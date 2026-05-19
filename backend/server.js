'use strict';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDatabaseConnection } from './src/config/db.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Validar variables de entorno críticas
if (!process.env.JWT_SECRET) {
  console.error('✗ FATAL: Falta la variable de entorno JWT_SECRET.');
  process.exit(1);
}

// ====== MIDDLEWARES ======
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== RUTAS ======
import vuelosRoutes from './src/routes/vuelos.js';

// Montar rutas
app.use('/api/vuelos', vuelosRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ====== MANEJO DE ERRORES ======
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ====== INICIALIZAR SERVIDOR ======
async function iniciarServidor() {
  try {
    // Verificar conexión a la base de datos
    console.log('Verificando conexión a la base de datos...');
    await testDatabaseConnection();
    console.log('✓ Conexión a PostgreSQL establecida');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✓ Servidor iniciado en puerto ${PORT}`);
      console.log(`  → http://localhost:${PORT}`);
      console.log(`  → GET http://localhost:${PORT}/api/vuelos`);
      console.log(`  → GET http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('✗ No fue posible iniciar el servidor:');
    console.error(error.message);
    process.exit(1);
  }
}

iniciarServidor();

export default app;
