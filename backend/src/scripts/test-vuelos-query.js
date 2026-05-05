'use strict';

const vuelosService = require('../services/vuelosService');
const { pool } = require('../config/database');

/**
 * Script de prueba para validar las consultas de vuelos desde el backend
 */

async function main() {
  try {
    console.log('='.repeat(60));
    console.log('PRUEBA DE CONSULTAS DE VUELOS - BACKEND');
    console.log('='.repeat(60));
    console.log();

    // ===== PRUEBA 1: Obtener todos los vuelos =====
    console.log('📋 Prueba 1: Obtener todos los vuelos');
    console.log('-'.repeat(60));
    const todosVuelos = await vuelosService.obtenerTodosVuelos();
    console.log(`✓ Se encontraron ${todosVuelos.length} vuelos`);
    if (todosVuelos.length > 0) {
      console.log(`  Primero: ${todosVuelos[0].codigo_vuelo} (${todosVuelos[0].ciudad_origen} → ${todosVuelos[0].ciudad_destino})`);
      if (todosVuelos.length > 1) {
        console.log(`  Último: ${todosVuelos[todosVuelos.length - 1].codigo_vuelo}`);
      }
    }
    console.log();

    // ===== PRUEBA 2: Obtener vuelo por ID =====
    console.log('📋 Prueba 2: Obtener vuelo por ID');
    console.log('-'.repeat(60));
    if (todosVuelos.length > 0) {
      const primerVuelo = todosVuelos[0];
      const vuelo = await vuelosService.obtenerVueloPorId(primerVuelo.id);
      if (vuelo) {
        console.log(`✓ Vuelo encontrado: ${vuelo.codigo_vuelo}`);
        console.log(`  Ruta: ${vuelo.ciudad_origen} → ${vuelo.ciudad_destino}`);
        console.log(`  Fecha: ${vuelo.fecha_salida} ${vuelo.hora_salida}`);
        console.log(`  Precio: $${vuelo.precio_base}`);
      } else {
        console.log('✗ Vuelo no encontrado');
      }
    } else {
      console.log('⚠ No hay vuelos para prueba');
    }
    console.log();

    // ===== PRUEBA 3: Filtrar por origen =====
    console.log('📋 Prueba 3: Filtrar vuelos por origen (Bogotá)');
    console.log('-'.repeat(60));
    const vuelosBogota = await vuelosService.filtrarVuelos({ origen: 'Bogotá' });
    console.log(`✓ Se encontraron ${vuelosBogota.length} vuelos desde Bogotá`);
    vuelosBogota.slice(0, 3).forEach(v => {
      console.log(`  - ${v.codigo_vuelo}: ${v.ciudad_origen} → ${v.ciudad_destino}`);
    });
    console.log();

    // ===== PRUEBA 4: Filtrar por destino =====
    console.log('📋 Prueba 4: Filtrar vuelos por destino (Medellín)');
    console.log('-'.repeat(60));
    const vuelosMedellin = await vuelosService.filtrarVuelos({ destino: 'Medellín' });
    console.log(`✓ Se encontraron ${vuelosMedellin.length} vuelos hacia Medellín`);
    vuelosMedellin.forEach(v => {
      console.log(`  - ${v.codigo_vuelo}: ${v.ciudad_origen} → ${v.ciudad_destino}`);
    });
    console.log();

    // ===== PRUEBA 5: Filtrar por fecha =====
    console.log('📋 Prueba 5: Filtrar vuelos por fecha (2026-04-10)');
    console.log('-'.repeat(60));
    const vuelos10abril = await vuelosService.filtrarVuelos({ fecha: '2026-04-10' });
    console.log(`✓ Se encontraron ${vuelos10abril.length} vuelos en 2026-04-10`);
    vuelos10abril.slice(0, 3).forEach(v => {
      console.log(`  - ${v.codigo_vuelo}: Salida ${v.hora_salida}`);
    });
    console.log();

    // ===== PRUEBA 6: Filtro combinado =====
    console.log('📋 Prueba 6: Filtro combinado (origen=Bogotá, destino=Cartagena)');
    console.log('-'.repeat(60));
    const vuelosEspecificos = await vuelosService.filtrarVuelos({
      origen: 'Bogotá',
      destino: 'Cartagena'
    });
    console.log(`✓ Se encontraron ${vuelosEspecificos.length} vuelos`);
    vuelosEspecificos.forEach(v => {
      console.log(`  - ${v.codigo_vuelo}: ${v.fecha_salida} ${v.hora_salida} - Precio: $${v.precio_base}`);
    });
    console.log();

    // ===== RESUMEN =====
    console.log('='.repeat(60));
    console.log('✓ Todas las pruebas completadas exitosamente');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('✗ Error durante las pruebas:');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
