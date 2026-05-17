import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireStudent } from '../../../middlewares/rbac.middleware.js';
import { atsUpload } from '../../../utils/fileHandler/multer.js';
import { atsRateLimiter } from '../../../middlewares/rateLimit.middleware.js';
import {
    requestAtsAnalysisController,
    getAtsResultsController,
    getAtsStatusController,
    deleteAtsResultController,
} from '../../../modules/students/controllers/ats.controller.js';

/**
 * @swagger
 * tags:
 *   name: ATS
 *   description: ATS analysis management (Resume vs JD comparison)
 */

const atsRouter: Router = Router();

/**
 * @swagger
 * /api/v1/students/ats/analyze:
 *   post:
 *     summary: Initiate a new ATS Analysis
 *     description: Uploads a resume and optionally a job description. Triggers background processing.
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
 *             required: [resume]
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume file (PDF, DOCX) - Max 2MB
 *               jobDescription:
 *                 type: string
 *                 description: The text of the job description to analyze against. If omitted, performs a general domain analysis.
 *                 example: "We are looking for a Full Stack Developer proficient in React, Node.js, and PostgreSQL..."
 *     responses:
 *       202:
 *         description: ATS analysis successfully queued.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     atsResultId:
 *                       type: integer
 *       400:
 *         description: Invalid file format or missing resume.
 *       403:
 *         description: Daily analysis limit reached (5/day).
 */
atsRouter.post(
    '/analyze',
    authMiddleware,
    requireStudent,
    atsRateLimiter,
    atsUpload.single('resume'),
    requestAtsAnalysisController
);

/**
 * @swagger
 * /api/v1/students/ats/status/{id}:
 *   get:
 *     summary: Poll ATS analysis status
 *     description: Get the current status (PENDING, PROCESSING, COMPLETED, FAILED) of a specific analysis.
 *     tags: [ATS]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the ATSResult record.
 *     responses:
 *       200:
 *         description: Status fetched successfully.
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
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [PENDING, PROCESSING, COMPLETED, FAILED]
 *                     score:
 *                       type: number
 *                     analysisMode:
 *                       type: string
 *                       enum: [GENERIC, JD_MATCHED]
 *       404:
 *         description: Analysis report not found.
 */
atsRouter.get(
    '/status/:id',
    authMiddleware,
    requireStudent,
    getAtsStatusController
);

/**
 * @swagger
 * /api/v1/students/ats:
 *   get:
 *     summary: Fetch COMPLETED ATS analysis history
 *     description: Returns a paginated list of all successful ATS reports for the student.
 *     tags: [ATS]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated history fetched successfully.
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
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ATSResult'
 *                     total:
 *                       type: integer
 */
atsRouter.get('/', authMiddleware, requireStudent, getAtsResultsController);

/**
 * @swagger
 * /api/v1/students/ats/{id}:
 *   delete:
 *     summary: Hard delete an ATS report
 *     description: Permanently deletes a specific COMPLETED or FAILED ATS analysis report.
 *     tags: [ATS]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the ATSResult record.
 *     responses:
 *       200:
 *         description: ATS report deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "ATS report deleted successfully."
 *                 data:
 *                   type: null
 *       400:
 *         description: Invalid report ID provided.
 *       404:
 *         description: ATS analysis report not found.
 */
atsRouter.delete('/:id', authMiddleware, requireStudent, deleteAtsResultController);

export { atsRouter };


