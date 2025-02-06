const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { isAdmin } = require("../middlewares/auth");

router.post('/admin/add-room-materials', isAdmin, async (req, res) => {
    const { room_id, material_ids } = req.body;

    if (!Array.isArray(material_ids) || material_ids.length === 0) {
        return res.status(400).json({ message: "La liste des matériels est vide ou invalide" });
    }

    try {
        // Vérifier si la salle existe
        const [room] = await db.promise().query(
            `SELECT * FROM rooms WHERE id = ?`,
            [room_id]
        );
        if (room.length === 0) {
            return res.status(400).json({ message: "Salle inexistante" });
        }

        // Filtrer les matériels existants
        const [existingMaterials] = await db.promise().query(
            `SELECT id FROM materiels WHERE id IN (?)`,
            [material_ids]
        );
        const existingMaterialIds = existingMaterials.map(m => m.id);

        if (existingMaterialIds.length === 0) {
            return res.status(400).json({ message: "Aucun des matériels fournis n'existe" });
        }

        // Vérifier quels matériels sont déjà associés à la salle
        const [existingRoomMaterials] = await db.promise().query(
            `SELECT materiel_id FROM rooms_materiels WHERE room_id = ? AND materiel_id IN (?)`,
            [room_id, existingMaterialIds]
        );
        const alreadyLinkedIds = existingRoomMaterials.map(m => m.material_id);

        // Filtrer ceux qui ne sont pas encore associés
        const newMaterialIds = existingMaterialIds.filter(id => !alreadyLinkedIds.includes(id));

        if (newMaterialIds.length === 0) {
            return res.status(400).json({ message: "Tous ces matériels sont déjà associés à cette salle" });
        }

        // Insérer les nouvelles associations
        const values = newMaterialIds.map(id => [room_id, id]);
        await db.promise().query(
            `INSERT INTO rooms_materiels (room_id, materiel_id) VALUES ?`,
            [values]
        );

        res.json({ message: "Matériels associés à la salle avec succès" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erreur serveur");
    }
});

router.get("/room-materials/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const [roomMaterials] = await db.promise().query(
        `SELECT m.* FROM materiels m 
         JOIN rooms_materiels rm ON m.id = rm.materiel_id 
         WHERE rm.room_id = ?`,
        [id]
      );
  
      if (roomMaterials.length > 0) {
        return res.json({ materials: roomMaterials });
      } else {
        return res.json({ message: "Aucun matériel disponible pour cette salle" });
      }
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

// modifier le matériel d'une salle 
// router.patch("/admin/room-materials/:id", isAdmin, async (req, res) => {
//     const { id } = req.params;
//     const { material_ids } = req.body;
  
//     if (!Array.isArray(material_ids) || material_ids.length === 0) {
//       return res.status(400).json({ message: "La liste des matériels est vide ou invalide" });
//     }
  
//     try {
//       // Vérifier quels matériels existent réellement
//       const [existingMaterials] = await db.promise().query(
//         `SELECT id FROM materiels WHERE id IN (?)`,
//         [material_ids]
//       );
//       const existingMaterialIds = existingMaterials.map(m => m.id);
  
//       if (existingMaterialIds.length === 0) {
//         return res.status(400).json({ message: "Aucun des matériels fournis n'existe" });
//       }
  
//       // Vérifier quels matériels sont déjà associés à la salle
//       const [existingRoomMaterials] = await db.promise().query(
//         `SELECT materiel_id FROM rooms_materiels WHERE room_id = ?`,
//         [id]
//       );
//       const alreadyLinkedIds = existingRoomMaterials.map(m => m.material_id);
  
//       // Déterminer les nouveaux matériels à ajouter
//       const newMaterialIds = existingMaterialIds.filter(material_id => !alreadyLinkedIds.includes(material_id));
      
//       if (newMaterialIds.length > 0) {
//         const values = newMaterialIds.map(material_id => [id, material_id]);
//         await db.promise().query(
//           `INSERT INTO rooms_materiels (room_id, materiel_id) VALUES ?`,
//           [values]
//         );
//       }
  
//       res.json({ message: "Matériels mis à jour avec succès" });
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Erreur serveur");
//     }
//   });

router.patch("/admin/room-materials/:id", isAdmin, async (req, res) => {
    const { id } = req.params;
    const { material_ids } = req.body;
  
    if (!Array.isArray(material_ids) || material_ids.length === 0) {
      return res.status(400).json({ message: "La liste des matériels est vide ou invalide" });
    }
  
    try {
      // Supprimer les anciennes associations
      await db.promise().query(
        `DELETE FROM rooms_materiels WHERE room_id = ?`,
        [id]
      );
  
      // Vérifier quels matériels existent réellement
      const [existingMaterials] = await db.promise().query(
        `SELECT id FROM materiels WHERE id IN (?)`,
        [material_ids]
      );
      const existingMaterialIds = existingMaterials.map(m => m.id);
  
      if (existingMaterialIds.length === 0) {
        return res.status(400).json({ message: "Aucun des matériels fournis n'existe" });
      }
  
      // Insérer les nouvelles associations
      const values = existingMaterialIds.map(material_id => [id, material_id]);
      await db.promise().query(
        `INSERT INTO rooms_materiels (room_id, materiel_id) VALUES ?`,
        [values]
      );
  
      res.json({ message: "Matériels mis à jour avec succès" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Erreur serveur");
    }
  });
  
  

// supprimer un matériel d'une salle
router.delete("/admin/room-materials/:id/:material_id", isAdmin, async (req, res) => {
  const { id, material_id } = req.params;

  try {
    // Supprimer l'association entre la salle et le matériel
    await db.promise().query(
      `DELETE FROM rooms_materiels WHERE room_id = ? AND materiel_id =?`,
      [id, material_id]
    );

    res.json({ message: "Matériel supprimé avec succès" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;
