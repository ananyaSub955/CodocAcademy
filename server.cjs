const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
require('dotenv').config({ path: 'config.env' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(bodyParser.json());

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

function getClientOrigin(req) {
    // Prefer the browser's Origin header if it's one of your allowed origins
    const origin = req.headers.origin;
    if (origin && ['http://localhost:5173', 'https://ananya.honor-itsolutions.com'].includes(origin)) {
        return origin;
    }
    // Fallback to environment or localhost
    return process.env.FRONTEND_URL || 'http://localhost:5173';
}

function joinUrl(root, path) {
    return `${String(root).replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;
}


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const searchClient = new MongoClient(uri);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        await searchClient.connect();
        console.log('Connected non-strict client for Atlas Search');
    } catch (err) {
        console.error(err);
    }
}
connectToMongoDB();

const allowedOrigins = [
    'http://localhost:5173',
    'https://ananya.honor-itsolutions.com/node'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.set('trust proxy', 1);


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
            code: user.code,
            individualUser: user.individualUser || false,
            inGroup: user.inGroup || false,
            groupLeader: user.groupLeader || false,
            superAdmin: user.superAdmin || false
        });

    } catch (err) {
        console.error('Session fetch failed:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/generate', (req, res) => {
    const secret = speakeasy.generateSecret({ length: 20 });
    QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
        if (err) return res.status(500).send('Error generating QR code');

        res.json({
            secret: secret.base32,
            qr: dataUrl
        });
    });
});

app.post('/verify', (req, res) => {
    const { token, secret } = req.body;
    const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1
    });

    res.json({ verified });
});

function getTwoFA(isSuperAdmin = false) {
    if (isSuperAdmin) return undefined;

    const secret = speakeasy.generateSecret({ length: 20 });
    return {
        enabled: true,
        secret: secret.base32,
    };
}


const database = client.db("CodocAcademy");
app.locals.db = database;
const userCollection = database.collection("Users");
const specialitiesCollection = database.collection("Specialties");
const groupCollection = database.collection("Groups");
const messageCollection = database.collection("Messages");
const diabetesCollection = database.collection("Diabetes");

const searchDb = searchClient.db("CodocAcademy");
const diabetesSearchCollection = searchDb.collection("Diabetes");

// (async () => {
//     try {
//         // Use a separate, non-strict client ONLY to create the index
//         const adminClient = new MongoClient(uri); // no serverApi.strict
//         await adminClient.connect();

//         const adminDb = adminClient.db("CodocAcademy");
//         const adminDiabetes = adminDb.collection("Diabetes");

//         // Optional: drop any existing text indexes except our target
//         const existing = await adminDiabetes.indexes();
//         for (const idx of existing) {
//             if (idx.name !== "search_text" && idx.key && idx.key._fts === "text") {
//                 try { await adminDiabetes.dropIndex(idx.name); } catch { }
//             }
//         }

//         // Create the single compound text index (runs once)
//         const hasSearch = existing.some(i => i.name === "search_text");
//         if (!hasSearch) {
//             await adminDiabetes.createIndex(
//                 {
//                     Category: "text",
//                     Subcategory: "text",
//                     SubTopics: "text",
//                     Headers: "text",
//                     Explanation: "text",
//                     "ICD 10": "text",
//                     "Coding/Documentation tip": "text",
//                 },
//                 {
//                     name: "search_text",
//                     weights: { Explanation: 10, Headers: 5 },
//                     default_language: "none",
//                 }
//             );
//             console.log("Created text index: search_text");
//         }

//         await adminClient.close();
//     } catch (e) {
//         console.error("Index setup failed:", e);
//     }
// })();



app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userCollection.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid login" });

        if (user.twoFA?.enabled) {
            return res.status(200).json({
                requires2FA: true,
                tempUserId: user._id,
                individualUser: user.individualUser || false,
                inGroup: user.inGroup || false,
                groupLeader: user.groupLeader || false,
                superAdmin: user.superAdmin || false
            });
        }

        req.session.userId = user._id.toString();
        res.status(200).json({
            success: true,
            individualUser: user.individualUser || false,
            inGroup: user.inGroup || false,
            groupLeader: user.groupLeader || false,
            superAdmin: user.superAdmin || false
        });

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

        // const session = await stripe.checkout.sessions.create({
        //     mode: 'subscription',
        //     payment_method_types: ['card'],
        //     customer_email: email,
        //     line_items: [{ price: priceId, quantity: 1 }],
        //     success_url: `${baseUrl}/success`,
        //     cancel_url: `${baseUrl}/cancel`,
        // });

        const origin = getClientOrigin(req);
        const successUrl = joinUrl(origin, '/success');
        const cancelUrl = joinUrl(origin, '/cancel');

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
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

        if (
            group.members.length >= 10 &&
            (group.plan == "group_lt10_yearly" || group.plan == "group_lt10_monthly")) {
            return res.status(400).json({ message: "Group has exceeded member limit" });
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
        const twoFASecret = speakeasy.generateSecret({ length: 20 });

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
            recientlyViewed: [],
            twoFA: {
                enabled: true,
                secret: twoFASecret.base32
            }
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

        // const session = await stripe.checkout.sessions.create({
        //     mode: 'subscription',
        //     payment_method_types: ['card'],
        //     customer_email: email,
        //     line_items: [{ price: priceId, quantity: 1 }],
        //     success_url: `${baseUrl}/success`,
        //     cancel_url: `${baseUrl}/cancel`,
        // });

        const origin = getClientOrigin(req);
        const successUrl = joinUrl(origin, '/success');
        const cancelUrl = joinUrl(origin, '/cancel');

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
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

    const existingGroup = formData.code
        ? await groupCollection.findOne({ code: formData.code })
        : null;

    if (existingGroup) return res.status(400).json({ message: "Code already in use" });

    const existingUser = await userCollection.findOne({ email: formData.email });
    if (existingUser) return res.status(400).json({ message: "Email already used as user" });

    const lastGroup = await groupCollection.find().sort({ id: -1 }).limit(1).toArray();
    const newId = lastGroup.length > 0 ? lastGroup[0].id + 1 : 1;

    const lastUser = await userCollection.find().sort({ id: -1 }).limit(1).toArray();
    const newUserId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;
    const hashedPassword = await bcrypt.hash(formData.password, 10);

    if (type === "individual") {
        const twoFA = getTwoFA(false);

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
            ...(twoFA && { twoFA }), // only add if not undefined
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

        const twoFA = getTwoFA(false);

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
            ...(twoFA && { twoFA }),
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

app.get('/get2FA', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await userCollection.findOne({ _id: new ObjectId(req.session.userId) });
    if (!user || !user.twoFA?.enabled) return res.status(400).json({ message: "2FA not set up" });

    const secret = user.twoFA.secret;

    const otpauthUrl = `otpauth://totp/CodocAcademy:${user.email}?secret=${secret}&issuer=CodocAcademy`;

    QRCode.toDataURL(otpauthUrl, (err, qrCodeDataUrl) => {
        if (err) {
            return res.status(500).json({ message: "Failed to generate QR code" });
        }

        res.json({
            qrCode: qrCodeDataUrl,
            secret,
        });
    });
});

app.post('/verifyToken', async (req, res) => {
    const { token, tempUserId } = req.body;

    if (!tempUserId) return res.status(401).json({ verified: false });

    const user = await userCollection.findOne({ _id: new ObjectId(tempUserId) });
    if (!user || !user.twoFA?.enabled) return res.status(400).json({ verified: false });

    const verified = speakeasy.totp.verify({
        secret: user.twoFA.secret,
        encoding: 'base32',
        token,
        window: 1
    });

    if (verified) {
        req.session.userId = user._id.toString(); // ✅ Set session
        return res.json({ verified: true });
    }

    res.json({ verified: false });
});


app.get("/specialties", async (req, res) => {
    if (!req.session.userId) {
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

    if (!req.session.userId) {
        return res.status(401).json({ message: "Not logged in" });
    }

    const { speciality } = req.params
    const { name, userId } = req.body;

    if (!name || !userId) {
        return res.status(400).json({ error: "Missing data" });
    }

    try {
        const allowedSpecialties = ["diabetes", "vascular", "cardiology", "renal", "neurology", "connective tissue disorder",
            "miscellaneous", "gastroentrology", "sud and behaviorial sciences"
        ];
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

        const bookmarks = (user.bookmarks || []).map(b => ({
            _id: b._id,
            name: b.name,
            category: b.category,
            specialty: b.specialty,
            category: b.category,
            subCategory: b.subCategory
        }));

        res.json(bookmarks);
    } catch (err) {
        console.error("Error fetching user bookmarks", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/user/recentlyViewed", async (req, res) => {
    const { userId, topic } = req.body;

    if (!userId || !topic || !topic._id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { recentlyViewed: { _id: topic._id } } }
    );

    await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $push: {
                recentlyViewed: {
                    $each: [{ ...topic, timestamp: new Date() }],
                    $position: 0
                }
            }
        }
    );

    await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $push: {
                recentlyViewed: {
                    $each: [],
                    $slice: 10
                }
            }
        }
    );

    res.json({ success: true });
});




