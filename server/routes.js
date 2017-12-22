
module.exports = function(app, passport) {
    const logger = require("./logger.js");
    const crypto = require("./crypto.js");
    const database = require("./database.js");

    // Login routes
    app.get('/create-account', (req, res) => res.render('create-account', { user: req.user }));
    app.post('/create-account', async (req, res) => {
        const password = req.body.password;
        const username = req.body.username;

        if (!password || !username) return res.status(400).send("username or password must not be empty");
        if (password.length < 8) return res.status(400).send("password must be at least 8 characters");

        try {
            const passwordHash = await crypto.hashPassword(password);
            await database.addUser(username, passwordHash)
            res.redirect("/login");
        } catch (err) {
            logAndError(err, res);
        }
    });
    
    app.get('/login', (req, res) => {
        if (req.isAuthenticated()) return res.redirect("/dashboard"); 
        res.render('login', { user: req.user });
    });
    app.post('/login', passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login?error' }), (req, res) => res.redirect("/dashboard"));
    app.get('/logout', ensureAuthenticated, (req, res) => {
        req.logout();
        res.redirect('/');
    });

    // App routes
    app.get('/', (req, res) => res.render('landing', { user: req.user }));

    app.get('/dashboard', ensureAuthenticated, async function(req, res) {
        try {
            const messages = await database.getMessages(req.user.userID);
            messages.map(msg => {
                msg.shortContent = msg.content.split(0,30)[0];
                if (msg.shortContent !== msg.content) msg.shortContent += "...";
                return msg;
            })
            res.render("dashboard", { messages, user: req.user });
        } catch (err) {
            logAndError(err, res);
        }
    });

    app.get('/message/:messageID', ensureAuthenticated, async function(req, res) {
        try {
            const messageID = req.params.messageID;
            const message = await database.getMessage(messageID);
            if (!message) return res.status(404).send('404');
            if (message.userID != req.user.userID) return res.status(404).send('404');

            res.render("message", { message, user: req.user });
        } catch (err) {
            logAndError(err, res);
        }
    });

    app.get('/send/', ensureAuthenticated, (req, res) => res.render('send', { user: req.user }));
    app.post('/send/', ensureAuthenticated, async function(req, res) {
        const content = req.body.content;
        const userID = req.user.userID;
        if (!content) return res.status(400).send("invalid input");

        try {
            await database.addMessage(userID, content);
            res.redirect("/dashboard");
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

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) return next(); 
        return res.redirect('/login');
    }
};
