const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Dodanie nowego typu umowy
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
      'INSERT INTO umowa (nazwa) VALUES (?)',
      [nazwa.trim()]
    );
    res.status(201).json({ id: result.insertId, nazwa: nazwa.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa umowy musi być unikalna' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich typów umów
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM umowa');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie typu umowy po ID
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  // Walidacja id
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID musi być liczbą całkowitą' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM umowa WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Typ umowy nie znaleziony' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja typu umowy
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
      'UPDATE umowa SET nazwa = ? WHERE id = ?',
      [nazwa.trim(), id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Typ umowy nie znaleziony' });
    }
    res.json({ id, nazwa: nazwa.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa umowy musi być unikalna' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie typu umowy
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
    const [result] = await pool.query('DELETE FROM umowa WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Typ umowy nie znaleziony' });
    }
    res.json({ message: 'Typ umowy usunięty' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'Nie można usunąć typu umowy, ponieważ jest powiązany z ofertami' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;