'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { verificarConexionBaseDatos } = require('./src/config/database');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ====== MIDDLEWARES ======
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== RUTAS ======
// Importar rutas
const vuelosRoutes = require('./src/routes/vuelos');

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
    await verificarConexionBaseDatos();
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

module.exports = app;
