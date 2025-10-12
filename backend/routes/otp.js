const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Konfiguracja transportera Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mc123.pl@gmail.com',
    pass: 'tsfhgbgputsrmwsq'  // Hasło aplikacji (nie zwykłe hasło Gmaila)
  }
});

// Generowanie 6-cyfrowego OTP
function generateOTP() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();  // Generuje 6 znaków hex (0-9A-F)
}

// Endpoint: Żądanie resetu hasła (wysyłanie OTP na e-mail)
router.post('/forgot-password', async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role || !['kandydat', 'pracownikHR'].includes(role)) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }

  try {
    let table = role === 'kandydat' ? 'kandydat' : 'pracownikHR';
    const [rows] = await pool.query(`SELECT id, stan FROM ${table} WHERE email = ?`, [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }
    if (rows[0].stan === 'zablokowany') {
      return res.status(403).json({ error: 'Konto zablokowane' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);  // Wygaśnięcie po 10 minutach

    // Usuń stare OTP dla tego użytkownika (jeśli istnieje)
    await pool.query('DELETE FROM otp WHERE email = ? AND role = ?', [email, role]);

    // Zapisz nowe OTP
    await pool.query(
      'INSERT INTO otp (email, role, otp_code, expires_at) VALUES (?, ?, ?, ?)',
      [email, role, otp, expiresAt]
    );

    // Wyślij e-mail z OTP
    const mailOptions = {
      from: 'mc123.pl@gmail.com',
      to: email,
      subject: 'Reset hasła - Kod OTP',
      text: `Twój jednorazowy kod OTP do resetu hasła to: ${otp}. Kod wygaśnie za 10 minut.`
    };
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Kod OTP wysłany na e-mail' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Endpoint: Weryfikacja OTP i generowanie tokena resetu
router.post('/verify-otp', async (req, res) => {
  const { email, role, otp } = req.body;
  if (!email || !role || !otp || !['kandydat', 'pracownikHR'].includes(role)) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM otp WHERE email = ? AND role = ? AND otp_code = ? AND expires_at > NOW()',
      [email, role, otp]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Nieprawidłowy lub wygasły kod OTP' });
    }

    // Usuń OTP po weryfikacji
    await pool.query('DELETE FROM otp WHERE id = ?', [rows[0].id]);

    // Wygeneruj tymczasowy token resetu (JWT, expires 10 min)
    const resetToken = jwt.sign({ email, role }, config.secret, { expiresIn: '10m' });

    res.json({ resetToken, message: 'OTP zweryfikowany' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Endpoint: Reset hasła z użyciem tokena
router.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }

  try {
    const decoded = jwt.verify(resetToken, config.secret);
    const { email, role } = decoded;

    let table = role === 'kandydat' ? 'kandydat' : 'pracownikHR';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(`UPDATE ${table} SET haslo = ? WHERE email = ?`, [hashedPassword, email]);

    res.json({ message: 'Hasło zresetowane pomyślnie' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token wygasł' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;