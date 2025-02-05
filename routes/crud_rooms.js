const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Ajouter une room
router.post("/add-room", async (req, res) => {
  const { name, capacity } = req.body;
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  try {
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO rooms (name, capacity, created_at, updated_at) VALUES (?, ?, ?, ?)",
        [name, capacity, currentDate, currentDate]
      );
    res.json({
      message: "Salle ajoutée avec succès",
      room_id: result.insertId,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;
