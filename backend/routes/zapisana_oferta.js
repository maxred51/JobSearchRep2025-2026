const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// Interfejs Kandydat (zakładka "Przegląd ofert")
// CREATE - Zapisanie oferty dla kandydata
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'kandydat') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { Ofertaid } = req.body;

  // Walidacja danych
  if (!Ofertaid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane: wymagane Ofertaid' });
  }
  if (isNaN(parseInt(Ofertaid))) {
    return res.status(400).json({ error: 'Ofertaid musi być liczbą całkowitą' });
  }

  try {
    // Sprawdzenie, czy oferta jest aktywna
    const [oferta] = await pool.query('SELECT id FROM oferta WHERE id = ? AND aktywna = TRUE', [Ofertaid]);
    if (oferta.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona lub nieaktywna' });
    }
    // Dodanie powiązania
    const [result] = await pool.query(
      'INSERT INTO zapisana_oferta (Kandydatid, Ofertaid) VALUES (?, ?)',
      [req.user.id, Ofertaid]
    );
    res.status(201).json({ Kandydatid: req.user.id, Ofertaid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Oferta już zapisana' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW' || error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs Kandydat (zakładka "Obserwowane firmy i oferty")
// READ - Pobieranie zapisanych ofert kandydata
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'kandydat') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT o.id, o.tytul, o.opis, o.wymagania, o.lokalizacja, f.nazwa AS nazwa_firmy ' +
      'FROM zapisana_oferta zo ' +
      'JOIN oferta o ON zo.Ofertaid = o.id ' +
      'JOIN pracownikHR p ON o.PracownikHRid = p.id ' +
      'JOIN firma f ON p.Firmaid = f.id ' +
      'WHERE zo.Kandydatid = ? AND o.aktywna = TRUE',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs Kandydat (zakładka "Obserwowane firmy i oferty")
// DELETE - Usunięcie zapisanej oferty
router.delete('/:Ofertaid', authMiddleware, async (req, res) => {
  if (req.user.role !== 'kandydat') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { Ofertaid } = req.params;

  // Walidacja parametrów
  if (isNaN(parseInt(Ofertaid))) {
    return res.status(400).json({ error: 'Ofertaid musi być liczbą całkowitą' });
  }

  try {
    // Sprawdzenie, czy oferta istnieje
    const [oferta] = await pool.query('SELECT id FROM oferta WHERE id = ?', [Ofertaid]);
    if (oferta.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    // Usunięcie powiązania
    const [result] = await pool.query(
      'DELETE FROM zapisana_oferta WHERE Kandydatid = ? AND Ofertaid = ?',
      [req.user.id, Ofertaid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Oferta nie była zapisana' });
    }
    res.json({ message: 'Zapisana oferta usunięta' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;