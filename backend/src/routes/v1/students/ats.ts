import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireStudent } from '../../../middlewares/rbac.middleware.js';
import { atsUpload } from '../../../utils/fileHandler/multer.js';
import {
    requestAtsAnalysisController,
    getAtsResultsController,
} from '../../../modules/students/controllers/ats.controller.js';

/**
 * @swagger
 * tags:
 *   name: ATS
 *   description: ATS analysis management
 */

const atsRouter: Router = Router();

/**
 * @swagger
 * /api/v1/students/ats:
 *   post:
 *     summary: Initiate an ATS Analysis
 *     tags: [ATS]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [resume, jobDescription]
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *               jobDescription:
 *                 type: string
 *                 example: "We are looking for a Node.js developer with 2+ years of experience in Express and PostgreSQL."
 *     responses:
 *       202:
 *         description: ATS analysis successfully queued
 */
atsRouter.post(
    '/ats',
    authMiddleware,
    requireStudent,
    atsUpload.single('resume'),
    requestAtsAnalysisController
);

/**
 * @swagger
 * /api/v1/students/ats:
 *   get:
 *     summary: Fetch student's own ATS analysis history
 *     tags: [ATS]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: ATS results fetched successfully
 */
atsRouter.get('/ats', authMiddleware, requireStudent, getAtsResultsController);

export { atsRouter };
