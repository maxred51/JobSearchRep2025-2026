const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CREATE - Dodanie nowego kandydata
router.post('/', async (req, res) => {
  const { imie, nazwisko, telefon, email, plec, Kategoriaid } = req.body;
  if (!imie || !nazwisko || !telefon || !email || !plec || !['M', 'K'].includes(plec) || !Kategoriaid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO kandydat (imie, nazwisko, telefon, email, plec, Kategoriaid) VALUES (?, ?, ?, ?, ?, ?)',
      [imie, nazwisko, telefon, email, plec, Kategoriaid]
    );
    res.status(201).json({ id: result.insertId, imie, nazwisko, telefon, email, plec, Kategoriaid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Telefon lub email już istnieje' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana kategoria nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich kandydatów
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kandydat');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie kandydata po ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM kandydat WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Kandydat nie znaleziony' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja kandydata
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { imie, nazwisko, telefon, email, plec, Kategoriaid } = req.body;
  if (!imie || !nazwisko || !telefon || !email || !plec || !['M', 'K'].includes(plec) || !Kategoriaid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE kandydat SET imie = ?, nazwisko = ?, telefon = ?, email = ?, plec = ?, Kategoriaid = ? WHERE id = ?',
      [imie, nazwisko, telefon, email, plec, Kategoriaid, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kandydat nie znaleziony' });
    }
    res.json({ id, imie, nazwisko, telefon, email, plec, Kategoriaid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Telefon lub email już istnieje' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana kategoria nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie kandydata
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM kandydat WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kandydat nie znaleziony' });
    }
    res.json({ message: 'Kandydat usunięty' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;