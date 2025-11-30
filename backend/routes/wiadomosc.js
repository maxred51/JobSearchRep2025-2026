const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// 1. Pobranie listy dostępnych rozmówców
router.get('/rozmowcy', authMiddleware, async (req, res) => {
  const { id, role } = req.user;

  try {
    let rows = [];

    if (role === 'administrator') {
      // Admin widzi: wszystkich kandydatów, HR-ów i innych adminów
      const [kandydaci] = await pool.query(`SELECT 'kandydat' as rola, id, imie, nazwisko FROM kandydat WHERE stan = 'aktywny'`);
      const [hr] = await pool.query(`SELECT 'pracownikHR' as rola, id, imie, nazwisko FROM pracownikHR WHERE stan = 'aktywny'`);
      const [admini] = await pool.query(`SELECT 'administrator' as rola, id, imie, nazwisko FROM administrator WHERE id != ?`, [id]);

      rows = [...kandydaci, ...hr, ...admini];
    }
    else if (role === 'pracownikHR') {
      // HR widzi: wszystkich adminów + kandydatów z aplikacji
      const [admini] = await pool.query(`SELECT 'administrator' as rola, id, imie, nazwisko FROM administrator`);
      const [kandydaci] = await pool.query(`
        SELECT DISTINCT 'kandydat' as rola, k.id, k.imie, k.nazwisko
        FROM aplikacja a
        JOIN oferta o ON a.Ofertaid = o.id
        JOIN kandydat k ON a.Kandydatid = k.id
        WHERE o.PracownikHRid = ?
      `, [id]);

      rows = [...admini, ...kandydaci];
    }
    else if (role === 'kandydat') {
      // Kandydat widzi: wszystkich adminów + HR-ów z aplikacji
      const [admini] = await pool.query(`SELECT 'administrator' as rola, id, imie, nazwisko FROM administrator`);
      const [hr] = await pool.query(`
        SELECT DISTINCT 'pracownikHR' as rola, phr.id, phr.imie, phr.nazwisko
        FROM aplikacja a
        JOIN oferta o ON a.Ofertaid = o.id
        JOIN pracownikHR phr ON o.PracownikHRid = phr.id
        WHERE a.Kandydatid = ?
      `, [id]);

      rows = [...admini, ...hr];
    }

    
    rows.sort((a, b) => a.nazwisko.localeCompare(b.nazwisko) || a.imie.localeCompare(b.imie));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// 2. Pobranie historii konwersacji z konkretnym użytkownikiem
router.get('/konwersacja/:rola/:id', authMiddleware, async (req, res) => {
  const { rola, id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!['kandydat', 'pracownikHR', 'administrator'].includes(rola)) {
    return res.status(400).json({ error: 'Nieprawidłowa rola rozmówcy' });
  }

  try {
    const [messages] = await pool.query(`
      SELECT 
        id, tresc, nadawca_id, nadawca_typ, odbiorca_id, odbiorca_typ,
        przeczytane, data
      FROM wiadomosc
      WHERE (nadawca_id = ? AND nadawca_typ = ? AND odbiorca_id = ? AND odbiorca_typ = ?)
         OR (nadawca_id = ? AND nadawca_typ = ? AND odbiorca_id = ? AND odbiorca_typ = ?)
      ORDER BY data ASC
    `, [userId, userRole, id, rola, id, rola, userId, userRole]);

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// 3. Oznacz jako przeczytane
router.put('/przeczytane/:rola/:id', authMiddleware, async (req, res) => {
  const { rola, id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    await pool.query(`
      UPDATE wiadomosc 
      SET przeczytane = TRUE 
      WHERE odbiorca_id = ? AND odbiorca_typ = ? 
        AND nadawca_id = ? AND nadawca_typ = ?
    `, [userId, userRole, id, rola]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;