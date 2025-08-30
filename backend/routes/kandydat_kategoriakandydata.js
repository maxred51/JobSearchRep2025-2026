const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Dodanie nowego powiązania kandydat-kategoria
router.post('/', authMiddleware, async (req, res) => {
  const { Kandydatid, KategoriaKandydataid } = req.body;
  if (!Kandydatid || !KategoriaKandydataid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    // Sprawdzenie, czy kandydat istnieje
    const [kandydat] = await pool.query('SELECT id FROM kandydat WHERE id = ?', [Kandydatid]);
    if (kandydat.length === 0) {
      return res.status(400).json({ error: 'Podany kandydat nie istnieje' });
    }
    // Sprawdzenie, czy kategoria istnieje i należy do zalogowanego pracownika HR
    const [kategoria] = await pool.query('SELECT * FROM kategoriakandydata WHERE id = ?', [KategoriaKandydataid]);
    if (kategoria.length === 0) {
      return res.status(400).json({ error: 'Podana kategoria nie istnieje' });
    }
    if (req.user.role === 'pracownikHR' && kategoria[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do tej kategorii' });
    }
    // Sprawdzenie, czy kandydat aplikował na ofertę należącą do pracownika HR
    const [aplikacja] = await pool.query(
      'SELECT a.* FROM aplikacja a ' +
      'JOIN oferta o ON a.Ofertaid = o.id ' +
      'JOIN pracownikHR p ON o.PracownikHRid = p.id ' +
      'WHERE a.Kandydatid = ? AND p.id = ?',
      [Kandydatid, kategoria[0].PracownikHRid]
    );
    if (req.user.role === 'pracownikHR' && aplikacja.length === 0) {
      return res.status(403).json({ error: 'Kandydat nie aplikował na ofertę należącą do tego pracownika HR' });
    }
    // Dodanie powiązania
    const [result] = await pool.query(
      'INSERT INTO kandydat_kategoriakandydata (Kandydatid, KategoriaKandydataid) VALUES (?, ?)',
      [Kandydatid, KategoriaKandydataid]
    );
    res.status(201).json({ Kandydatid, KategoriaKandydataid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Powiązanie już istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich powiązań kandydat-kategoria (zabezpieczone)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'pracownikHR') {
      const [rows] = await pool.query(
        'SELECT kk.* FROM kandydat_kategoriakandydata kk ' +
        'JOIN kategoriakandydata k ON kk.KategoriaKandydataid = k.id ' +
        'WHERE k.PracownikHRid = ?',
        [req.user.id]
      );
      res.json(rows);
    } else if (req.user.role === 'administrator') {
      const [rows] = await pool.query('SELECT * FROM kandydat_kategoriakandydata');
      res.json(rows);
    } else {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie powiązania kandydat-kategoria po Kandydatid i KategoriaKandydataid (zabezpieczone)
router.get('/:Kandydatid/:KategoriaKandydataid', authMiddleware, async (req, res) => {
  const { Kandydatid, KategoriaKandydataid } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM kandydat_kategoriakandydata WHERE Kandydatid = ? AND KategoriaKandydataid = ?',
      [Kandydatid, KategoriaKandydataid]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Powiązanie nie znalezione' });
    }
    // Sprawdzenie uprawnień
    const [kategoria] = await pool.query('SELECT PracownikHRid FROM kategoriakandydata WHERE id = ?', [KategoriaKandydataid]);
    if (req.user.role === 'pracownikHR' && kategoria[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do tego powiązania' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie powiązania kandydat-kategoria (zabezpieczone)
router.delete('/:Kandydatid/:KategoriaKandydataid', authMiddleware, async (req, res) => {
  const { Kandydatid, KategoriaKandydataid } = req.params;
  try {
    // Sprawdzenie uprawnień
    const [kategoria] = await pool.query('SELECT PracownikHRid FROM kategoriakandydata WHERE id = ?', [KategoriaKandydataid]);
    if (kategoria.length === 0) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }
    if (req.user.role === 'pracownikHR' && kategoria[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do usunięcia tego powiązania' });
    }
    const [result] = await pool.query(
      'DELETE FROM kandydat_kategoriakandydata WHERE Kandydatid = ? AND KategoriaKandydataid = ?',
      [Kandydatid, KategoriaKandydataid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Powiązanie nie znalezione' });
    }
    res.json({ message: 'Powiązanie usunięte' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;