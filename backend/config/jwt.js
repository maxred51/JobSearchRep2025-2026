
module.exports = {
  secret: process.env.JWT_SECRET || 'secret_dev',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h'
};