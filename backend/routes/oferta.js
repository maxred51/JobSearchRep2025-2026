const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CREATE - Dodanie nowej oferty
router.post('/', async (req, res) => {
  const { tytuł, opis, wynagrodzenie, lokalizacja, czas, PracownikHRid, KategoriaPracyid } = req.body;
  if (!tytuł || !opis || !wynagrodzenie || !lokalizacja || !czas || !PracownikHRid || !KategoriaPracyid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO oferta (tytuł, opis, wynagrodzenie, lokalizacja, czas, PracownikHRid, KategoriaPracyid) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [tytuł, opis, wynagrodzenie, lokalizacja, czas, PracownikHRid, KategoriaPracyid]
    );
    res.status(201).json({ id: result.insertId, tytuł, opis, wynagrodzenie, lokalizacja, czas, PracownikHRid, KategoriaPracyid });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podany pracownik HR lub kategoria pracy nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich ofert
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM oferta');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie oferty po ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM oferta WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja oferty
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { tytuł, opis, wynagrodzenie, lokalizacja, czas, PracownikHRid, KategoriaPracyid } = req.body;
  if (!tytuł || !opis || !wynagrodzenie || !lokalizacja || !czas || !PracownikHRid || !KategoriaPracyid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE oferta SET tytuł = ?, opis = ?, wynagrodzenie = ?, lokalizacja = ?, czas = ?, PracownikHRid = ?, KategoriaPracyid = ? WHERE id = ?',
      [tytuł, opis, wynagrodzenie, lokalizacja, czas, PracownikHRid, KategoriaPracyid, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    res.json({ id, tytuł, opis, wynagrodzenie, lokalizacja, czas, PracownikHRid, KategoriaPracyid });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podany pracownik HR lub kategoria pracy nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie oferty
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM oferta WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    res.json({ message: 'Oferta usunięta' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;