const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Dodanie nowej oferty
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'pracownikHR') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { tytuł, opis, wynagrodzenie, lokalizacja, czas, KategoriaPracyid } = req.body;
  if (!tytuł || !opis || !wynagrodzenie || !lokalizacja || !czas || !KategoriaPracyid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO oferta (tytuł, opis, wynagrodzenie, lokalizacja, czas, PracownikHRid, KategoriaPracyid, aktywna) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)',
      [tytuł, opis, wynagrodzenie, lokalizacja, czas, req.user.id, KategoriaPracyid]
    );
    res.status(201).json({ id: result.insertId, tytuł, opis, wynagrodzenie, lokalizacja, czas, PracownikHRid: req.user.id, KategoriaPracyid, aktywna: true });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana kategoria pracy nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich ofert
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM oferta');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie oferty po ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM oferta WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja oferty
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'pracownikHR') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { id } = req.params;
  const { tytuł, opis, wynagrodzenie, lokalizacja, czas, KategoriaPracyid, aktywna } = req.body;
  if (!tytuł || !opis || !wynagrodzenie || !lokalizacja || !czas || !KategoriaPracyid || aktywna === undefined) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    // Weryfikacja, czy oferta należy do pracownika HR i jest aktywna
    const [oferta] = await pool.query('SELECT PracownikHRid, aktywna FROM oferta WHERE id = ?', [id]);
    if (oferta.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    if (oferta[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do edycji tej oferty' });
    }
    if (!oferta[0].aktywna && aktywna) {
      return res.status(400).json({ error: 'Nie można aktywować nieaktywnej oferty' });
    }
    const [result] = await pool.query(
      'UPDATE oferta SET tytuł = ?, opis = ?, wynagrodzenie = ?, lokalizacja = ?, czas = ?, KategoriaPracyid = ?, aktywna = ? WHERE id = ?',
      [tytuł, opis, wynagrodzenie, lokalizacja, czas, KategoriaPracyid, aktywna, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    res.json({ id, tytuł, opis, wynagrodzenie, lokalizacja, czas, PracownikHRid: req.user.id, KategoriaPracyid, aktywna });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana kategoria pracy nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie oferty
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'pracownikHR') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { id } = req.params;
  try {
    const [oferta] = await pool.query('SELECT PracownikHRid FROM oferta WHERE id = ?', [id]);
    if (oferta.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    if (oferta[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do usunięcia tej oferty' });
    }
    const [result] = await pool.query('DELETE FROM oferta WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    res.json({ message: 'Oferta usunięta' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;