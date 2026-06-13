import { Router } from 'express';
import { requestExportController, getExportStatusController, getExportLogsController, deleteExportLogController } from '../../../modules/admin/controllers/export.controller.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { requireAdmin } from '../../../shared/middlewares/rbac.middleware.js';

const exportRouter: Router = Router();

/**
 * @swagger
 * /v1/admin/export:
 *   post:
 *     summary: Request a CSV export (Admin Only)
 *     description: Enqueues a CSV export job for student profiles or application status list with filters.
 *     tags: [Admin - Export]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [students, applications]
 *     responses:
 *       202:
 *         description: Export job enqueued successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
exportRouter.post(
    '/',
    authMiddleware,
    requireAdmin,
    requestExportController
);

/**
 * @swagger
 * /v1/admin/export/{jobId}/status:
 *   get:
 *     summary: Get status of a CSV export job (Admin Only)
 *     description: Retrieve status of export job, returns downloadUrl if completed.
 *     tags: [Admin - Export]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status retrieved successfully
 */
exportRouter.get(
    '/logs',
    authMiddleware,
    requireAdmin,
    getExportLogsController
);

exportRouter.delete(
    '/logs/:id',
    authMiddleware,
    requireAdmin,
    deleteExportLogController
);

exportRouter.get(
    '/:jobId/status',
    authMiddleware,
    requireAdmin,
    getExportStatusController
);

export { exportRouter };
