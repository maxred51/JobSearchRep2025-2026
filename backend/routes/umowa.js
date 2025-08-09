const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CREATE - Dodanie nowego typu umowy
router.post('/', async (req, res) => {
  const { nazwa } = req.body;
  if (!nazwa) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO umowa (nazwa) VALUES (?)',
      [nazwa]
    );
    res.status(201).json({ id: result.insertId, nazwa });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa umowy musi być unikalna' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich typów umów
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM umowa');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie typu umowy po ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM umowa WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Typ umowy nie znaleziony' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja typu umowy
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nazwa } = req.body;
  if (!nazwa) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE umowa SET nazwa = ? WHERE id = ?',
      [nazwa, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Typ umowy nie znaleziony' });
    }
    res.json({ id, nazwa });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa umowy musi być unikalna' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie typu umowy
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM umowa WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Typ umowy nie znaleziony' });
    }
    res.json({ message: 'Typ umowy usunięty' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;