import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { createUserController, listUsersController, getUserController, deleteUserController } from '../controllers/users.controller.js';

const router = express.Router();

const validarCreate = [
  body('username').isString().notEmpty(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['SUPER_ADMIN', 'AGENT']).withMessage('role debe ser SUPER_ADMIN o AGENT')
];

// Crear usuario admin/agent (solo SUPER_ADMIN)
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN'), validarCreate, createUserController);

// Listar usuarios (SUPER_ADMIN)
router.get('/', authenticateToken, authorizeRoles('SUPER_ADMIN'), listUsersController);

// Obtener usuario
router.get('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), getUserController);

// Eliminar usuario
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), deleteUserController);

export default router;
