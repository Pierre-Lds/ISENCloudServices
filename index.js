// Required
require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require("express-session");
const port = process.env.PORT;
const router = express();
const flash = require('connect-flash');
const bp = require("body-parser");

// Middlewares
router.use("/", express.static("public"));
router.engine('pug', require('pug').__express);
router.set('views', path.join(__dirname, "./public/views"));
router.set('view engine', 'pug');
router.use(morgan('dev'));
router.use(session({
    secret: 'top secret',
    resave: false,
    saveUninitialized: true
}));
router.use(bp.json())
router.use(bp.urlencoded({ extended: true }))
router.use(flash());

// Required Controllers
const mainController = require('./src/controllers/mainController.js');
const clusterController = require('./src/controllers/clusterController.js');
const refArchitectureCPUController = require('./src/controllers/refArchitectureCPUController.js');
const reservationController = require('./src/controllers/reservationController.js');
const ressourceController = require('./src/controllers/ressourceController.js');
const userController = require('./src/controllers/userController.js');

// Use Controllers
router.use('/', mainController);
router.use('/cluster/', clusterController);
router.use('/refArchitectureCPU/', refArchitectureCPUController);
router.use('/reservation/', reservationController);
router.use('/ressource/', ressourceController);
router.use('/user/', userController);
router.use('*', (req, res) => {
    res.status(404).render('404', {session: req.session});
});


router.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
