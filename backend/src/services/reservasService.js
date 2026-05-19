import { pool } from '../config/db.js';

/**
 * Crea una reserva de forma transaccional: reserva + tiquetes + paquetes + historial
 * payload: { cliente_id, vuelo_id, tickets: [{numero_asiento, clase, precio_final}], packages: [{package_id, precio_aplicado}] }
 */
export async function crearReservaTransaccional(payload) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { cliente_id, vuelo_id, tickets = [], packages = [] } = payload;

    // Bloquear fila de vuelo para evitar race conditions
    const vueloRes = await client.query('SELECT id, capacidad FROM vuelos WHERE id = $1 FOR UPDATE', [vuelo_id]);
    if (vueloRes.rowCount === 0) throw new Error('Vuelo no existe');
    const capacidad = vueloRes.rows[0].capacidad;

    const existTicketsRes = await client.query('SELECT COUNT(*) as cnt FROM tickets WHERE vuelo_id = $1', [vuelo_id]);
    const ocupados = Number(existTicketsRes.rows[0].cnt || 0);

    if (ocupados + tickets.length > capacidad) {
      throw new Error('No hay asientos suficientes en este vuelo');
    }

    // Calcular valor total
    const sumaTiquetes = tickets.reduce((s, t) => s + Number(t.precio_final || 0), 0);
    const sumaPaquetes = packages.reduce((s, p) => s + Number(p.precio_aplicado || 0), 0);
    const valorTotal = sumaTiquetes + sumaPaquetes;

    // Obtener estado 'Reservada'
    const estadoRes = await client.query("SELECT id FROM reservation_states WHERE nombre = 'Reservada' LIMIT 1");
    const estadoId = estadoRes.rowCount ? estadoRes.rows[0].id : null;
    if (!estadoId) throw new Error('Estado "Reservada" no definido en reservation_states');

    // Insertar reserva
    const insertReserva = await client.query(
      `INSERT INTO reservations (cliente_id, vuelo_id, valor_total, estado_id) VALUES ($1,$2,$3,$4) RETURNING *`,
      [cliente_id, vuelo_id, valorTotal, estadoId]
    );
    const reserva = insertReserva.rows[0];

    // Insertar tiquetes
    const createdTickets = [];
    for (const t of tickets) {
      const ins = await client.query(
        `INSERT INTO tickets (reservation_id, vuelo_id, numero_asiento, clase, precio_final) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [reserva.id, vuelo_id, t.numero_asiento, t.clase, t.precio_final]
      );
      createdTickets.push(ins.rows[0]);
    }

    // Insertar paquetes asociados
    const createdPackages = [];
    for (const p of packages) {
      const ins = await client.query(
        `INSERT INTO reservation_packages (reservation_id, package_id, precio_aplicado) VALUES ($1,$2,$3) RETURNING *`,
        [reserva.id, p.package_id, p.precio_aplicado]
      );
      createdPackages.push(ins.rows[0]);
    }

    // Registrar historial de estado
    await client.query(
      `INSERT INTO reservation_state_history (reservation_id, estado_id, nota) VALUES ($1,$2,$3)`,
      [reserva.id, estadoId, 'Reserva creada']
    );

    await client.query('COMMIT');

    return { reserva, tickets: createdTickets, packages: createdPackages };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default { crearReservaTransaccional };
