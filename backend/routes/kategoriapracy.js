const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CREATE - Dodanie nowej kategorii pracy
router.post('/', async (req, res) => {
  const { Nazwa, KategoriaPracyid } = req.body;
  if (!Nazwa) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO kategoriapracy (Nazwa, KategoriaPracyid) VALUES (?, ?)',
      [Nazwa, KategoriaPracyid || null]
    );
    res.status(201).json({ id: result.insertId, Nazwa, KategoriaPracyid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa kategorii musi być unikalna' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana kategoria nadrzędna nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich kategorii pracy
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kategoriapracy');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie kategorii pracy po ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM kategoriapracy WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Kategoria pracy nie znaleziona' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja kategorii pracy
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { Nazwa, KategoriaPracyid } = req.body;
  if (!Nazwa) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE kategoriapracy SET Nazwa = ?, KategoriaPracyid = ? WHERE id = ?',
      [Nazwa, KategoriaPracyid || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kategoria pracy nie znaleziona' });
    }
    res.json({ id, Nazwa, KategoriaPracyid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa kategorii musi być unikalna' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana kategoria nadrzędna nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie kategorii pracy
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM kategoriapracy WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kategoria pracy nie znaleziona' });
    }
    res.json({ message: 'Kategoria pracy usunięta' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;