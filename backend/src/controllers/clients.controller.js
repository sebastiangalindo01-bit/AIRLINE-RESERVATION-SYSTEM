import { validationResult } from 'express-validator';
import * as clientsService from '../services/clientsService.js';

export async function listClients(req, res) {
  try {
    const rows = await clientsService.getAllClients();
    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error('listClients error', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}

export async function getClient(req, res) {
  try {
    const { id } = req.params;
    const row = await clientsService.getClientById(id);
    if (!row) return res.status(404).json({ ok: false, message: 'Cliente no encontrado' });
    return res.json({ ok: true, data: row });
  } catch (err) {
    console.error('getClient error', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}

export async function updateClientController(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

  try {
    const { id } = req.params;
    const cambios = req.body;
    const updated = await clientsService.updateClient(id, cambios);
    if (!updated) return res.status(404).json({ ok: false, message: 'Cliente no encontrado' });
    return res.json({ ok: true, data: updated });
  } catch (err) {
    console.error('updateClientController error', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}

export async function deleteClientController(req, res) {
  try {
    const { id } = req.params;
    const deleted = await clientsService.deleteClient(id);
    if (!deleted) return res.status(404).json({ ok: false, message: 'Cliente no encontrado' });
    return res.json({ ok: true, data: deleted });
  } catch (err) {
    console.error('deleteClientController error', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}

export default { listClients, getClient, updateClientController, deleteClientController };
