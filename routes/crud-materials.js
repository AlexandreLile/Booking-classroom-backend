const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { isAdmin } = require("../middlewares/auth");

// Ajouter un material
router.post("/admin/add-material", isAdmin, async (req, res) => {
  const { name }  = req.body;
  console.log(name);
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  try {
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO materiels (name, created_at, updated_at) VALUES (?, ?, ?)",
        [name, currentDate, currentDate]
      );
    res.json({
      message: "Matériel ajouté avec succès",
      material_id: result.insertId,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

router.get('/show-materials', async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM materiels');
    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

router.patch('/admin/update-material/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  try {
    const [result] = await db.promise().query(
      'UPDATE materiels SET name =?, updated_at =? WHERE id =?',
      [name, currentDate, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).send('Matériel non trouvé');
    }
    res.json({ message: 'Matériel mis à jour avec succès' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

router.delete('/admin/delete-material/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query(
      'DELETE FROM materiels WHERE id =?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).send('Matériel non trouvé');
    }
    res.json({ message: 'Matériel supprimé avec succès' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

router.get('/material/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query(
      'SELECT * FROM materiels WHERE id =?',
      [id]
    );
    if (!result.length) {
      return res.status(404).send('Matériel non trouvé');
    }
    res.json(result[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;