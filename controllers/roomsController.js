const db = require("../db/db");

// fonctions pour afficher les salles
exports.getAllRooms = async (req, res) => {
  try {
    const [rooms] = await db.promise().query("SELECT * FROM rooms");
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// fontion pour afficher une salle

exports.getOneRoom = async (req, res) => {
  const roomId = req.params.id;
  try {
    const [room] = await db
      .promise()
      .query("SELECT * FROM rooms WHERE id =?", [roomId]);

    if (room.length === 0) {
      return res.status(404).json({ message: "Salle non trouvée" });
    }

    res.json(room[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// ajouter une salle (role admin)

exports.addRoom = async (req, res) => {
  const { name, capacity } = req.body;
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  try {
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO rooms (name, capacity, created_at, updated_at) VALUES (?, ?, ?, ?)",
        [name, capacity, currentDate, currentDate]
      );
    res.json({
      message: "Salle ajoutée avec succès",
      room_id: result.insertId,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// Modifier une page (role admin)

exports.updateRoom = async (req, res) => {
  const { name, capacity } = req.body;
  const roomId = req.params.id;
  const updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    const [existingRoom] = await db
      .promise()
      .query("SELECT * FROM rooms WHERE id = ?", [roomId]);

    if (existingRoom.length === 0) {
      return res.status(404).json({ message: "Salle non trouvée" });
    }

    const fields = [];
    const values = [];

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }
    if (capacity) {
      fields.push("capacity = ?");
      values.push(capacity);
    }

    fields.push("updated_at = ?");
    values.push(updatedAt);

    values.push(roomId);

    if (fields.length === 1) {
      return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
    }

    const query = `UPDATE rooms SET ${fields.join(", ")} WHERE id = ?`;
    await db.promise().query(query, values);

    res.json({ message: "Salle mise à jour avec succès" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

exports.deleteRoom = async (req, res) => {
  const roomId = req.params.id;
  try {
    // Vérifier si la salle existe
    const [existingRoom] = await db
      .promise()
      .query("SELECT * FROM rooms WHERE id =?", [roomId]);

    if (existingRoom.length === 0) {
      return res.status(404).json({ message: "Salle non trouvée" });
    }

    // Supprimer la salle
    const [result] = await db
      .promise()
      .query("DELETE FROM rooms WHERE id =?", [roomId]);

    res.json({ message: "Salle supprimée avec succès" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};
