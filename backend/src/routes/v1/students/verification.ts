import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireStudent } from '../../../middlewares/rbac.middleware.js';
import { initiateVerificationController } from '../../../modules/students/controllers/verification.controller.js';

/**
 * @swagger
 * tags:
 *   name: Verification
 *   description: Student document verification management
 */

const verificationRouter: Router = Router();

/**
 * @swagger
 * /api/v1/students/verification:
 *   post:
 *     summary: Trigger student document verification
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       202:
 *         description: Verification process successfully initiated
 */
verificationRouter.post(
    '/verification',
    authMiddleware,
    requireStudent,
    initiateVerificationController
);

export { verificationRouter };
