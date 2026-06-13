import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { requireAdmin } from '../../../shared/middlewares/rbac.middleware.js';
import {
    validateParams,
    validateRequest,
} from '../../../shared/middlewares/validate.middlware.js';
import { createJobSchema, updateJobSchema } from '../../../shared/types/admin/job.js';
import {
    createJobController,
    updateJobByIdController,
    activateJobController,
    deactivateJobController,
    getAllJobsController,
    getJobByIdController,
    deleteJobByIdController,
    getApplicationDashboardController,
} from '../../../modules/admin/controllers/job.controller.js';
import { getJobApplicantsController } from '../../../modules/admin/controllers/jobApplication.controller.js';
import { idSchema } from '../../../shared/types/auth.js';

/**
 * @swagger
 * tags:
 *   name: Admin Jobs
 *   description: Admin job management
 */

const jobRouter: Router = Router();

/**
 * @swagger
 * /api/v1/admin/job:
 *   get:
 *     summary: Fetch all available jobs
 *     tags: [Admin Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Jobs fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Jobs fetched successfully",
 *                 "data": [
 *                   {
 *                     "id": "abc",
 *                     "title": "Software Engineer",
 *                     "company": "Google",
 *                     "status": "ACTIVE"
 *                   }
 *                 ]
 *               }
 */
jobRouter.get('/',
    authMiddleware,
    getAllJobsController
);

/**
 * @swagger
 * /api/v1/admin/job/dashboard:
 *   get:
 *     summary: Get all jobs with per-status application counts for the admin dashboard
 *     tags: [Admin Jobs]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully
 */
jobRouter.get('/dashboard',
    authMiddleware,
    requireAdmin,
    getApplicationDashboardController
);

/**
 * @swagger
 * /api/v1/admin/job/{id}/applicants:
 *   get:
 *     summary: Get all applicants for a specific job (Admin Only)
 *     tags: [Admin - Job Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     responses:
 *       200:
 *         description: List of applicants with profile data
 *       404:
 *         description: Job not found
 */
jobRouter.get("/:id/applicants",
    validateParams(idSchema),
    authMiddleware,
    requireAdmin,
    getJobApplicantsController
);

/**
 * @swagger
 * /api/v1/admin/job/{id}:
 *   get:
 *     summary: Fetch a single job by ID
 *     tags: [Admin Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Job fetched successfully",
 *                 "data": {
 *                   "id": "abc",
 *                   "title": "Software Engineer",
 *                   "company": "Google",
 *                   "description": "Full Job Description...",
 *                   "status": "ACTIVE"
 *                 }
 *               }
 *       404:
 *         description: Job not found
 */
jobRouter.get('/:id',
    authMiddleware,
    validateParams(idSchema),
    getJobByIdController
);

/**
 * @swagger
 * /api/v1/admin/job:
 *   post:
 *     summary: Create a new job
 *     tags: [Admin Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, company, description, requiredCgpa, allowedBranches, backlogAllowed, deadline]
 *             properties:
 *               title: { type: string, example: "Software Engineer" }
 *               company: { type: string, example: "Google" }
 *               description: { type: string, example: "We are looking for a skilled Software Engineer to join our team..." }
 *               requiredCgpa: { type: number, example: 7.5 }
 *               allowedBranches: { type: array, items: { type: string }, example: ["CSE", "ECE", "ME"] }
 *               backlogAllowed: { type: boolean, example: false }
 *               deadline: { type: string, format: date-time, example: "2025-12-31T23:59:59Z" }
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Job created successfully",
 *                 "data": {
 *                   "id": "abc",
 *                   "title": "Software Engineer"
 *                 }
 *               }
 */
jobRouter.post(
    '/',
    authMiddleware,
    requireAdmin,
    validateRequest(createJobSchema),
    createJobController
);

/**
 * @swagger
 * /api/v1/admin/job/{id}:
 *   patch:
 *     summary: Update an existing job
 *     tags: [Admin Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, example: "Senior Software Engineer" }
 *               requiredCgpa: { type: number, example: 8.0 }
 *               backlogAllowed: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Job updated successfully",
 *                 "data": {
 *                   "id": "abc",
 *                   "title": "Senior Software Engineer"
 *                 }
 *               }
 */
jobRouter.patch(
    '/:id',
    authMiddleware,
    requireAdmin,
    validateParams(idSchema),
    validateRequest(updateJobSchema),
    updateJobByIdController
);

/**
 * @swagger
 * /api/v1/admin/job/{id}/activate:
 *   post:
 *     summary: Activate a job
 *     tags: [Admin Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job activated successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Job activated successfully",
 *                 "data": {
 *                   "id": "abc",
 *                   "status": "ACTIVE"
 *                 }
 *               }
 */
jobRouter.post(
    '/:id/activate',
    authMiddleware,
    requireAdmin,
    validateParams(idSchema),
    activateJobController
);

/**
 * @swagger
 * /api/v1/admin/job/{id}/deactivate:
 *   post:
 *     summary: Deactivate a job
 *     tags: [Admin Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deactivated successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Job deactivated successfully",
 *                 "data": {
 *                   "id": "abc",
 *                   "status": "DEACTIVE"
 *                 }
 *               }
 */
jobRouter.post(
    '/:id/deactivate',
    authMiddleware,
    requireAdmin,
    validateParams(idSchema),
    deactivateJobController
);

/**
 * @swagger
 * /api/v1/admin/job/{id}:
 *   delete:
 *     summary: Delete a job posting
 *     tags: [Admin Jobs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       404:
 *         description: Job not found
 */
jobRouter.delete(
    '/:id',
    authMiddleware,
    requireAdmin,
    validateParams(idSchema),
    deleteJobByIdController
);

export { jobRouter };
