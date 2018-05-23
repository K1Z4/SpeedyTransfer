module.exports = function(app) {
    const logger = require("./logger.js");
    const database = require("./database.js");

    app.get('/', (req, res) => res.render('index'));
    app.post('/add', async function(req, res) {
        const content = req.body.content || '';

        try {
            const key = Math.random().toString(36).substring(7);
            await database.addMessage(key, content);
            res.render("sent", { key });
        } catch (err) {
            logAndError(err, res);
        }
    });

    app.post('/delete', async function(req, res) {
        const key = req.body.key;
        if (!key) return res.status(400).send("invalid input");

        try {
            await database.deleteMessage(key);
            res.render("notify", { message: "Message deleted" });
        } catch (err) {
            logAndError(err, res);
        }
    });

    app.get('/get/:key', async function(req, res) {
        try {
            const key = req.params.key;
            const message = await database.getMessage(key);
            if (!message) return res.status(404).render("notify", { message: "Message not found" });

            res.render("message", { message: message.content, key });
        } catch (err) {
            logAndError(err, res);
        }
    });

    // Fallback routes
    app.get('*', (req, res) => res.status(404).send('404'));
    app.post('*', (req, res) => res.status(404).send('404'));
    
    app.use(function(err, req, res, next) {
        logAndError(err, res)
    });

    function logAndError(err, res) {
        logger.error(err.stack || err);
        res.status(500).send('500');
    }
};
