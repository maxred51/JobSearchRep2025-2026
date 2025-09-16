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
  try {
    if (req.user.role !== 'kandydat' || req.user.id != kandydatId) {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM powiadomienie WHERE Kandydatid = ? AND typ = "oferta" ORDER BY data DESC',
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
  try {
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
  try {
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
    if (req.user.role !== 'administrator') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM powiadomienie WHERE typ = "system" ORDER BY data DESC'
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});


module.exports = router;
