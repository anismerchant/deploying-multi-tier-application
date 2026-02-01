const express = require('express');
const mysql = require('mysql2/promise');

const app = express();

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/db-health', async (req, res) => {
  try {
    const conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    await conn.query('SELECT 1');
    await conn.end();

    res.json({ db: 'connected' });
  } catch (err) {
    res.status(500).json({ db: 'error', error: err.message });
  }
});

app.listen(5000, () => {
  console.log('API listening on port 5000');
});
