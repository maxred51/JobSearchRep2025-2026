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

// READ - Pobieranie wszystkich użytkowników (kandydaci i pracownicy HR) (zabezpieczone)
router.get('/uzytkownicy', authMiddleware, async (req, res) => {
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { rola, sortBy, sortOrder } = req.query;
  try {
    let query = `
      SELECT id, imie, nazwisko, 'Kandydat' AS rola, stan FROM kandydat
      UNION
      SELECT id, imie, nazwisko, 'HR' AS rola, stan FROM pracownikHR
    `;
    const queryParams = [];

    // Filtrowanie po roli
    if (rola && ['Kandydat', 'HR'].includes(rola)) {
      query = `
        SELECT id, imie, nazwisko, '${rola}' AS rola, stan
        FROM ${rola === 'Kandydat' ? 'kandydat' : 'pracownikHR'}
      `;
    }

    // Sortowanie
    if (sortBy && ['imie', 'nazwisko'].includes(sortBy)) {
      const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortBy} ${order}`;
    }

    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie szczegółów użytkownika po ID (zabezpieczone)
router.get('/uzytkownicy/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { id } = req.params;
  try {
    // Sprawdzenie w tabeli kandydat
    let [rows] = await pool.query(
      'SELECT id, imie, nazwisko, email, telefon, stan, "Kandydat" AS rola, ' +
      '(SELECT COUNT(*) FROM aplikacja WHERE Kandydatid = ?) AS ilosc_aplikacji, ' +
      '(SELECT COUNT(*) FROM opinia WHERE Kandydatid = ?) AS ilosc_opinii, ' +
      '0 AS ilosc_ofert ' +
      'FROM kandydat WHERE id = ?',
      [id, id, id]
    );
    
    if (rows.length > 0) {
      return res.json(rows[0]);
    }

    // Sprawdzenie w tabeli pracownikHR
    [rows] = await pool.query(
      'SELECT id, imie, nazwisko, email, telefon, stan, "HR" AS rola, ' +
      '0 AS ilosc_aplikacji, ' +
      '0 AS ilosc_opinii, ' +
      '(SELECT COUNT(*) FROM oferta WHERE PracownikHRid = ?) AS ilosc_ofert ' +
      'FROM pracownikHR WHERE id = ?',
      [id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Zmiana statusu użytkownika (zabezpieczone)
router.put('/uzytkownicy/:id/status', authMiddleware, async (req, res) => {
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { id } = req.params;
  const { stan } = req.body;
  if (!stan || !['aktywny', 'zablokowany'].includes(stan)) {
    return res.status(400).json({ error: 'Nieprawidłowy status' });
  }
  try {
    // Sprawdzenie w tabeli kandydat
    let [result] = await pool.query(
      'UPDATE kandydat SET stan = ? WHERE id = ?',
      [stan, id]
    );
    
    if (result.affectedRows > 0) {
      return res.json({ id, stan });
    }

    // Sprawdzenie w tabeli pracownikHR
    [result] = await pool.query(
      'UPDATE pracownikHR SET stan = ? WHERE id = ?',
      [stan, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }
    
    res.json({ id, stan });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;