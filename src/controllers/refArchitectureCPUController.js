// Global variables
const express = require("express");
const router = express.Router();
const RefArchitectureCPUController = require("../models/RefArchitectureCPU.js");
const bp = require('body-parser')
const Ressource = require("../models/Ressource.js");

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
router.get("/create", (req, res) => {
    isAdmin(req, res);
    res.render(
        "refArchitecturesCPU/refArchitectureCPUForm.pug",
        {
            title: "Create an architecture CPU",
            session: req.session,
            action: "Create"
        }
    );
});

router.post("/create",  async (req, res) => {
    const { name } = req.body;
    let refArchitectureCPU = {
        name: name,
    }
    let result = await RefArchitectureCPUController.insert(refArchitectureCPU);
    if (!result) {
        req.flash('danger', 'The name should be unique.');
    }
    res.redirect("/refArchitectureCPU/");
});

// READ
router.get("/", async (req, res) => {
    let flash = req.flash();
    res.render(
        "refArchitecturesCPU/refArchitecturesCPU.pug",
        {
            title: "List of architectures CPU",
            session: req.session,
            flash: flash,
            refArchitecturesCPU: await RefArchitectureCPUController.getAll(),
        }
    );
});

router.get("/:idRefArchitectureCPU/read", async (req, res) => {
    let refArchitectureCPU = await RefArchitectureCPUController.getById(req.params.idRefArchitectureCPU);
    let ressources = await Ressource.getRessourcesByArchitectureCPU(req.params.idRefArchitectureCPU);
    res.render(
        "refArchitecturesCPU/refArchitectureCPU.pug",
        {
            title: refArchitectureCPU.name,
            session: req.session,
            refArchitectureCPU: refArchitectureCPU,
            ressources: ressources,
        }
    );
});

// UPDATE
router.get("/:idRefArchitectureCPUController/update", async (req, res) => {
    isAdmin(req, res);
    let refArchitectureCPU = await RefArchitectureCPUController.getById(req.params.idRefArchitectureCPUController);
    res.render(
        "refArchitecturesCPU/refArchitectureCPUForm.pug",
        {
            title: "Update " + refArchitectureCPU.name,
            session: req.session,
            action: "Update",
            refArchitectureCPU: refArchitectureCPU,
        }
    );
});

router.post("/:idRefArchitectureCPUController/update", async (req, res) => {
    const { _id, name } = req.body;
    let refArchitectureCPU = {
        _id: _id,
        name: name,
    }
    let result = await RefArchitectureCPUController.update(refArchitectureCPU);
    if (!result) {
        req.flash('danger', 'The name should be unique.');
    }
    res.redirect("/refArchitectureCPU/");
});

// DELETE
router.post("/:idRefArchitectureCPU/delete", async (req, res) => {
    isAdmin(req, res);
    let result = await RefArchitectureCPUController.delete(req.params.idRefArchitectureCPU);
    if (!result) {
        req.flash('danger', 'Ressources use this architecture ; cannot delete it.');
    }
    res.redirect("/refArchitectureCPU/");
});

module.exports = router;