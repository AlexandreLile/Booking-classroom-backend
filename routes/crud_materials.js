const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Ajouter un material
router.post("/add-material", async (req, res) => {
  const name  = req.body;
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  try {
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO materiels (name, created_at, updated_at) VALUES (?, ?, ?)",
        [name, currentDate, currentDate]
      );
    res.json({
      message: "Matériel ajouté avec succès",
      material_id: result.insertId,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;