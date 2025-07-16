const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config({ path: 'config.env' });

const app = express();
const PORT = 5000;

//app.use(cors()); // Allow requests from frontend
app.use(express.json());

const session = require("express-session");
const MongoStore = require("connect-mongo");
app.use(express.urlencoded({ extended: true }));

const bcrypt = require("bcryptjs");
const { data } = require('react-router-dom');

const uri = process.env.MONGOURL;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error(err);
    }
}
connectToMongoDB();

// const windowUrl = window.location.hostname === "localhost"
//   ? "http://localhost:5173"
//   : "https://itws-4500-s25-team6.eastus.cloudapp.azure.com/node";

app.use(cors({
    origin: 'http://localhost:5173', // deployed frontend URL
    credentials: true,
}));

// SESSION SET UP 
app.use(
    session({
        secret: 'SECRET KEY',
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: uri,
            ttl: 14 * 24 * 60 * 60,
            autoRemove: 'native',
        }),
        cookie: {
            sameSite: 'lax',
            secure: false,
            httpOnly: true,
        },
    })
);

app.get('/session', async (req, res) => {
    //console.log("Incoming session:", req.session); // ✅ debug

    if (!req.session.userId) return res.json({});

    const userId = req.session.userId;

    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) return res.json({});

        res.json({
            id: user._id.toString(),
            firstName: user.firstName,
            bookmarks: user.bookmarks || []
        });
    } catch (err) {
        console.error('Session fetch failed:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const database = client.db("CodocAcademy");
app.locals.db = database;
const userCollection = database.collection("Users");
const specialitiesCollection = database.collection("Specialties");
const groupCollection = database.collection("Groups");
//const diabetes = database.collection("Diabetes");

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userCollection.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            req.session.user = {
                id: user._id,
                email: user.email,
                firstName: user.firstName
            };

            req.session.userId = user._id.toString();

            return res.status(200).json({
                success: true,
                individualUser: user.individualUser || false,
                inGroup: user.inGroup || false,
                isGroupAdmin: user.isGroupAdmin || false,
                isSuperAdmin: user.isSuperAdmin || false
            });
        } else {
            return res.status(401).json({ message: "Invalid login" });
        }

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/individualSignup", async (req, res) => {

    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const lastUser = await userCollection.find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await userCollection.insertOne({
            id: newId,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            inGroup: false,
            groupLeader: false,
            individualUser: true,
            bookmarks: [],
            recientlyViewed: []
        });

        // Store user information in session
        req.session.user = {
            id: newId,
            email,
            firstName,
            lastName,
            inGroup: false,
            groupLeader: false,
            individualUser: true
        };
        req.session.userId = newUser.insertedId.toString(); // ✅ this is needed


        res.status(201).json({ message: "Signup successful!" });
    } catch (error) {
        res.status(500).json({ message: "Error signing up", error: error.message });
    }
});

app.post("/joinGroup", async (req, res) => {

    try {
        const { firstName, lastName, email, password, groupCode } = req.body;

        const group = await groupCollection.findOne({ code: groupCode });
        if (!group) {
            return res.status(400).json({ message: "Invalid group code" });
        }

        // Check if user already exists
        const existingUser = await userCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const lastUser = await userCollection.find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await userCollection.insertOne({
            id: newId,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            inGroup: true,
            groupLeader: false,
            individualUser: false,
            bookmarks: [],
            recientlyViewed: []
        });

        await groupCollection.updateOne(
            { code: groupCode },
            { $push: { members: newId } }
        );

        // Store user information in session
        req.session.user = {
            id: newId,
            email,
            firstName,
            lastName,
            inGroup: true,
            groupLeader: false,
            individualUser: false,
            groupCode
        };
        req.session.userId = newUser.insertedId.toString(); // ✅ this is needed


        res.status(201).json({ message: "Signup successful!" });
    } catch (error) {
        res.status(500).json({ message: "Error signing up", error: error.message });
    }
});


app.get("/specialties", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not logged in" });
    }
    try {
        const specialties = await specialitiesCollection
            .find({})
            .sort({ id: 1 })
            .toArray();
        //console.log(specialties);
        res.json(specialties);
    } catch (error) {
        console.error("Error fetching specialties:", error);
        res.status(500).json({ message: "Error fetching specialties" });
    }
});


