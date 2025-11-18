const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Dodanie nowej kategorii pracy
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { Nazwa, KategoriaPracyid } = req.body;

  // Walidacja danych
  if (typeof Nazwa !== 'string' || Nazwa.trim().length === 0 || Nazwa.length > 60) {
    return res.status(400).json({ error: 'Nazwa musi być niepustym ciągiem znaków o długości do 60 znaków' });
  }
  if (KategoriaPracyid !== undefined && KategoriaPracyid !== null && isNaN(parseInt(KategoriaPracyid))) {
    return res.status(400).json({ error: 'KategoriaPracyid musi być liczbą całkowitą' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO kategoriapracy (Nazwa, KategoriaPracyid) VALUES (?, ?)',
      [Nazwa.trim(), KategoriaPracyid || null]
    );

    res.status(201).json({ id: result.insertId, Nazwa: Nazwa.trim(), KategoriaPracyid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa kategorii musi być unikalna' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana kategoria nadrzędna nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich kategorii pracy
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kategoriapracy');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie kategorii pracy po ID
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  // Walidacja parametrów
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID musi być liczbą całkowitą' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM kategoriapracy WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Kategoria pracy nie znaleziona' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja kategorii pracy
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { id } = req.params;
  const { Nazwa, KategoriaPracyid } = req.body;

  // Walidacja danych
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID musi być liczbą całkowitą' });
  }
  if (typeof Nazwa !== 'string' || Nazwa.trim().length === 0 || Nazwa.length > 60) {
    return res.status(400).json({ error: 'Nazwa musi być niepustym ciągiem znaków o długości do 60 znaków' });
  }
  if (KategoriaPracyid !== undefined && KategoriaPracyid !== null && isNaN(parseInt(KategoriaPracyid))) {
    return res.status(400).json({ error: 'KategoriaPracyid musi być liczbą całkowitą' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE kategoriapracy SET Nazwa = ?, KategoriaPracyid = ? WHERE id = ?',
      [Nazwa.trim(), KategoriaPracyid || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kategoria pracy nie znaleziona' });
    }
    res.json({ id, Nazwa: Nazwa.trim(), KategoriaPracyid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nazwa kategorii musi być unikalna' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana kategoria nadrzędna nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie kategorii pracy
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
    const [result] = await pool.query('DELETE FROM kategoriapracy WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kategoria pracy nie znaleziona' });
    }
    res.json({ message: 'Kategoria pracy usunięta' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'Nie można usunąć kategorii, ponieważ jest powiązana z ofertami lub podkategoriami' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;