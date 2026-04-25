import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireStudent } from '../../../middlewares/rbac.middleware.js';
import { validateRequest } from '../../../middlewares/validate.middlware.js';
import {
    createProfileSchema,
    updateProfileSchema,
} from '../../../types/students/profile.js';
import {
    createStudentProfileController,
    getStudentProfileController,
    updateProfileController,
} from '../../../modules/students/controllers/student.controller.js';

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: Student profile management
 */

const profileRouter: Router = Router();

/**
 * @swagger
 * /api/v1/students/profile:
 *   get:
 *     summary: Fetch student profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 */
profileRouter.get(
    '/profile',
    authMiddleware,
    requireStudent,
    getStudentProfileController
);

/**
 * @swagger
 * /api/v1/students/profile:
 *   post:
 *     summary: Create student profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - core
 *             properties:
 *               core:
 *                 type: object
 *                 required: [fullName, branch, rollNo, dob, phoneNumber]
 *                 properties:
 *                   fullName: { type: string, example: "John Doe" }
 *                   branch: { type: string, example: "CSE" }
 *                   rollNo: { type: string, example: "CSE/20/01" }
 *                   dob: { type: string, format: date, example: "2002-01-01" }
 *                   phoneNumber: { type: string, example: "9876543210" }
 *                   summary: { type: string, example: "Aspiring Full Stack Developer" }
 *                   university: { type: string, example: "Assam Science and Technology University" }
 *                   degree: { type: string, example: "B.Tech" }
 *                   graduationYear: { type: number, example: 2024 }
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     platform: { type: string, example: "LinkedIn" }
 *                     url: { type: string, example: "https://linkedin.com/in/johndoe" }
 *               experiences:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, example: "Frontend Intern" }
 *                     company: { type: string, example: "Tech Corp" }
 *                     startDate: { type: string, format: date, example: "2023-06-01" }
 *                     description: { type: array, items: { type: string }, example: ["Developed UI components", "Fixed bugs"] }
 *               projects:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title: { type: string, example: "Placement Portal" }
 *                     description: { type: array, items: { type: string }, example: ["Built using Node.js and React"] }
 *                     keyTools: { type: string, example: "React, Node.js, Prisma" }
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     category: { type: string, example: "Languages" }
 *                     skills: { type: array, items: { type: string }, example: ["JavaScript", "TypeScript"] }
 *               additionalDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title: { type: string, example: "Open Source Contributor" }
 *                     description: { type: array, items: { type: string }, example: ["Contributed to React core"] }
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Bad Request - Restricted academic fields provided
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
profileRouter.post(
    '/profile',
    authMiddleware,
    requireStudent,
    validateRequest(createProfileSchema),
    createStudentProfileController
);

/**
 * @swagger
 * /api/v1/students/profile:
 *   patch:
 *     summary: Update student profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               core:
 *                 type: object
 *                 properties:
 *                   fullName: { type: string, example: "John Smith" }
 *                   summary: { type: string, example: "Updated summary info" }
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     platform: { type: string }
 *                     url: { type: string }
 *               experiences:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string }
 *                     company: { type: string }
 *               projects:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title: { type: string }
 *                     keyTools: { type: string }
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     category: { type: string }
 *                     skills: { type: array, items: { type: string } }
 *               additionalDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title: { type: string }
 *                     description: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad Request - Restricted academic fields provided
 *       403:
 *         description: Forbidden - Profile is locked during verification processing
 */
profileRouter.patch(
    '/profile',
    authMiddleware,
    requireStudent,
    validateRequest(updateProfileSchema),
    updateProfileController
);

export { profileRouter };
