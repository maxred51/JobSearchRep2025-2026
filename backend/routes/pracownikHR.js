const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const authMiddleware = require('../middlewares/auth');

// CREATE - Rejestracja nowego pracownika HR
router.post('/', async (req, res) => {
  const { imie, nazwisko, telefon, email, haslo, plec, Firmaid } = req.body;
  // Walidacja danych
  if (!imie || !nazwisko || !telefon || !email || !haslo || !plec || !['M', 'K'].includes(plec) || !Firmaid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  // Walidacja długości pól
  if (imie.length > 50 || nazwisko.length > 50 || telefon.length > 50 || email.length > 50) {
    return res.status(400).json({ error: 'Przekroczono maksymalną długość pól' });
  }
  // Walidacja formatu emaila
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Nieprawidłowy format emaila' });
  }
  // Walidacja formatu telefonu
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  if (!phoneRegex.test(telefon)) {
    return res.status(400).json({ error: 'Nieprawidłowy format telefonu' });
  }
  try {
    const [existing] = await pool.query('SELECT * FROM pracownikHR WHERE email = ? OR telefon = ?', [email, telefon]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email lub telefon już istnieje' });
    }

    const hashedPassword = await bcrypt.hash(haslo, 10);
    const [result] = await pool.query(
      'INSERT INTO pracownikHR (imie, nazwisko, telefon, email, haslo, plec, Firmaid, stan) VALUES (?, ?, ?, ?, ?, ?, ?, "aktywny")',
      [imie, nazwisko, telefon, email, hashedPassword, plec, Firmaid]
    );

    // Dodanie powiadomienia systemowego dla administratora
    await pool.query(
      'INSERT INTO powiadomienie (typ, tresc) VALUES (?, ?)',
      [
        'system',
        `Nowy pracownik HR: ${imie} ${nazwisko} (ID: ${result.insertId})`
      ]
    );

    res.status(201).json({ id: result.insertId, imie, nazwisko, telefon, email, plec, Firmaid });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana firma nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// LOGIN - Logowanie pracownika HR
router.post('/login', async (req, res) => {
  const { email, haslo } = req.body;
  if (!email || !haslo) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [rows] = await pool.query('SELECT id, email, haslo, stan FROM pracownikHR WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }
    const user = rows[0];
    if (user.stan === 'zablokowany') {
      return res.status(403).json({ error: 'Konto zablokowane' });
    }
    const isMatch = await bcrypt.compare(haslo, user.haslo);
    if (!isMatch) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }
    const token = jwt.sign({ id: user.id, role: 'pracownikHR' }, config.secret, { expiresIn: config.expiresIn });
    res.json({ token, user: { id: user.id, imie: user.imie, nazwisko: user.nazwisko, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich pracowników HR (zabezpieczone)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'administrator' && req.user.role !== 'pracownikHR') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  try {
    const [rows] = await pool.query('SELECT id, imie, nazwisko, telefon, email, plec, Firmaid FROM pracownikHR');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie pracownika HR po ID (zabezpieczone)
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'administrator' && (req.user.role !== 'pracownikHR' || req.user.id !== parseInt(id))) {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  try {
    const [rows] = await pool.query('SELECT id, imie, nazwisko, telefon, email, plec, Firmaid FROM pracownikHR WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pracownik HR nie znaleziony' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja pracownika HR (zabezpieczone)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { imie, nazwisko, telefon, email, haslo, plec, Firmaid } = req.body;
  if (req.user.role !== 'administrator' && (req.user.role !== 'pracownikHR' || req.user.id !== parseInt(id))) {
    return res.status(403).json({ error: 'Brak uprawnień do edycji tego konta' });
  }
  // Walidacja danych
  if (!imie || !nazwisko || !telefon || !email || !plec || !['M', 'K'].includes(plec) || !Firmaid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  // Walidacja długości pól
  if (imie.length > 50 || nazwisko.length > 50 || telefon.length > 50 || email.length > 50) {
    return res.status(400).json({ error: 'Przekroczono maksymalną długość pól' });
  }
  // Walidacja formatu emaila
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Nieprawidłowy format emaila' });
  }
  // Walidacja formatu telefonu
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  if (!phoneRegex.test(telefon)) {
    return res.status(400).json({ error: 'Nieprawidłowy format telefonu' });
  }
  try {
    const [existing] = await pool.query('SELECT * FROM pracownikHR WHERE (email = ? OR telefon = ?) AND id != ?', [email, telefon, id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email lub telefon już istnieje' });
    }
    let query = 'UPDATE pracownikHR SET imie = ?, nazwisko = ?, telefon = ?, email = ?, plec = ?, Firmaid = ?';
    const params = [imie, nazwisko, telefon, email, plec, Firmaid];
    if (haslo) {
      const hashedPassword = await bcrypt.hash(haslo, 10);
      query += ', haslo = ?';
      params.push(hashedPassword);
    }
    query += ' WHERE id = ?';
    params.push(id);
    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pracownik HR nie znaleziony' });
    }
    res.json({ id, imie, nazwisko, telefon, email, plec, Firmaid });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana firma nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie pracownika HR (zabezpieczone)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (req.user.role === 'pracownikHR' && req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Brak uprawnień do usunięcia tego konta' });
  }
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