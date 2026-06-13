import { Router } from 'express';
import {
    getAllAdminsController,
    createAdminController,
    updateAdminRoleController,
    deleteAdminController,
    reactivateAdminController,
} from '../../../modules/admin/controllers/team.controller.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { requireSuperAdmin } from '../../../shared/middlewares/rbac.middleware.js';
import { validateParams, validateRequest } from '../../../shared/middlewares/validate.middlware.js';
import { createAdminSchema, updateAdminRoleSchema, reactivateAdminSchema } from '../../../shared/types/admin/team.js';
import { idSchema } from '../../../shared/types/auth.js';

const teamRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin Team Management
 *   description: Super Admin only team management endpoints
 */

/**
 * @swagger
 * /v1/admin/team:
 *   get:
 *     summary: Fetch all administrative team members (Super Admin Only)
 *     tags: [Admin Team Management]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of administrative team members successfully fetched
 */
teamRouter.get('/',
    authMiddleware,
    requireSuperAdmin,
    getAllAdminsController
);

/**
 * @swagger
 * /v1/admin/team:
 *   post:
 *     summary: Register a new administrative team member (Super Admin Only)
 *     tags: [Admin Team Management]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, role]
 *             properties:
 *               email: { type: string, example: "admin@university.edu" }
 *               password: { type: string, example: "secureAdmin123" }
 *               role: { type: string, enum: [ADMIN, SUPER_ADMIN], example: "ADMIN" }
 *     responses:
 *       201:
 *         description: Administrative team member registered successfully
 */
teamRouter.post('/',
    authMiddleware,
    requireSuperAdmin,
    validateRequest(createAdminSchema),
    createAdminController
);

/**
 * @swagger
 * /v1/admin/team/{id}/role:
 *   patch:
 *     summary: Swap an administrator's role (Super Admin Only)
 *     tags: [Admin Team Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [ADMIN, SUPER_ADMIN], example: "SUPER_ADMIN" }
 *     responses:
 *       200:
 *         description: Admin role swapped successfully
 */
teamRouter.patch('/:id/role',
    validateParams(idSchema),
    authMiddleware,
    requireSuperAdmin,
    validateRequest(updateAdminRoleSchema),
    updateAdminRoleController
);

/**
 * @swagger
 * /v1/admin/team/{id}:
 *   delete:
 *     summary: Soft delete/deactivate an administrative team member (Super Admin Only)
 *     tags: [Admin Team Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Administrative team member deactivated successfully
 */
teamRouter.delete('/:id',
    validateParams(idSchema),
    authMiddleware,
    requireSuperAdmin,
    deleteAdminController
);

/**
 * @swagger
 * /v1/admin/team/{id}/reactivate:
 *   post:
 *     summary: Reactivate a deactivated administrative team member (Super Admin Only)
 *     tags: [Admin Team Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password: { type: string, example: "newSecurePassword123" }
 *               role: { type: string, enum: [ADMIN, SUPER_ADMIN], example: "ADMIN" }
 *     responses:
 *       200:
 *         description: Administrative team member reactivated successfully
 */
teamRouter.post('/:id/reactivate',
    validateParams(idSchema),
    authMiddleware,
    requireSuperAdmin,
    validateRequest(reactivateAdminSchema),
    reactivateAdminController
);

export default teamRouter;
