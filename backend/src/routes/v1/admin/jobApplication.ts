import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../../middlewares/rbac.middleware.js';
import { updateApplicationStatusController, getAllApplicationsController } from '../../../modules/admin/controllers/jobApplication.controller.js';

const jobApplicationRouter: Router = Router();

/**
 * @swagger
 * /api/v1/admin/job/application/list:
 *   get:
 *     summary: Get all applications across all jobs (Admin Only)
 *     tags: [Admin - Job Management]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all applications
 */
jobApplicationRouter.get("/list",
    authMiddleware,
    requireAdmin,
    getAllApplicationsController
);

/**
 * @swagger
 * /api/v1/admin/job/application/status:
 *   post:
 *     summary: Batch update application statuses (Admin Only)
 *     description: >
 *       Updates the status of multiple applications atomically.
 *       Only valid forward transitions are allowed (APPLIED → SHORTLISTED → SELECTED).
 *       Sends email notifications only to students whose status actually changed.
 *       Uses Serializable transaction isolation to prevent race conditions.
 *     tags: [Admin - Job Management]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationIds
 *               - status
 *             properties:
 *               applicationIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *                 maxItems: 100
 *                 example: [1, 2, 3]
 *               status:
 *                 type: string
 *                 enum: [SHORTLISTED, SELECTED, REJECTED]
 *                 example: SHORTLISTED
 *     responses:
 *       200:
 *         description: Applications updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     updated:
 *                       type: integer
 *                       description: Number of applications actually updated
 *                     total:
 *                       type: integer
 *                       description: Total IDs submitted
 *                     skipped:
 *                       type: integer
 *                       description: Number of IDs skipped (already in target status or invalid)
 *       400:
 *         description: Invalid request body or no eligible applications
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
jobApplicationRouter.post("/application/status",
    authMiddleware,
    requireAdmin,
    updateApplicationStatusController
);

export default jobApplicationRouter;