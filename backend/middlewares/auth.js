const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu, autoryzacja odmówiona' });
  }
  try {
    const decoded = jwt.verify(token, config.secret);
    req.user = decoded; // Dodaje zdekodowane dane użytkownika do żądania
    next();
  } catch (error) {
    res.status(401).json({ error: 'Nieprawidłowy token' });
  }
};

module.exports = authMiddleware;