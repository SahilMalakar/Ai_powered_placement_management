import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { requireAdmin } from '../../../shared/middlewares/rbac.middleware.js';
import { validateRequest } from '../../../shared/middlewares/validate.middlware.js';
import { createAdminMessageSchema } from '../../../shared/types/admin/message.js';
import {
    sendAdminMessageController,
    getAdminMessagesHistoryController,
} from '../../../modules/admin/controllers/message.controller.js';

const messageRouter: Router = Router();

/**
 * @swagger
 * /api/v1/admin/messages:
 *   post:
 *     summary: Broadcast a branch-specific notification message to students
 *     tags: [Admin Notifications]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message, branches]
 *             properties:
 *               message: { type: string, example: "Dear students, there is a mandatory pre-placement talk tomorrow at 10 AM. Please make sure to register." }
 *               link: { type: string, example: "https://example.com/register" }
 *               branches: { type: array, items: { type: string }, example: ["ETE", "CSE"] }
 *     responses:
 *       201:
 *         description: Notification broadcast successfully queued
 */
messageRouter.post(
    '/',
    authMiddleware,
    requireAdmin,
    validateRequest(createAdminMessageSchema),
    sendAdminMessageController
);

/**
 * @swagger
 * /api/v1/admin/messages:
 *   get:
 *     summary: Fetch historic admin announcements
 *     tags: [Admin Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Notification history fetched successfully
 */
messageRouter.get(
    '/',
    authMiddleware,
    requireAdmin,
    getAdminMessagesHistoryController
);

export { messageRouter };
