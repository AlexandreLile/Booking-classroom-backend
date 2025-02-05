const express = require("express");
const router = express.Router();
const db = require("../db/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.get("/", function (req, res) {
  res.send("Hello, world!");
});
router.post("/login", (req, res) => {
  // Récupération des paramètres POST (username et password)
  const { username, password } = req.body;
  if (password === "toto") {
    // Encodage du JWT via la variable d'environnement JWT_SECRET
    const jwtToken = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json(jwtToken);
  } else {
    res.status(401).json({ message: "Authentification échouée." });
  }
});

router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  // Obtenir la date et l'heure actuelles
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

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
        "INSERT INTO user(firstname, lastname, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        [firstname, lastname, email, hashedPassword, currentDate, currentDate]
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
