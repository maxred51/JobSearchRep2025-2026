const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// Interfejs Kandydat (zakładka "Przegląd ofert" -> kliknięcie Aplikuj)
// CREATE - Dodanie nowej aplikacji
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'kandydat') {
    return res.status(403).json({ error: 'Tylko kandydat może złożyć aplikację' });
  }
  const { Ofertaid, kwota, odpowiedz } = req.body;
  const Kandydatid = req.user.id;
  // Walidacja danych
  if (!Ofertaid || !kwota || !odpowiedz) {
    return res.status(400).json({ error: 'Nieprawidłowe dane: wymagane Ofertaid, kwota i odpowiedz' });
  }
  if (isNaN(parseInt(Ofertaid))) {
    return res.status(400).json({ error: 'Ofertaid musi być liczbą całkowitą' });
  }
  if (typeof kwota !== 'number' || kwota <= 0) {
    return res.status(400).json({ error: 'Kwota musi być liczbą dodatnią' });
  }
  if (typeof odpowiedz !== 'string' || odpowiedz.trim() === '') {
    return res.status(400).json({ error: 'Odpowiedź musi być niepustym ciągiem znaków' });
  }
  try {
    // Sprawdzenie, czy oferta istnieje i jest aktywna
    const [oferta] = await pool.query(
      'SELECT o.id, o.PracownikHRid, p.Firmaid ' +
      'FROM oferta o ' +
      'JOIN pracownikHR p ON o.PracownikHRid = p.id ' +
      'WHERE o.id = ? AND o.aktywna = TRUE',
      [Ofertaid]
    );
    if (oferta.length === 0) {
      return res.status(400).json({ error: 'Podana oferta nie istnieje lub nie jest aktywna' });
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

    // POWIADOMIENIE SYSTEMOWE DLA ADMINISTRATORÓW
    /*const trescAdmin = `Nowa aplikacja: ${oferta.kandydatImie} ${oferta.kandydatNazwisko} ` +
                       `aplikował/a na ofertę "${oferta.tytul}" (ID: ${Ofertaid}) ` +
                       `w firmie ${oferta.firma} (HR: ${oferta.hrImie} ${oferta.hrNazwisko})`;

    await pool.query(
      `INSERT INTO powiadomienie (typ, tresc, Kandydatid, Ofertaid)
       VALUES ('system', ?, ?, ?)`,
      [trescAdmin, Kandydatid, Ofertaid]
    );*/

    res.status(201).json({ Kandydatid, Ofertaid, status: "oczekujaca", kwota, odpowiedz });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Aplikacja już istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs PracownikHR (zakładka "Aplikacje") i Interfejs Kandydat (zakładka "Aplikacje")
// READ - Pobieranie wszystkich aplikacji (zabezpieczone)
router.get('/', authMiddleware, async (req, res) => {
  const { sortBy, sortOrder, status } = req.query;
  try {
    if (req.user.role === 'kandydat') {
      let query = `
        SELECT o.tytul, f.nazwa AS nazwa_firmy, o.opis, o.wymagania
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
        query += ` ORDER BY o.tytul ${order}`;
      }

      const [rows] = await pool.query(query, queryParams);
      res.json(rows);
    } else if (req.user.role === 'pracownikHR') {
      let query = `
        SELECT a.id, a.status, a.Kandydatid, a.Ofertaid, a.kwota, a.odpowiedz,
               o.tytul AS stanowisko, k.imie, k.nazwisko
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
        const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY o.tytul ${order}`;
      }

      const [rows] = await pool.query(query, queryParams);
      res.json(rows);
    } else if (req.user.role === 'administrator') {
      const [rows] = await pool.query(`
        SELECT a.id, a.status, a.Kandydatid, a.Ofertaid, a.kwota, a.odpowiedz,
               o.tytul AS stanowisko, k.imie, k.nazwisko
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

// Interfejs PracownikHR (zakładka "Aplikacje")
// READ - Pobieranie aplikacji po Kandydatid i Ofertaid (zabezpieczone)
router.get('/:Kandydatid/:Ofertaid', authMiddleware, async (req, res) => {
  const { Kandydatid, Ofertaid } = req.params;
  // Walidacja ID
  if (isNaN(Kandydatid) || isNaN(Ofertaid)) {
    return res.status(400).json({ error: 'Kandydatid i Ofertaid muszą być liczbami całkowitymi' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT a.id, a.status, a.Kandydatid, a.Ofertaid, a.kwota, a.odpowiedz, ' +
      'o.tytul AS stanowisko, k.imie, k.nazwisko, k.telefon, k.email ' +
      'FROM aplikacja a ' +
      'JOIN oferta o ON a.Ofertaid = o.id ' +
      'JOIN kandydat k ON a.Kandydatid = k.id ' +
      'WHERE a.Kandydatid = ? AND a.Ofertaid = ?',
      [Kandydatid, Ofertaid]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Aplikacja nie znaleziona' });
    }
    // Sprawdzenie uprawnień
    if (req.user.role !== 'administrator') {
      const [oferta] = await pool.query('SELECT PracownikHRid FROM oferta WHERE id = ?', [Ofertaid]);
      if (req.user.role === 'pracownikHR' && oferta[0].PracownikHRid !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień do tej aplikacji' });
      }
      if (req.user.role === 'kandydat' && parseInt(Kandydatid) !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień do tej aplikacji' });
      }
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs PracownikHR (zakładka "Kandydaci")
// READ - Pobieranie listy kandydatów, którzy aplikowali na oferty pracownika HR (zabezpieczone)
router.get('/pracownikHR/HR/:PracownikHRid', authMiddleware, async (req, res) => {
  const { PracownikHRid } = req.params;
  const { sortBy, sortOrder, status, kategoria } = req.query;
  // Walidacja ID
  if (isNaN(PracownikHRid)) {
    return res.status(400).json({ error: 'PracownikHRid musi być liczbą całkowitą' });
  }
  if (kategoria && isNaN(parseInt(kategoria))) {
    return res.status(400).json({ error: 'Kategoria musi być liczbą całkowitą' });
  }
  try {
    // Sprawdzenie uprawnień
    if (req.user.role !== 'administrator' && (req.user.role === 'pracownikHR' && req.user.id !== parseInt(PracownikHRid))) {
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

// Interfejs PracownikHR (zakładka "Aplikacje")
// UPDATE - Zmiana statusu aplikacji
router.put('/:Kandydatid/:Ofertaid/status', authMiddleware, async (req, res) => {
  const { Kandydatid, Ofertaid } = req.params;
  const { status } = req.body;
  // Walidacja ID
  if (isNaN(Kandydatid) || isNaN(Ofertaid)) {
    return res.status(400).json({ error: 'Kandydatid i Ofertaid muszą być liczbami całkowitymi' });
  }
  if (!status || !['oczekujaca', 'odrzucona', 'zakceptowana'].includes(status)) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    // Weryfikacja uprawnień
    const [oferta] = await pool.query('SELECT PracownikHRid FROM oferta WHERE id = ?', [Ofertaid]);
    if (oferta.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    if (req.user.role !== 'administrator' && (req.user.role === 'pracownikHR' && oferta[0].PracownikHRid !== req.user.id)) {
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

// Interfejs PracownikHR (zakładka "Aplikacje")
// DELETE - Usunięcie aplikacji (zabezpieczone)
router.delete('/:Kandydatid/:Ofertaid', authMiddleware, async (req, res) => {
  const { Kandydatid, Ofertaid } = req.params;
  // Walidacja ID
  if (isNaN(Kandydatid) || isNaN(Ofertaid)) {
    return res.status(400).json({ error: 'Kandydatid i Ofertaid muszą być liczbami całkowitymi' });
  }
  try {
    const [oferta] = await pool.query('SELECT PracownikHRid FROM oferta WHERE id = ?', [Ofertaid]);
    if (oferta.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    // Sprawdzenie uprawnień
    if (req.user.role !== 'administrator' && (req.user.role === 'pracownikHR' && oferta[0].PracownikHRid !== req.user.id) && (req.user.role === 'kandydat' && parseInt(Kandydatid) !== req.user.id)) {
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

// Interfejs PracownikHR (zakładka "Kandydaci")
// DELETE - Usunięcie wszystkich aplikacji kandydata dla pracownika HR (zabezpieczone)
router.delete('/pracownikHR/:PracownikHRid/kandydat/:Kandydatid', authMiddleware, async (req, res) => {
  const { PracownikHRid, Kandydatid } = req.params;
  // Walidacja ID
  if (isNaN(PracownikHRid) || isNaN(Kandydatid)) {
    return res.status(400).json({ error: 'PracownikHRid i Kandydatid muszą być liczbami całkowitymi' });
  }
  try {
    // Sprawdzenie uprawnień
    if (req.user.role !== 'administrator' && (req.user.role === 'pracownikHR' && req.user.id !== parseInt(PracownikHRid))) {
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