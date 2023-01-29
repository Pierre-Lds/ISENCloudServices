// Required & Constants
const {MongoClient, ObjectId, ServerApiVersion} = require("mongodb");
const Reservation = require("./Reservation");
require('dotenv').config();
const uri = process.env.URI
const dbName = process.env.DB_NAME;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const User = {
    getById : async function(userId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("user");
        // Query
        const users = await table.findOne({_id: ObjectId(userId)});
        // Results
        await client.close();
        return users;
    },
    getAll : async function() {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("user");
        // Query
        const users = await table.find().toArray();
        // Results
        await client.close();
        return users;
    },
    insert : async function(user) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("user");
        // Check unique
        const existingUser = await table.findOne({email: user.email});
        let result = true;
        if (!existingUser) {
            // Query
            result = await table.insertOne(user);
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    },
    update : async function(user) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("user");
        // Check unique
        const existingUser = await table.findOne({email: user.email});
        let result = true;
        // Unique or we modify our current element
        if (!existingUser || ObjectId(existingUser._id).equals(ObjectId(user._id))) {
            // Query
            result = await table.updateOne(
                {_id: ObjectId(user._id)},
                {$set: {
                        name: user.name,
                        email: user.email,
                        password: user.password,
                        role: user.role,
                        last_name: user.last_name,
                    }}
            );
            // Update associated objects
            const reservations = await Reservation.getReservationsByUser(user._id);
            for (let i = 0; i < reservations.length; i++) {
                reservations[i].refUser = user;
                await Reservation.update(reservations[i]);
            }
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    },
    delete : async function(userId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("user");
        // Check if user is used
        const reservations = await Reservation.getReservationsByUser(userId);
        let result = true;
        if (reservations.length === 0) {
            // Query
            result = await table.deleteOne({_id: ObjectId(userId)});
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    },
    getByEmail : async function(email) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("user");
        // Query
        const users = await table.findOne({email: email});
        // Results
        await client.close();
        return users;
    },
    getByUsername : async function(username) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("user");
        // Query
        const users = await table.find({
            $or: [
                { name: { $regex: username, $options: "i" } },
                { last_name: { $regex: username, $options: "i" } }
            ]
        }).toArray();
        // Results
        await client.close();
        return users;
    }
}

module.exports = User;