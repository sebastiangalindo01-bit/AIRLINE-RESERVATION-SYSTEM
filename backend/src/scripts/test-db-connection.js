import { pool, testDatabaseConnection } from '../config/db.js';

async function main() {
  try {
    const resultado = await testDatabaseConnection();
    console.log('Conexión a PostgreSQL establecida correctamente.');
    console.log(`Hora del servidor: ${resultado.now || resultado.fecha_actual || resultado}`);
  } catch (error) {
    console.error('No fue posible conectar con la base de datos.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
