const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  const token = authHeader.split(" ")[1]; // Récupération du token après "Bearer"

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    next();
  });
}

module.exports = auth;
