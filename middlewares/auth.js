const jwt = require("jsonwebtoken");

// Middleware pour vérifier si l'utilisateur est authentifié
function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  const token = authHeader.split(" ")[1]; // Récupération du token après "Bearer"

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    req.user = decoded.user; // Stocker les infos de l'utilisateur dans req.user
    next();
  });
}

// Middleware pour vérifier si l'utilisateur est un admin
function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé. Admin uniquement." });
  }
  next();
}
module.exports = { auth, isAdmin };
