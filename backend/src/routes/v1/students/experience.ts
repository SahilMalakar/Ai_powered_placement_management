import { Router } from "express";
import { authMiddleware } from "../../../shared/middlewares/auth.middleware.js";
import { requireStudent } from "../../../shared/middlewares/rbac.middleware.js";
import { validateRequest } from "../../../shared/middlewares/validate.middlware.js";
import { experienceSchema, updateExperienceSchema } from "../../../shared/types/students/profile.js";
import { 
    addExperienceController, 
    deleteExperienceController, 
    getExperiencesController, 
    updateExperienceController 
} from "../../../modules/students/controllers/experience.controller.js";

const experienceRouter:Router = Router();

/**
 * @swagger
 * tags:
 *   name: Experiences
 *   description: Student work experience management
 */

experienceRouter.use(authMiddleware, requireStudent);

/**
 * @swagger
 * /api/v1/students/profile/experience:
 *   get:
 *     summary: Fetch all experiences for the logged-in student
 *     tags: [Experiences]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of experiences fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Experiences fetched successfully",
 *                 "data": [
 *                   {
 *                     "id": 1,
 *                     "role": "Backend Intern",
 *                     "company": "Google",
 *                     "location": "Bangalore",
 *                     "startDate": "2025-06-01",
 *                     "endDate": "2025-08-31",
 *                     "description": [
 *                       "Built REST APIs"
 *                     ],
 *                     "toolsUsed": "Node.js",
 *                     "profileId": 1
 *                   }
 *                 ]
 *               }
 *       404:
 *         description: Profile not found
 */
experienceRouter.get("/", getExperiencesController);

/**
 * @swagger
 * /api/v1/students/profile/experience:
 *   post:
 *     summary: Add a new work experience
 *     tags: [Experiences]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role, company, startDate, description]
 *             properties:
 *               role: { type: string, example: "Backend Intern" }
 *               company: { type: string, example: "Google" }
 *               location: { type: string, example: "Bangalore, India" }
 *               startDate: { type: string, format: date, example: "2025-06-01" }
 *               endDate: { type: string, format: date, example: "2025-08-31" }
 *               description:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Built REST APIs with Express and Prisma", "Wrote unit tests with Jest"]
 *               toolsUsed: { type: string, example: "Node.js, TypeScript, PostgreSQL" }
 *     responses:
 *       201:
 *         description: Experience added successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Experience added successfully",
 *                 "data": {
 *                   "id": 1,
 *                   "role": "Backend Intern",
 *                   "company": "Google",
 *                   "location": "Bangalore",
 *                   "startDate": "2025-06-01",
 *                   "endDate": "2025-08-31",
 *                   "description": [
 *                     "Built REST APIs"
 *                   ],
 *                   "toolsUsed": "Node.js",
 *                   "profileId": 1
 *                 }
 *               }
 *       403:
 *         description: Profile is locked during verification
 *       404:
 *         description: Profile not found
 */
experienceRouter.post("/", validateRequest(experienceSchema), addExperienceController);

/**
 * @swagger
 * /api/v1/students/profile/experience/{id}:
 *   patch:
 *     summary: Update an existing experience
 *     tags: [Experiences]
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
 *               role: { type: string, example: "Full Stack Intern" }
 *               company: { type: string, example: "Google" }
 *               location: { type: string, example: "Remote" }
 *               startDate: { type: string, format: date, example: "2025-06-01" }
 *               endDate: { type: string, format: date, example: "2025-12-31" }
 *               description:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Migrated monolith to microservices"]
 *               toolsUsed: { type: string, example: "Next.js, Go, gRPC" }
 *     responses:
 *       200:
 *         description: Experience updated successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Experience updated successfully",
 *                 "data": {
 *                   "id": 1,
 *                   "role": "Backend Intern",
 *                   "company": "Google",
 *                   "location": "Bangalore",
 *                   "startDate": "2025-06-01",
 *                   "endDate": "2025-08-31",
 *                   "description": [
 *                     "Built REST APIs"
 *                   ],
 *                   "toolsUsed": "Node.js",
 *                   "profileId": 1
 *                 }
 *               }
 *       403:
 *         description: Forbidden - not owner or profile locked
 *       404:
 *         description: Experience not found
 */
experienceRouter.patch("/:id", validateRequest(updateExperienceSchema), updateExperienceController);

/**
 * @swagger
 * /api/v1/students/profile/experience/{id}:
 *   delete:
 *     summary: Delete an experience
 *     tags: [Experiences]
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
 *         description: Experience deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Experience deleted successfully",
 *                 "data": null
 *               }
 *       403:
 *         description: Forbidden - not owner or profile locked
 *       404:
 *         description: Experience not found
 */
experienceRouter.delete("/:id", deleteExperienceController);

export { experienceRouter };
