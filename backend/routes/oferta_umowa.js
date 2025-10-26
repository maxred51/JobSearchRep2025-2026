const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Dodanie nowego powiązania oferta-umowa
router.post('/', authMiddleware, async (req, res) => {
  // Sprawdzenie roli (pracownikhr lub administrator)
  if (req.user.role !== 'pracownikHR' && req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }

  const { Ofertaid, Umowaid } = req.body;

  // Walidacja Ofertaid i Umowaid
  if (isNaN(parseInt(Ofertaid)) || isNaN(parseInt(Umowaid))) {
    return res.status(400).json({ error: 'Ofertaid i Umowaid muszą być liczbami całkowitymi' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO oferta_umowa (Ofertaid, Umowaid) VALUES (?, ?)',
      [Ofertaid, Umowaid]
    );
    res.status(201).json({ Ofertaid, Umowaid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Powiązanie już istnieje' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podana oferta lub typ umowy nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich powiązań oferta-umowa
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM oferta_umowa');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie powiązania oferta-umowa po Ofertaid i Umowaid
router.get('/:Ofertaid/:Umowaid', authMiddleware, async (req, res) => {
  const { Ofertaid, Umowaid } = req.params;

  // Walidacja Ofertaid i Umowaid
  if (isNaN(parseInt(Ofertaid)) || isNaN(parseInt(Umowaid))) {
    return res.status(400).json({ error: 'Ofertaid i Umowaid muszą być liczbami całkowitymi' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM oferta_umowa WHERE Ofertaid = ? AND Umowaid = ?',
      [Ofertaid, Umowaid]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Powiązanie nie znalezione' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie powiązania oferta-umowa
router.delete('/:Ofertaid/:Umowaid', authMiddleware, async (req, res) => {
  // Sprawdzenie roli (pracownikhr lub administrator)
  if (req.user.role !== 'pracownikHR' && req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }

  const { Ofertaid, Umowaid } = req.params;

  // Walidacja Ofertaid i Umowaid
  if (isNaN(parseInt(Ofertaid)) || isNaN(parseInt(Umowaid))) {
    return res.status(400).json({ error: 'Ofertaid i Umowaid muszą być liczbami całkowitymi' });
  }

  try {
    const [result] = await pool.query(
      'DELETE FROM oferta_umowa WHERE Ofertaid = ? AND Umowaid = ?',
      [Ofertaid, Umowaid]
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