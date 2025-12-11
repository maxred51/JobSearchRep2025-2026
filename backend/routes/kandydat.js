<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// === KONFIGURACJA MULTER ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `public/uploads/cv/${req.user.id}`;
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `cv_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(null, false);
      
    }
  }
});


// CREATE - Rejestracja nowego kandydata
router.post('/', async (req, res) => {
  const { imie, nazwisko, telefon, email, haslo, plec, cv_path } = req.body;
  // Walidacja danych
  if (!imie || !nazwisko || !telefon || !email || !haslo || !plec || !['M', 'K'].includes(plec)) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  // Walidacja długości pól
  if (imie.length > 50 || nazwisko.length > 50 || email.length > 50 || telefon.length > 12 || (cv_path && cv_path.length > 255)) {
    return res.status(400).json({ error: 'Przekroczono maksymalną długość pól' });
  }
  // Walidacja formatu emaila
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Nieprawidłowy format emaila' });
  }
  // Walidacja formatu telefonu
  const phoneRegex = /^[0-9]{9,12}$/;
  if (!phoneRegex.test(telefon)) {
    return res.status(400).json({ error: 'Nieprawidłowy format telefonu' });
  }
  try {

    const [emailExists] = await pool.query(
      `
      SELECT email FROM (
        SELECT email FROM administrator
        UNION ALL
        SELECT email FROM kandydat
        UNION ALL
        SELECT email FROM pracownikHR
      ) AS all_users
      WHERE email = ?
      `,
      [email]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({ error: 'Email już istnieje' });
    }

    const [phoneExists] = await pool.query(
      `
      SELECT telefon FROM (
        SELECT telefon FROM kandydat
        UNION ALL
        SELECT telefon FROM pracownikHR
      ) AS all_phones
      WHERE telefon = ?
      `,
      [telefon]
    );

    if (phoneExists.length > 0) {
      return res.status(400).json({ error: 'Telefon już istnieje' });
    }

    const hashedPassword = await bcrypt.hash(haslo, 10);
    const [result] = await pool.query(
      'INSERT INTO kandydat (imie, nazwisko, telefon, email, haslo, plec, cv_path, stan) VALUES (?, ?, ?, ?, ?, ?, ?, "aktywny")',
      [imie, nazwisko, telefon, email, hashedPassword, plec, cv_path || null]
    );

    // Dodanie powiadomienia systemowego dla administratora
    await pool.query(
      'INSERT INTO powiadomienie (typ, tresc, Kandydatid) VALUES (?, ?, ?)',
      [
        'system',
        `Nowy kandydat: ${imie} ${nazwisko} (ID: ${result.insertId})`,
        result.insertId
      ]
    );

    res.status(201).json({ id: result.insertId, imie, nazwisko, telefon, email, plec, cv_path });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// LOGIN - Logowanie kandydata
router.post('/login', async (req, res) => {
  const { email, haslo } = req.body;
  if (!email || !haslo) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [rows] = await pool.query('SELECT id, email, haslo, stan FROM kandydat WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }
    const user = rows[0];
    if (user.stan === 'zablokowany') {
      return res.status(403).json({ error: 'Konto zablokowane' });
    }
    const isMatch = await bcrypt.compare(haslo, user.haslo);
    if (!isMatch) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }
    const token = jwt.sign({ id: user.id, role: 'kandydat' }, config.secret, { expiresIn: config.expiresIn });
    res.json({ token, user: { id: user.id, imie: user.imie, nazwisko: user.nazwisko, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich kandydatów (zabezpieczone)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'administrator' && req.user.role !== 'pracownikHR') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  try {
    const [rows] = await pool.query('SELECT id, imie, nazwisko, telefon, email, plec, cv_path, stan FROM kandydat');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie kandydata po ID (zabezpieczone)
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'administrator' && req.user.role !== 'pracownikHR' && (req.user.role !== 'kandydat' || req.user.id !== parseInt(id))) {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  try {
    const [rows] = await pool.query('SELECT id, imie, nazwisko, telefon, email, plec, cv_path, stan FROM kandydat WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Kandydat nie znaleziony' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Upload CV (zabezpieczone)
router.put('/cv', authMiddleware, async (req, res, next) => {
    // Sprawdzenie roli + czy użytkownik istnieje
    if (req.user.role !== 'kandydat') {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }

    try {
      const [rows] = await pool.query('SELECT id FROM kandydat WHERE id = ?', [req.user.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Kandydat nie istnieje' });
      }
    } catch (err) {
      console.error('Błąd sprawdzania kandydata:', err);
      return res.status(500).json({ error: 'Błąd serwera' });
    }

    next(); // upload
  },
  upload.single('cv'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Brak pliku lub nieprawidłowy format (tylko PDF, DOC, DOCX)' });
    }

    const newCvPath = `/uploads/cv/${req.user.id}/${req.file.filename}`;

    try {
      // 1. Pobierz stare CV
      const [rows] = await pool.query('SELECT cv_path FROM kandydat WHERE id = ?', [req.user.id]);
      const oldCvPath = rows[0]?.cv_path;

      // 2. Usuń stare CV (jeśli istnieje)
      if (oldCvPath) {
        const fullOldPath = path.join(__dirname, '..', 'public', oldCvPath);
        if (fs.existsSync(fullOldPath)) {
          try {
            fs.unlinkSync(fullOldPath);
            console.log(`Usunięto stare CV: ${fullOldPath}`);
          } catch (unlinkErr) {
            console.error(`Nie udało się usunąć starego CV: ${fullOldPath}`, unlinkErr);
          }
        }
      }

      // 3. Zapisz nową ścieżkę
      await pool.query('UPDATE kandydat SET cv_path = ? WHERE id = ?', [newCvPath, req.user.id]);

      // 4. Odpowiedź
      res.json({
        message: 'CV zaktualizowane',
        cv_path: newCvPath
      });
    } catch (err) {
      console.error('Błąd przy zapisie CV:', err);
      res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// Interfejs Kandydat (zakładka "Moje CV") i Interfejs PracownikHR (zakładka "Kandydaci")
// READ - Pobieranie CV kandydata (zabezpieczone)
router.get('/:id/cv', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    // Pobierz kandydata
    const [kandydat] = await pool.query('SELECT cv_path FROM kandydat WHERE id = ?', [id]);
    if (kandydat.length === 0) {
      return res.status(404).json({ error: 'Kandydat nie znaleziony' });
    }
    if (!kandydat[0].cv_path) {
      return res.status(404).json({ error: 'CV nie istnieje dla tego kandydata' });
    }
    // Weryfikacja uprawnień dla kandydata
    if (req.user.role === 'kandydat' && req.user.id === parseInt(id)) {
      return res.json({ cv_path: kandydat[0].cv_path });
    }
    // Weryfikacja uprawnień dla pracownika HR
    if (req.user.role === 'pracownikHR') {
      const [aplikacje] = await pool.query(
        'SELECT a.Kandydatid FROM aplikacja a ' +
        'JOIN oferta o ON a.Ofertaid = o.id ' +
        'WHERE a.Kandydatid = ? AND o.PracownikHRid = ?',
        [id, req.user.id]
      );
      if (aplikacje.length === 0) {
        return res.status(403).json({ error: 'Brak uprawnień do wyświetlenia CV tego kandydata' });
      }
    }
    // Administrator ma pełny dostęp
    res.json({ cv_path: kandydat[0].cv_path });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja kandydata (zabezpieczone)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { imie, nazwisko, telefon, email, plec, cv_path } = req.body;
  if (req.user.role !== 'administrator' && (req.user.role !== 'kandydat' || req.user.id !== parseInt(id))) {
    return res.status(403).json({ error: 'Brak uprawnień do edycji tego konta' });
  }
  // Walidacja danych
  if (!imie || !nazwisko || !telefon || !email || !plec || !['M', 'K'].includes(plec)) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  // Walidacja długości pól
  if (imie.length > 50 || nazwisko.length > 50 || email.length > 50 || telefon.length > 12 || (cv_path && cv_path.length > 255)) {
    return res.status(400).json({ error: 'Przekroczono maksymalną długość pól' });
  }
  // Walidacja formatu emaila
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Nieprawidłowy format emaila' });
  }
  // Walidacja formatu telefonu
  const phoneRegex = /^[0-9]{9,12}$/;
  if (!phoneRegex.test(telefon)) {
    return res.status(400).json({ error: 'Nieprawidłowy format telefonu' });
  }
  try {


    const [emailExists] = await pool.query(
      `
      SELECT * FROM (
        SELECT id, email, 'kandydat' AS role FROM kandydat
        UNION ALL
        SELECT id, email, 'pracownikHR' FROM pracownikHR
        UNION ALL
        SELECT id, email, 'administrator' FROM administrator
      ) AS all_users
      WHERE email = ? AND NOT (role = 'kandydat' AND id = ?)
      `,
      [email, id]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({ error: 'Email już istnieje' });
    }

    const [phoneExists] = await pool.query(
      `
      SELECT * FROM (
        SELECT id, telefon, 'kandydat' AS role FROM kandydat
        UNION ALL
        SELECT id, telefon, 'pracownikHR' FROM pracownikHR
      ) AS all_phones
      WHERE telefon = ? AND NOT (role = 'kandydat' AND id = ?)
      `,
      [telefon, id]
    );

    if (phoneExists.length > 0) {
      return res.status(400).json({ error: 'Telefon już istnieje' });
    }


    let query = 'UPDATE kandydat SET imie = ?, nazwisko = ?, telefon = ?, email = ?, plec = ?, cv_path = ?';
    const params = [imie, nazwisko, telefon, email, plec, cv_path || null];
    
    query += ' WHERE id = ?';
    params.push(id);
    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kandydat nie znaleziony' });
    }
    res.json({ id, imie, nazwisko, telefon, email, plec, cv_path });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie kandydata (zabezpieczone)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'administrator' && (req.user.role !== 'kandydat' || req.user.id !== parseInt(id))) {
    return res.status(403).json({ error: 'Brak uprawnień do usunięcia tego konta' });
  }
  try {
    const [result] = await pool.query('DELETE FROM kandydat WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kandydat nie znaleziony' });
    }
    res.json({ message: 'Kandydat usunięty' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Oferty od obserwowanych firm dla kandydata
router.get('/kandydat/:id/obserwowane-oferty', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'kandydat' || req.user.id != id) {
    return res.status(403).json({ error: 'Brak dostępu' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT oferta.id, oferta.tytul, oferta.dataDodania, firma.nazwa
      FROM obserwowane_firmy
      JOIN oferta ON oferta.FirmaId = obserwowane_firmy.FirmaId
      JOIN firma ON firma.id = oferta.FirmaId
      WHERE obserwowane_firmy.KandydatId = ?
      ORDER BY oferta.dataDodania DESC;
    `, [id]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});


