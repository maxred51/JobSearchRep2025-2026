const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Dodanie nowego powiązania oferta-tryb
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'pracownikhr' && req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { Ofertaid, Trybid } = req.body;

  // Walidacja danych
  if (isNaN(parseInt(Ofertaid)) || isNaN(parseInt(Trybid))) {
    return res.status(400).json({ error: 'Ofertaid i Trybid muszą być liczbami całkowitymi' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO oferta_tryb (Ofertaid, Trybid) VALUES (?, ?)',
      [Ofertaid, Trybid]
    );
    res.status(201).json({ Ofertaid, Trybid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Powiązanie już istnieje' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana oferta lub tryb pracy nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich powiązań oferta-tryb
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM oferta_tryb');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie powiązania oferta-tryb po Ofertaid i Trybid
router.get('/:Ofertaid/:Trybid', authMiddleware, async (req, res) => {
  const { Ofertaid, Trybid } = req.params;

  // Walidacja parametrów
  if (isNaN(parseInt(Ofertaid)) || isNaN(parseInt(Trybid))) {
    return res.status(400).json({ error: 'Ofertaid i Trybid muszą być liczbami całkowitymi' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM oferta_tryb WHERE Ofertaid = ? AND Trybid = ?',
      [Ofertaid, Trybid]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Powiązanie nie znalezione' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie powiązania oferta-tryb
router.delete('/:Ofertaid/:Trybid', authMiddleware, async (req, res) => {
  if (req.user.role !== 'pracownikhr' && req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { Ofertaid, Trybid } = req.params;

  // Walidacja parametrów
  if (isNaN(parseInt(Ofertaid)) || isNaN(parseInt(Trybid))) {
    return res.status(400).json({ error: 'Ofertaid i Trybid muszą być liczbami całkowitymi' });
  }

  try {
    const [result] = await pool.query(
      'DELETE FROM oferta_tryb WHERE Ofertaid = ? AND Trybid = ?',
      [Ofertaid, Trybid]
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