app.get('/user/:id/recentlyViewed', async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid user ID" });

    try {
        const user = await userCollection.findOne({ _id: new ObjectId(id) });
        if (!user) return res.status(404).json({ error: "User not found" });

        const recentlyViewed = (user.recentlyViewed || []).map(rv => ({
            _id: rv._id,
            name: rv.name,
            category: rv.category,
            specialty: rv.specialty,
            category: rv.category,
            subCategory: rv.subCategory
        }));

        res.json(recentlyViewed);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch recently viewed" });
    }
});

// app.get('/user/:id/recommendations', async (req, res) => {
//     const { id } = req.params;
//     if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid user ID" });

//     const user = await userCollection.findOne({ _id: new ObjectId(id) });
//     const bookmarks = user.bookmarks || [];

//     const subtopicNames = bookmarks.map(b => b.name);
//     const bookmarkIds = new Set(bookmarks.map(b => String(b._id)));

//     const bookmarkSubTopics = new Set(bookmarks.map(b => (b.name || "").trim().toLowerCase()));

//     const categories = [...new Set(bookmarks.map(b => b.Category?.trim()).filter(Boolean))];

//     const collections = ["Diabetes", "Renal", "Cardiology", "Vascular", "Neurology"];
//     let recommendations = [];

//     for (let name of collections) {
//         const col = req.app.locals.db.collection(name);
//         //const subcategories = bookmarks.map(b => b.Subcategory).filter(Boolean);
//         const matches = await col.find({
//             $or: [
//                 { SubTopics: { $in: subtopicNames } },
//                 { Category: { $in: categories } }
//             ]
//         }).toArray();

