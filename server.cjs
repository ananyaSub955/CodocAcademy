const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
//const MongoStore = require("connect-mongo");
require('dotenv').config({ path: 'config.env' });

const app = express();
const PORT = 5000;

app.use(cors()); // Allow requests from frontend
app.use(express.json());


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

const database = client.db("CodocAcademy");
const userCollection = database.collection("users");

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userCollection.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.password === password) {
            // req.session.user = {
            //     id: user._id,
            //     email: user.email
            // };

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



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});