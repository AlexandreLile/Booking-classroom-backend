const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { isAdmin } = require("../middlewares/auth");

// afficher les utilisateurs
router.get("/users", isAdmin, async (req, res) => {
  try {
    const [users] = await db.promise().query("SELECT * FROM user");
    res.json(users);
  } catch (err) {
    console.error(err.message);
  }
});

// afficher un utilisateur avec l'historique des salles réservés
router.get("/user/:id", isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [user] = await db
      .promise()
      .query(
        "SELECT id, firstname, lastname, email, role FROM user WHERE id = ?",
        [id]
      );

    if (user.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const [bookings] = await db.promise().query(
      `SELECT r.id AS room_id, r.name AS room_name, b.start_at, b.end_at
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.user_id = ?`,
      [id]
    );

    res.json({
      user: user[0],
      bookings: bookings,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

router.delete("/user/:id", isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [user] = await db
      .promise()
      .query("SELECT * FROM user WHERE id = ?", [id]);

    if (user.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    await db.promise().query("DELETE FROM bookings WHERE user_id = ?", [id]);

    await db.promise().query("DELETE FROM user WHERE id = ?", [id]);

    res.json({ message: "Utilisateur et réservations supprimés avec succès" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// modification d'un utilisateur

router.patch("/user/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, role } = req.body;

  try {
    const [user] = await db
      .promise()
      .query("SELECT * FROM user WHERE id = ?", [id]);

    if (user.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    let updateFields = [];
    let values = [];

    if (firstname) {
      updateFields.push("firstname = ?");
      values.push(firstname);
    }
    if (lastname) {
      updateFields.push("lastname = ?");
      values.push(lastname);
    }
    if (email) {
      updateFields.push("email = ?");
      values.push(email);
    }
    if (role) {
      updateFields.push("role = ?");
      values.push(role);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
    }

    updateFields.push("updated_at = ?");
    values.push(new Date().toISOString().slice(0, 19).replace("T", " "));

    const sql = `UPDATE user SET ${updateFields.join(", ")} WHERE id = ?`;
    values.push(id);

    await db.promise().query(sql, values);

    res.json({ message: "Utilisateur mis à jour avec succès" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;
