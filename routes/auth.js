const express = require("express");
const router = express.Router();
const db = require("../db/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.get("/", function (req, res) {
  res.send("Hello, world!");
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // vérifie si l'utilisateur existe
    const [user] = await db
      .promise()
      .query(
        "SELECT id, firstname, lastname, email, password, role FROM user WHERE email = ?",
        [email]
      );

    // vérifie si l'utilisateur n'existe pas
    if (user.length === 0) {
      return res.status(400).json({ msg: "Utilisateur non trouvé" });
    }

    // Compare le mot de passe avec celui de la base de données
    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Mot de passe incorrect" });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { user: { id: user[0].id, role: user[0].role } },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Répondre avec le token et les informations de l'utilisateur
    res.json({
      msg: "Connexion réussie !",
      token,
      user: {
        id: user[0].id,
        firstname: user[0].firstname,
        lastname: user[0].lastname,
        email: user[0].email,
        role: user[0].role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password, role } = req.body;

  // Obtenir la date et l'heure actuelles
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  // définition du role user par defaut
  const userRole =
    role && (role === "admin" || role === "user") ? role : "user";

  try {
    // Vérifier si l'utilisateur existe déjà
    const [existingUser] = await db
      .promise()
      .query("SELECT id FROM user WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ msg: "Utilisateur déjà existant" });
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insérer l'utilisateur dans la base de données avec created_at et updated_at
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO user(firstname, lastname, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          firstname,
          lastname,
          email,
          hashedPassword,
          userRole,
          currentDate,
          currentDate,
        ]
      );

    // Générer un token JWT
    const token = jwt.sign(
      { user: { id: result.insertId } },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Inscription réussie !",
      token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;
