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
    req.user = decoded; // np. { id: 3, role: 'kandydat' }

    if (decoded.role === 'kandydat') {
      const [rows] = await pool.query('SELECT stan FROM kandydat WHERE id = ?', [decoded.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
      }
      if (rows[0].stan === 'zablokowany') {
        return res.status(403).json({ error: 'Konto zablokowane' });
      }
    } else if (decoded.role === 'pracownikHR') {
      const [rows] = await pool.query('SELECT stan FROM pracownikHR WHERE id = ?', [decoded.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
      }
      if (rows[0].stan === 'zablokowany') {
        return res.status(403).json({ error: 'Konto zablokowane' });
      }
    } else if (decoded.role === 'administrator') {
      // Administratorzy nie mają pola "stan"
    } else {
      return res.status(400).json({ error: 'Nieprawidłowa rola użytkownika' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Nieprawidłowy token' });
  }
};

module.exports = authMiddleware;
