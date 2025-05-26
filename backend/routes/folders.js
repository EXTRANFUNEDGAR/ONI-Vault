const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Crear una nueva carpeta
router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO folders (user_id, name) VALUES ($1, $2) RETURNING *',
      [req.userId, name]
    );
    res.status(201).json({ folder: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear carpeta', details: err.message });
  }
});

// Obtener todas las carpetas del usuario
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM folders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener carpetas', details: err.message });
  }
});

// 🧹 Eliminar carpeta completa
router.delete('/:id', auth, async (req, res) => {
  const folderId = req.params.id;

  try {
    // 1. Obtener todos los archivos de la carpeta
    const mediaRes = await pool.query(
      'SELECT id, file_url FROM media WHERE folder_id = $1 AND user_id = $2',
      [folderId, req.userId]
    );
    const ids = mediaRes.rows.map((row) => row.id);

    // 2. Eliminar archivos del disco
    for (const { file_url } of mediaRes.rows) {
      const filePath = path.join(__dirname, '..', file_url.replace(/^\/+/, ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 3. Eliminar referencias
    await pool.query('DELETE FROM media_tags WHERE media_id = ANY($1)', [ids]);
    await pool.query('DELETE FROM media WHERE id = ANY($1) AND user_id = $2', [ids, req.userId]);

    // 4. Eliminar carpeta en la BD
    await pool.query('DELETE FROM folders WHERE id = $1 AND user_id = $2', [folderId, req.userId]);

    // 5. Eliminar carpeta física si existe
    const folderPath = path.join(__dirname, '..', 'uploads', `${req.userId}`, `${folderId}`);
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }

    res.json({ message: 'Carpeta eliminada correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar carpeta:', err);
    res.status(500).json({ error: 'Error al eliminar carpeta', details: err.message });
  }
});

module.exports = router;
