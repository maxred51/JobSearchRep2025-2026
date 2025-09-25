const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// ========================
// POWIADOMIENIA KANDYDATA
// ========================

// Pobranie powiadomień kandydata (typu "oferta")
router.get('/kandydat/:kandydatId', authMiddleware, async (req, res) => {
  const { kandydatId } = req.params;

  // Walidacja kandydatId
  if (isNaN(parseInt(kandydatId))) {
    return res.status(400).json({ error: 'Kandydatid musi być liczbą całkowitą' });
  }

  try {
    // Sprawdzenie uprawnień
    if (req.user.role !== 'kandydat' || req.user.id != kandydatId) {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    // Sprawdzenie istnienia kandydata
    const [kandydat] = await pool.query('SELECT id FROM kandydat WHERE id = ?', [kandydatId]);
    if (kandydat.length === 0) {
      return res.status(404).json({ error: 'Kandydat nie istnieje' });
    }

    // Pobranie powiadomień
    const [rows] = await pool.query(
      'SELECT id, tresc, data, przeczytane, Ofertaid FROM powiadomienie WHERE Kandydatid = ? AND typ = "oferta" ORDER BY data DESC',
      [kandydatId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Oznaczenie powiadomienia jako przeczytane
router.put('/:id/przeczytane', authMiddleware, async (req, res) => {
  const { id } = req.params;

  // Walidacja id
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID powiadomienia musi być liczbą całkowitą' });
  }

  try {
    // Sprawdzenie istnienia powiadomienia
    const [powiadomienie] = await pool.query('SELECT id, Kandydatid FROM powiadomienie WHERE id = ?', [id]);
    if (powiadomienie.length === 0) {
      return res.status(404).json({ error: 'Powiadomienie nie istnieje' });
    }

    // Autoryzacja
    if (req.user.role !== 'administrator' && (req.user.role !== 'kandydat' || req.user.id !== powiadomienie[0].Kandydatid)) {
      return res.status(403).json({ error: 'Brak dostępu do tego powiadomienia' });
    }

    // Aktualizacja powiadomienia
    await pool.query('UPDATE powiadomienie SET przeczytane = TRUE WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Usunięcie powiadomienia (dla kandydata i admina)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  // Walidacja id
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID powiadomienia musi być liczbą całkowitą' });
  }

  try {
    // Sprawdzenie istnienia powiadomienia
    const [powiadomienie] = await pool.query('SELECT id, Kandydatid FROM powiadomienie WHERE id = ?', [id]);
    if (powiadomienie.length === 0) {
      return res.status(404).json({ error: 'Powiadomienie nie istnieje' });
    }

    // Autoryzacja
    if (req.user.role !== 'administrator' && (req.user.role !== 'kandydat' || req.user.id !== powiadomienie[0].Kandydatid)) {
      return res.status(403).json({ error: 'Brak dostępu do tego powiadomienia' });
    }

    // Usunięcie powiadomienia
    await pool.query('DELETE FROM powiadomienie WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ========================
// POWIADOMIENIA ADMINISTRATORA
// ========================

// Interfejs Administrator (zakładka "Powiadomienia")
// Pobranie powiadomień systemowych (typu "system")
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    // Sprawdzenie uprawnień
    if (req.user.role !== 'administrator') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    // Pobranie powiadomień
    const [rows] = await pool.query(
      'SELECT id, tresc, data, przeczytane FROM powiadomienie WHERE typ = "system" ORDER BY data DESC'
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;