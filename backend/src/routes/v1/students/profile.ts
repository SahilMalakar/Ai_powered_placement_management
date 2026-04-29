import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireStudent } from '../../../middlewares/rbac.middleware.js';
import { validateRequest } from '../../../middlewares/validate.middlware.js';
import { CreateProfileSchema, UpdateProfileSchema } from '../../../types/students/profile.js';
import {
    createStudentProfileController,
    getStudentProfileController,
    updateStudentProfileController,
    getAcademicRecordController,
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
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Profile fetched successfully",
 *                 "data": {
 *                   "id": 1,
 *                   "fullName": "Sahil Malakar",
 *                   "branch": "ETE",
 *                   "rollNo": "22/211",
 *                   "dob": "2002-07-02",
 *                   "phoneNumber": "9876543210",
 *                   "university": "AEC",
 *                   "degree": "B.Tech",
 *                   "graduationYear": 2024
 *                 }
 *               }
 */
profileRouter.get(
    '/',
    authMiddleware,
    requireStudent,
    getStudentProfileController
);

/**
 * @swagger
 * /api/v1/students/profile/academic:
 *   get:
 *     summary: Fetch verified academic records (CGPA, SGPAs)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Academic records fetched successfully
 */
profileRouter.get(
    '/academic',
    authMiddleware,
    requireStudent,
    getAcademicRecordController
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
 *             required: [fullName, branch, rollNo, dob, phoneNumber, university, degree, graduationYear]
 *             properties:
 *               fullName: { type: string, example: "Sahil Malakar" }
 *               branch: { type: string, example: "ETE" }
 *               rollNo: { type: string, example: "22/211" }
 *               dob: { type: string, format: date, example: "2002-07-02" }
 *               phoneNumber: { type: string, example: "9876543210" }
 *               university: { type: string, example: "Assam Engineering College, Guwahati" }
 *               degree: { type: string, example: "B.Tech" }
 *               graduationYear: { type: number, example: 2024 }
 *               summary: { type: string, example: "Final-year ECE student focused on backend systems." }
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Profile created successfully",
 *                 "data": {
 *                   "id": 1,
 *                   "fullName": "Sahil Malakar",
 *                   "branch": "ETE",
 *                   "rollNo": "22/211",
 *                   "dob": "2002-07-02",
 *                   "phoneNumber": "9876543210",
 *                   "university": "AEC",
 *                   "degree": "B.Tech",
 *                   "graduationYear": 2024
 *                 }
 *               }
 *       400:
 *         description: Bad Request - Missing required fields or invalid format
 */
profileRouter.post(
    '/',
    authMiddleware,
    requireStudent,
    validateRequest(CreateProfileSchema),
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
 *               fullName: { type: string, example: "Sahil Malakar" }
 *               summary: { type: string, example: "Updated summary info." }
 *               phoneNumber: { type: string, example: "9876543211" }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Profile updated successfully",
 *                 "data": {
 *                   "id": 1,
 *                   "fullName": "Sahil Malakar",
 *                   "branch": "ETE",
 *                   "rollNo": "22/211",
 *                   "dob": "2002-07-02",
 *                   "phoneNumber": "9876543210",
 *                   "university": "AEC",
 *                   "degree": "B.Tech",
 *                   "graduationYear": 2024
 *                 }
 *               }
 *       403:
 *         description: Forbidden - Profile is locked during verification
 */
profileRouter.patch(
    '/',
    authMiddleware,
    requireStudent,
    validateRequest(UpdateProfileSchema),
    updateStudentProfileController
);

export { profileRouter };
