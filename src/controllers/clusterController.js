// Global variables
const express = require("express");
const router = express.Router();
const Cluster = require("../models/Cluster.js");
const bp = require('body-parser');
const Ressource = require("../models/Ressource");

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
        "clusters/clusterForm.pug",
        {
            title: "Create a cluster",
            session: req.session,
            action: "Create"
        }
    );
});

router.post("/create",  async (req, res) => {
    const { name } = req.body;
    let cluster = {
        name: name,
    }
    let result = await Cluster.insert(cluster);
    if (!result) {
        req.flash('danger', 'The name should be unique.');
    }
    res.redirect("/cluster/");
});

// READ
router.get("/", async (req, res) => {
    let flash = req.flash();
    res.render(
        "clusters/clusters.pug",
        {
            title: "List of clusters",
            session: req.session,
            flash: flash,
            clusters: await Cluster.getAll(),
        }
    );
});

router.get("/:idCluster/read", async (req, res) => {
    let cluster = await Cluster.getById(req.params.idCluster);
    let ressources = await Ressource.getRessourcesByCluster(req.params.idCluster);
    res.render(
        "clusters/cluster.pug",
        {
            title: cluster.name,
            session: req.session,
            cluster: cluster,
            ressources: ressources,
        }
    );
});

// UPDATE
router.get("/:idCluster/update", async(req, res) => {
    isAdmin(req, res);
    let cluster = await Cluster.getById(req.params.idCluster);
    res.render(
        "clusters/clusterForm.pug",
        {
            title: "Update "+ cluster.name,
            session: req.session,
            action: "Update",
            cluster: cluster,
        }
    );
});

router.post("/:idCluster/update",  async (req, res) => {
    const { _id, name } = req.body;
    let cluster = {
        _id: _id,
        name: name,
    }
    let result = await Cluster.update(cluster);
    if (!result) {
        req.flash('danger', 'The name should be unique.');
    }
    res.redirect("/cluster/");
});

// DELETE
router.post("/:idCluster/delete",  async (req, res) => {
    isAdmin(req, res);
    let result = await Cluster.delete(req.params.idCluster);
    if (!result) {
        req.flash('danger', 'Ressources belongs to this cluster ; cannot delete it.');
    }
    res.redirect("/cluster/");
});

module.exports = router;