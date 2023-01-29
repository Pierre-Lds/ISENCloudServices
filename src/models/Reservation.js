// Required & Constants
const {MongoClient, ObjectId, ServerApiVersion} = require("mongodb");
require('dotenv').config();
const uri = process.env.URI
const dbName = process.env.DB_NAME;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const Reservation = {
    getById : async function(reservationId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("reservation");
        // Query
        const reservations = await table.findOne({_id: ObjectId(reservationId)});
        // Results
        await client.close();
        return reservations;
    },
    getAll : async function() {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("reservation");
        // Query
        const reservations = await table.find().toArray();
        // Results
        await client.close();
        return reservations;
    },
    insert : async function(reservation) {
        const res = await this.getReservationsByRessource(reservation.refRessource._id);
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("reservation");
        // Availability of the ressource
        let free = true;
        for (resa of res) {
            if (!(reservation.dateEnd <= resa.dateStart || reservation.dateStart >= resa.dateEnd)) {
                free = false;
            }
        }
        let result = true;
        if (free) {
            // Query
            result = await table.insertOne(reservation);
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    },
    update : async function(reservation) {
        const res = await this.getReservationsByRessource(reservation.refRessource._id);
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("reservation");
        // Availability of the ressource
        let free = true;
        for (resa of res) {
            if (!(reservation.dateEnd <= resa.dateStart || reservation.dateStart >= resa.dateEnd) && !(ObjectId(resa._id).equals(ObjectId(reservation._id)))) {
                free = false;
            }
        }
        let result = true;
        if (free) {
            // Query
            result = await table.updateOne(
                {_id: ObjectId(reservation._id)},
                {$set: {
                        refUser: reservation.refUser,
                        refRessource: reservation.refRessource,
                        dateStart: reservation.dateStart,
                        dateEnd: reservation.dateEnd,
                    }}
            );
        } else {
            result = false;
        }
        // Results
        await client.close();
        return result;
    },
    delete : async function(reservationId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("reservation");
        // Query
        const result = await table.deleteOne({_id: ObjectId(reservationId)});
        // Results
        await client.close();
        return result;
    },
    getReservationsByUser : async function(userId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("reservation");
        // Query
        const reservations = await table.find({"refUser._id": ObjectId(userId)}).toArray();
        // Results
        await client.close();
        return reservations;
    },
    getReservationsByRessource : async function(ressourceId) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("reservation");
        // Query
        const reservations = await table.find({"refRessource._id": ObjectId(ressourceId)}).toArray();
        // Results
        await client.close();
        return reservations;
    },
    getRessourceStats : async function() {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("reservation");
        // Query
        const reservations = await table.aggregate([
            {
                $group: {
                    _id: "$refRessource._id",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {count: -1}
            }
        ]).toArray();
        // Results
        await client.close();
        return reservations;
    },
    getUserStats : async function() {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("reservation");
        // Query
        const reservations = await table.aggregate([
            {
                $group: {
                    _id: "$refUser._id",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {count: -1}
            }
        ]).toArray();
        // Results
        await client.close();
        return reservations;
    },
    getByRessourceDate : async function(ressourceId, date) {
        // Start
        await client.connect();
        // Connections
        const table = client.db(dbName).collection("reservation");
        // Query
        let reservations;
        // Get all reservations contained in the date or a reservation on a single day
        reservations = await table.find({
            'refRessource._id': ObjectId(ressourceId),
            $or: [
                {
                    'dateStart': {$lte: date.format('YYYY-MM-DDTHH:mm')},
                    'dateEnd': {$gte: date.format('YYYY-MM-DDTHH:mm')}
                },
                {
                    'dateStart': {$regex: /^date.format('YYYY-MM-DD')/},
                    'dateEnd': {$regex: /^date.format('YYYY-MM-DD')/}
                }
            ]
        }).toArray();
        // Results
        await client.close();
        return reservations;
    }
}

module.exports = Reservation;