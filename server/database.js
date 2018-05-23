const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../data/speedytransfer.sqlite');

db.run("CREATE TABLE IF NOT EXISTS message (key TEXT NOT NULL, content TEXT NOT NULL, sendTime TEXT NOT NULL)");

module.exports = class Database {
    static getMessage(key) {
        return promisifyGetSingle("SELECT content, sendTime FROM message WHERE key = ?", [key])
    }

    static addMessage(key, messageContent) {
        return promisifyRun("INSERT INTO message (key, content, sendTime) VALUES (?, ?, Datetime('now'))", [key, messageContent]);
    }

    static deleteMessage(key) {
        return promisifyRun("DELETE FROM message WHERE key = ?", [key]);
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