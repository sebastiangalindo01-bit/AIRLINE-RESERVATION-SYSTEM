import { pool } from '../config/db.js';

export async function getAllClients() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, tipo_documento, numero_identificacion, nombre, apellido, email, telefono, telefono_alterno, direccion_residencia, pais_id, departamento_id, ciudad_id, rol, created_at FROM clientes ORDER BY id');
    return res.rows;
  } finally {
    client.release();
  }
}

export async function getClientById(id) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, tipo_documento, numero_identificacion, nombre, apellido, email, telefono, telefono_alterno, direccion_residencia, pais_id, departamento_id, ciudad_id, rol, created_at FROM clientes WHERE id = $1', [id]);
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function updateClient(id, cambios) {
  const client = await pool.connect();
  try {
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [k, v] of Object.entries(cambios)) {
      fields.push(`${k} = $${idx}`);
      params.push(v);
      idx++;
    }
    if (fields.length === 0) return null;
    params.push(id);
    const res = await client.query(`UPDATE clientes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, nombre, apellido, email, rol` , params);
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteClient(id) {
  const client = await pool.connect();
  try {
    const res = await client.query('DELETE FROM clientes WHERE id = $1 RETURNING id', [id]);
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}

export default { getAllClients, getClientById, updateClient, deleteClient };
