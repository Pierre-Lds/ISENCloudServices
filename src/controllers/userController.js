// Global variables
const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const bp = require('body-parser');
const bcrypt = require('bcrypt');
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
router.get("/create", (req, res) => {
    isAdmin(req, res);
    res.render(
        "users/userForm.pug",
        {
            title: "Create a user",
            session: req.session,
            action: "Create"
        }
    );
});

router.post("/create",  async (req, res) => {
    const { name, last_name, email, password, role } = req.body;
    let hash = await bcrypt.hash(password, 10);
    let user = {
        name: name,
        last_name: last_name,
        email: email,
        password: hash,
        role: role,
    }
    let result = await User.insert(user);
    if (!result) {
        req.flash('danger', 'The email should be unique.');
    }
    res.redirect("/user/");
});

// READ
router.get("/", async (req, res) => {
    let flash = req.flash();
    res.render(
        "users/users.pug",
        {
            title: "List of users",
            session: req.session,
            flash: flash,
            users: await User.getAll(),
        }
    );
});

router.get("/:idUser/read", async (req, res) => {
    let user = await User.getById(req.params.idUser);
    let reservations = await Reservation.getReservationsByUser(req.params.idUser);
    res.render(
        "users/user.pug",
        {
            title: user.name + " " + user.last_name,
            session: req.session,
            user: user,
            reservations: reservations,
        }
    );
});

router.get('/me', async (req, res) => {
    let user = await User.getById(req.session.user._id);
    let reservations = await Reservation.getReservationsByUser(req.session.user._id);
    res.render(
        "users/user.pug",
        {
            title: user.name + " " + user.last_name,
            session: req.session,
            user: user,
            reservations: reservations,
        }
    );
});

router.get('/search/', async (req, res) => {
    console.log(">>", req.query.q);
    let users = await User.getByUsername(req.query.q);
    console.log(users);
    res.render(
        "users/users.pug",
        {
            title: "List of users",
            session: req.session,
            users: users,
        }
    );
});

// UPDATE
router.get("/:idUser/update", async (req, res) => {
    let user = await User.getById(req.params.idUser);
    res.render(
        "users/userForm.pug",
        {
            title: "Update " +user.name + " " + user.last_name,
            session: req.session,
            action: "Update",
            user: user,
        }
    );
});

router.post("/:idUser/update", async (req, res) => {
    const { _id, name, last_name, email, password, role } = req.body;
    let account = await User.getById(_id);
    let hash = await bcrypt.hash(password, 10);
    if (bcrypt.compare(password, account.password)) {
        hash = password;
    }
    let user = {
        _id: _id,
        name: name,
        last_name: last_name,
        email: email,
        password: hash,
        role: role,
    }
    let result = await User.update(user);
    if (!result) {
        req.flash('danger', 'The email should be unique.');
    }
    res.redirect("/user/");
});

// DELETE
router.post("/:idUser/delete", async (req, res) => {
    isAdmin(req, res);
    let result = await User.delete(req.params.idUser);
    if (!result) {
        req.flash('danger', 'The user is in a reservation ; cannot delete it.');
    }
    res.redirect("/user/");
});

module.exports = router;