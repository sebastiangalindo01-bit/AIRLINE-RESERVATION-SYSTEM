import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { listClients, getClient, updateClientController, deleteClientController } from '../controllers/clients.controller.js';

const router = express.Router();

const validarUpdate = [
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('telefono').optional().isString(),
];

// Listar clientes (SUPER_ADMIN, AGENT)
router.get('/', authenticateToken, authorizeRoles('SUPER_ADMIN', 'AGENT'), listClients);

// Obtener cliente por id (SUPER_ADMIN, AGENT, CLIENT can view own via token elsewhere)
router.get('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'AGENT'), getClient);

// Actualizar cliente (SUPER_ADMIN, AGENT)
router.put('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'AGENT'), validarUpdate, updateClientController);

// Eliminar cliente (SUPER_ADMIN)
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), deleteClientController);

export default router;
