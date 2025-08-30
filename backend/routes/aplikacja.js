const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Dodanie nowej aplikacji
router.post('/', authMiddleware, async (req, res) => {
  const { Kandydatid, Ofertaid } = req.body;
  if (!Kandydatid || !Ofertaid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [kandydat] = await pool.query('SELECT id FROM kandydat WHERE id = ?', [Kandydatid]);
    if (kandydat.length === 0) {
      return res.status(400).json({ error: 'Podany kandydat nie istnieje' });
    }
    const [oferta] = await pool.query('SELECT id, PracownikHRid FROM oferta WHERE id = ?', [Ofertaid]);
    if (oferta.length === 0) {
      return res.status(400).json({ error: 'Podana oferta nie istnieje' });
    }
    if (req.user.role === 'pracownikHR' && oferta[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do tej oferty' });
    }
    const [result] = await pool.query(
      'INSERT INTO aplikacja (Kandydatid, Ofertaid) VALUES (?, ?)',
      [Kandydatid, Ofertaid]
    );
    res.status(201).json({ Kandydatid, Ofertaid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Aplikacja już istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich aplikacji (zabezpieczone)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'pracownikHR') {
      const [rows] = await pool.query(
        'SELECT a.* FROM aplikacja a ' +
        'JOIN oferta o ON a.Ofertaid = o.id ' +
        'WHERE o.PracownikHRid = ?',
        [req.user.id]
      );
      res.json(rows);
    } else if (req.user.role === 'administrator') {
      const [rows] = await pool.query('SELECT * FROM aplikacja');
      res.json(rows);
    } else {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie aplikacji po Kandydatid i Ofertaid (zabezpieczone)
router.get('/:Kandydatid/:Ofertaid', authMiddleware, async (req, res) => {
  const { Kandydatid, Ofertaid } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT a.* FROM aplikacja a ' +
      'JOIN oferta o ON a.Ofertaid = o.id ' +
      'WHERE a.Kandydatid = ? AND a.Ofertaid = ?',
      [Kandydatid, Ofertaid]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Aplikacja nie znaleziona' });
    }
    if (req.user.role === 'pracownikHR' && rows[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do tej aplikacji' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie listy kandydatów, którzy aplikowali na oferty pracownika HR (zabezpieczone)
router.get('/pracownikHR/:PracownikHRid', authMiddleware, async (req, res) => {
  const { PracownikHRid } = req.params;
  try {
    // Sprawdzenie, czy użytkownik ma uprawnienia
    if (req.user.role === 'pracownikHR' && req.user.id !== parseInt(PracownikHRid)) {
      return res.status(403).json({ error: 'Brak uprawnień do wyświetlania kandydatów' });
    }
    // Sprawdzenie, czy PracownikHRid istnieje
    const [pracownikHR] = await pool.query('SELECT id FROM pracownikHR WHERE id = ?', [PracownikHRid]);
    if (pracownikHR.length === 0) {
      return res.status(400).json({ error: 'Podany pracownik HR nie istnieje' });
    }
    // Pobranie listy kandydatów
    const [rows] = await pool.query(
      'SELECT DISTINCT k.id, k.imie, k.nazwisko, k.email, k.telefon, k.plec, a.Ofertaid ' +
      'FROM kandydat k ' +
      'JOIN aplikacja a ON k.id = a.Kandydatid ' +
      'JOIN oferta o ON a.Ofertaid = o.id ' +
      'WHERE o.PracownikHRid = ?',
      [PracownikHRid]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie aplikacji (zabezpieczone)
router.delete('/:Kandydatid/:Ofertaid', authMiddleware, async (req, res) => {
  const { Kandydatid, Ofertaid } = req.params;
  try {
    const [oferta] = await pool.query('SELECT PracownikHRid FROM oferta WHERE id = ?', [Ofertaid]);
    if (oferta.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    if (req.user.role === 'pracownikHR' && oferta[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do usunięcia tej aplikacji' });
    }
    const [result] = await pool.query(
      'DELETE FROM aplikacja WHERE Kandydatid = ? AND Ofertaid = ?',
      [Kandydatid, Ofertaid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aplikacja nie znaleziona' });
    }
    res.json({ message: 'Aplikacja usunięta' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;