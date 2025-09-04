const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Dodanie nowej aplikacji
router.post('/', authMiddleware, async (req, res) => {
  const { Kandydatid, Ofertaid, kwota, odpowiedz } = req.body;
  if (!Kandydatid || !Ofertaid || !kwota || !odpowiedz) {
    return res.status(400).json({ error: 'Nieprawidłowe dane: wymagane Kandydatid, Ofertaid, kwota i odpowiedz' });
  }
  try {
    const [kandydat] = await pool.query('SELECT id FROM kandydat WHERE id = ?', [Kandydatid]);
    if (kandydat.length === 0) {
      return res.status(400).json({ error: 'Podany kandydat nie istnieje' });
    }
    const [oferta] = await pool.query(
      'SELECT o.id, o.PracownikHRid, p.Firmaid ' +
      'FROM oferta o ' +
      'JOIN pracownikHR p ON o.PracownikHRid = p.id ' +
      'WHERE o.id = ?',
      [Ofertaid]
    );
    if (oferta.length === 0) {
      return res.status(400).json({ error: 'Podana oferta nie istnieje' });
    }
    if (req.user.role === 'pracownikHR' && oferta[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do tej oferty' });
    }
    // Dodanie rekordu do tabeli aplikacja
    const [result] = await pool.query(
      'INSERT INTO aplikacja (Kandydatid, Ofertaid, status, kwota, odpowiedz) VALUES (?, ?, "oczekujaca", ?, ?)',
      [Kandydatid, Ofertaid, kwota, odpowiedz]
    );
    // Dodanie rekordu do tabeli opinia, jeśli nie istnieje
    const [existingOpinia] = await pool.query(
      'SELECT * FROM opinia WHERE Kandydatid = ? AND Firmaid = ?',
      [Kandydatid, oferta[0].Firmaid]
    );
    if (existingOpinia.length === 0) {
      await pool.query(
        'INSERT INTO opinia (Kandydatid, Firmaid, tresc) VALUES (?, ?, ?)',
        [Kandydatid, oferta[0].Firmaid, '']
      );
    }
    res.status(201).json({ Kandydatid, Ofertaid, status: "oczekujaca", kwota, odpowiedz });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Aplikacja już istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich aplikacji (zabezpieczone)
router.get('/', authMiddleware, async (req, res) => {
  const { sortBy, sortOrder, status } = req.query;
  try {
    if (req.user.role === 'kandydat') {
      let query = `
        SELECT o.tytuł, f.nazwa AS nazwa_firmy, o.opis, o.wymagania
        FROM aplikacja a
        JOIN oferta o ON a.Ofertaid = o.id
        JOIN pracownikHR p ON o.PracownikHRid = p.id
        JOIN firma f ON p.Firmaid = f.id
        WHERE a.Kandydatid = ?
      `;
      const queryParams = [req.user.id];

      // Filtrowanie po statusie dla kandydata
      if (status && ['oczekujaca', 'odrzucona', 'zakceptowana'].includes(status)) {
        query += ' AND a.status = ?';
        queryParams.push(status);
      }

      // Sortowanie dla kandydata
      if (sortBy === 'tytuł') {
        const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY o.tytuł ${order}`;
      }

      const [rows] = await pool.query(query, queryParams);
      res.json(rows);
    } else if (req.user.role === 'pracownikHR') {
      let query = `
        SELECT a.id, a.status, a.Kandydatid, a.Ofertaid, a.kwota, a.odpowiedz,
               o.tytuł AS stanowisko, k.imie, k.nazwisko
        FROM aplikacja a
        JOIN oferta o ON a.Ofertaid = o.id
        JOIN kandydat k ON a.Kandydatid = k.id
        WHERE o.PracownikHRid = ?
      `;
      const queryParams = [req.user.id];

      // Filtrowanie po statusie
      if (status && ['oczekujaca', 'odrzucona', 'zakceptowana'].includes(status)) {
        query += ' AND a.status = ?';
        queryParams.push(status);
      }

      // Sortowanie
      if (sortBy === 'stanowisko') {
        const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? 'ASC' : 'ASC';
        query += ` ORDER BY o.tytuł ${order}`;
      }

      const [rows] = await pool.query(query, queryParams);
      res.json(rows);
    } else if (req.user.role === 'administrator') {
      const [rows] = await pool.query(`
        SELECT a.id, a.status, a.Kandydatid, a.Ofertaid, a.kwota, a.odpowiedz,
               o.tytuł AS stanowisko, k.imie, k.nazwisko
        FROM aplikacja a
        JOIN oferta o ON a.Ofertaid = o.id
        JOIN kandydat k ON a.Kandydatid = k.id
      `);
      res.json(rows);
    } else {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie aplikacji po Kandydatid i Ofertaid (zabezpieczone)
router.get('/:Kandydatid/:Ofertaid', authMiddleware, async (req, res) => {
  const { Kandydatid, Ofertaid } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT a.id, a.status, a.Kandydatid, a.Ofertaid, a.kwota, a.odpowiedz, ' +
      'o.tytuł AS stanowisko, k.imie, k.nazwisko, k.telefon, k.email ' +
      'FROM aplikacja a ' +
      'JOIN oferta o ON a.Ofertaid = o.id ' +
      'JOIN kandydat k ON a.Kandydatid = k.id ' +
      'WHERE a.Kandydatid = ? AND a.Ofertaid = ?',
      [Kandydatid, Ofertaid]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Aplikacja nie znaleziona' });
    }
    if (req.user.role === 'pracownikHR') {
      const [oferta] = await pool.query('SELECT PracownikHRid FROM oferta WHERE id = ?', [Ofertaid]);
      if (oferta[0].PracownikHRid !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień do tej aplikacji' });
      }
    } else if (req.user.role === 'kandydat' && parseInt(Kandydatid) !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do tej aplikacji' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie listy kandydatów, którzy aplikowali na oferty pracownika HR (zabezpieczone)
router.get('/pracownikHR/:PracownikHRid', authMiddleware, async (req, res) => {
  const { PracownikHRid } = req.params;
  const { sortBy, sortOrder, status, kategoria } = req.query;
  try {
    // Sprawdzenie, czy użytkownik ma uprawnienia
    if (req.user.role === 'pracownikHR' && req.user.id !== parseInt(PracownikHRid)) {
      return res.status(403).json({ error: 'Brak uprawnień do wyświetlania kandydatów' });
    }
    // Sprawdzenie, czy PracownikHRid istnieje
    const [pracownikHR] = await pool.query('SELECT id FROM pracownikHR WHERE id = ?', [PracownikHRid]);
    if (pracownikHR.length === 0) {
      return res.status(400).json({ error: 'Podany pracownik HR nie istnieje' });
    }
    // Budowanie zapytania SQL
    let query = `
      SELECT DISTINCT k.id, k.imie, k.nazwisko, k.email, k.telefon, k.plec, k.cv_path, a.Ofertaid, a.status,
      kk.KategoriaKandydataid, kat.nazwa AS kategoria_nazwa
      FROM kandydat k
      JOIN aplikacja a ON k.id = a.Kandydatid
      JOIN oferta o ON a.Ofertaid = o.id
      LEFT JOIN kandydat_kategoriakandydata kk ON k.id = kk.Kandydatid
      LEFT JOIN kategoriakandydata kat ON kk.KategoriaKandydataid = kat.id AND kat.PracownikHRid = ?
      WHERE o.PracownikHRid = ?
    `;
    const queryParams = [PracownikHRid, PracownikHRid];
    // Filtrowanie po statusie
    if (status && ['oczekujaca', 'odrzucona', 'zakceptowana'].includes(status)) {
      query += ' AND a.status = ?';
      queryParams.push(status);
    }
    // Filtrowanie po kategorii
    if (kategoria) {
      query += ' AND kk.KategoriaKandydataid = ?';
      queryParams.push(kategoria);
    }
    // Sortowanie
    if (sortBy && ['imie', 'nazwisko'].includes(sortBy)) {
      const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY k.${sortBy} ${order}`;
    }
    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Zmiana statusu aplikacji
router.put('/:Kandydatid/:Ofertaid/status', authMiddleware, async (req, res) => {
  const { Kandydatid, Ofertaid } = req.params;
  const { status } = req.body;
  if (!status || !['oczekujaca', 'odrzucona', 'zakceptowana'].includes(status)) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    // Weryfikacja uprawnień
    const [oferta] = await pool.query('SELECT PracownikHRid FROM oferta WHERE id = ?', [Ofertaid]);
    if (oferta.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    if (req.user.role === 'pracownikHR' && oferta[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do zmiany statusu tej aplikacji' });
    }
    const [result] = await pool.query(
      'UPDATE aplikacja SET status = ? WHERE Kandydatid = ? AND Ofertaid = ?',
      [status, Kandydatid, Ofertaid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aplikacja nie znaleziona' });
    }
    res.json({ Kandydatid, Ofertaid, status });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie aplikacji (zabezpieczone)
router.delete('/:Kandydatid/:Ofertaid', authMiddleware, async (req, res) => {
  const { Kandydatid, Ofertaid } = req.params;
  try {
    const [oferta] = await pool.query('SELECT PracownikHRid FROM oferta WHERE id = ?', [Ofertaid]);
    if (oferta.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    if (req.user.role === 'pracownikHR' && oferta[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do usunięcia tej aplikacji' });
    }
    const [result] = await pool.query(
      'DELETE FROM aplikacja WHERE Kandydatid = ? AND Ofertaid = ?',
      [Kandydatid, Ofertaid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aplikacja nie znaleziona' });
    }
    res.json({ message: 'Aplikacja usunięta' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie wszystkich aplikacji kandydata dla pracownika HR (zabezpieczone)
router.delete('/pracownikHR/:PracownikHRid/kandydat/:Kandydatid', authMiddleware, async (req, res) => {
  const { PracownikHRid, Kandydatid } = req.params;
  try {
    // Sprawdzenie uprawnień
    if (req.user.role === 'pracownikHR' && req.user.id !== parseInt(PracownikHRid)) {
      return res.status(403).json({ error: 'Brak uprawnień do usuwania aplikacji' });
    }
    // Sprawdzenie, czy PracownikHRid istnieje
    const [pracownikHR] = await pool.query('SELECT id FROM pracownikHR WHERE id = ?', [PracownikHRid]);
    if (pracownikHR.length === 0) {
      return res.status(400).json({ error: 'Podany pracownik HR nie istnieje' });
    }
    // Sprawdzenie, czy kandydat istnieje
    const [kandydat] = await pool.query('SELECT id FROM kandydat WHERE id = ?', [Kandydatid]);
    if (kandydat.length === 0) {
      return res.status(400).json({ error: 'Podany kandydat nie istnieje' });
    }
    // Usunięcie wszystkich aplikacji kandydata na oferty pracownika HR
    const [result] = await pool.query(
      'DELETE a FROM aplikacja a ' +
      'JOIN oferta o ON a.Ofertaid = o.id ' +
      'WHERE a.Kandydatid = ? AND o.PracownikHRid = ?',
      [Kandydatid, PracownikHRid]
    );
    res.json({ message: `Usunięto ${result.affectedRows} aplikacji kandydata` });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;