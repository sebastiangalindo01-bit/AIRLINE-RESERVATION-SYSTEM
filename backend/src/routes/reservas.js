import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { crearReservaTransaccional } from '../services/reservasService.js';

const router = express.Router();

const validarReserva = [
  body('vuelo_id').isInt().withMessage('vuelo_id debe ser un entero'),
  body('tickets').isArray({ min: 1 }).withMessage('tickets debe ser un arreglo con al menos un tiquete'),
  body('tickets.*.numero_asiento').optional().isString(),
  body('tickets.*.clase').isString().withMessage('clase es obligatoria por tiquete'),
  body('tickets.*.precio_final').isFloat({ min: 0 }).withMessage('precio_final válido por tiquete'),
  body('packages').optional().isArray(),
  body('packages.*.package_id').optional().isInt(),
  body('packages.*.precio_aplicado').optional().isFloat({ min: 0 })
];

/**
 * POST /api/reservas
 * Crea una reserva transaccionalmente. Roles permitidos: CLIENT, AGENT, SUPER_ADMIN
 */
router.post('/', authenticateToken, authorizeRoles('CLIENT', 'AGENT', 'SUPER_ADMIN'), validarReserva, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }

  try {
    const requester = req.user;
    const payload = req.body || {};

    // Si el rol es CLIENT, forzar cliente_id desde el token
    if ((requester.role || requester.rol || '').toUpperCase() === 'CLIENT') {
      payload.cliente_id = requester.sub;
    }

    const result = await crearReservaTransaccional(payload);
    return res.status(201).json({ ok: true, data: result });
  } catch (error) {
    console.error('Error en POST /api/reservas:', error);
    return res.status(400).json({ ok: false, message: error.message });
  }
});

export default router;
