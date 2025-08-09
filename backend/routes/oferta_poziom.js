const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CREATE - Dodanie nowego powiązania oferta-poziom
router.post('/', async (req, res) => {
  const { Ofertaid, Poziomid } = req.body;
  if (!Ofertaid || !Poziomid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO oferta_poziom (Ofertaid, Poziomid) VALUES (?, ?)',
      [Ofertaid, Poziomid]
    );
    res.status(201).json({ Ofertaid, Poziomid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Powiązanie już istnieje' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana oferta lub poziom nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich powiązań oferta-poziom
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM oferta_poziom');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie powiązania oferta-poziom po Ofertaid i Poziomid
router.get('/:Ofertaid/:Poziomid', async (req, res) => {
  const { Ofertaid, Poziomid } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM oferta_poziom WHERE Ofertaid = ? AND Poziomid = ?',
      [Ofertaid, Poziomid]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Powiązanie nie znalezione' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie powiązania oferta-poziom
router.delete('/:Ofertaid/:Poziomid', async (req, res) => {
  const { Ofertaid, Poziomid } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM oferta_poziom WHERE Ofertaid = ? AND Poziomid = ?',
      [Ofertaid, Poziomid]
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