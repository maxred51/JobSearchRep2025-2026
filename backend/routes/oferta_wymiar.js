const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Dodanie nowego powiązania oferta-wymiar
router.post('/', authMiddleware, async (req, res) => {
  // Sprawdzenie roli (pracownikhr lub administrator)
  if (req.user.role !== 'pracownikhr' && req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }

  const { Ofertaid, Wymiarid } = req.body;

  // Walidacja Ofertaid i Wymiarid
  if (isNaN(parseInt(Ofertaid)) || isNaN(parseInt(Wymiarid))) {
    return res.status(400).json({ error: 'Ofertaid i Wymiarid muszą być liczbami całkowitymi' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO oferta_wymiar (Ofertaid, Wymiarid) VALUES (?, ?)',
      [Ofertaid, Wymiarid]
    );
    res.status(201).json({ Ofertaid, Wymiarid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Powiązanie już istnieje' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana oferta lub wymiar etatu nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich powiązań oferta-wymiar
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM oferta_wymiar');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie powiązania oferta-wymiar po Ofertaid i Wymiarid
router.get('/:Ofertaid/:Wymiarid', authMiddleware, async (req, res) => {
  const { Ofertaid, Wymiarid } = req.params;

  // Walidacja Ofertaid i Wymiarid
  if (isNaN(parseInt(Ofertaid)) || isNaN(parseInt(Wymiarid))) {
    return res.status(400).json({ error: 'Ofertaid i Wymiarid muszą być liczbami całkowitymi' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM oferta_wymiar WHERE Ofertaid = ? AND Wymiarid = ?',
      [Ofertaid, Wymiarid]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Powiązanie nie znalezione' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie powiązania oferta-wymiar
router.delete('/:Ofertaid/:Wymiarid', authMiddleware, async (req, res) => {
  // Sprawdzenie roli (pracownikhr lub administrator)
  if (req.user.role !== 'pracownikhr' && req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }

  const { Ofertaid, Wymiarid } = req.params;

  // Walidacja Ofertaid i Wymiarid
  if (isNaN(parseInt(Ofertaid)) || isNaN(parseInt(Wymiarid))) {
    return res.status(400).json({ error: 'Ofertaid i Wymiarid muszą być liczbami całkowitymi' });
  }

  try {
    const [result] = await pool.query(
      'DELETE FROM oferta_wymiar WHERE Ofertaid = ? AND Wymiarid = ?',
      [Ofertaid, Wymiarid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Powiązanie nie znalezione' });
    }
    res.json({ message: 'Powiązanie usunięte' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;