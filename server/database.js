const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../data/speedytransfer.sqlite');

db.run("CREATE TABLE IF NOT EXISTS user (username TEXT NOT NULL UNIQUE, passwordHash TEXT NOT NULL, createdDate TEXT NOT NULL," 
    +" CONSTRAINT unique_username UNIQUE (username))");
db.run("CREATE TABLE IF NOT EXISTS message (content TEXT NOT NULL, sendTime TEXT NOT NULL, userID INTEGER NOT NULL," 
    + " FOREIGN KEY(userID) REFERENCES user(rowid))");

module.exports = class Database {
    // User
    static getUserPasswordHash(username) {
        return promisifyGetSingle("SELECT rowid AS userID, passwordHash FROM user WHERE username = ?", [username])
    }

    static addUser(username, passwordHash) {
        return promisifyRun("INSERT INTO user (username, passwordHash, createdDate) VALUES (?, ?, Datetime('now'))", [username, passwordHash]);
    }

    static deleteUser(userID) {
        return promisifyRun("DELETE FROM user WHERE rowid = ?", [userID]);
    }

    // Message
    static getMessages(userID) {
        return promisifyGet("SELECT message.rowid AS messageID, content, sendTime FROM message WHERE userID = ?", [userID])
    }

    static getMessage(messageID) {
        return promisifyGetSingle("SELECT message.rowid AS messageID, content, sendTime, userID FROM message WHERE messageID = ?", [messageID])
    }

    static addMessage(userID, messageContent) {
        return promisifyRun("INSERT INTO message (userID, content, sendTime) VALUES (?, ?, Datetime('now'))", [userID, messageContent]);
    }

    static deleteMessage(messageID) {
        return promisifyRun("DELETE FROM message WHERE rowid = ?", [messageID]);
    }

    static deleteExpiredMessages() {
        return promisifyRun("DELETE FROM message WHERE sendTime <= Datetime('now', '-15 minutes')", []);
    }
}

function promisifyGetSingle(sql, data) {
    return new Promise((resolve, reject) => {
        db.serialize(function() {
            db.get(sql, data, (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    });
}

function promisifyGet(sql, data) {
    return new Promise((resolve, reject) => {
        db.serialize(function() {
            db.all(sql, data, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    });
}

function promisifyRun(sql, data) {
    return new Promise((resolve, reject) => {
        db.serialize(function() {
            db.run(sql, data, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
}