app.post("/:speciality/info", async (req, res) => {
    //console.log("Specialty POST Request:", req.body);

    if (!req.session.user) {
        return res.status(401).json({ message: "Not logged in" });
    }

    const { speciality } = req.params
    const { name, userId } = req.body;

    if (!name || !userId) {
        return res.status(400).json({ error: "Missing data" });
    }

    try {
        const allowedSpecialties = ["diabetes", "vascular", "cardiology", "renal", "neurology"];
        if (!allowedSpecialties.includes(speciality.toLowerCase())) {
            return res.status(404).json({ error: "Specialty not found" });
        }

        // Dynamically access a collection based on the speciality name
        const collection = req.app.locals.db.collection(speciality);

        const results = await collection.find({}).toArray();


        res.json({
            specialty: speciality,
            data: results || []
        });

    } catch (error) {
        console.error("MongoDB error:", error);
        res.status(500).json({ error: "Server error retrieving specialty data" });
    }
});

app.post("/user/bookmark", async (req, res) => {
    const { userId, action, bookmark } = req.body;

    if (!userId || !action || !bookmark || !bookmark._id) {
        return res.status(400).json({ success: false, message: "Missing data" });
    }

    try {
        const update =
            action === "add"
                ? { $addToSet: { bookmarks: bookmark } }
                : { $pull: { bookmarks: { _id: bookmark._id } } };

        const result = await userCollection.updateOne(
            { _id: new ObjectId(userId) },
            update
        );

        // console.log("Mongo update result:", result);

        res.json({ success: true });
    } catch (error) {
        console.error("Bookmark update error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get('/user/:id/bookmarks', async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        console.error("Invalid user ID:", id);
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        const user = await userCollection.findOne({ _id: new ObjectId(id) });
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user.bookmarks || []);
    } catch (err) {
        console.error("Error fetching user bookmarks", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/user/recentlyViewed", async (req, res) => {
    const { userId, topic } = req.body;

    if (!userId || !topic || !topic._id || !topic.SubTopics) {
        return res.status(400).json({ message: "Missing topic data" });
    }

    try {
        await userCollection.updateOne(
            { _id: new ObjectId(userId) },
            {
                $push: {
                    recentlyViewed: {
                        $each: [{ ...topic, timestamp: new Date() }],
                        $position: 0,
                        $slice: 10
                    }
                }
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Failed to update recently viewed:", error);
        res.status(500).json({ message: "Server error" });
    }
});


app.get('/user/:id/recentlyViewed', async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid user ID" });

    try {
        const user = await userCollection.findOne({ _id: new ObjectId(id) });
        res.json(user.recentlyViewed || []);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch recently viewed" });
    }
});

app.get('/user/:id/recommendations', async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid user ID" });

    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    const bookmarks = user.bookmarks || [];

    const subtopicNames = bookmarks.map(b => b.name);
    const bookmarkIds = new Set(bookmarks.map(b => String(b._id)));

    const bookmarkSubTopics = new Set(bookmarks.map(b => (b.name || "").trim().toLowerCase()));

    const categories = [...new Set(bookmarks.map(b => b.Category?.trim()).filter(Boolean))];

    const collections = ["Diabetes", "Renal", "Cardiology", "Vascular", "Neurology"];
    let recommendations = [];

    for (let name of collections) {
        const col = req.app.locals.db.collection(name);
        //const subcategories = bookmarks.map(b => b.Subcategory).filter(Boolean);
        const matches = await col.find({
            $or: [
                { SubTopics: { $in: subtopicNames } },
                { Category: { $in: categories } }
            ]
        }).toArray();

        for (const item of matches) {
            const idStr = String(item._id);
            const nameStr = (item.SubTopics || "").trim().toLowerCase();

            const alreadySeen = bookmarkIds.has(idStr) || bookmarkSubTopics.has(nameStr);

            if (!alreadySeen) {
                recommendations.push({
                    _id: idStr,
                    SubTopics: item.SubTopics || "",
                    Category: item.Category || "",
                    Subcategory: item.Subcategory || ""
                });
            }
        }

    }

    //console.log(recommendations);

    // Remove already-bookmarked items
    //const bookmarkIds = new Set(bookmarks.map(b => String(b._id)));

    // console.log("bookmark IDs:", [...bookmarkIds]);
    // console.log("------");
    // console.log("recommendation IDs:", recommendations.map(r => String(r._id)));

    //const uniqueRecs = recommendations.filter(r => !bookmarkIds.has(String(r._id)));

    //console.log(uniqueRecs);
    //res.json(uniqueRecs.slice(0, 10));

    const seen = new Set();
    const unique = recommendations.filter(r => {
        if (seen.has(r._id)) return false;
        seen.add(r._id);
        return true;
    });

    //console.log(unique);
    res.json(unique.slice(0, 10));
});


//LOGOUT ROUTE
app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Error logging out" });
        }
        res.json({ message: "Logged out successfully" });
    });
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});