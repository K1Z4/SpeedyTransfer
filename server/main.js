"use strict";

const path = require('path');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const config = require("../config.json");
const SQLiteSessionStore = require('connect-sqlite3')(session);

const logger = require("./logger.js");

logger.info("Starting...");

const app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, '../static')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

// Passport
require('./configureAuth.js');
app.use(session({ 
    name: "speedyTransferSid",
    store: new SQLiteSessionStore({ dir: "../data/", db: "sessions.sqlite" }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 182 * 24 * 60 * 60 * 1000 } // ~6 months
}));
app.use(passport.initialize());
app.use(passport.session());

require('./routes.js')(app, passport);
require('./messageExpirationManager.js');

app.listen(config.port);
logger.info("Running...");
