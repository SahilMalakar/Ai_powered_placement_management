import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireStudent } from "../../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middlware.js";
import { socialLinkSchema, updateSocialLinkSchema } from "../../../types/students/profile.js";
import { 
    addSocialLinkController, 
    deleteSocialLinkController, 
    getSocialLinksController, 
    updateSocialLinkController 
} from "../../../modules/students/controllers/socialLink.controller.js";

const socialLinkRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Social Links
 *   description: Student social link management
 */

socialLinkRouter.use(authMiddleware, requireStudent);

/**
 * @swagger
 * /api/v1/students/profile/socialLink:
 *   get:
 *     summary: Fetch all social links for the logged-in student
 *     tags: [Social Links]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of social links fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Social links fetched successfully",
 *                 "data": [
 *                   {
 *                     "id": 1,
 *                     "platform": "LinkedIn",
 *                     "url": "https://linkedin.com/in/johndoe",
 *                     "profileId": 1
 *                   }
 *                 ]
 *               }
 *       404:
 *         description: Profile not found
 */
socialLinkRouter.get("/", getSocialLinksController);

/**
 * @swagger
 * /api/v1/students/profile/socialLink:
 *   post:
 *     summary: Add a new social link
 *     tags: [Social Links]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [platform, url]
 *             properties:
 *               platform: { type: string, example: "LinkedIn" }
 *               url: { type: string, example: "https://linkedin.com/in/johndoe" }
 *     responses:
 *       201:
 *         description: Social link added successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Social link added successfully",
 *                 "data": {
 *                   "id": 1,
 *                   "platform": "LinkedIn",
 *                   "url": "https://linkedin.com/in/johndoe",
 *                   "profileId": 1
 *                 }
 *               }
 *       403:
 *         description: Profile is locked during verification
 *       404:
 *         description: Profile not found
 */
socialLinkRouter.post("/", validateRequest(socialLinkSchema), addSocialLinkController);

/**
 * @swagger
 * /api/v1/students/profile/socialLink/{id}:
 *   patch:
 *     summary: Update an existing social link
 *     tags: [Social Links]
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
 *               platform: { type: string, example: "GitHub" }
 *               url: { type: string, example: "https://github.com/johndoe" }
 *     responses:
 *       200:
 *         description: Social link updated successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Social link updated successfully",
 *                 "data": {
 *                   "id": 1,
 *                   "platform": "LinkedIn",
 *                   "url": "https://linkedin.com/in/johndoe",
 *                   "profileId": 1
 *                 }
 *               }
 *       403:
 *         description: Forbidden - not owner or profile locked
 *       404:
 *         description: Social link not found
 */
socialLinkRouter.patch("/:id", validateRequest(updateSocialLinkSchema), updateSocialLinkController);

/**
 * @swagger
 * /api/v1/students/profile/socialLink/{id}:
 *   delete:
 *     summary: Delete a social link
 *     tags: [Social Links]
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
 *         description: Social link deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Social link deleted successfully",
 *                 "data": null
 *               }
 *       403:
 *         description: Forbidden - not owner or profile locked
 *       404:
 *         description: Social link not found
 */
socialLinkRouter.delete("/:id", deleteSocialLinkController);

export { socialLinkRouter };
