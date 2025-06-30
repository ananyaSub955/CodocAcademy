const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config({ path: 'config.env' });

const app = express();
const PORT = 5000;

//app.use(cors()); // Allow requests from frontend
app.use(express.json());

const session = require("express-session");
const MongoStore = require("connect-mongo");
app.use(express.urlencoded({ extended: true }));

const bcrypt = require("bcryptjs");

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

app.get("/session", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "No session" });
    }
    res.json(req.session.user);
});

const database = client.db("CodocAcademy");
const userCollection = database.collection("users");

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
            email: email, 
            firstName: firstName

        };

        res.status(201).json({ message: "Signup successful!" });
    } catch (error) {
        res.status(500).json({ message: "Error signing up", error: error.message });
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