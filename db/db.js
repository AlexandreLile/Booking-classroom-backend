const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "root",
  database: process.env.DB_NAME || "booking_classroom",
  port: process.env.DB_PORT || 8889,
});

connection.connect((err) => {
  if (err) {
    console.error("Erreur de connexion :", err.stack);
    return;
  }
  console.log("Connecté à MySQL avec ID " + connection.threadId);
});

module.exports = connection;
