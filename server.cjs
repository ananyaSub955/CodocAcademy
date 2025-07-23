const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config({ path: 'config.env' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';


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
            bookmarks: user.bookmarks || [],
            code: user.code
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
                groupLeader: user.groupLeader || false,
                superAdmin: user.superAdmin || false
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
        const { firstName, lastName, email, password, frequency } = req.body;

        // Check if user already exists
        const existingUser = await userCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // const lastUser = await userCollection.find().sort({ id: -1 }).limit(1).toArray();
        // const newId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;

        // // Hash password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // // Create new user
        // const newUser = await userCollection.insertOne({
        //     id: newId,
        //     firstName,
        //     lastName,
        //     email,
        //     password: hashedPassword,
        //     inGroup: false,
        //     groupLeader: false,
        //     individualUser: true,
        //     superAdmin: false,
        //     bookmarks: [],
        //     recientlyViewed: [],
        //     code: null
        // });

        // Store user information in session
        // req.session.user = {
        //     id: newId,
        //     email,
        //     firstName,
        //     lastName,
        //     inGroup: false,
        //     groupLeader: false,
        //     individualUser: true,
        //     superAdmin: false,
        // };
        // req.session.userId = newUser.insertedId.toString(); // ✅ this is needed


        // res.status(201).json({ message: "Signup successful!" });

        req.session.pendingSignup = {
            type: "individual",
            formData: { firstName, lastName, email, password },
            frequency,
        };

        const priceId = frequency === "yearly"
            ? 'price_1RnTtaFa5BATz5g02VLVxJyI'
            : 'price_1Rlr0eFa5BATz5g0m33bFvi8';

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${baseUrl}/success`,
            cancel_url: `${baseUrl}/cancel`,
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ message: "Error signing up", error: error.message });
    }
});

app.post("/joinGroup", async (req, res) => {

    try {
        const { firstName, lastName, email, password, code } = req.body;

        const group = await groupCollection.findOne({ code: code });
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
            superAdmin: false,
            bookmarks: [],
            recientlyViewed: []
        });

        await groupCollection.updateOne(
            { code: code },
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
            superAdmin: false,
            code
        };
        req.session.userId = newUser.insertedId.toString(); // ✅ this is needed


        res.status(201).json({ message: "Signup successful!" });
    } catch (error) {
        res.status(500).json({ message: "Error signing up", error: error.message });
    }
});

app.post("/createGroup", async (req, res) => {

    try {
        const { groupName, email, password, code, frequency, groupSize } = req.body;

        const size = groupSize;

        // const existingGroup = await groupCollection.findOne({ code });
        // if (existingGroup) return res.status(400).json({ message: "Code already in use" });

        // const existingUser = await userCollection.findOne({ email });
        // if (existingUser) return res.status(400).json({ message: "Email already used as user" });

        // const lastGroup = await groupCollection.find().sort({ id: -1 }).limit(1).toArray();
        // const newId = lastGroup.length > 0 ? lastGroup[0].id + 1 : 1;

        // const lastUser = await userCollection.find().sort({ id: -1 }).limit(1).toArray();
        // const newUserId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;

        // const hashedPassword = await bcrypt.hash(password, 10);

        // const newGroup = await groupCollection.insertOne({
        //     id: newId,
        //     groupName,
        //     email,
        //     password: hashedPassword,
        //     code,
        //     members: []
        // });

        // const result = await userCollection.insertOne({
        //     id: newUserId,
        //     email,
        //     password: hashedPassword,
        //     firstName: groupName,
        //     lastName: "Admin",
        //     inGroup: true,
        //     groupLeader: true,
        //     individualUser: false,
        //     superAdmin: false,
        //     code: code
        // });

        // req.session.user = {
        //     id: newUserId,
        //     email,
        //     groupLeader: true,
        //     inGroup: true,
        //     individualUser: false,
        //     superAdmin: false,
        //     code: code,
        // };

        // req.session.userId = result.insertedId.toString(); // ✅ this is what /session reads


        // //req.session.userId = newGroup.insertedId.toString();
        // res.status(201).json({ message: "Group creation successful!", code });

        let priceId;
        if (size === "lt10") {
            priceId = frequency === "monthly"
                ? "price_1RlrK2Fa5BATz5g0SgC8m6yW"
                : "price_1RnTsxFa5BATz5g0xaZOoKAa";
        } else {
            priceId = frequency === "monthly"
                ? "price_1RlrIxFa5BATz5g0DSuWVrtb"
                : "price_1RnTsIFa5BATz5g0I2SHe2qw";
        }

        req.session.pendingSignup = {
            type: "group",
            formData: { groupName, email, password, code },
            frequency,
            size: groupSize
        };

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${baseUrl}/success`,
            cancel_url: `${baseUrl}/cancel`,
        });

        res.json({ url: session.url });


    } catch (error) {
        res.status(500).json({ message: "Error signing up", error: error.message });

    }

});

