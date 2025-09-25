const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Dodanie nowej firmy
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { nazwa, strona_www } = req.body;

  // Walidacja danych
  if (typeof nazwa !== 'string' || nazwa.trim().length === 0 || nazwa.length > 50) {
    return res.status(400).json({ error: 'Nazwa musi być niepustym ciągiem znaków o długości do 50 znaków' });
  }
  if (typeof strona_www !== 'string' || strona_www.trim().length === 0 || strona_www.length > 50) {
    return res.status(400).json({ error: 'Strona www musi być niepustym ciągiem znaków o długości do 50 znaków' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO firma (nazwa, strona_www) VALUES (?, ?)',
      [nazwa.trim(), strona_www.trim()]
    );
    res.status(201).json({ id: result.insertId, nazwa: nazwa.trim(), strona_www: strona_www.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa firmy lub strona www już istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich firm
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM firma');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie firmy po ID
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  // Walidacja parametrów
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID musi być liczbą całkowitą' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM firma WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Firma nie znaleziona' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja firmy
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { id } = req.params;
  const { nazwa, strona_www } = req.body;

  // Walidacja danych
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID musi być liczbą całkowitą' });
  }
  if (typeof nazwa !== 'string' || nazwa.trim().length === 0 || nazwa.length > 50) {
    return res.status(400).json({ error: 'Nazwa musi być niepustym ciągiem znaków o długości do 50 znaków' });
  }
  if (typeof strona_www !== 'string' || strona_www.trim().length === 0 || strona_www.length > 50) {
    return res.status(400).json({ error: 'Strona www musi być niepustym ciągiem znaków o długości do 50 znaków' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE firma SET nazwa = ?, strona_www = ? WHERE id = ?',
      [nazwa.trim(), strona_www.trim(), id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Firma nie znaleziona' });
    }
    res.json({ id, nazwa: nazwa.trim(), strona_www: strona_www.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa firmy lub strona www już istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie firmy
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { id } = req.params;

  // Walidacja parametrów
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID musi być liczbą całkowitą' });
  }

  try {
    const [result] = await pool.query('DELETE FROM firma WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Firma nie znaleziona' });
    }
    res.json({ message: 'Firma usunięta' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'Nie można usunąć firmy, ponieważ jest powiązana z pracownikami HR' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;