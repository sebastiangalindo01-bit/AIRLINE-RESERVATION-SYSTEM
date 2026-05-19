import express from 'express';
import { obtenerTodosVuelos, obtenerVueloPorId, filtrarVuelos } from '../services/vuelosService.js';
import { convertirVueloAlFormato, convertirVuelosAlFormato } from '../utils/formatoAdapter.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { crearVuelo, actualizarVuelo, eliminarVuelo } from '../services/vuelosService.js';

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
      vuelos = await filtrarVuelos({ origen, destino, fecha });
    } else {
      vuelos = await obtenerTodosVuelos();
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
 * POST /api/vuelos
 * Crea un nuevo vuelo (SUPER_ADMIN, AGENT)
 */
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN', 'AGENT'), async (req, res) => {
  try {
    const payload = req.body || {};
    const nuevo = await crearVuelo(payload);
    return res.status(201).json({ success: true, data: convertirVueloAlFormato(nuevo) });
  } catch (error) {
    console.error('Error en POST /api/vuelos:', error);
    res.status(500).json({ success: false, error: 'Error al crear vuelo', message: error.message });
  }
});

/**
 * GET /api/vuelos/:id
 * Obtiene un vuelo específico por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vuelo = await obtenerVueloPorId(id);

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

/**
 * PUT /api/vuelos/:id
 * Actualiza un vuelo (SUPER_ADMIN, AGENT)
 */
router.put('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'AGENT'), async (req, res) => {
  try {
    const { id } = req.params;
    const cambios = req.body || {};
    const actualizado = await actualizarVuelo(id, cambios);
    if (!actualizado) return res.status(404).json({ success: false, error: 'Vuelo no encontrado' });
    return res.json({ success: true, data: convertirVueloAlFormato(actualizado) });
  } catch (error) {
    console.error('Error en PUT /api/vuelos/:id:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar vuelo', message: error.message });
  }
});

/**
 * DELETE /api/vuelos/:id
 * Elimina un vuelo (SUPER_ADMIN)
 */
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await eliminarVuelo(id);
    if (!eliminado) return res.status(404).json({ success: false, error: 'Vuelo no encontrado' });
    return res.json({ success: true, data: eliminado });
  } catch (error) {
    console.error('Error en DELETE /api/vuelos/:id:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar vuelo', message: error.message });
  }
});

export default router;