app.get("/generateGroupCode", async (req, res) => {
    const generateCode = async () => {
        let code, exists;
        do {
            code = Math.random().toString(36).substring(2, 8).toUpperCase();
            exists = await groupCollection.findOne({ code });
        } while (exists);
        return code;
    };

    const code = await generateCode();
    res.json({ code });
});



app.post("/finalizeSignup", async (req, res) => {
    const signup = req.session.pendingSignup;
    if (!signup) return res.status(400).json({ message: "No pending signup" });

    const { type, frequency, size, formData } = signup;
    const plan = type === "group"
        ? `group_${size}_${frequency}`
        : `individual_${frequency}`;

    const existingGroup = await groupCollection.findOne({ code });
    if (existingGroup) return res.status(400).json({ message: "Code already in use" });

    const existingUser = await userCollection.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already used as user" });

    const lastGroup = await groupCollection.find().sort({ id: -1 }).limit(1).toArray();
    const newId = lastGroup.length > 0 ? lastGroup[0].id + 1 : 1;

    const lastUser = await userCollection.find().sort({ id: -1 }).limit(1).toArray();
    const newUserId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;
    const hashedPassword = await bcrypt.hash(formData.password, 10);

    if (type === "individual") {
        await userCollection.insertOne({
            ...formData,
            password: hashedPassword,
            hasPaid: true,
            plan,
            inGroup: false,
            groupLeader: false,
            individualUser: true,
            superAdmin: false,
            bookmarks: [],
            recentlyViewed: [],
        });

        const user = await userCollection.findOne({ email: formData.email });

        req.session.user = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            code: user.code,
            groupLeader: false,
            inGroup: false,
            individualUser: true,
            superAdmin: false,
        };

        req.session.userId = user._id.toString(); 
    } else if (type === "group") {
        await groupCollection.insertOne({
            groupName: formData.groupName,
            email: formData.email,
            password: hashedPassword,
            code: formData.code,
            members: [],
            hasPaid: true,
            plan,
        });

        await userCollection.insertOne({
            email: formData.email,
            password: hashedPassword,
            firstName: formData.groupName,
            lastName: "Admin",
            inGroup: true,
            groupLeader: true,
            individualUser: false,
            superAdmin: false,
            code: formData.code,
            hasPaid: true,
            plan,
        });

        const user = await userCollection.findOne({ email: formData.email });

        req.session.user = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            code: user.code,
            groupLeader: true,
            inGroup: true,
            individualUser: false,
            superAdmin: false,
        };

        req.session.userId = user._id.toString(); 
    }

    delete req.session.pendingSignup;
    res.json({
        success: true,
        groupLeader: type === "group",
    });

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

app.get('/groups', async (req, res) => {
    try {
        const groups = await groupCollection.find({}).toArray();
        res.json(groups);
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ message: "Error fetching groups" });
    }
});

app.get('/group/:code', async (req, res) => {
    // console.log("GET /group/:code called");
    // console.log("Params:", req.params);
    try {
        //console.log(req.params.code);
        const group = await groupCollection.findOne({ code: req.params.code });

        if (!group) return res.status(404).json({ message: "Group not found" });

        // console.log("Raw group members:", group.members);

        // Populate members with user data
        const memberIds = group.members;  // these are numbers like [7, 12]
        const members = await userCollection.find({ id: { $in: memberIds } }).toArray();
        //console.log(members);



        res.json({ ...group, members });
    } catch (err) {
        res.status(500).json({ message: "Error fetching group", error: err.message });
    }
});

app.post('/group/:code/removeMember', async (req, res) => {
    const { memberId } = req.body;
    const numId = parseInt(memberId, 10);

    try {
        const group = await groupCollection.findOne({ code: req.params.code });
        if (!group) return res.status(404).json({ message: "Group not found" });

        //const numericId = parseInt(memberId);


        await groupCollection.updateOne(
            { code: req.params.code },
            { $pull: { members: numId } }
        );

        await userCollection.updateOne(
            { id: numId },
            {
                $set: {
                    inGroup: false,
                    groupLeader: false,
                    code: null
                }
            }
        );

        res.json({ message: "Member removed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error removing member", error: err.message });
    }
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