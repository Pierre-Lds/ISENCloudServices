// Required & Constants
const {MongoClient, ObjectId, ServerApiVersion} = require("mongodb");
const Ressource = require("./Ressource");
require('dotenv').config();
const uri = process.env.URI
const dbName = process.env.DB_NAME;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const Cluster = {
    getById : async function(clusterId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("cluster");
        // Query
        const clusters = await table.findOne({_id: ObjectId(clusterId)});
        // Results
        await client.close();
        return clusters;
    },
    getAll : async function() {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("cluster");
        // Query
        const clusters = await table.find().toArray();
        // Results
        await client.close();
        return clusters;
    },
    insert : async function(cluster) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("cluster");
        // Query
        const existingCluster = await table.findOne({name: cluster.name});
        let result = true;
        if (!existingCluster) {
            result = await table.insertOne(cluster);
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    },
    update : async function(cluster) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("cluster");
        // Check unique
        const existingCluster = await table.findOne({name: cluster.name});
        let result = true;
        // Unique or we modify our current element
        if (!existingCluster || ObjectId(existingCluster._id).equals(ObjectId(cluster._id))) {
            // Query
            result = await table.updateOne(
                {_id: ObjectId(cluster._id)},
                {$set: {name: cluster.name}}
            );
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    },
    delete : async function(clusterId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("cluster");
        // Check if used
        const ressource = await Ressource.getRessourcesByCluster(clusterId);
        let result = true;
        if (ressource.length === 0) {
            // Query
            result = await table.deleteOne({_id: ObjectId(clusterId)});
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    }
}

module.exports = Cluster;