const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// pobierz całą historię z danym rozmówcą
router.get('/konwersacja/:rola/:id', authMiddleware, async (req, res) => {
  const { rola, id } = req.params;
  const user = req.user;

  // Walidacja parametrów
  if (!['kandydat', 'pracownikHR', 'administrator'].includes(rola)) {
    return res.status(400).json({ error: 'Nieprawidłowa rola' });
  }
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID musi być liczbą całkowitą' });
  }

  try {
    // Sprawdzenie istnienia rozmówcy
    let queryTable;
    if (rola === 'kandydat') {
      queryTable = 'kandydat';
    } else if (rola === 'pracownikHR') {
      queryTable = 'pracownikHR';
    } else {
      queryTable = 'administrator';
    }
    const [rozmowca] = await pool.query(`SELECT id FROM ${queryTable} WHERE id = ?`, [id]);
    if (rozmowca.length === 0) {
      return res.status(404).json({ error: `Rozmówca (${rola}) nie istnieje` });
    }

    // Pobieranie wiadomości
    const [rows] = await pool.query(
      `SELECT id, tresc, przeczytane, data FROM wiadomosc
       WHERE (nadawca_id=? AND nadawca_typ=? AND odbiorca_id=? AND odbiorca_typ=?)
          OR (nadawca_id=? AND nadawca_typ=? AND odbiorca_id=? AND odbiorca_typ=?)
       ORDER BY data ASC`,
      [user.id, user.role, id, rola, id, rola, user.id, user.role]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// lista konwersacji (ostatnia wiadomość z każdym rozmówcą)
router.get('/lista', authMiddleware, async (req, res) => {
  const { id, role } = req.user;

  // Walidacja roli użytkownika
  if (!['kandydat', 'pracownikHR', 'administrator'].includes(role)) {
    return res.status(400).json({ error: 'Nieprawidłowa rola użytkownika' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT w.id, w.tresc, w.przeczytane, w.data
       FROM wiadomosc w
       JOIN (
         SELECT LEAST(nadawca_id, odbiorca_id, nadawca_typ, odbiorca_typ) as key1,
                GREATEST(nadawca_id, odbiorca_id, nadawca_typ, odbiorca_typ) as key2,
                MAX(data) as max_date
         FROM wiadomosc
         WHERE (nadawca_id=? AND nadawca_typ=?) OR (odbiorca_id=? AND odbiorca_typ=?)
         GROUP BY key1, key2
       ) t
       ON (LEAST(w.nadawca_id, w.odbiorca_id, w.nadawca_typ, w.odbiorca_typ) = t.key1
           AND GREATEST(w.nadawca_id, w.odbiorca_id, w.nadawca_typ, w.odbiorca_typ) = t.key2
           AND w.data = t.max_date)
       ORDER BY w.data DESC`,
      [id, role, id, role]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// oznacz konwersację jako przeczytaną
router.put('/mark-read/:rola/:id', authMiddleware, async (req, res) => {
  const { rola, id } = req.params;
  const { id: userId, role } = req.user;

  // Walidacja parametrów
  if (!['kandydat', 'pracownikHR', 'administrator'].includes(rola)) {
    return res.status(400).json({ error: 'Nieprawidłowa rola' });
  }
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID musi być liczbą całkowitą' });
  }
  if (!['kandydat', 'pracownikHR', 'administrator'].includes(role)) {
    return res.status(400).json({ error: 'Nieprawidłowa rola użytkownika' });
  }

  try {
    // Sprawdzenie istnienia nadawcy
    let queryTable;
    if (rola === 'kandydat') {
      queryTable = 'kandydat';
    } else if (rola === 'pracownikHR') {
      queryTable = 'pracownikHR';
    } else {
      queryTable = 'administrator';
    }
    const [nadawca] = await pool.query(`SELECT id FROM ${queryTable} WHERE id = ?`, [id]);
    if (nadawca.length === 0) {
      return res.status(404).json({ error: `Nadawca (${rola}) nie istnieje` });
    }

    // Aktualizacja wiadomości
    await pool.query(
      `UPDATE wiadomosc
       SET przeczytane=TRUE
       WHERE odbiorca_id=? AND odbiorca_typ=? AND nadawca_id=? AND nadawca_typ=?`,
      [userId, role, id, rola]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;