import { pool } from '../config/db.js';

/**
 * Simula un pago para una reserva: verifica existencia y actualiza estado a Confirmada
 */
export async function simulatePayment(reservationId, payerId, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const resv = await client.query('SELECT id, cliente_id, valor_total, estado_id FROM reservations WHERE id = $1 FOR UPDATE', [reservationId]);
    if (resv.rowCount === 0) throw new Error('Reserva no encontrada');

    const reservation = resv.rows[0];

    // opcional: verificar amount contra valor_total
    // const expected = Number(reservation.valor_total || 0);
    // if (Math.abs(expected - Number(amount || 0)) > 0.01) throw new Error('Monto pagado no coincide con el valor de la reserva');

    // Obtener id de estado 'Confirmada'
    const stateRes = await client.query("SELECT id FROM reservation_states WHERE nombre = 'Confirmada' LIMIT 1");
    if (stateRes.rowCount === 0) throw new Error('Estado Confirmada no definido');
    const confirmedId = stateRes.rows[0].id;

    // Actualizar reserva
    await client.query('UPDATE reservations SET estado_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [confirmedId, reservationId]);

    // Insertar historial
    await client.query('INSERT INTO reservation_state_history (reservation_id, estado_id, nota) VALUES ($1,$2,$3)', [reservationId, confirmedId, `Pago simulado por ${payerId}`]);

    await client.query('COMMIT');

    return { ok: true, reservationId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export default { simulatePayment };
