import { validationResult } from 'express-validator';
import * as usersService from '../services/usersService.js';

export async function createUserController(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

  try {
    const { username, password, nombre, apellido, email, role } = req.body;
    const user = await usersService.createUser({ username, password, nombre, apellido, email, role });
    return res.status(201).json({ ok: true, data: user });
  } catch (err) {
    console.error('createUserController error', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}

export async function listUsersController(req, res) {
  try {
    const rows = await usersService.getAllUsers();
    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error('listUsersController error', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}

export async function getUserController(req, res) {
  try {
    const { id } = req.params;
    const user = await usersService.getUserById(id);
    if (!user) return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    return res.json({ ok: true, data: user });
  } catch (err) {
    console.error('getUserController error', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}

export async function deleteUserController(req, res) {
  try {
    const { id } = req.params;
    const deleted = await usersService.deleteUser(id);
    if (!deleted) return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    return res.json({ ok: true, data: deleted });
  } catch (err) {
    console.error('deleteUserController error', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}

export default { createUserController, listUsersController, getUserController, deleteUserController };
