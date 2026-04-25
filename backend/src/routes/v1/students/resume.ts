import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireStudent } from '../../../middlewares/rbac.middleware.js';
import {
    generateResumeController,
    getResumeByIdController,
    getStudentResumesController,
    updateResumeController,
    exportResumeController,
} from '../../../modules/students/controllers/resume.controller.js';

/**
 * @swagger
 * tags:
 *   name: Resumes
 *   description: Student resume management
 */

const resumeRouter: Router = Router();

/**
 * @swagger
 * /api/v1/students/resumes/generate:
 *   post:
 *     summary: Generate a new AI-powered resume
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       202:
 *         description: Resume generation successfully queued
 */
resumeRouter.post(
    '/resumes/generate',
    authMiddleware,
    requireStudent,
    generateResumeController
);

/**
 * @swagger
 * /api/v1/students/resumes:
 *   get:
 *     summary: Fetch all resumes for the authenticated student
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Resumes fetched successfully
 */
resumeRouter.get(
    '/resumes/',
    authMiddleware,
    requireStudent,
    getStudentResumesController
);

/**
 * @swagger
 * /api/v1/students/resumes/{id}:
 *   get:
 *     summary: Fetch a single resume by its unique ID
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The resume ID
 *     responses:
 *       200:
 *         description: Resume fetched successfully
 */
resumeRouter.get(
    '/resumes/:id',
    authMiddleware,
    requireStudent,
    getResumeByIdController
);

/**
 * @swagger
 * /api/v1/students/resumes/{id}:
 *   patch:
 *     summary: Update the JSON content of a student's resume
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The resume ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetRole, name, summary, skills]
 *             properties:
 *               targetRole: { type: string, example: "Full Stack Developer" }
 *               name: { type: string, example: "John Doe" }
 *               summary: { type: string, example: "Experienced developer with expertise in React, Node.js and Cloud Technologies." }
 *               contact:
 *                 type: object
 *                 properties:
 *                   email: { type: string, example: "john@example.com" }
 *                   phone: { type: string, example: "9876543210" }
 *                   linkedin: { type: string, example: "https://linkedin.com/in/johndoe" }
 *                   github: { type: string, example: "https://github.com/johndoe" }
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     category: { type: string, example: "Technical Skills" }
 *                     items: { type: array, items: { type: string }, example: ["Node.js", "React", "Prisma"] }
 *               workExperience:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title: { type: string, example: "Software Engineer Intern" }
 *                     company: { type: string, example: "Google" }
 *                     dateRange: { type: string, example: "Jun 2023 - Aug 2023" }
 *                     bullets: { type: array, items: { type: string }, example: ["Optimized search latency", "Built dashboard"] }
 *               projects:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title: { type: string, example: "E-commerce Platform" }
 *                     techStack: { type: array, items: { type: string }, example: ["React", "Stripe"] }
 *                     bullets: { type: array, items: { type: string }, example: ["Integrated payment gateway"] }
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     institution: { type: string, example: "ASTU" }
 *                     degree: { type: string, example: "B.Tech" }
 *                     dateRange: { type: string, example: "2020 - 2024" }
 *               additionalDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title: { type: string, example: "Certifications" }
 *                     description: { type: array, items: { type: string }, example: ["AWS Certified Developer"] }
 *     responses:
 *       200:
 *         description: Resume updated successfully
 */
resumeRouter.patch(
    '/resumes/:id',
    authMiddleware,
    requireStudent,
    updateResumeController
);

/**
 * @swagger
 * /api/v1/students/resumes/{id}/export:
 *   get:
 *     summary: Initiate PDF export for a resume
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The resume ID
 *     responses:
 *       202:
 *         description: Resume export successfully queued
 */
resumeRouter.get(
    '/resumes/:id/export',
    authMiddleware,
    requireStudent,
    exportResumeController
);

export { resumeRouter };
