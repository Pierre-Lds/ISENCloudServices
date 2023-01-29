const {MongoClient, ObjectId, ServerApiVersion} = require("mongodb");
const bcrypt = require("bcrypt");
require('dotenv').config();
const uri = process.env.URI
const dbName = process.env.DB_NAME;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function main() {
    await client.connect();
    const table = client.db(dbName).collection("user");
    await table.insertOne({
        name: "Admin",
        last_name: "Admin",
        email: "admin@isen-ouest.yncrea.fr",
        password: await bcrypt.hash("admin", 10),
        role: "admin"
    });
    await client.close();
}

main()