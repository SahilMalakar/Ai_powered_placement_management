import { Router } from 'express';
import { applyToJobController, getApplicationsController } from '../../../modules/students/controllers/application.controller.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireStudent } from '../../../middlewares/rbac.middleware.js';
import {
    validateParams,
    validateRequest,
} from '../../../middlewares/validate.middlware.js';
import { applicationRateLimiter } from '../../../middlewares/rateLimit.middleware.js';
import {
    applyToJobParamsSchema,
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
 * /api/v1/students/application/{jobId}/apply:
 *   post:
 *     summary: Apply to a job (No resume needed for initial application)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the job
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Application submitted successfully",
 *                 "data": {
 *                   "id": 1,
 *                   "jobId": 1,
 *                   "status": "APPLIED"
 *                 }
 *               }
 */
router.post(
    '/:jobId/apply',
    authMiddleware,
    requireStudent,
    applicationRateLimiter,
    validateParams(applyToJobParamsSchema),
    applyToJobController
);

/**
 * @swagger
 * /api/v1/students/application:
 *   get:
 *     summary: Get all applications for the authenticated student
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: 
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 */
router.get(
    '/',
    authMiddleware,
    requireStudent,
    getApplicationsController
);

export { router as applicationRouter };
