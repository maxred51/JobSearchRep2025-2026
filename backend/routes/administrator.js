const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CREATE - Dodanie nowego administratora
router.post('/', async (req, res) => {
  const { imie, nazwisko, plec } = req.body;
  if (!imie || !nazwisko || !plec || !['M', 'K'].includes(plec)) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO administrator (imie, nazwisko, plec) VALUES (?, ?, ?)',
      [imie, nazwisko, plec]
    );
    res.status(201).json({ id: result.insertId, imie, nazwisko, plec });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich administratorów
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM administrator');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie administratora po ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM administrator WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Administrator nie znaleziony' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja administratora
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { imie, nazwisko, plec } = req.body;
  if (!imie || !nazwisko || !plec || !['M', 'K'].includes(plec)) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE administrator SET imie = ?, nazwisko = ?, plec = ? WHERE id = ?',
      [imie, nazwisko, plec, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Administrator nie znaleziony' });
    }
    res.json({ id, imie, nazwisko, plec });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie administratora
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM administrator WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Administrator nie znaleziony' });
    }
    res.json({ message: 'Administrator usunięty' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;