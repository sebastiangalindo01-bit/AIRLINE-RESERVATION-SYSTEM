import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

export async function createUser({ username, password, nombre, apellido, email, role }) {
  const client = await pool.connect();
  try {
    const hash = await bcrypt.hash(password, 10);
    const res = await client.query('INSERT INTO users (username, nombre, apellido, email, password_hash, role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, username, nombre, apellido, email, role', [username, nombre, apellido, email, hash, role]);
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function getAllUsers() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, username, nombre, apellido, email, role, created_at FROM users ORDER BY id');
    return res.rows;
  } finally {
    client.release();
  }
}

export async function getUserById(id) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, username, nombre, apellido, email, role FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function deleteUser(id) {
  const client = await pool.connect();
  try {
    const res = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}

export default { createUser, getAllUsers, getUserById, deleteUser };
