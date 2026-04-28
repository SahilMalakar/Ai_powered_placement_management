import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireStudent } from "../../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middlware.js";
import { projectSchema, updateProjectSchema } from "../../../types/students/profile.js";
import { 
    addProjectController, 
    deleteProjectController, 
    getProjectsController, 
    updateProjectController 
} from "../../../modules/students/controllers/project.controller.js";

const projectRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Student project management
 */

projectRouter.use(authMiddleware, requireStudent);

/**
 * @swagger
 * /api/v1/students/project:
 *   get:
 *     summary: Fetch all projects for the logged-in student
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of projects fetched successfully
 *       404:
 *         description: Profile not found
 */
projectRouter.get("/projects", getProjectsController);

/**
 * @swagger
 * /api/v1/students/project:
 *   post:
 *     summary: Add a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title: { type: string, example: "E-commerce App" }
 *               description:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Built full stack app using Next.js", "Implemented Stripe for payments"]
 *               link: { type: string, example: "https://example.com" }
 *               secondaryLink: { type: string, example: "https://github.com/johndoe/repo" }
 *               keyTools: { type: string, example: "React, Node.js, MongoDB" }
 *               startDate: { type: string, format: date, example: "2025-01-01" }
 *               endDate: { type: string, format: date, example: "2025-03-31" }
 *     responses:
 *       201:
 *         description: Project added successfully
 *       403:
 *         description: Profile is locked during verification
 *       404:
 *         description: Profile not found
 */
projectRouter.post("/projects", validateRequest(projectSchema), addProjectController);

/**
 * @swagger
 * /api/v1/students/project/{id}:
 *   patch:
 *     summary: Update an existing project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, example: "Advanced E-commerce App" }
 *               description:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Migrated to PostgreSQL"]
 *               link: { type: string, example: "https://new-example.com" }
 *               keyTools: { type: string, example: "Next.js, Prisma, PostgreSQL" }
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       403:
 *         description: Forbidden - not owner or profile locked
 *       404:
 *         description: Project not found
 */
projectRouter.patch("/projects/:id", validateRequest(updateProjectSchema), updateProjectController);

/**
 * @swagger
 * /api/v1/students/project/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       403:
 *         description: Forbidden - not owner or profile locked
 *       404:
 *         description: Project not found
 */
projectRouter.delete("/projects/:id", deleteProjectController);

export { projectRouter };
