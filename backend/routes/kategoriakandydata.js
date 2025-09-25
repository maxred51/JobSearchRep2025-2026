const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// Interfejs PracownikHR (zakładka "Kategorie")
// CREATE - Dodanie nowej kategorii kandydata
router.post('/', authMiddleware, async (req, res) => {
  const { nazwa, PracownikHRid } = req.body;
  
  // Walidacja danych
  if (!nazwa || !PracownikHRid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  if (typeof nazwa !== 'string' || nazwa.trim() === '' || nazwa.length > 60) {
    return res.status(400).json({ error: 'Nazwa musi być niepustym ciągiem znaków o długości do 60 znaków' });
  }
  if (isNaN(parseInt(PracownikHRid))) {
    return res.status(400).json({ error: 'PracownikHRid musi być liczbą całkowitą' });
  }

  try {
    // Sprawdzenie, czy PracownikHRid istnieje
    const [pracownikHR] = await pool.query('SELECT id FROM pracownikHR WHERE id = ?', [PracownikHRid]);
    if (pracownikHR.length === 0) {
      return res.status(400).json({ error: 'Podany pracownik HR nie istnieje' });
    }
    // Sprawdzenie uprawnień
    if (req.user.role !== 'administrator' && (req.user.role !== 'pracownikHR' || req.user.id !== PracownikHRid)) {
      return res.status(403).json({ error: 'Brak uprawnień do tworzenia kategorii' });
    }
    // Sprawdzenie unikalności nazwy w obrębie PracownikHRid
    const [existing] = await pool.query(
      'SELECT * FROM kategoriakandydata WHERE nazwa = ? AND PracownikHRid = ?',
      [nazwa, PracownikHRid]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Nazwa kategorii musi być unikalna dla danego pracownika HR' });
    }
    // Wstawienie kategorii
    const [result] = await pool.query(
      'INSERT INTO kategoriakandydata (nazwa, PracownikHRid) VALUES (?, ?)',
      [nazwa, PracownikHRid]
    );
    res.status(201).json({ id: result.insertId, nazwa, PracownikHRid });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs PracownikHR (zakładka "Kategorie")
// READ - Pobieranie wszystkich kategorii kandydatów (zabezpieczone)
router.get('/', authMiddleware, async (req, res) => {
  const { sortBy, sortOrder } = req.query;

  // Walidacja parametrów sortowania
  if (sortBy && sortBy !== 'nazwa') {
    return res.status(400).json({ error: 'Sortowanie możliwe tylko po polu "nazwa"' });
  }
  if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    return res.status(400).json({ error: 'SortOrder musi być "asc" lub "desc"' });
  }

  try {
    if (req.user.role === 'pracownikHR') {
      let query = `
        SELECT k.id, k.nazwa, k.PracownikHRid, 
               COUNT(kk.Kandydatid) AS liczba_kandydatow
        FROM kategoriakandydata k
        LEFT JOIN kandydat_kategoriakandydata kk ON k.id = kk.KategoriaKandydataid
        WHERE k.PracownikHRid = ?
        GROUP BY k.id, k.nazwa, k.PracownikHRid
      `;
      const queryParams = [req.user.id];

      // Sortowanie
      if (sortBy === 'nazwa') {
        const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY k.nazwa ${order}`;
      }

      const [rows] = await pool.query(query, queryParams);
      res.json(rows);
    } else if (req.user.role === 'administrator') {
      let query = `
        SELECT k.id, k.nazwa, k.PracownikHRid, 
               COUNT(kk.Kandydatid) AS liczba_kandydatow
        FROM kategoriakandydata k
        LEFT JOIN kandydat_kategoriakandydata kk ON k.id = kk.KategoriaKandydataid
        GROUP BY k.id, k.nazwa, k.PracownikHRid
      `;
      if (sortBy === 'nazwa') {
        const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY k.nazwa ${order}`;
      }

      const [rows] = await pool.query(query);
      res.json(rows);
    } else {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs PracownikHR (zakładka "Kategorie")
// READ - Pobieranie kategorii kandydata po ID (zabezpieczone)
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  // Walidacja id
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID kategorii musi być liczbą całkowitą' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT k.id, k.nazwa, k.PracownikHRid, COUNT(kk.Kandydatid) AS liczba_kandydatow ' +
      'FROM kategoriakandydata k ' +
      'LEFT JOIN kandydat_kategoriakandydata kk ON k.id = kk.KategoriaKandydataid ' +
      'WHERE k.id = ? ' +
      'GROUP BY k.id, k.nazwa, k.PracownikHRid',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }
    // Sprawdzenie uprawnień
    if (req.user.role !== 'administrator' && req.user.role === 'pracownikHR' && rows[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do tej kategorii' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs PracownikHR (zakładka "Kategorie")
// UPDATE - Aktualizacja kategorii kandydata (zabezpieczone)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nazwa } = req.body;

  // Walidacja danych
  if (!nazwa) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID kategorii musi być liczbą całkowitą' });
  }
  if (typeof nazwa !== 'string' || nazwa.trim() === '' || nazwa.length > 60) {
    return res.status(400).json({ error: 'Nazwa musi być niepustym ciągiem znaków o długości do 60 znaków' });
  }

  try {
    // Sprawdzenie, czy kategoria istnieje
    const [kategoria] = await pool.query('SELECT * FROM kategoriakandydata WHERE id = ?', [id]);
    if (kategoria.length === 0) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }
    // Sprawdzenie uprawnień
    if (req.user.role !== 'administrator' && req.user.role === 'pracownikHR' && kategoria[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do edycji tej kategorii' });
    }
    // Sprawdzenie unikalności nazwy w obrębie PracownikHRid
    const [existing] = await pool.query(
      'SELECT * FROM kategoriakandydata WHERE nazwa = ? AND PracownikHRid = ? AND id != ?',
      [nazwa, kategoria[0].PracownikHRid, id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Nazwa kategorii musi być unikalna dla danego pracownika HR' });
    }
    // Aktualizacja kategorii
    const [result] = await pool.query(
      'UPDATE kategoriakandydata SET nazwa = ? WHERE id = ?',
      [nazwa, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }
    res.json({ id, nazwa, PracownikHRid: kategoria[0].PracownikHRid });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs PracownikHR (zakładka "Kategorie")
// DELETE - Usunięcie kategorii kandydata (zabezpieczone)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  // Walidacja id
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID kategorii musi być liczbą całkowitą' });
  }

  try {
    // Sprawdzenie, czy kategoria istnieje
    const [kategoria] = await pool.query('SELECT * FROM kategoriakandydata WHERE id = ?', [id]);
    if (kategoria.length === 0) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }
    // Sprawdzenie uprawnień
    if (req.user.role !== 'administrator' && req.user.role === 'pracownikHR' && kategoria[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do usunięcia tej kategorii' });
    }
    // Usunięcie kategorii
    const [result] = await pool.query('DELETE FROM kategoriakandydata WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }
    res.json({ message: 'Kategoria usunięta' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;