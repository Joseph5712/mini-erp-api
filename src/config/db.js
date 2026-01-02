const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Si usas Render/Railway a veces ocupas SSL:
    // ssl: { rejectUnauthorized: false },
});

module.exports = pool;