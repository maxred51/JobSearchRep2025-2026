const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Dodanie nowego wymiaru etatu
router.post('/', authMiddleware, async (req, res) => {
  // Sprawdzenie roli (tylko administrator)
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }

  const { nazwa } = req.body;

  // Walidacja nazwy
  if (!nazwa || typeof nazwa !== 'string' || nazwa.trim().length === 0 || nazwa.length > 50) {
    return res.status(400).json({ error: 'Nazwa musi być niepustym ciągiem znaków o długości do 50 znaków' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO wymiar (nazwa) VALUES (?)',
      [nazwa.trim()]
    );
    res.status(201).json({ id: result.insertId, nazwa: nazwa.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa wymiaru musi być unikalna' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich wymiarów etatu
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM wymiar');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wymiaru etatu po ID
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  // Walidacja id
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID musi być liczbą całkowitą' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM wymiar WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Wymiar etatu nie znaleziony' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja wymiaru etatu
router.put('/:id', authMiddleware, async (req, res) => {
  // Sprawdzenie roli (tylko administrator)
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }

  const { id } = req.params;
  const { nazwa } = req.body;

  // Walidacja id
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID musi być liczbą całkowitą' });
  }

  // Walidacja nazwy
  if (!nazwa || typeof nazwa !== 'string' || nazwa.trim().length === 0 || nazwa.length > 50) {
    return res.status(400).json({ error: 'Nazwa musi być niepustym ciągiem znaków o długości do 50 znaków' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE wymiar SET nazwa = ? WHERE id = ?',
      [nazwa.trim(), id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Wymiar etatu nie znaleziony' });
    }
    res.json({ id, nazwa: nazwa.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa wymiaru musi być unikalna' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie wymiaru etatu
router.delete('/:id', authMiddleware, async (req, res) => {
  // Sprawdzenie roli (tylko administrator)
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }

  const { id } = req.params;

  // Walidacja id
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID musi być liczbą całkowitą' });
  }

  try {
    const [result] = await pool.query('DELETE FROM wymiar WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Wymiar etatu nie znaleziony' });
    }
    res.json({ message: 'Wymiar etatu usunięty' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'Nie można usunąć wymiaru etatu, ponieważ jest używany w powiązaniach' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;