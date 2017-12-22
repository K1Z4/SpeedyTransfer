const LocalStrategy = require('passport-local').Strategy;
const database = require('./database.js');
const crypto = require('./crypto.js');

const passport = require('passport');

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    async function(username, password, done) {
        try {
            const user = await database.getUserPasswordHash(username);
            if (!user) return done(null, false, { message: 'Incorrect username.' });
            if (!await crypto.comparePassword(password, user.passwordHash)) return done(null, false, { message: 'Incorrect password.' });
            return done(null, user);
        } catch (err) {
            done(err);
        }
    }
));

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(async function(userID, done) {
    return done(null, userID);
});
