const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CREATE - Dodanie nowej firmy
router.post('/', async (req, res) => {
  const { nazwa, strona_www } = req.body;
  if (!nazwa || !strona_www) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO firma (nazwa, strona_www) VALUES (?, ?)',
      [nazwa, strona_www]
    );
    res.status(201).json({ id: result.insertId, nazwa, strona_www });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa firmy lub strona www już istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich firm
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM firma');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie firmy po ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM firma WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Firma nie znaleziona' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja firmy
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nazwa, strona_www } = req.body;
  if (!nazwa || !strona_www) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE firma SET nazwa = ?, strona_www = ? WHERE id = ?',
      [nazwa, strona_www, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Firma nie znaleziona' });
    }
    res.json({ id, nazwa, strona_www });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa firmy lub strona www już istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie firmy
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM firma WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Firma nie znaleziona' });
    }
    res.json({ message: 'Firma usunięta' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;