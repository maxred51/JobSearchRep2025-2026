const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const pool = require('../config/db');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu, autoryzacja odmówiona' });
  }
  try {
    const decoded = jwt.verify(token, config.secret);
    req.user = decoded; // Dodaje zdekodowane dane użytkownika do żądania

    // Sprawdzenie statusu użytkownika (stan) dla ról kandydat i HR
    if (decoded.role === 'kandydat') {
      const [rows] = await pool.query('SELECT stan FROM kandydat WHERE id = ?', [decoded.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
      }
      if (rows[0].stan === 'zablokowany') {
        return res.status(403).json({ error: 'Konto zablokowane' });
      }
    } else if (decoded.role === 'HR') {
      const [rows] = await pool.query('SELECT stan FROM pracownikHR WHERE id = ?', [decoded.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
      }
      if (rows[0].stan === 'zablokowany') {
        return res.status(403).json({ error: 'Konto zablokowane' });
      }
    }
    

    next();
  } catch (error) {
    res.status(401).json({ error: 'Nieprawidłowy token' });
  }
};

module.exports = authMiddleware;