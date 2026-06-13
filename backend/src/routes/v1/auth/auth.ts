import { Router } from 'express';
import { validateRequest } from '../../../shared/middlewares/validate.middlware.js';
import {
    changePasswordSchma,
    forgetPasswordSchema,
    loginSchema,
    resetPasswordSchema,
    signupSchema,
} from '../../../shared/types/auth.js';
import {
    changePasswordController,
    forgetPasswordController,
    loginController,
    logoutController,
    meController,
    refreshTokenController,
    resetPasswordController,
    signupController,
} from '../../../modules/auth/controllers/auth.controller.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { authRateLimit } from '../../../shared/middlewares/rateLimit.middleware.js';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

const authRouter: Router = Router();

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: student@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "User created successfully",
 *                 "data": {
 *                   "id": 1,
 *                   "email": "student@example.com",
 *                   "role": "STUDENT"
 *                 }
 *               }
 */
authRouter.post(
    '/signup',
    authRateLimit,
    validateRequest(signupSchema),
    signupController
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: student@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful. Sets accessToken and refreshToken cookies.
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Login successful",
 *                 "data": {
 *                   "user": {
 *                     "id": 1,
 *                     "email": "student@example.com",
 *                     "role": "STUDENT"
 *                   },
 *                   "token": "..."
 *                 }
 *               }
 */
authRouter.post(
    '/login',
    authRateLimit,
    validateRequest(loginSchema),
    loginController
);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "User details fetched successfully",
 *                 "data": {
 *                   "id": 1,
 *                   "email": "student@example.com",
 *                   "role": "STUDENT"
 *                 }
 *               }
 */
authRouter.get('/me', authMiddleware, meController);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful. Clears auth cookies.
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Logout successful",
 *                 "data": null
 *               }
 */
authRouter.post('/logout', authMiddleware, logoutController);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   patch:
 *     summary: Change user password
 *     tags: [Auth]
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
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: Password123
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Password changed successfully",
 *                 "data": null
 *               }
 */
authRouter.patch(
    '/change-password',
    authMiddleware,
    validateRequest(changePasswordSchma),
    changePasswordController
);

/**
 * @swagger
 * /api/v1/auth/forget-password:
 *   post:
 *     summary: Forget password request
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: student@example.com
 *     responses:
 *       200:
 *         description: Reset email sent successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Reset email sent successfully",
 *                 "data": null
 *               }
 */
authRouter.post(
    '/forget-password',
    validateRequest(forgetPasswordSchema),
    forgetPasswordController
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   patch:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: student@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Password reset successfully",
 *                 "data": null
 *               }
 */
authRouter.patch(
    '/reset-password',
    validateRequest(resetPasswordSchema),
    resetPasswordController
);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Token refreshed successfully",
 *                 "data": {
 *                   "token": "..."
 *                 }
 *               }
 */
authRouter.post('/refresh-token', refreshTokenController);

export { authRouter };
