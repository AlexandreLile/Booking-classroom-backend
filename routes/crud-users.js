const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { isAdmin } = require("../middlewares/auth");
const {
  getAllUsers,
  getOneUser,
  UpdateOneUser,
  deleteOneUser,
} = require("../controllers/userController");

// afficher les utilisateurs
router.get("/users", isAdmin, getAllUsers);

// afficher un utilisateur avec l'historique des salles réservés
router.get("/user/:id", isAdmin, getOneUser);

router.delete("/user/:id", isAdmin, deleteOneUser);

// modification d'un utilisateur

router.patch("/user/:id", isAdmin, UpdateOneUser);

module.exports = router;
