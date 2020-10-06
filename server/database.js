const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../data/speedytransfer.sqlite');

db.run("CREATE TABLE IF NOT EXISTS message (room TEXT NOT NULL, content TEXT NOT NULL, sendTime TEXT NOT NULL)");

module.exports = class Database {
    static getMessages(room) {
        return promisifyAll("SELECT content, sendTime FROM message WHERE room = ?", [room])
    }

    static addMessage(room, messageContent) {
        return promisifyRun("INSERT INTO message (room, content, sendTime) VALUES (?, ?, Datetime('now'))", [room, messageContent]);
    }

    static deleteExpiredMessages() {
        return promisifyRun("DELETE FROM message WHERE sendTime <= Datetime('now', '-15 minutes')", []);
    }
}

function promisifyAll(sql, data) {
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