=======
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// === KONFIGURACJA MULTER ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `public/uploads/cv/${req.user.id}`;
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `cv_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(null, false);
      
    }
  }
});


// CREATE - Rejestracja nowego kandydata
router.post('/', async (req, res) => {
  const { imie, nazwisko, telefon, email, haslo, plec, cv_path } = req.body;
  // Walidacja danych
  if (!imie || !nazwisko || !telefon || !email || !haslo || !plec || !['M', 'K'].includes(plec)) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  // Walidacja długości pól
  if (imie.length > 50 || nazwisko.length > 50 || email.length > 50 || telefon.length > 12 || (cv_path && cv_path.length > 255)) {
    return res.status(400).json({ error: 'Przekroczono maksymalną długość pól' });
  }
  // Walidacja formatu emaila
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Nieprawidłowy format emaila' });
  }
  // Walidacja formatu telefonu
  const phoneRegex = /^[0-9]{9,12}$/;
  if (!phoneRegex.test(telefon)) {
    return res.status(400).json({ error: 'Nieprawidłowy format telefonu' });
  }
  try {

    const [emailExists] = await pool.query(
      `
      SELECT email FROM (
        SELECT email FROM administrator
        UNION ALL
        SELECT email FROM kandydat
        UNION ALL
        SELECT email FROM pracownikHR
      ) AS all_users
      WHERE email = ?
      `,
      [email]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({ error: 'Email już istnieje' });
    }

    const [phoneExists] = await pool.query(
      `
      SELECT telefon FROM (
        SELECT telefon FROM kandydat
        UNION ALL
        SELECT telefon FROM pracownikHR
      ) AS all_phones
      WHERE telefon = ?
      `,
      [telefon]
    );

    if (phoneExists.length > 0) {
      return res.status(400).json({ error: 'Telefon już istnieje' });
    }

    const hashedPassword = await bcrypt.hash(haslo, 10);
    const [result] = await pool.query(
      'INSERT INTO kandydat (imie, nazwisko, telefon, email, haslo, plec, cv_path, stan) VALUES (?, ?, ?, ?, ?, ?, ?, "aktywny")',
      [imie, nazwisko, telefon, email, hashedPassword, plec, cv_path || null]
    );

    // Dodanie powiadomienia systemowego dla administratora
    await pool.query(
      'INSERT INTO powiadomienie (typ, tresc, Kandydatid) VALUES (?, ?, ?)',
      [
        'system',
        `Nowy kandydat: ${imie} ${nazwisko} (ID: ${result.insertId})`,
        result.insertId
      ]
    );

    res.status(201).json({ id: result.insertId, imie, nazwisko, telefon, email, plec, cv_path });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// LOGIN - Logowanie kandydata
router.post('/login', async (req, res) => {
  const { email, haslo } = req.body;
  if (!email || !haslo) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [rows] = await pool.query('SELECT id, email, haslo, stan FROM kandydat WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }
    const user = rows[0];
    if (user.stan === 'zablokowany') {
      return res.status(403).json({ error: 'Konto zablokowane' });
    }
    const isMatch = await bcrypt.compare(haslo, user.haslo);
    if (!isMatch) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }
    const token = jwt.sign({ id: user.id, role: 'kandydat' }, config.secret, { expiresIn: config.expiresIn });
    res.json({ token, user: { id: user.id, imie: user.imie, nazwisko: user.nazwisko, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich kandydatów (zabezpieczone)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'administrator' && req.user.role !== 'pracownikHR') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  try {
    const [rows] = await pool.query('SELECT id, imie, nazwisko, telefon, email, plec, cv_path, stan FROM kandydat');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie kandydata po ID (zabezpieczone)
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'administrator' && req.user.role !== 'pracownikHR' && (req.user.role !== 'kandydat' || req.user.id !== parseInt(id))) {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  try {
    const [rows] = await pool.query('SELECT id, imie, nazwisko, telefon, email, plec, cv_path, stan FROM kandydat WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Kandydat nie znaleziony' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Upload CV (zabezpieczone)
router.put('/cv', authMiddleware, async (req, res, next) => {
    // Sprawdzenie roli + czy użytkownik istnieje
    if (req.user.role !== 'kandydat') {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }

    try {
      const [rows] = await pool.query('SELECT id FROM kandydat WHERE id = ?', [req.user.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Kandydat nie istnieje' });
      }
    } catch (err) {
      console.error('Błąd sprawdzania kandydata:', err);
      return res.status(500).json({ error: 'Błąd serwera' });
    }

    next(); // upload
  },
  upload.single('cv'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Brak pliku lub nieprawidłowy format (tylko PDF, DOC, DOCX)' });
    }

    const newCvPath = `/uploads/cv/${req.user.id}/${req.file.filename}`;

    try {
      // 1. Pobierz stare CV
      const [rows] = await pool.query('SELECT cv_path FROM kandydat WHERE id = ?', [req.user.id]);
      const oldCvPath = rows[0]?.cv_path;

      // 2. Usuń stare CV (jeśli istnieje)
      if (oldCvPath) {
        const fullOldPath = path.join(__dirname, '..', 'public', oldCvPath);
        if (fs.existsSync(fullOldPath)) {
          try {
            fs.unlinkSync(fullOldPath);
            console.log(`Usunięto stare CV: ${fullOldPath}`);
          } catch (unlinkErr) {
            console.error(`Nie udało się usunąć starego CV: ${fullOldPath}`, unlinkErr);
          }
        }
      }

      // 3. Zapisz nową ścieżkę
      await pool.query('UPDATE kandydat SET cv_path = ? WHERE id = ?', [newCvPath, req.user.id]);

      // 4. Odpowiedź
      res.json({
        message: 'CV zaktualizowane',
        cv_path: newCvPath
      });
    } catch (err) {
      console.error('Błąd przy zapisie CV:', err);
      res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// Interfejs Kandydat (zakładka "Moje CV") i Interfejs PracownikHR (zakładka "Kandydaci")
// READ - Pobieranie CV kandydata (zabezpieczone)
router.get('/:id/cv', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    // Pobierz kandydata
    const [kandydat] = await pool.query('SELECT cv_path FROM kandydat WHERE id = ?', [id]);
    if (kandydat.length === 0) {
      return res.status(404).json({ error: 'Kandydat nie znaleziony' });
    }
    if (!kandydat[0].cv_path) {
      return res.status(404).json({ error: 'CV nie istnieje dla tego kandydata' });
    }
    // Weryfikacja uprawnień dla kandydata
    if (req.user.role === 'kandydat' && req.user.id === parseInt(id)) {
      return res.json({ cv_path: kandydat[0].cv_path });
    }
    // Weryfikacja uprawnień dla pracownika HR
    if (req.user.role === 'pracownikHR') {
      const [aplikacje] = await pool.query(
        'SELECT a.Kandydatid FROM aplikacja a ' +
        'JOIN oferta o ON a.Ofertaid = o.id ' +
        'WHERE a.Kandydatid = ? AND o.PracownikHRid = ?',
        [id, req.user.id]
      );
      if (aplikacje.length === 0) {
        return res.status(403).json({ error: 'Brak uprawnień do wyświetlenia CV tego kandydata' });
      }
    }
    // Administrator ma pełny dostęp
    res.json({ cv_path: kandydat[0].cv_path });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja kandydata (zabezpieczone)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { imie, nazwisko, telefon, email, plec, cv_path } = req.body;
  if (req.user.role !== 'administrator' && (req.user.role !== 'kandydat' || req.user.id !== parseInt(id))) {
    return res.status(403).json({ error: 'Brak uprawnień do edycji tego konta' });
  }
  // Walidacja danych
  if (!imie || !nazwisko || !telefon || !email || !plec || !['M', 'K'].includes(plec)) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  // Walidacja długości pól
  if (imie.length > 50 || nazwisko.length > 50 || email.length > 50 || telefon.length > 12 || (cv_path && cv_path.length > 255)) {
    return res.status(400).json({ error: 'Przekroczono maksymalną długość pól' });
  }
  // Walidacja formatu emaila
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Nieprawidłowy format emaila' });
  }
  // Walidacja formatu telefonu
  const phoneRegex = /^[0-9]{9,12}$/;
  if (!phoneRegex.test(telefon)) {
    return res.status(400).json({ error: 'Nieprawidłowy format telefonu' });
  }
  try {


    const [emailExists] = await pool.query(
      `
      SELECT * FROM (
        SELECT id, email, 'kandydat' AS role FROM kandydat
        UNION ALL
        SELECT id, email, 'pracownikHR' FROM pracownikHR
        UNION ALL
        SELECT id, email, 'administrator' FROM administrator
      ) AS all_users
      WHERE email = ? AND NOT (role = 'kandydat' AND id = ?)
      `,
      [email, id]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({ error: 'Email już istnieje' });
    }

    const [phoneExists] = await pool.query(
      `
      SELECT * FROM (
        SELECT id, telefon, 'kandydat' AS role FROM kandydat
        UNION ALL
        SELECT id, telefon, 'pracownikHR' FROM pracownikHR
      ) AS all_phones
      WHERE telefon = ? AND NOT (role = 'kandydat' AND id = ?)
      `,
      [telefon, id]
    );

    if (phoneExists.length > 0) {
      return res.status(400).json({ error: 'Telefon już istnieje' });
    }


    let query = 'UPDATE kandydat SET imie = ?, nazwisko = ?, telefon = ?, email = ?, plec = ?, cv_path = ?';
    const params = [imie, nazwisko, telefon, email, plec, cv_path || null];
    
    query += ' WHERE id = ?';
    params.push(id);
    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kandydat nie znaleziony' });
    }
    res.json({ id, imie, nazwisko, telefon, email, plec, cv_path });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie kandydata (zabezpieczone)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'administrator' && (req.user.role !== 'kandydat' || req.user.id !== parseInt(id))) {
    return res.status(403).json({ error: 'Brak uprawnień do usunięcia tego konta' });
  }
  try {
    const [result] = await pool.query('DELETE FROM kandydat WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kandydat nie znaleziony' });
    }
    res.json({ message: 'Kandydat usunięty' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Oferty od obserwowanych firm dla kandydata
router.get('/kandydat/:id/obserwowane-oferty', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'kandydat' || req.user.id != id) {
    return res.status(403).json({ error: 'Brak dostępu' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT oferta.id, oferta.tytul, oferta.dataDodania, firma.nazwa
      FROM obserwowane_firmy
      JOIN oferta ON oferta.FirmaId = obserwowane_firmy.FirmaId
      JOIN firma ON firma.id = oferta.FirmaId
      WHERE obserwowane_firmy.KandydatId = ?
      ORDER BY oferta.dataDodania DESC;
    `, [id]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});


>>>>>>> def9ccd (Poprawki)
module.exports = router;