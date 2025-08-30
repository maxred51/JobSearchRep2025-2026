const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const authMiddleware = require('../middlewares/auth');

// CREATE - Rejestracja nowego kandydata
router.post('/', async (req, res) => {
  const { imie, nazwisko, telefon, email, haslo, plec } = req.body;
  if (!imie || !nazwisko || !telefon || !email || !haslo || !plec || !['M', 'K'].includes(plec)) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [existing] = await pool.query('SELECT * FROM kandydat WHERE email = ? OR telefon = ?', [email, telefon]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email lub telefon już istnieje' });
    }
    const hashedPassword = await bcrypt.hash(haslo, 10);
    const [result] = await pool.query(
      'INSERT INTO kandydat (imie, nazwisko, telefon, email, haslo, plec) VALUES (?, ?, ?, ?, ?, ?)',
      [imie, nazwisko, telefon, email, hashedPassword, plec]
    );
    res.status(201).json({ id: result.insertId, imie, nazwisko, telefon, email, plec });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// LOGIN - Logowanie kandydata
router.post('/login', async (req, res) => {
  const { email, haslo } = req.body;
  if (!email || !haslo) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM kandydat WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(haslo, user.haslo);
    if (!isMatch) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }
    const token = jwt.sign({ id: user.id, role: 'kandydat' }, config.secret, { expiresIn: config.expiresIn });
    res.json({ token, user: { id: user.id, imie: user.imie, nazwisko: user.nazwisko, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich kandydatów (zabezpieczone)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, imie, nazwisko, telefon, email, plec FROM kandydat');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie kandydata po ID (zabezpieczone)
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, imie, nazwisko, telefon, email, plec FROM kandydat WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Kandydat nie znaleziony' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja kandydata (zabezpieczone)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { imie, nazwisko, telefon, email, haslo, plec } = req.body;
  if (!imie || !nazwisko || !telefon || !email || !plec || !['M', 'K'].includes(plec)) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [existing] = await pool.query('SELECT * FROM kandydat WHERE (email = ? OR telefon = ?) AND id != ?', [email, telefon, id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email lub telefon już istnieje' });
    }
    let query = 'UPDATE kandydat SET imie = ?, nazwisko = ?, telefon = ?, email = ?, plec = ?';
    const params = [imie, nazwisko, telefon, email, plec];
    if (haslo) {
      const hashedPassword = await bcrypt.hash(haslo, 10);
      query += ', haslo = ?';
      params.push(hashedPassword);
    }
    query += ' WHERE id = ?';
    params.push(id);
    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kandydat nie znaleziony' });
    }
    res.json({ id, imie, nazwisko, telefon, email, plec });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie kandydata (zabezpieczone)
router.delete('/:id', authMiddleware, async (req, res) => {
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