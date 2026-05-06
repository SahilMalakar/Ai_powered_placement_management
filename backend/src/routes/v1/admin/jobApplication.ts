import { Router } from 'express';
import { validateParams } from '../../../middlewares/validate.middlware.js';
import { idSchema } from '../../../types/auth.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../../middlewares/rbac.middleware.js';
import { getJobApplicantsController } from '../../../modules/admin/controllers/application.controller.js';

const jobApplicationRouter: Router = Router();

/**
 * @swagger
 * /v1/admin/job/{id}/applicants:
 *   get:
 *     summary: Get all applicants for a specific job (Admin Only)
 *     tags: [Admin - Job Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
jobApplicationRouter.get("/:id/applicants",
    validateParams(idSchema),
    authMiddleware,
    requireAdmin,
    getJobApplicantsController
);



export default jobApplicationRouter;