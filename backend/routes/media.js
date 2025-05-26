const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// 📤 SUBIR archivo individual
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  const { description, folder_id, type } = req.body;
  const file = req.file;

  try {
    const fileUrl = `/uploads/${req.userId}/${folder_id || 'general'}/${file.filename}`;
    const result = await pool.query(
      `INSERT INTO media(user_id, folder_id, filename, file_url, type, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        req.userId,
        folder_id || null,
        file.filename,
        fileUrl,
        type || (path.extname(file.originalname).includes('mp4') ? 'video' : 'image'),
        description
      ]
    );

    const tags = req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [];
    for (const tag of tags) {
      const tagResult = await pool.query(
        'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [tag]
      );
      const tagId = tagResult.rows[0].id;
      await pool.query(
        'INSERT INTO media_tags (media_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [result.rows[0].id, tagId]
      );
    }

    res.json({ message: 'Archivo subido', media: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al subir archivo', details: err.message });
  }
});

// 📥 OBTENER archivos del usuario
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, 
        COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
      FROM media m
      LEFT JOIN media_tags mt ON mt.media_id = m.id
      LEFT JOIN tags t ON t.id = mt.tag_id
      WHERE m.user_id = $1
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `, [req.userId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener archivos', details: err.message });
  }
});

// 🔍 BUSCAR archivos por descripción o etiqueta
router.get('/search', auth, async (req, res) => {
  const query = req.query.q;
  try {
    const result = await pool.query(`
      SELECT m.* FROM media m
      LEFT JOIN media_tags mt ON mt.media_id = m.id
      LEFT JOIN tags t ON t.id = mt.tag_id
      WHERE m.user_id = $1
        AND (
          LOWER(m.description) LIKE LOWER($2)
          OR LOWER(t.name) LIKE LOWER($2)
        )
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `, [req.userId, `%${query}%`]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error en la búsqueda', details: err.message });
  }
});

// 📄 VER archivo por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, 
        COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
      FROM media m
      LEFT JOIN media_tags mt ON mt.media_id = m.id
      LEFT JOIN tags t ON t.id = mt.tag_id
      WHERE m.id = $1 AND m.user_id = $2
      GROUP BY m.id
    `, [req.params.id, req.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener archivo', details: err.message });
  }
});

// ✏️ EDITAR archivo
router.put('/:id', auth, async (req, res) => {
  const { description, tags, folder_id } = req.body;

  try {
    await pool.query(
      'UPDATE media SET description = $1, folder_id = $2 WHERE id = $3 AND user_id = $4',
      [description, folder_id || null, req.params.id, req.userId]
    );

    await pool.query('DELETE FROM media_tags WHERE media_id = $1', [req.params.id]);

    if (tags?.length > 0) {
      for (const tag of tags) {
        const tagResult = await pool.query(
          'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
          [tag]
        );
        const tagId = tagResult.rows[0].id;
        await pool.query(
          'INSERT INTO media_tags (media_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [req.params.id, tagId]
        );
      }
    }

    res.json({ message: 'Actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar', details: err.message });
  }
});


// 🧹 ELIMINACIÓN masiva
// 🧹 Eliminar múltiples archivos del disco y base de datos
router.delete('/bulk', auth, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Debes enviar un array de IDs' });
  }

  try {
    // 1. Obtener rutas de los archivos
    const result = await pool.query(
      'SELECT file_url FROM media WHERE id = ANY($1) AND user_id = $2',
      [ids, req.userId]
    );

    // 2. Eliminar los archivos del disco
    for (const row of result.rows) {
      const relativePath = row.file_url.replace(/^\/+/, '');
      const fullPath = path.join(__dirname, '..', relativePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // 3. Eliminar relaciones en media_tags
    await pool.query('DELETE FROM media_tags WHERE media_id = ANY($1)', [ids]);

    // 4. Eliminar entradas en media
    await pool.query('DELETE FROM media WHERE id = ANY($1) AND user_id = $2', [ids, req.userId]);

    res.json({ message: 'Archivos eliminados correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar:', err);
    res.status(500).json({ error: 'Error al eliminar archivos', details: err.message });
  }
});

// 🗑️ ELIMINAR archivo individual
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT file_url FROM media WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (result.rows.length > 0) {
      const filePath = path.join(__dirname, '..', result.rows[0].file_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM media_tags WHERE media_id = $1', [req.params.id]);
    await pool.query('DELETE FROM media WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);

    res.json({ message: 'Archivo eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar', details: err.message });
  }
});

// 📤 SUBIDA múltiple de archivos
router.post('/multi-upload', auth, upload.array('files'), async (req, res) => {
  const { folder_id } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No se recibieron archivos' });
  }

  try {
    const inserted = [];

    for (const file of files) {
      const isVideo = file.originalname.toLowerCase().endsWith('.mp4');
      const fileUrl = `/uploads/${req.userId}/${folder_id || 'general'}/${file.filename}`;

      const result = await pool.query(
        `INSERT INTO media(user_id, folder_id, filename, file_url, type, description)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          req.userId,
          folder_id || null,
          file.filename,
          fileUrl,
          isVideo ? 'video' : 'image',
          ''
        ]
      );

      inserted.push(result.rows[0]);
    }

    res.json({ message: 'Archivos subidos', media: inserted });
  } catch (err) {
    res.status(500).json({ error: 'Error al subir archivos', details: err.message });
  }
});



module.exports = router;
