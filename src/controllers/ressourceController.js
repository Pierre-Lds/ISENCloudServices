// Global variables
const express = require("express");
const router = express.Router();
const Ressource = require("../models/Ressource.js");
const bp = require('body-parser')
const Cluster = require("../models/Cluster.js");
const refArchitectureCPU = require("../models/refArchitectureCPU.js");
const Reservation = require("../models/Reservation.js");

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
    isAdmin(req, res);
    clusters = await Cluster.getAll();
    refArchitecturesCPU = await refArchitectureCPU.getAll();
    res.render(
        "ressources/ressourceForm.pug",
        {
            title: "Create a Ressource",
            session: req.session,
            action: "Create",
            clusters: clusters,
            refArchitecturesCPU: refArchitecturesCPU,
        }
    );
});

router.post("/create",  async (req, res) => {
    const { name, nbThread, RAM, rrefArchitectureCPU, refCluster } = req.body;
    let cluster = await Cluster.getById(refCluster);
    let architectureCPU = await refArchitectureCPU.getById(rrefArchitectureCPU);
    let ressource = {
        name: name,
        nbThread: nbThread,
        RAM: RAM,
        refArchitectureCPU: architectureCPU,
        refCluster: cluster,
    }
    let result = await Ressource.insert(ressource);
    if (!result) {
        req.flash('danger', 'The name should be unique.');
    }
    res.redirect("/ressource/");
});

// READ
router.get("/", async (req, res) => {
    let flash = req.flash();
    res.render(
        "ressources/ressources.pug",
        {
            title: "List of ressources",
            session: req.session,
            flash: flash,
            ressources: await Ressource.getAll(),
        }
    );
});

router.get("/:idRessource/read", async (req, res) => {
    let ressource = await Ressource.getById(req.params.idRessource);
    let reservations = await Reservation.getReservationsByRessource(req.params.idRessource);
    res.render(
        "ressources/ressource.pug",
        {
            title: ressource.name,
            session: req.session,
            ressource: ressource,
            reservations: reservations,
        }
    );
});

// UPDATE
router.get("/:idRessource/update", async (req, res) => {
    isAdmin(req, res);
    let ressource = await Ressource.getById(req.params.idRessource);
    let clusters = await Cluster.getAll();
    let refArchitecturesCPU = await refArchitectureCPU.getAll();
    res.render(
        "ressources/ressourceForm.pug",
        {
            title: "Update " + ressource.name,
            session: req.session,
            action: "Update",
            ressource: ressource,
            clusters: clusters,
            refArchitecturesCPU: refArchitecturesCPU,
        }
    );
});

router.post("/:idRessource/update", async (req, res) => {
    const { _id, name, nbThread, RAM, rrefArchitectureCPU, refCluster } = req.body;
    let cluster = await Cluster.getById(refCluster);
    let architectureCPU = await refArchitectureCPU.getById(rrefArchitectureCPU);
    let ressource = {
        _id: _id,
        name: name,
        nbThread: nbThread,
        RAM: RAM,
        refArchitectureCPU: architectureCPU,
        refCluster: cluster,
    }
    let result = await Ressource.update(ressource);
    if (!result) {
        req.flash('danger', 'The name should be unique.');
    }
    res.redirect("/ressource/");
});

// DELETE
router.post("/:idRessource/delete", async (req, res) => {
    isAdmin(req, res);
    let result = await Ressource.delete(req.params.idRessource);
    if (!result) {
        req.flash('danger', 'The ressource is in a reservation ; cannot delete it.');
    }
    res.redirect("/ressource/");
});


module.exports = router;