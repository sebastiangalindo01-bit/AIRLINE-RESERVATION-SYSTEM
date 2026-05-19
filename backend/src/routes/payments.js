import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { simulatePayment } from '../services/paymentsService.js';
import { pool } from '../config/db.js';

const router = express.Router();

const validarPago = [
  body('reservationId').isInt().withMessage('reservationId debe ser entero'),
  body('amount').isFloat({ min: 0 }).withMessage('amount debe ser numérico mayor o igual a 0')
];

/**
 * POST /api/payments/simulate
 * Simula el pago de una reserva y la marca como Confirmada
 */
router.post('/simulate', authenticateToken, authorizeRoles('CLIENT', 'AGENT', 'SUPER_ADMIN'), validarPago, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

  try {
    const { reservationId, amount } = req.body;
    const requester = req.user;

    // Si el usuario es CLIENT, verificar que la reserva le pertenece
    if ((requester.role || requester.rol || '').toUpperCase() === 'CLIENT') {
      const r = await pool.query('SELECT cliente_id FROM reservations WHERE id = $1', [reservationId]);
      if (r.rowCount === 0) return res.status(404).json({ ok: false, message: 'Reserva no encontrada' });
      if (r.rows[0].cliente_id !== requester.sub) return res.status(403).json({ ok: false, message: 'No puede pagar esta reserva' });
    }

    const result = await simulatePayment(reservationId, requester.sub, amount);
    return res.json({ ok: true, data: result });
  } catch (err) {
    console.error('Error en /api/payments/simulate:', err);
    return res.status(400).json({ ok: false, message: err.message });
  }
});

export default router;
