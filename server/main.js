"use strict";

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

const config = require("config");
const logger = require("@kiza/logger");

const app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, '../static')));

app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./routes.js')(app);
require('./messageExpirationManager.js');

app.listen(config.port);
logger.info(`Running on port ${config.port}`);
