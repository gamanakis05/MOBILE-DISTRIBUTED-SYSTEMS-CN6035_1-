const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME     || 'theatre_db',
  user:     process.env.DB_USER     || 'theatre_user',
  password: process.env.DB_PASSWORD || 'theatre_pass',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           'Z',
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ DB connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
  });

module.exports = pool;
