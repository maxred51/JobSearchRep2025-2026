const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Dodanie nowej kategorii kandydata
router.post('/', authMiddleware, async (req, res) => {
  const { nazwa, PracownikHRid } = req.body;
  if (!nazwa || !PracownikHRid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    // Sprawdzenie, czy PracownikHRid istnieje
    const [pracownikHR] = await pool.query('SELECT id FROM pracownikHR WHERE id = ?', [PracownikHRid]);
    if (pracownikHR.length === 0) {
      return res.status(400).json({ error: 'Podany pracownik HR nie istnieje' });
    }
    // Sprawdzenie, czy użytkownik ma uprawnienia (musi być pracownikiem HR o podanym ID)
    if (req.user.role !== 'pracownikHR' || req.user.id !== PracownikHRid) {
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
    const [result] = await pool.query(
      'INSERT INTO kategoriakandydata (nazwa, PracownikHRid) VALUES (?, ?)',
      [nazwa, PracownikHRid]
    );
    res.status(201).json({ id: result.insertId, nazwa, PracownikHRid });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich kategorii kandydatów (zabezpieczone)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Ograniczamy wyniki do kategorii należących do zalogowanego pracownika HR
    if (req.user.role === 'pracownikHR') {
      const [rows] = await pool.query(
        'SELECT * FROM kategoriakandydata WHERE PracownikHRid = ?',
        [req.user.id]
      );
      res.json(rows);
    } else if (req.user.role === 'administrator') {
      const [rows] = await pool.query('SELECT * FROM kategoriakandydata');
      res.json(rows);
    } else {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie kategorii kandydata po ID (zabezpieczone)
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM kategoriakandydata WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }
    // Sprawdzenie uprawnień: pracownik HR może zobaczyć tylko własne kategorie
    if (req.user.role === 'pracownikHR' && rows[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do tej kategorii' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja kategorii kandydata (zabezpieczone)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nazwa } = req.body;
  if (!nazwa) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    // Sprawdzenie, czy kategoria istnieje i należy do zalogowanego pracownika HR
    const [kategoria] = await pool.query('SELECT * FROM kategoriakandydata WHERE id = ?', [id]);
    if (kategoria.length === 0) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }
    if (req.user.role === 'pracownikHR' && kategoria[0].PracownikHRid !== req.user.id) {
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

// DELETE - Usunięcie kategorii kandydata (zabezpieczone)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    // Sprawdzenie, czy kategoria istnieje i należy do zalogowanego pracownika HR
    const [kategoria] = await pool.query('SELECT * FROM kategoriakandydata WHERE id = ?', [id]);
    if (kategoria.length === 0) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }
    if (req.user.role === 'pracownikHR' && kategoria[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do usunięcia tej kategorii' });
    }
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