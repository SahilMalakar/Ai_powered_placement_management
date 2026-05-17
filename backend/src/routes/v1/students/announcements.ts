import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireStudent } from "../../../middlewares/rbac.middleware.js";
import { getStudentAnnouncementsController } from "../../../modules/students/controllers/announcement.controller.js";

const announcementsRouter: Router = Router();

/**
 * @swagger
 * /api/v1/students/announcements:
 *   get:
 *     summary: Fetch active announcements targeted to the student's branch
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Active announcements fetched successfully
 */
announcementsRouter.get(
  "/",
  authMiddleware,
  requireStudent,
  getStudentAnnouncementsController
);

export { announcementsRouter };
