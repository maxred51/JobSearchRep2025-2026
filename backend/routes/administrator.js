const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const authMiddleware = require('../middlewares/auth');

// CREATE - Rejestracja nowego administratora
router.post('/', async (req, res) => {
  const { imie, nazwisko, plec, email, haslo } = req.body;
  if (!imie || !nazwisko || !plec || !['M', 'K'].includes(plec) || !email || !haslo) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [existing] = await pool.query('SELECT * FROM administrator WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email już istnieje' });
    }
    const hashedPassword = await bcrypt.hash(haslo, 10);
    const [result] = await pool.query(
      'INSERT INTO administrator (imie, nazwisko, plec, email, haslo) VALUES (?, ?, ?, ?, ?)',
      [imie, nazwisko, plec, email, hashedPassword]
    );
    res.status(201).json({ id: result.insertId, imie, nazwisko, plec, email });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// LOGIN - Logowanie administratora
router.post('/login', async (req, res) => {
  const { email, haslo } = req.body;
  if (!email || !haslo) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM administrator WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(haslo, user.haslo);
    if (!isMatch) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }
    const token = jwt.sign({ id: user.id, role: 'administrator' }, config.secret, { expiresIn: config.expiresIn });
    res.json({ token, user: { id: user.id, imie: user.imie, nazwisko: user.nazwisko, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich administratorów (zabezpieczone)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, imie, nazwisko, plec, email FROM administrator');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie administratora po ID (zabezpieczone)
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, imie, nazwisko, plec, email FROM administrator WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Administrator nie znaleziony' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja administratora (zabezpieczone)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { imie, nazwisko, plec, email, haslo } = req.body;
  if (!imie || !nazwisko || !plec || !['M', 'K'].includes(plec) || !email) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [existing] = await pool.query('SELECT * FROM administrator WHERE email = ? AND id != ?', [email, id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email już istnieje' });
    }
    let query = 'UPDATE administrator SET imie = ?, nazwisko = ?, plec = ?, email = ?';
    const params = [imie, nazwisko, plec, email];
    if (haslo) {
      const hashedPassword = await bcrypt.hash(haslo, 10);
      query += ', haslo = ?';
      params.push(hashedPassword);
    }
    query += ' WHERE id = ?';
    params.push(id);
    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Administrator nie znaleziony' });
    }
    res.json({ id, imie, nazwisko, plec, email });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie administratora (zabezpieczone)
router.delete('/:id', authMiddleware, async (req, res) => {
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