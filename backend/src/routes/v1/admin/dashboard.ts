import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../../middlewares/rbac.middleware.js';
import { getDashboardStatsController } from '../../../modules/admin/controllers/dashboard.controller.js';

/**
 * @swagger
 * tags:
 *   name: Admin Dashboard
 *   description: Admin dashboard statistics and analytics
 */

const dashboardRouter: Router = Router();

/**
 * @swagger
 * /api/v1/admin/dashboard/stats:
 *   get:
 *     summary: Get aggregated dashboard statistics
 *     tags: [Admin Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats fetched successfully
 */
dashboardRouter.get(
    '/stats',
    authMiddleware,
    requireAdmin,
    getDashboardStatsController
);

export { dashboardRouter };
