const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "booking_classroom",
  port: process.env.DB_PORT || 3306,
});

connection.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de donnée :", err.stack);
    return;
  }
  console.log("Connecté à MySQL avec ID " + connection.threadId);
});

module.exports = connection;
