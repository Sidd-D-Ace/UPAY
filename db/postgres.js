const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', // Ensure this matches POSTGRES_USER in docker-compose
  host: process.env.DB_HOST || 'localhost', // The Critical Fix
  database: 'upay',
  password: process.env.DBPASSWORD, // Reads from .env
  port: 5432,
});

pool.connect()
  .then(() => console.log(`✅ Connected to PostgreSQL at ${process.env.DB_HOST || 'localhost'}`))
  .catch(err => console.error('❌ PostgreSQL connection error:', err.stack));

module.exports = pool;