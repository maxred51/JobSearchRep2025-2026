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

  // Walidacja danych
  if (tresc === undefined || tresc === null) {
    return res.status(400).json({ error: 'Nieprawidłowe dane: wymagane tresc' });
  }
  if (isNaN(parseInt(Firmaid))) {
    return res.status(400).json({ error: 'Firmaid musi być liczbą całkowitą' });
  }
  if (typeof tresc === 'string' && tresc.length > 80) {
    return res.status(400).json({ error: 'Treść opinii nie może przekraczać 80 znaków' });
  }

  try {
    // Sprawdzenie, czy firma istnieje
    const [firma] = await pool.query('SELECT id FROM firma WHERE id = ?', [Firmaid]);
    if (firma.length === 0) {
      return res.status(404).json({ error: 'Firma nie znaleziona' });
    }
    // Aktualizacja opinii
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