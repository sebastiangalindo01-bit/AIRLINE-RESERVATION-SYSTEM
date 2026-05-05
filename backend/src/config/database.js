'use strict';

const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

function buildPoolConfig() {
  if (process.env.DATABASE_URL) {
    const useSsl = process.env.PGSSL === 'true';

    return {
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false
    };
  }

  return {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'airline_reservation_system',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
  };
}

const pool = new Pool(buildPoolConfig());

async function verificarConexionBaseDatos() {
  const cliente = await pool.connect();

  try {
    const resultado = await cliente.query('SELECT NOW() AS fecha_actual');
    return resultado.rows[0];
  } finally {
    cliente.release();
  }
}

module.exports = {
  pool,
  buildPoolConfig,
  verificarConexionBaseDatos
};