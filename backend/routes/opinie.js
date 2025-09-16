const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// Interfejs Kandydat (zakładka "Moje opinie")
// READ - Pobieranie listy firm z opiniami kandydata
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'kandydat') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT o.Firmaid, f.nazwa AS nazwa_firmy, o.tresc ' +
      'FROM opinia o ' +
      'JOIN firma f ON o.Firmaid = f.id ' +
      'WHERE o.Kandydatid = ?',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs Kandydat (zakładka "Moje opinie")
// UPDATE - Edycja opinii o firmie
router.put('/:Firmaid', authMiddleware, async (req, res) => {
  if (req.user.role !== 'kandydat') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { Firmaid } = req.params;
  const { tresc } = req.body;
  if (tresc === undefined || tresc === null) {
    return res.status(400).json({ error: 'Nieprawidłowe dane: wymagane tresc' });
  }
  try {
    const [opinia] = await pool.query(
      'SELECT * FROM opinia WHERE Kandydatid = ? AND Firmaid = ?',
      [req.user.id, Firmaid]
    );
    if (opinia.length === 0) {
      return res.status(404).json({ error: 'Opinia nie znaleziona' });
    }
    const [result] = await pool.query(
      'UPDATE opinia SET tresc = ? WHERE Kandydatid = ? AND Firmaid = ?',
      [tresc, req.user.id, Firmaid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Opinia nie znaleziona' });
    }
    res.json({ Kandydatid: req.user.id, Firmaid, tresc });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;