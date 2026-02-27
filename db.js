const { Pool } = require('pg');
require('dotenv').config();

// Creamos la conexión ('Pool' maneja múltiples conexiones a la vez, ideal para la web)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Requisito de seguridad de Supabase
});

// Probamos si la conexión funciona al arrancar
pool.connect()
    .then(() => console.log('🟢 Conexión exitosa a la Base de Datos en Supabase'))
    .catch(err => console.error('🔴 Error conectando a la BD:', err.stack));

module.exports = pool;