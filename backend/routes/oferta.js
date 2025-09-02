const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Dodanie nowej oferty
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'pracownikHR') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { tytuł, opis, wynagrodzenie, wymagania, lokalizacja, czas, KategoriaPracyid } = req.body;
  if (!tytuł || !opis || !wynagrodzenie || !lokalizacja || !czas || !KategoriaPracyid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO oferta (tytuł, opis, wynagrodzenie, wymagania, lokalizacja, czas, PracownikHRid, KategoriaPracyid, aktywna) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)',
      [tytuł, opis, wynagrodzenie, wymagania || null, lokalizacja, czas, req.user.id, KategoriaPracyid]
    );
    res.status(201).json({ id: result.insertId, tytuł, opis, wynagrodzenie, wymagania, lokalizacja, czas, PracownikHRid: req.user.id, KategoriaPracyid, aktywna: true });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana kategoria pracy nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich ofert
router.get('/', async (req, res) => {
  const { kategoriaPracy, poziom, wymiar, tryb, umowa } = req.query;
  try {
    let query = `
      SELECT o.id, o.tytuł, o.lokalizacja, f.nazwa AS nazwa_firmy, o.KategoriaPracyid
      FROM oferta o
      JOIN pracownikHR p ON o.PracownikHRid = p.id
      JOIN firma f ON p.Firmaid = f.id
      WHERE o.aktywna = TRUE
    `;
    const queryParams = [];

    // Filtrowanie po kategorii pracy
    if (kategoriaPracy) {
      query += ' AND o.KategoriaPracyid = ?';
      queryParams.push(kategoriaPracy);
    }

    // Filtrowanie po cechach
    if (poziom) {
      query += ' AND o.id IN (SELECT Ofertaid FROM oferta_poziom WHERE Poziomid = ?)';
      queryParams.push(poziom);
    }
    if (wymiar) {
      query += ' AND o.id IN (SELECT Ofertaid FROM oferta_wymiar WHERE Wymiarid = ?)';
      queryParams.push(wymiar);
    }
    if (tryb) {
      query += ' AND o.id IN (SELECT Ofertaid FROM oferta_tryb WHERE Trybid = ?)';
      queryParams.push(tryb);
    }
    if (umowa) {
      query += ' AND o.id IN (SELECT Ofertaid FROM oferta_umowa WHERE Umowaid = ?)';
      queryParams.push(umowa);
    }

    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie oferty po ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT o.*, f.nazwa AS nazwa_firmy, kp.nazwa AS nazwa_kategorii_pracy ' +
      'FROM oferta o ' +
      'JOIN pracownikHR p ON o.PracownikHRid = p.id ' +
      'JOIN firma f ON p.Firmaid = f.id ' +
      'JOIN kategoriapracy kp ON o.KategoriaPracyid = kp.id ' +
      'WHERE o.id = ? AND o.aktywna = TRUE',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona lub nieaktywna' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie ofert pracownika HR (zabezpieczone)
router.get('/pracownikHR/:PracownikHRid', authMiddleware, async (req, res) => {
  const { PracownikHRid } = req.params;
  try {
    // Sprawdzenie uprawnień
    if (req.user.role === 'pracownikHR' && req.user.id !== parseInt(PracownikHRid)) {
      return res.status(403).json({ error: 'Brak uprawnień do wyświetlania ofert' });
    }
    const [rows] = await pool.query(
      'SELECT o.*, f.nazwa AS nazwa_firmy, ' +
      '(SELECT COUNT(*) FROM aplikacja a WHERE a.Ofertaid = o.id) AS liczba_aplikacji ' +
      'FROM oferta o ' +
      'JOIN pracownikHR p ON o.PracownikHRid = p.id ' +
      'JOIN firma f ON p.Firmaid = f.id ' +
      'WHERE o.PracownikHRid = ?',
      [PracownikHRid]
    );
    res.json(rows);
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
  const { tytuł, opis, wynagrodzenie, wymagania, lokalizacja, czas, KategoriaPracyid, aktywna } = req.body;
  if (!tytuł || !opis || !wynagrodzenie || !lokalizacja || !czas || !KategoriaPracyid || aktywna === undefined) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    // Weryfikacja, czy oferta należy do pracownika HR
    const [oferta] = await pool.query('SELECT PracownikHRid FROM oferta WHERE id = ?', [id]);
    if (oferta.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    if (oferta[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do edycji tej oferty' });
    }
    const [result] = await pool.query(
      'UPDATE oferta SET tytuł = ?, opis = ?, wynagrodzenie = ?, wymagania = ?, lokalizacja = ?, czas = ?, KategoriaPracyid = ?, aktywna = ? WHERE id = ?',
      [tytuł, opis, wynagrodzenie, wymagania || null, lokalizacja, czas, KategoriaPracyid, aktywna, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    res.json({ id, tytuł, opis, wynagrodzenie, wymagania, lokalizacja, czas, PracownikHRid: req.user.id, KategoriaPracyid, aktywna });
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