//         for (const item of matches) {
//             const idStr = String(item._id);
//             const nameStr = (item.SubTopics || "").trim().toLowerCase();

//             const alreadySeen = bookmarkIds.has(idStr) || bookmarkSubTopics.has(nameStr);

//             if (!alreadySeen) {
//                 recommendations.push({
//                     _id: idStr,
//                     SubTopics: item.SubTopics || "",
//                     Category: item.Category || "",
//                     Subcategory: item.Subcategory || ""
//                 });
//             }
//         }

//     }

//     //console.log(recommendations);

//     // Remove already-bookmarked items
//     //const bookmarkIds = new Set(bookmarks.map(b => String(b._id)));

//     // console.log("bookmark IDs:", [...bookmarkIds]);
//     // console.log("------");
//     // console.log("recommendation IDs:", recommendations.map(r => String(r._id)));

//     //const uniqueRecs = recommendations.filter(r => !bookmarkIds.has(String(r._id)));

//     //console.log(uniqueRecs);
//     //res.json(uniqueRecs.slice(0, 10));

//     const seen = new Set();
//     const unique = recommendations.filter(r => {
//         if (seen.has(r._id)) return false;
//         seen.add(r._id);
//         return true;
//     });

//     //console.log(unique);
//     res.json(unique.slice(0, 10));
// });

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
        const memberIds = group.members;
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

app.post('/contactMessage', async (req, res) => {

    try {
        const { firstName, lastName, email, company, message } = req.body;

        await messageCollection.insertOne({
            firstName,
            lastName,
            email,
            company,
            message,
            createdAt: new Date()
        });

        res.status(200).json({ message: "Message submitted successfully!" });


    } catch (err) {
        res.status(500).json({ message: "Error submitting message", error: err.message });
    }
});

app.get('/search', async (req, res) => {
    try {
        const q = String(req.query.query || '').trim();
        if (!q) return res.json([]);

        const limit = Math.min(parseInt(req.query.limit || '10', 10) || 10, 25);

        const pipeline = [
            {
                $search: {
                    index: 'default',
                    text: {
                        query: q,
                        path: { wildcard: '*' },
                        fuzzy: { maxEdits: 1, prefixLength: 2 }
                    }
                }
            },
            {
                $project: {
                    score: { $meta: 'searchScore' },
                    highlights: { $meta: 'searchHighlights' },
                    Category: 1, Subcategory: 1, SubTopics: 1,
                    Headers: 1, Explanation: 1, 'ICD 10': 1, 'Coding/Documentation tip': 1
                }
            },
            { $limit: limit }
        ];

        const docs = await diabetesSearchCollection.aggregate(pipeline).toArray();
        if (docs.length === 0) {
            const fallback = await diabetesCollection.find({
                $or: [
                    { Explanation: { $regex: q, $options: 'i' } },
                    { Headers: { $regex: q, $options: 'i' } },
                    { SubTopics: { $regex: q, $options: 'i' } },
                    { Subcategory: { $regex: q, $options: 'i' } },
                    { Category: { $regex: q, $options: 'i' } },
                    { 'ICD 10': { $regex: q, $options: 'i' } },
                    { 'Coding/Documentation tip': { $regex: q, $options: 'i' } }
                ]
            })
                .limit(10)
                .project({
                    _id: 1,
                    Category: { $ifNull: ["$Category", "$Category ", " $Category"] },
                    Subcategory: { $ifNull: ["$Subcategory", "$Subcategory ", " $Subcategory"] },
                    SubTopics: { $ifNull: ["$SubTopics", "$SubTopics ", " $SubTopics"] },
                    Headers: { $ifNull: ["$Headers", "$Headers ", " $Headers"] },
                    Explanation: { $ifNull: ["$Explanation", "$Explanation ", " $Explanation"] },
                    "ICD 10": { $ifNull: ["$ICD 10", "$ICD 10 ", " $ICD 10"] },
                    "Coding/Documentation tip": { $ifNull: ["$Coding/Documentation tip", "$Coding/Documentation tip ", " $Coding/Documentation tip"] }
                })
                .toArray();

            return res.json(fallback);
        }

        res.json(docs);
    } catch (err) {
        console.error('Atlas Search error:', err);
        res.status(500).json({ message: 'Error with search', error: err.message });
    }
});



app.get('/health', (_req, res) => res.send("ok"));

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