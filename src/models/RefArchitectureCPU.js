// Required & Constants
const {MongoClient, ObjectId, ServerApiVersion} = require("mongodb");
const Ressource = require("./Ressource");
require('dotenv').config();
const uri = process.env.URI
const dbName = process.env.DB_NAME;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const RefArchitectureCPU = {
    getById : async function(refArchitectureCPUId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("refArchitectureCPU");
        // Query
        const refArchitectureCPUs = await table.findOne({_id: ObjectId(refArchitectureCPUId)});
        // Results
        await client.close();
        return refArchitectureCPUs;
    },
    getAll : async function() {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("refArchitectureCPU");
        // Query
        const refArchitecturesCPU = await table.find().toArray();
        // Results
        await client.close();
        return refArchitecturesCPU;
    },
    insert : async function(refArchitecture) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("refArchitectureCPU");
        // Check unique
        const existingRefArchitecture = await table.findOne({name: refArchitecture.name});
        let result = true;
        if (!existingRefArchitecture) {
            // Query
            result = await table.insertOne(refArchitecture);
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    },
    update : async function(refArchitecture) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("refArchitectureCPU");
        // Check unique
        const existingRefArchitecture = await table.findOne({name: refArchitecture.name});
        let result = true;
        // Unique or we modify our current element
        if (!existingRefArchitecture || ObjectId(existingRefArchitecture._id).equals(ObjectId(refArchitecture._id))) {
            // Query
            result = await table.updateOne(
                {_id: ObjectId(refArchitecture._id)},
                {$set: {name: refArchitecture.name}}
            );
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    },
    delete : async function(refArchitectureId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("refArchitectureCPU");
        // Check if used
        const ressource = await Ressource.getRessourcesByArchitectureCPU(refArchitectureId);
        let result = true;
        if (ressource.length === 0) {
            // Query
            result = await table.deleteOne({_id: ObjectId(refArchitectureId)});
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    }
}

module.exports = RefArchitectureCPU;