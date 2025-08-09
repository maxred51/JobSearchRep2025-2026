const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CREATE - Dodanie nowego trybu pracy
router.post('/', async (req, res) => {
  const { nazwa } = req.body;
  if (!nazwa) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO tryb (nazwa) VALUES (?)',
      [nazwa]
    );
    res.status(201).json({ id: result.insertId, nazwa });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa trybu musi być unikalna' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich trybów pracy
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tryb');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie trybu pracy po ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM tryb WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tryb pracy nie znaleziony' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja trybu pracy
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nazwa } = req.body;
  if (!nazwa) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE tryb SET nazwa = ? WHERE id = ?',
      [nazwa, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tryb pracy nie znaleziony' });
    }
    res.json({ id, nazwa });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa trybu musi być unikalna' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie trybu pracy
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tryb WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tryb pracy nie znaleziony' });
    }
    res.json({ message: 'Tryb pracy usunięty' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;