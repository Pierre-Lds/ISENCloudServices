// Global variables
const express = require('express');
const User = require("../models/User");
const router = express.Router();
const session = require("express-session");
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const bp = require("body-parser");

// Authorization

router.get('/', async (req, res) => {
    res.render(
        'homepage.pug',
        {
            title: "Homepage",
            session: req.session,
        }
    );
});

// AUTHENTIFICATION

router.get('/login', (req, res) => {
    if(req?.session?.user){
        res.redirect("/dashboard");
    }
    else{
        let flash = req.flash();
        res.render(
            'login.pug',
            {
                title: 'Login',
                session: req.session,
                flash: flash,
            }
        );
    }
});

router.post('/login', async (req, res) => {
    const { mail, password } = req.body;
    let user = await User.getByEmail(mail);
    if (await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        res.redirect("/dashboard");
    } else {
        req.flash('danger', 'The combinaison of email and password is incorrect.');
        res.redirect("/login");
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

// DASHBOARD

router.get('/dashboard', async (req, res) => {
    res.render(
        'dashboard.pug',
        {
            title: "Dashboard",
            session: req.session,
            user: req.session.user,
        }
    );
});

module.exports = router;