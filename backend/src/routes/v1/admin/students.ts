import { Router } from 'express';
import { getAllStudentsController, getStudentByIdController, softDeleteStudentController } from '../../../modules/admin/controllers/students.controller.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireAdmin, requireSuperAdmin } from '../../../middlewares/rbac.middleware.js';
import { validateParams } from '../../../middlewares/validate.middlware.js';
import { idSchema } from '../../../types/auth.js';

const studentRouter: Router = Router();

/**
 * @swagger
 * /v1/admin/students:
 *   get:
 *     summary: Get all students (Admin Only)
 *     description: Fetch a paginated list of all students with advanced filtering for branch, CGPA, and verification status.
 *     tags: [Admin - Student Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or roll number
 *       - in: query
 *         name: branch
 *         schema:
 *           $ref: '#/components/schemas/Branch'
 *       - in: query
 *         name: verificationStatus
 *         schema:
 *           $ref: '#/components/schemas/VerificationStatus'
 *       - in: query
 *         name: backlogAllowed
 *         schema:
 *           type: boolean
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
 *         description: Successfully fetched students
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
 *                     student:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
studentRouter.get("/",
    authMiddleware,
    requireAdmin,
    getAllStudentsController
)


/**
 * @swagger
 * /v1/admin/students/{id}:
 *   get:
 *     summary: Get complete student profile (Admin Only)
 *     tags: [Admin - Student Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Full student data including academic records and applications.
 */
studentRouter.get("/:id",
    validateParams(idSchema),
    authMiddleware,
    requireAdmin,
    getStudentByIdController
);


/**
 * @swagger
 * /v1/admin/students/{id}:
 *   delete:
 *     summary: Soft delete/Ban a student account (Super Admin Only)
 *     tags: [Admin - Student Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student account deactivated successfully
 */
studentRouter.delete("/:id",
    validateParams(idSchema),
    authMiddleware,
    requireSuperAdmin,
    softDeleteStudentController
)

export default studentRouter;