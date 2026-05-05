'use strict';

const { pool, verificarConexionBaseDatos } = require('../config/database');

async function main() {
  try {
    const resultado = await verificarConexionBaseDatos();
    console.log('Conexión a PostgreSQL establecida correctamente.');
    console.log(`Hora del servidor: ${resultado.fecha_actual}`);
  } catch (error) {
    console.error('No fue posible conectar con la base de datos.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();