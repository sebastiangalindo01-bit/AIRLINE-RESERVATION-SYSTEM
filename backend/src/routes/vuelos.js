'use strict';

const express = require('express');
const vuelosService = require('../services/vuelosService');
const { convertirVueloAlFormato, convertirVuelosAlFormato } = require('../utils/formatoAdapter');

const router = express.Router();

/**
 * GET /api/vuelos
 * Obtiene todos los vuelos o los filtra por criterios
 * Query params: origen, destino, fecha
 */
router.get('/', async (req, res) => {
  try {
    const { origen, destino, fecha } = req.query;

    let vuelos;

    if (origen || destino || fecha) {
      vuelos = await vuelosService.filtrarVuelos({
        origen,
        destino,
        fecha
      });
    } else {
      vuelos = await vuelosService.obtenerTodosVuelos();
    }

    // Convertir al formato esperado por el frontend
    const vuelosFormato = convertirVuelosAlFormato(vuelos);

    res.json({
      success: true,
      data: vuelosFormato,
      count: vuelosFormato.length
    });
  } catch (error) {
    console.error('Error en GET /api/vuelos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al consultar vuelos',
      message: error.message
    });
  }
});

/**
 * GET /api/vuelos/:id
 * Obtiene un vuelo específico por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vuelo = await vuelosService.obtenerVueloPorId(id);

    if (!vuelo) {
      return res.status(404).json({
        success: false,
        error: 'Vuelo no encontrado'
      });
    }

    // Convertir al formato esperado por el frontend
    const vueloFormato = convertirVueloAlFormato(vuelo);

    res.json({
      success: true,
      data: vueloFormato
    });
  } catch (error) {
    console.error('Error en GET /api/vuelos/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error al consultar vuelo',
      message: error.message
    });
  }
});

module.exports = router;
