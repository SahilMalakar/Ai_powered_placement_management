import { Router } from "express";
import { authMiddleware } from "../../../shared/middlewares/auth.middleware.js";
import { requireStudent } from "../../../shared/middlewares/rbac.middleware.js";
import { validateRequest } from "../../../shared/middlewares/validate.middlware.js";
import { skillSchema, updateSkillSchema } from "../../../shared/types/students/profile.js";
import { 
    addSkillController, 
    deleteSkillController,  
    getSkillsController, 
    updateSkillController 
} from "../../../modules/students/controllers/skill.controller.js";

const skillRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Skills
 *   description: Student skill management
 */

skillRouter.use(authMiddleware, requireStudent);

/**
 * @swagger
 * /api/v1/students/profile/skill:
 *   get:
 *     summary: Fetch all skills for the logged-in student
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of skills fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Skills fetched successfully",
 *                 "data": [
 *                   {
 *                     "id": 1,
 *                     "category": "Languages",
 *                     "skills": [
 *                       "JavaScript",
 *                       "TypeScript",
 *                       "Python"
 *                     ],
 *                     "profileId": 1
 *                   }
 *                 ]
 *               }
 *       404:
 *         description: Profile not found
 */
skillRouter.get("/", getSkillsController);

/**
 * @swagger
 * /api/v1/students/profile/skill:
 *   post:
 *     summary: Add a new skill category and skills
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, skills]
 *             properties:
 *               category: { type: string, example: "Languages" }
 *               skills:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["JavaScript", "TypeScript", "Python"]
 *     responses:
 *       201:
 *         description: Skill added successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Skill added successfully",
 *                 "data": {
 *                   "id": 1,
 *                   "category": "Languages",
 *                   "skills": [
 *                     "JavaScript",
 *                     "TypeScript",
 *                     "Python"
 *                   ],
 *                   "profileId": 1
 *                 }
 *               }
 *       403:
 *         description: Profile is locked during verification
 *       404:
 *         description: Profile not found
 */
skillRouter.post("/", validateRequest(skillSchema), addSkillController);

/**
 * @swagger
 * /api/v1/students/profile/skill/{id}:
 *   patch:
 *     summary: Update an existing skill
 *     tags: [Skills]
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
 *               category: { type: string, example: "Programming Languages" }
 *               skills:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["JavaScript", "TypeScript", "Python", "Go"]
 *     responses:
 *       200:
 *         description: Skill updated successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Skill updated successfully",
 *                 "data": {
 *                   "id": 1,
 *                   "category": "Languages",
 *                   "skills": [
 *                     "JavaScript",
 *                     "TypeScript",
 *                     "Python"
 *                   ],
 *                   "profileId": 1
 *                 }
 *               }
 *       403:
 *         description: Forbidden - not owner or profile locked
 *       404:
 *         description: Skill not found
 */
skillRouter.patch("/:id", validateRequest(updateSkillSchema), updateSkillController);

/**
 * @swagger
 * /api/v1/students/profile/skill/{id}:
 *   delete:
 *     summary: Delete a skill
 *     tags: [Skills]
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
 *         description: Skill deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Skill deleted successfully",
 *                 "data": null
 *               }
 *       403:
 *         description: Forbidden - not owner or profile locked
 *       404:
 *         description: Skill not found
 */
skillRouter.delete("/:id", deleteSkillController);

export { skillRouter };
