const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { isAdmin } = require("../middlewares/auth");
const {
  getAllRooms,
  getOneRoom,
  addRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomsController");

// afficher les rooms
router.get("/rooms", getAllRooms);

// afficher une room
router.get("/room/:id", getOneRoom);

// Ajouter une room
router.post("/admin/add-room", isAdmin, addRoom);

// Modifier une room

router.patch("/admin/update-room/:id", isAdmin, updateRoom);

// Supprimer une room
router.delete("/admin/delete-room/:id", isAdmin, deleteRoom);
module.exports = router;
