import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireStudent } from "../../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middlware.js";
import { additionalDetailSchema, updateAdditionalDetailSchema } from "../../../types/students/profile.js";
import { 
    addAdditionalDetailController, 
    deleteAdditionalDetailController, 
    getAdditionalDetailsController, 
    updateAdditionalDetailController 
} from "../../../modules/students/controllers/additionalDetail.controller.js";

const additionalDetailRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Additional Details
 *   description: Student additional detail management
 */

additionalDetailRouter.use(authMiddleware, requireStudent);

/**
 * @swagger
 * /api/v1/students/additional-detail:
 *   get:
 *     summary: Fetch all additional details for the logged-in student
 *     tags: [Additional Details]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of additional details fetched successfully
 *       404:
 *         description: Profile not found
 */
additionalDetailRouter.get("/additionals", getAdditionalDetailsController);

/**
 * @swagger
 * /api/v1/students/additional-detail:
 *   post:
 *     summary: Add a new additional detail
 *     tags: [Additional Details]
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
 *               title: { type: string, example: "OpenSource Contribution" }
 *               description:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Contributed to React core team", "Fixed a major bug in the router"]
 *               date: { type: string, format: date, example: "2025-01-01" }
 *     responses:
 *       201:
 *         description: Additional detail added successfully
 *       403:
 *         description: Profile is locked during verification
 *       404:
 *         description: Profile not found
 */
additionalDetailRouter.post("/additionals", validateRequest(additionalDetailSchema), addAdditionalDetailController);

/**
 * @swagger
 * /api/v1/students/additional-detail/{id}:
 *   patch:
 *     summary: Update an existing additional detail
 *     tags: [Additional Details]
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
 *               title: { type: string, example: "OpenSource Contributions" }
 *               description:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Contributed to Next.js", "Fixed a major bug"]
 *               date: { type: string, format: date, example: "2025-02-01" }
 *     responses:
 *       200:
 *         description: Additional detail updated successfully
 *       403:
 *         description: Forbidden - not owner or profile locked
 *       404:
 *         description: Additional detail not found
 */
additionalDetailRouter.patch("/additionals/:id", validateRequest(updateAdditionalDetailSchema), updateAdditionalDetailController);

/**
 * @swagger
 * /api/v1/students/additional-detail/{id}:
 *   delete:
 *     summary: Delete an additional detail
 *     tags: [Additional Details]
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
 *         description: Additional detail deleted successfully
 *       403:
 *         description: Forbidden - not owner or profile locked
 *       404:
 *         description: Additional detail not found
 */
additionalDetailRouter.delete("/additionals/:id", deleteAdditionalDetailController);

export { additionalDetailRouter };
