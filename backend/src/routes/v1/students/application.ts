import { Router } from 'express';
import { applyToJobController } from '../../../modules/students/controllers/application.controller.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireStudent } from '../../../middlewares/rbac.middleware.js';
import {
    validateParams,
    validateRequest,
} from '../../../middlewares/validate.middlware.js';
import { applicationRateLimiter } from '../../../middlewares/rateLimit.middleware.js';
import {
    applyToJobParamsSchema,
    applyToJobBodySchema,
} from '../../../types/students/application.js';

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job application management
 */

const router: Router = Router();

/**
 * @swagger
 * /api/v1/students/jobs/{jobId}/apply:
 *   post:
 *     summary: Apply to a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the job
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resumeId
 *             properties:
 *               resumeId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Application submitted successfully
 */
router.post(
    '/jobs/:jobId/apply',
    authMiddleware,
    requireStudent,
    applicationRateLimiter,
    validateParams(applyToJobParamsSchema),
    validateRequest(applyToJobBodySchema),
    applyToJobController
);

export { router as applicationRouter };
