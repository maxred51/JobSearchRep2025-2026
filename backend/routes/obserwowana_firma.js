const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// Interfejs Kandydat (zakładka "Przegląd ofert" -> przejście do szczegółów oferty)
// CREATE - Obserwowanie firmy przez kandydata
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'kandydat') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { Firmaid } = req.body;

  // Walidacja danych
  if (!Firmaid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane: wymagane Firmaid' });
  }
  if (isNaN(parseInt(Firmaid))) {
    return res.status(400).json({ error: 'Firmaid musi być liczbą całkowitą' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO obserwowana_firma (Kandydatid, Firmaid) VALUES (?, ?)',
      [req.user.id, Firmaid]
    );
    res.status(201).json({ Kandydatid: req.user.id, Firmaid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Firma już obserwowana' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW' || error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ error: 'Firma nie znaleziona' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs Kandydat (zakładka "Obserwowane firmy i oferty")
// READ - Pobieranie obserwowanych firm kandydata
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'kandydat') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT f.id, f.nazwa AS nazwa_firmy ' +
      'FROM obserwowana_firma of ' +
      'JOIN firma f ON of.Firmaid = f.id ' +
      'WHERE of.Kandydatid = ?',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs Kandydat (zakładka "Obserwowane firmy i oferty")
// DELETE - Usunięcie obserwowanej firmy
router.delete('/:Firmaid', authMiddleware, async (req, res) => {
  if (req.user.role !== 'kandydat') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { Firmaid } = req.params;

  // Walidacja parametrów
  if (isNaN(parseInt(Firmaid))) {
    return res.status(400).json({ error: 'Firmaid musi być liczbą całkowitą' });
  }

  try {
    // Sprawdzenie, czy firma istnieje
    const [firma] = await pool.query('SELECT id FROM firma WHERE id = ?', [Firmaid]);
    if (firma.length === 0) {
      return res.status(404).json({ error: 'Firma nie znaleziona' });
    }
    // Usunięcie powiązania
    const [result] = await pool.query(
      'DELETE FROM obserwowana_firma WHERE Kandydatid = ? AND Firmaid = ?',
      [req.user.id, Firmaid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Firma nie była obserwowana' });
    }
    res.json({ message: 'Obserwowana firma usunięta' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;