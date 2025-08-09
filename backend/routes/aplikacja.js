const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CREATE - Dodanie nowej aplikacji
router.post('/', async (req, res) => {
  const { status, Kandydatid, Ofertaid } = req.body;
  if (!status || !['oczekujaca', 'odrzucona', 'zakceptowana'].includes(status) || !Kandydatid || !Ofertaid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO aplikacja (status, Kandydatid, Ofertaid) VALUES (?, ?, ?)',
      [status, Kandydatid, Ofertaid]
    );
    res.status(201).json({ id: result.insertId, status, Kandydatid, Ofertaid });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podany kandydat lub oferta nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie wszystkich aplikacji
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM aplikacja');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// READ - Pobieranie aplikacji po ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM aplikacja WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Aplikacja nie znaleziona' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// UPDATE - Aktualizacja aplikacji
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, Kandydatid, Ofertaid } = req.body;
  if (!status || !['oczekujaca', 'odrzucona', 'zakceptowana'].includes(status) || !Kandydatid || !Ofertaid) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE aplikacja SET status = ?, Kandydatid = ?, Ofertaid = ? WHERE id = ?',
      [status, Kandydatid, Ofertaid, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aplikacja nie znaleziona' });
    }
    res.json({ id, status, Kandydatid, Ofertaid });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Podany kandydat lub oferta nie istnieje' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// DELETE - Usunięcie aplikacji
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM aplikacja WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aplikacja nie znaleziona' });
    }
    res.json({ message: 'Aplikacja usunięta' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;