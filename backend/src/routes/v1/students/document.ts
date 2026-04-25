import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireStudent } from '../../../middlewares/rbac.middleware.js';
import { documentUpload } from '../../../utils/fileHandler/multer.js';
import {
    uploadDocumentsController,
    deleteDocumentController,
} from '../../../modules/students/controllers/document.controller.js';

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Student document management
 */

const documentRouter: Router = Router();

/**
 * @swagger
 * /api/v1/students/documents:
 *   post:
 *     summary: Bulk upload student documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sem1: { type: string, format: binary }
 *               sem2: { type: string, format: binary }
 *               sem3: { type: string, format: binary }
 *               sem4: { type: string, format: binary }
 *               sem5: { type: string, format: binary }
 *               sem6: { type: string, format: binary }
 *               sem7: { type: string, format: binary }
 *               sem8: { type: string, format: binary }
 *               other: { type: string, format: binary }
 *     responses:
 *       202:
 *         description: Document upload successfully queued
 */
documentRouter.post(
    '/documents',
    authMiddleware,
    requireStudent,
    documentUpload.fields([
        { name: 'sem1', maxCount: 1 },
        { name: 'sem2', maxCount: 1 },
        { name: 'sem3', maxCount: 1 },
        { name: 'sem4', maxCount: 1 },
        { name: 'sem5', maxCount: 1 },
        { name: 'sem6', maxCount: 1 },
        { name: 'sem7', maxCount: 1 },
        { name: 'sem8', maxCount: 1 },
        { name: 'other', maxCount: 1 },
    ]),
    uploadDocumentsController
);

/**
 * @swagger
 * /api/v1/students/documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 */
documentRouter.delete(
    '/documents/:id',
    authMiddleware,
    requireStudent,
    deleteDocumentController
);

export { documentRouter };
