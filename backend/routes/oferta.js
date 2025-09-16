const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// Interfejs PracownikHR (zakładka "Moje oferty")
// CREATE - Dodanie nowej oferty
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'pracownikHR') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { tytuł, opis, wynagrodzenie, wymagania, lokalizacja, czas, KategoriaPracyid } = req.body;
  // Walidacja danych
  if (!tytuł || !opis || !wynagrodzenie || !lokalizacja || !czas || !KategoriaPracyid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  // Walidacja długości pól
  if (tytuł.length > 60 || opis.length > 150 || lokalizacja.length > 50) {
    return res.status(400).json({ error: 'Przekroczono maksymalną długość pól' });
  }
  // Walidacja formatu pól
  if (typeof wynagrodzenie !== 'number' || wynagrodzenie <= 0) {
    return res.status(400).json({ error: 'Wynagrodzenie musi być liczbą dodatnią' });
  }
  if (!Number.isInteger(czas) || czas <= 0) {
    return res.status(400).json({ error: 'Czas musi być liczbą całkowitą dodatnią' });
  }
  if (isNaN(parseInt(KategoriaPracyid))) {
    return res.status(400).json({ error: 'KategoriaPracyid musi być liczbą całkowitą' });
  }
  try {
    // 1. Zapis oferty
    const [result] = await pool.query(
      'INSERT INTO oferta (tytul, opis, wynagrodzenie, wymagania, lokalizacja, czas, PracownikHRid, KategoriaPracyid, aktywna, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, CURRENT_DATE)',
      [tytuł, opis, wynagrodzenie, wymagania || null, lokalizacja, czas, req.user.id, KategoriaPracyid]
    );

    const ofertaId = result.insertId;

    // 2. Pobranie danych HR i firmy
    const [[hrRow]] = await pool.query(
      `SELECT p.imie, p.nazwisko, f.nazwa AS firma
       FROM pracownikHR p
       JOIN firma f ON p.Firmaid = f.id
       WHERE p.id = ?`,
      [req.user.id]
    );

    const firmaId = hrRow ? hrRow.Firmaid : null;

    // 3. Kandydaci obserwujący firmę
    const [kandydaci] = await pool.query(
      'SELECT Kandydatid FROM obserwowana_firma WHERE Firmaid = ?',
      [hrRow.Firmaid]
    );

    const io = req.app.get('io');
    if (!io) {
      return res.status(500).json({ error: 'Socket.IO niedostępne' });
    }

    // 4. Dodanie powiadomień + wysłanie przez Socket.IO do kandydatów
    for (const kandydat of kandydaci) {
      const tresc = `Dodano ofertę w firmie ${hrRow.firma}: ${tytuł}`;
      const [notifResult] = await pool.query(
        'INSERT INTO powiadomienie (typ, tresc, Kandydatid, Ofertaid) VALUES ("oferta", ?, ?, ?)',
        [tresc, kandydat.Kandydatid, ofertaId]
      );

      io.emit(`powiadomienie-${kandydat.Kandydatid}`, {
        id: notifResult.insertId,
        tresc,
        ofertaId,
        przeczytane: false,
        data: new Date()
      });
    }

    // 5. Dodanie powiadomienia systemowego dla administratora
    const trescAdmin = `Dodano ofertę: ${tytuł} w firmie ${hrRow.firma} przez ${hrRow.imie} ${hrRow.nazwisko}`;
    await pool.query(
      'INSERT INTO powiadomienie (typ, tresc, Ofertaid) VALUES ("system", ?, ?)',
      [trescAdmin, ofertaId]
    );

    res.status(201).json({
      id: ofertaId,
      tytuł,
      opis,
      wynagrodzenie,
      wymagania,
      lokalizacja,
      czas,
      PracownikHRid: req.user.id,
      KategoriaPracyid,
      aktywna: true,
      data: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana kategoria pracy nie istnieje' });
    }
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs Administrator (zakładka "Oferty pracy") i Interfejs Kandydat (zakładka "Przegląd ofert")
// READ - Pobieranie wszystkich ofert (dla administratora i publiczne)
router.get('/', authMiddleware, async (req, res) => {
  const { kategoriaPracy, poziom, wymiar, tryb, umowa } = req.query;
  // Walidacja parametrów query
  if (kategoriaPracy && isNaN(parseInt(kategoriaPracy))) {
    return res.status(400).json({ error: 'KategoriaPracyid musi być liczbą całkowitą' });
  }
  if (poziom && isNaN(parseInt(poziom))) {
    return res.status(400).json({ error: 'Poziomid musi być liczbą całkowitą' });
  }
  if (wymiar && isNaN(parseInt(wymiar))) {
    return res.status(400).json({ error: 'Wymiarid musi być liczbą całkowitą' });
  }
  if (tryb && isNaN(parseInt(tryb))) {
    return res.status(400).json({ error: 'Trybid musi być liczbą całkowitą' });
  }
  if (umowa && isNaN(parseInt(umowa))) {
    return res.status(400).json({ error: 'Umowaid musi być liczbą całkowitą' });
  }
  try {
    if (req.user.role === 'administrator') {
      let query = `
        SELECT o.id, o.tytul, o.lokalizacja, o.data, f.nazwa AS nazwa_firmy, o.KategoriaPracyid
        FROM oferta o
        JOIN pracownikHR p ON o.PracownikHRid = p.id
        JOIN firma f ON p.Firmaid = f.id
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
    } else {
      let query = `
        SELECT o.id, o.tytul, o.lokalizacja, o.data, f.nazwa AS nazwa_firmy, o.KategoriaPracyid
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
    }
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs Administrator (zakładka "Oferty pracy") i Interfejs Kandydat (zakładka "Przegląd ofert")
// READ - Pobieranie oferty po ID (dla administratora i publiczne)
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT o.*, f.nazwa AS nazwa_firmy, kp.nazwa AS nazwa_kategorii_pracy, ' +
      'p.imie AS hr_imie, p.nazwisko AS hr_nazwisko, ' +
      'GROUP_CONCAT(DISTINCT po.nazwa) AS poziomy, ' +
      'GROUP_CONCAT(DISTINCT w.nazwa) AS wymiary, ' +
      'GROUP_CONCAT(DISTINCT t.nazwa) AS tryby, ' +
      'GROUP_CONCAT(DISTINCT u.nazwa) AS umowy ' +
      'FROM oferta o ' +
      'JOIN pracownikHR p ON o.PracownikHRid = p.id ' +
      'JOIN firma f ON p.Firmaid = f.id ' +
      'JOIN kategoriapracy kp ON o.KategoriaPracyid = kp.id ' +
      'LEFT JOIN oferta_poziom op ON o.id = op.Ofertaid ' +
      'LEFT JOIN poziom po ON op.Poziomid = po.id ' +
      'LEFT JOIN oferta_wymiar ow ON o.id = ow.Ofertaid ' +
      'LEFT JOIN wymiar w ON ow.Wymiarid = w.id ' +
      'LEFT JOIN oferta_tryb ot ON o.id = ot.Ofertaid ' +
      'LEFT JOIN tryb t ON ot.Trybid = t.id ' +
      'LEFT JOIN oferta_umowa ou ON o.id = ou.Ofertaid ' +
      'LEFT JOIN umowa u ON ou.Umowaid = u.id ' +
      'WHERE o.id = ? ' +
      (req.user.role === 'administrator' ? '' : 'AND o.aktywna = TRUE') +
      ' GROUP BY o.id',
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

// Interfejs PracownikHR (zakładka "Moje oferty")
// READ - Pobieranie ofert pracownika HR (zabezpieczone)
router.get('/pracownikHR/:PracownikHRid', authMiddleware, async (req, res) => {
  const { PracownikHRid } = req.params;
  try {
    // Sprawdzenie uprawnień
    if (req.user.role !== 'administrator' && (req.user.role === 'pracownikHR' && req.user.id !== parseInt(PracownikHRid))) {
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

// Interfejs Administrator (zakładka "Oferty pracy") i Interfejs PracownikHR (zakładka "Moje oferty")
// UPDATE - Aktualizacja oferty
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { tytuł, opis, wynagrodzenie, wymagania, lokalizacja, czas, KategoriaPracyid, aktywna } = req.body;
  // Walidacja danych
  if (!tytuł || !opis || !wynagrodzenie || !lokalizacja || !czas || !KategoriaPracyid || aktywna === undefined) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  // Walidacja długości pól
  if (tytuł.length > 60 || opis.length > 150 || lokalizacja.length > 50) {
    return res.status(400).json({ error: 'Przekroczono maksymalną długość pól' });
  }
  // Walidacja formatu pól
  if (typeof wynagrodzenie !== 'number' || wynagrodzenie <= 0) {
    return res.status(400).json({ error: 'Wynagrodzenie musi być liczbą dodatnią' });
  }
  if (!Number.isInteger(czas) || czas <= 0) {
    return res.status(400).json({ error: 'Czas musi być liczbą całkowitą dodatnią' });
  }
  if (isNaN(parseInt(KategoriaPracyid))) {
    return res.status(400).json({ error: 'KategoriaPracyid musi być liczbą całkowitą' });
  }
  try {
    // Weryfikacja, czy oferta należy do pracownika HR lub użytkownik jest administratorem
    const [oferta] = await pool.query('SELECT PracownikHRid FROM oferta WHERE id = ?', [id]);
    if (oferta.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    if (req.user.role === 'pracownikHR' && oferta[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do edycji tej oferty' });
    }
    if (req.user.role !== 'pracownikHR' && req.user.role !== 'administrator') {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    const [result] = await pool.query(
      'UPDATE oferta SET tytul = ?, opis = ?, wynagrodzenie = ?, wymagania = ?, lokalizacja = ?, czas = ?, KategoriaPracyid = ?, aktywna = ? WHERE id = ?',
      [tytuł, opis, wynagrodzenie, wymagania || null, lokalizacja, czas, KategoriaPracyid, aktywna, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    res.json({ id, tytuł, opis, wynagrodzenie, wymagania, lokalizacja, czas, PracownikHRid: oferta[0].PracownikHRid, KategoriaPracyid, aktywna });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana kategoria pracy nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Interfejs Administrator (zakładka "Oferty pracy") i Interfejs PracownikHR (zakładka "Moje oferty")
// DELETE - Usunięcie oferty
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const [oferta] = await pool.query('SELECT PracownikHRid FROM oferta WHERE id = ?', [id]);
    if (oferta.length === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    if (req.user.role === 'pracownikHR' && oferta[0].PracownikHRid !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień do usunięcia tej oferty' });
    }
    if (req.user.role !== 'pracownikHR' && req.user.role !== 'administrator') {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    // Sprawdzenie, czy istnieją aplikacje dla oferty
    const [[aplikacje]] = await pool.query('SELECT COUNT(*) AS count FROM aplikacja WHERE Ofertaid = ?', [id]);
    if (aplikacje.count > 0) {
      return res.status(400).json({ error: 'Nie można usunąć oferty z istniejącymi aplikacjami' });
    }
    const [result] = await pool.query('DELETE FROM oferta WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Oferta nie znaleziona' });
    }
    res.json({ message: 'Oferta usunięta' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'Nie można usunąć oferty z istniejącymi aplikacjami' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;