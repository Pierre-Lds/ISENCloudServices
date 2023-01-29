// Global variables
const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation.js");
const bp = require('body-parser')
const User = require("../models/User");
const Ressource = require("../models/Ressource");
const flash = require('connect-flash');
const moment = require('moment');

// Authorization

router.use('/', (req, res, next) => {
    if (req?.session?.user) {
        return next();
    }
    else {
        res.status(401).render('401', {session: req.session});
    }
});

function isAdmin(req, res) {
    if (req.session.user.role === 'admin') {
        return true;
    }
    else {
        res.status(401).render('401', {session: req.session});
    }
}

// CREATE
router.get("/create", async (req, res) => {
    let users = await User.getAll();
    let ressources = await Ressource.getAll();
    res.render(
        "reservations/reservationForm.pug",
        {
            title: "Create a Reservation",
            session: req.session,
            users: users,
            ressources: ressources,
        }
    );
});

router.post("/create",  async (req, res) => {
    const { dateStart, dateEnd, refRessource, refUser } = req.body;
    let user = await User.getById(refUser);
    let ressource = await Ressource.getById(refRessource);
    let reservation = {
        dateStart: dateStart,
        dateEnd: dateEnd,
        refRessource: ressource,
        refUser: user,
    };
    if (dateStart > dateEnd) {
        req.flash('danger', 'The start date must be before the end date');
    } else {
        let result = await Reservation.insert(reservation);
        if (!result) {
            req.flash('danger', 'The ressource is already reserved on this date.');
        }
    }
    res.redirect("/reservation/");
});

// READ
router.get("/", async (req, res) => {
    let flash = req.flash();
    res.render(
        "reservations/reservations.pug",
        {
            title: "Reservations",
            session: req.session,
            reservations: await Reservation.getAll(),
            flash: flash,
        }
    );
});

router.get("/:idReservation/read", async (req, res) => {
    let reservation = await Reservation.getById(req.params.idReservation);
    res.render(
        "reservations/reservation.pug",
        {
            title: "Reservation",
            session: req.session,
            reservation: reservation,
        }
    );
});

router.get("/me", async (req, res) => {
    let reservations = await Reservation.getReservationsByUser(req.session.user._id);
    res.render(
        "reservations/reservations.pug",
        {
            title: "My Reservations",
            session: req.session,
            reservations: reservations,
        }
    );
});

// UPDATE
router.get("/:idReservation/update", async (req, res) => {
    let reservation = await Reservation.getById(req.params.idReservation);
    let users = await User.getAll();
    let ressources = await Ressource.getAll();
    res.render(
        "reservations/reservationForm.pug",
        {
            title: "Update reservation",
            session: req.session,
            reservation: reservation,
            users: users,
            ressources: ressources,
        }
    );
});

router.post("/:idReservation/update", async (req, res) => {
    const { _id, dateStart, dateEnd, refRessource, refUser } = req.body;
    let user = await User.getById(refUser);
    let ressource = await Ressource.getById(refRessource);
    let reservation = {
        _id: _id,
        dateStart: dateStart,
        dateEnd: dateEnd,
        refRessource: ressource,
        refUser: user,
    }
    if (dateStart > dateEnd) {
        req.flash('danger', 'The start date must be before the end date');
    } else {
        let result = await Reservation.update(reservation);
        if (!result) {
            req.flash('danger', 'The ressource is already reserved on this date.');
        }
    }
    res.redirect("/reservation/");
});

// DELETE

router.post("/:idReservation/delete", async (req, res) => {
    await Reservation.delete(req.params.idReservation);
    res.redirect("/reservation/");
});

// PLANNING

router.get("/planning/:date?", async (req, res) => {
    // Get date
    let date = moment().format('YYYY-MM-DD');
    if (req.params.date) {
        date = moment(req.params.date,'YYYY-MM-DD');
    }
    // Get associated data
    let users = await User.getAll();
    let ressources = await Ressource.getAll();
    for (ressource of ressources) {
        let dateD = moment(date).startOf('week');
        ressource.reservations = [];
        for (let i = 0; i < 7; i++) {
            dateD.add(1, 'days');
            let reservation = await Reservation.getByRessourceDate(ressource._id, dateD);
            ressource.reservations.push(reservation);
        }
    }
    res.render(
        "reservations/planning.pug",
        {
            title: "Planning",
            session: req.session,
            users: users,
            ressources: ressources,
            dateD: date,
            moment: moment,
            Reservation: Reservation,
        }
    );
});

// INFOCENTER

router.get("/infocenter", async (req, res) => {
    // Get ressources stats
    let ressources = await Reservation.getRessourceStats();
    // Upper
    const highestCountRessources = Math.max(...ressources.map(item => item.count));
    const highestCountRessourcesObjects = ressources.filter(item => item.count === highestCountRessources);
    for (const ressourceU of highestCountRessourcesObjects) {
        let ressourceObject = await Ressource.getById(ressourceU._id);
        ressourceU.name = ressourceObject.name;
    }
    // Lower
    const lowestCountRessources = Math.min(...ressources.map(item => item.count));
    const lowestCountRessourcesObjects = ressources.filter(item => item.count === lowestCountRessources);
    for (const ressourceL of lowestCountRessourcesObjects) {
        let ressourceObject = await Ressource.getById(ressourceL._id);
        ressourceL.name = ressourceObject.name;
    }
    // Get consumers stats
    let consumers = await Reservation.getUserStats();
    // Upper
    const highestCountConsumers = Math.max(...consumers.map(item => item.count));
    const highestCountConsumersObjects = consumers.filter(item => item.count === highestCountConsumers);
    for (const consumerU of highestCountConsumersObjects) {
        let user = await User.getById(consumerU._id);
        consumerU.name = user.name;
        consumerU.last_name = user.last_name;
    }
    // Lower
    const lowestCountConsumers = Math.min(...consumers.map(item => item.count));
    const lowestCountConsumersObjects = consumers.filter(item => item.count === lowestCountConsumers);
    for (const consumerL of lowestCountConsumersObjects) {
        let user = await User.getById(consumerL._id);
        consumerL.name = user.name;
        consumerL.last_name = user.last_name;
    }

    res.render(
        "reservations/infocenter.pug",
        {
            title: "InfoCenter",
            session: req.session,
            highestCountConsumersObjects: highestCountConsumersObjects,
            lowestCountConsumersObjects: lowestCountConsumersObjects,
            highestCountRessourcesObjects: highestCountRessourcesObjects,
            lowestCountRessourcesObjects: lowestCountRessourcesObjects,
        }
    );
});

module.exports = router;