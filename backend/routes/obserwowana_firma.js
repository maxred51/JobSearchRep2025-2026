const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// CREATE - Obserwowanie firmy przez kandydata
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'kandydat') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { Firmaid } = req.body;
  if (!Firmaid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane: wymagane Firmaid' });
  }
  try {
    const [firma] = await pool.query('SELECT id FROM firma WHERE id = ?', [Firmaid]);
    if (firma.length === 0) {
      return res.status(404).json({ error: 'Firma nie znaleziona' });
    }
    const [result] = await pool.query(
      'INSERT INTO obserwowana_firma (Kandydatid, Firmaid) VALUES (?, ?)',
      [req.user.id, Firmaid]
    );
    res.status(201).json({ Kandydatid: req.user.id, Firmaid });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Firma już obserwowana' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie obserwowanych firm kandydata
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'kandydat') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT f.id, f.nazwa AS nazwa_firmy ' +
      'FROM obserwowana_firma of ' +
      'JOIN firma f ON of.Firmaid = f.id ' +
      'WHERE of.Kandydatid = ?',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie obserwowanej firmy
router.delete('/:Firmaid', authMiddleware, async (req, res) => {
  if (req.user.role !== 'kandydat') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  const { Firmaid } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM obserwowana_firma WHERE Kandydatid = ? AND Firmaid = ?',
      [req.user.id, Firmaid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Obserwowana firma nie znaleziona' });
    }
    res.json({ message: 'Obserwowana firma usunięta' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;