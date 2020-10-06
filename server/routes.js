module.exports = function(app) {
    const logger = require("@kiza/logger");
    const config = require("config")
    const database = require("./database.js");
    const { v4 } = require('uuid');

    app.use(function(req, res, next) {
        req.room = req.cookies[config.cookieName];
        next();
    });

    app.get('/', async function(req, res) {
        const room = req.room;
        const messages = await database.getMessages(room);

        res.render('index', { room, messages });
    });

    app.post('/create-room', async function(req, res) {
        try {
            if (!req.room) {
                const guid = v4();
                setCookie(res, guid);
            } else {
                logger.debug("Room cookie is already set");
            }

            res.redirect("/");
        } catch (err) {
            next(err);
        }
    });

    app.post('/add', async function(req, res) {
        try {
            if (req.room) {
                const content = req.body.content || '';
                await database.addMessage(req.room, content);
            }

            res.redirect("/");
        } catch (err) {
            next(err);
        }
    });

    app.get('/join/:key', async function(req, res, next) {
        try {
            const key = req.params.key;
            setCookie(res, key);
            res.redirect("/");
        } catch (err) {
            next(err);
        }
    });

    // Fallback routes
    app.get('*', (req, res) => res.status(404).send('404'));
    app.post('*', (req, res) => res.status(404).send('404'));
    
    app.use(function(err, req, res, next) {
        logger.error(err.stack || err);
        res.status(500).send('500');
    });

    function setCookie(res, room) {
        res.cookie(config.cookieName, room, { maxAge: 900000, httpOnly: true });
    }
};
