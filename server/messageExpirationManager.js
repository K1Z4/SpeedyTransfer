const database = require("./database.js");
const minute = 60000;
setInterval(() => database.deleteExpiredMessages().catch(err => { throw err }), minute);