const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CREATE - Dodanie nowego pracownika HR
router.post('/', async (req, res) => {
  const { imie, nazwisko, telefon, email, plec, Firmaid } = req.body;
  if (!imie || !nazwisko || !telefon || !email || !plec || !['M', 'K'].includes(plec) || !Firmaid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO pracownikHR (imie, nazwisko, telefon, email, plec, Firmaid) VALUES (?, ?, ?, ?, ?, ?)',
      [imie, nazwisko, telefon, email, plec, Firmaid]
    );
    res.status(201).json({ id: result.insertId, imie, nazwisko, telefon, email, plec, Firmaid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Telefon lub email już istnieje' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana firma nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich pracowników HR
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pracownikHR');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie pracownika HR po ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM pracownikHR WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pracownik HR nie znaleziony' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja pracownika HR
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { imie, nazwisko, telefon, email, plec, Firmaid } = req.body;
  if (!imie || !nazwisko || !telefon || !email || !plec || !['M', 'K'].includes(plec) || !Firmaid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE pracownikHR SET imie = ?, nazwisko = ?, telefon = ?, email = ?, plec = ?, Firmaid = ? WHERE id = ?',
      [imie, nazwisko, telefon, email, plec, Firmaid, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pracownik HR nie znaleziony' });
    }
    res.json({ id, imie, nazwisko, telefon, email, plec, Firmaid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Telefon lub email już istnieje' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana firma nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie pracownika HR
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM pracownikHR WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pracownik HR nie znaleziony' });
    }
    res.json({ message: 'Pracownik HR usunięty' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;