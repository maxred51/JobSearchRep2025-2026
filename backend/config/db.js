const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'mysql',
  user: process.env.MYSQL_USER || 'jobapp_user',
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'mydb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;