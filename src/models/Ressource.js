// Required & Constants
const {MongoClient, ObjectId, ServerApiVersion} = require("mongodb");
const Reservation = require("./Reservation.js");
require('dotenv').config();
const uri = process.env.URI
const dbName = process.env.DB_NAME;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const Ressource = {
    getById : async function(ressourceId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("ressource");
        // Query
        const ressources = await table.findOne({_id: ObjectId(ressourceId)});
        // Results
        await client.close();
        return ressources;
    },
    getAll : async function() {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("ressource");
        // Query
        const products = await table.find().toArray();
        // Results
        await client.close();
        return products;
    },
    insert : async function(ressource) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("ressource");
        // Check unique
        const existingRessource = await table.findOne({name: ressource.name});
        let result = true;
        if (!existingRessource) {
            // Query
            result = await table.insertOne(ressource);
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    },
    update : async function(ressource) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("ressource");
        // Check unique
        const existingRessource = await table.findOne({name: ressource.name});
        let result = true;
        // Unique or we modify our current element
        if (!existingRessource || ObjectId(existingRessource._id).equals(ObjectId(ressource._id))) {
            // Query
            result = await table.updateOne(
                {_id: ObjectId(ressource._id)},
                {$set: {
                        name: ressource.name,
                        nbThread: ressource.nbThread,
                        RAM: ressource.RAM,
                        refArchitectureCPU: ressource.refArchitectureCPU,
                        refCluster: ressource.refCluster,
                    }}
            );
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    },
    delete : async function(ressourceId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("ressource");
        // Check if ressource is used
        const reservations = await Reservation.getReservationsByRessource(ressourceId);
        let result = true;
        if (reservations.length === 0) {
            // Query
            result = await table.deleteOne({_id: ObjectId(ressourceId)});
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    },
    getRessourcesByCluster : async function(clusterId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("ressource");
        // Query
        const ressources = await table.find({"refCluster._id": ObjectId(clusterId)}).toArray();
        // Results
        await client.close();
        return ressources;
    },
    getRessourcesByArchitectureCPU : async function(architectureCPUId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("ressource");
        // Query
        const ressources = await table.find({"refArchitectureCPU._id": ObjectId(architectureCPUId)}).toArray();
        // Results
        await client.close();
        return ressources;
    }
}

module.exports = Ressource;