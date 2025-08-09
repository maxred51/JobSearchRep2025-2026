const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CREATE - Dodanie nowej kategorii kandydata
router.post('/', async (req, res) => {
  const { id, nazwa } = req.body;
  if (!id || !nazwa) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO kategoriakandydata (id, nazwa) VALUES (?, ?)',
      [id, nazwa]
    );
    res.status(201).json({ id, nazwa });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa kategorii musi być unikalna' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich kategorii kandydatów
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kategoriakandydata');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie kategorii kandydata po ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM kategoriakandydata WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja kategorii kandydata
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nazwa } = req.body;
  if (!nazwa) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE kategoriakandydata SET nazwa = ? WHERE id = ?',
      [nazwa, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }
    res.json({ id, nazwa });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa kategorii musi być unikalna' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie kategorii kandydata
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM kategoriakandydata WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }
    res.json({ message: 'Kategoria usunięta' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;