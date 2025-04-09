const express = require("express");
const router = express.Router();
const db = require("../db/db");
const {
  getOneBooking,
  getBookings,
  updateBooking,
  deleteBooking,
  addBooking,
} = require("../controllers/bookingsController");

// Réserver une salle
router.post("/book-room", addBooking);

// afficher une réservation

router.get("/show-booking/:id", getOneBooking);

// Affiches les réservations
router.get("/show-bookings/:user_id", getBookings);

// modifier une réservation
router.patch("/update-bookings/:id", updateBooking);

// supprimer une réservation
router.delete("/delete-booking/:id", deleteBooking);

module.exports = router;
