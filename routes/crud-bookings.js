const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Réserver une salle
router.post("/book-room", async (req, res) => {
  const { user_id, room_id, start_at, end_at } = req.body;

  try {
    const [existingBookings] = await db.promise().query(
      `SELECT * FROM bookings 
         WHERE room_id = ? 
         AND ((start_at BETWEEN ? AND ?) OR (end_at BETWEEN ? AND ?))`,
      [room_id, start_at, end_at, start_at, end_at]
    );

    if (existingBookings.length > 0) {
      return res
        .status(400)
        .json({ message: "Salle déjà réservée à cette période" });
    }

    const [result] = await db
      .promise()
      .query(
        "INSERT INTO bookings (user_id, room_id, start_at, end_at) VALUES (?, ?, ?, ?)",
        [user_id, room_id, start_at, end_at]
      );

    res.json({
      message: "Réservation effectuée avec succès",
      booking_id: result.insertId,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// afficher une réservation

router.get("/show-booking/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Requête pour récupérer les infos de la réservation avec jointure
    const [booking] = await db.promise().query(
      `SELECT 
           b.id, 
           u.firstname, 
           u.lastname, 
           u.email, 
           r.name AS room_name, 
           r.capacity, 
           b.start_at, 
           b.end_at
         FROM bookings b
         JOIN user u ON b.user_id = u.id
         JOIN rooms r ON b.room_id = r.id
         WHERE b.id = ?`,
      [id]
    );

    // Vérifier si la réservation existe
    if (booking.length === 0) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    res.json(booking[0]); // Retourner la réservation trouvée
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// Affiches les réservations
router.get("/show-bookings/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const [bookings] = await db.promise().query(
      `SELECT b.id, r.name AS room_name, b.start_at, b.end_at
         FROM bookings b
         JOIN rooms r ON b.room_id = r.id
         WHERE b.user_id = ?`,
      [user_id]
    );

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// modifier une réservation
router.patch("/update-bookings/:id", async (req, res) => {
  const { id } = req.params;
  const { room_id, start_at, end_at } = req.body;

  try {
    const [existingBooking] = await db
      .promise()
      .query("SELECT * FROM bookings WHERE id = ?", [id]);

    if (existingBooking.length === 0) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    if (room_id && start_at && end_at) {
      const [conflictingBooking] = await db.promise().query(
        `SELECT * FROM bookings 
             WHERE room_id = ? 
             AND ((start_at BETWEEN ? AND ?) OR (end_at BETWEEN ? AND ?)) 
             AND id != ?`,
        [room_id, start_at, end_at, start_at, end_at, id]
      );

      if (conflictingBooking.length > 0) {
        return res
          .status(400)
          .json({ message: "La salle est déjà réservée à cet horaire." });
      }
    }

    const [result] = await db.promise().query(
      `UPDATE bookings 
           SET room_id = COALESCE(?, room_id), 
               start_at = COALESCE(?, start_at), 
               end_at = COALESCE(?, end_at)
           WHERE id = ?`,
      [room_id, start_at, end_at, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(400)
        .json({ message: "Aucune modification effectuée." });
    }

    res.json({ message: "Réservation mise à jour avec succès !" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// supprimer une réservation
router.delete("/delete-booking/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db
      .promise()
      .query("DELETE FROM bookings WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    res.json({ message: "Réservation annulée avec succès" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;
