require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    // PARA PRODUCCIÓN
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('🔴 Error conectando a la BD:', err.message);
    } else {
        console.log('🟢 Conectado exitosamente a PostgreSQL (Supabase)');
        release();
    }
});

module.exports = pool;