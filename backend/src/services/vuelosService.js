import { pool } from '../config/db.js';

/**
 * Obtiene todos los vuelos de la base de datos
 * @returns {Promise<Array>} Lista de vuelos
 */
async function obtenerTodosVuelos() {
  const cliente = await pool.connect();

  try {
    const query = `
      SELECT 
        id,
        codigo_vuelo,
        ciudad_origen,
        ciudad_destino,
        fecha_salida,
        hora_salida,
        fecha_llegada,
        hora_llegada,
        capacidad,
        precio_base,
        estado,
        imagen
      FROM vuelos
      ORDER BY fecha_salida ASC, hora_salida ASC
    `;

    const resultado = await cliente.query(query);
    return resultado.rows;
  } finally {
    cliente.release();
  }
}

/**
 * Obtiene un vuelo específico por ID
 * @param {number} id - ID del vuelo
 * @returns {Promise<Object|null>} Vuelo encontrado o null
 */
async function obtenerVueloPorId(id) {
  const cliente = await pool.connect();

  try {
    const query = `
      SELECT 
        id,
        codigo_vuelo,
        ciudad_origen,
        ciudad_destino,
        fecha_salida,
        hora_salida,
        fecha_llegada,
        hora_llegada,
        capacidad,
        precio_base,
        estado,
        imagen
      FROM vuelos
      WHERE id = $1
    `;

    const resultado = await cliente.query(query, [id]);
    return resultado.rows[0] || null;
  } finally {
    cliente.release();
  }
}

/**
 * Filtra vuelos por criterios
 * @param {Object} filtros - { origen, destino, fecha }
 * @returns {Promise<Array>} Lista de vuelos filtrados
 */
async function filtrarVuelos(filtros = {}) {
  const cliente = await pool.connect();

  try {
    let query = `
      SELECT 
        id,
        codigo_vuelo,
        ciudad_origen,
        ciudad_destino,
        fecha_salida,
        hora_salida,
        fecha_llegada,
        hora_llegada,
        capacidad,
        precio_base,
        estado,
        imagen
      FROM vuelos
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (filtros.origen) {
      query += ` AND LOWER(ciudad_origen) LIKE LOWER($${paramCount})`;
      params.push(`%${filtros.origen}%`);
      paramCount++;
    }

    if (filtros.destino) {
      query += ` AND LOWER(ciudad_destino) LIKE LOWER($${paramCount})`;
      params.push(`%${filtros.destino}%`);
      paramCount++;
    }

    if (filtros.fecha) {
      query += ` AND fecha_salida = $${paramCount}`;
      params.push(filtros.fecha);
      paramCount++;
    }

    query += ` ORDER BY fecha_salida ASC, hora_salida ASC`;

    const resultado = await cliente.query(query, params);
    return resultado.rows;
  } finally {
    cliente.release();
  }
}

export { obtenerTodosVuelos, obtenerVueloPorId, filtrarVuelos };

/**
 * Crea un nuevo vuelo
 */
async function crearVuelo(vuelo) {
  const cliente = await pool.connect();
  try {
    const query = `
      INSERT INTO vuelos (
        codigo_vuelo, ciudad_origen, ciudad_destino,
        fecha_salida, hora_salida, fecha_llegada, hora_llegada,
        capacidad, precio_base, estado, imagen
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `;

    const params = [
      vuelo.codigo_vuelo,
      vuelo.ciudad_origen,
      vuelo.ciudad_destino,
      vuelo.fecha_salida,
      vuelo.hora_salida,
      vuelo.fecha_llegada,
      vuelo.hora_llegada,
      vuelo.capacidad,
      vuelo.precio_base,
      vuelo.estado || 'Programado',
      vuelo.imagen || null
    ];

    const result = await cliente.query(query, params);
    return result.rows[0];
  } finally {
    cliente.release();
  }
}

/**
 * Actualiza un vuelo existente
 */
async function actualizarVuelo(id, cambios) {
  const cliente = await pool.connect();
  try {
    const fields = [];
    const params = [];
    let idx = 1;

    for (const [key, value] of Object.entries(cambios)) {
      fields.push(`${key} = $${idx}`);
      params.push(value);
      idx++;
    }

    if (fields.length === 0) return null;

    params.push(id);
    const query = `UPDATE vuelos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await cliente.query(query, params);
    return result.rows[0] || null;
  } finally {
    cliente.release();
  }
}

/**
 * Elimina un vuelo por id
 */
async function eliminarVuelo(id) {
  const cliente = await pool.connect();
  try {
    const query = `DELETE FROM vuelos WHERE id = $1 RETURNING id`;
    const result = await cliente.query(query, [id]);
    return result.rows[0] || null;
  } finally {
    cliente.release();
  }
}

export { crearVuelo, actualizarVuelo, eliminarVuelo };
