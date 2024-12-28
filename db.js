const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./sovereign-strength.db");

module.exports = db;
