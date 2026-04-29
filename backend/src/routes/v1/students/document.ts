import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireStudent } from '../../../middlewares/rbac.middleware.js';
import { documentUpload } from '../../../utils/fileHandler/multer.js';
import { validateRequest } from '../../../middlewares/validate.middlware.js';
import { uploadDocumentSchema } from '../../../types/students/document.js';
import {
    getDocumentsController,
    uploadDocumentController,
    deleteDocumentController,
} from '../../../modules/students/controllers/document.controller.js';

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Student document (Marksheets & Certificates) management
 */

const documentRouter: Router = Router();

// Apply student authorization to all document routes
documentRouter.use(authMiddleware, requireStudent);

/**
 * @swagger
 * /api/v1/students/document:
 *   get:
 *     summary: Fetch all documents for the logged-in student
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of documents fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "List of documents fetched successfully",
 *                 "data": [
 *                   {
 *                     "id": 1,
 *                     "type": "SGPA",
 *                     "semester": 1,
 *                     "fileUrl": "...",
 *                     "status": "VERIFIED"
 *                   }
 *                 ]
 *               }
 */
documentRouter.get('/', getDocumentsController);

/**
 * @swagger
 * /api/v1/students/document:
 *   post:
 *     summary: Upload a single student document (SGPA or OTHER)
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
 *             required: [type, file]
 *             properties:
 *               type: 
 *                 type: string
 *                 enum: [SGPA, OTHER]
 *                 description: "The type of document"
 *               semester:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 8
 *                 description: "Required if type is SGPA"
 *               file: 
 *                 type: string
 *                 format: binary
 *                 description: "The document file (PDF, DOC, DOCX allowed)"
 *     responses:
 *       202:
 *         description: Document upload successfully queued for background processing
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Document upload successfully queued for background processing",
 *                 "data": null
 *               }
 *       400:
 *         description: Validation error or missing file
 *       403:
 *         description: Forbidden - profile is locked during verification
 */
documentRouter.post(
    '/',
    documentUpload.single('file'), // Expecting single file under 'file' key
    validateRequest(uploadDocumentSchema),
    uploadDocumentController
);

/**
 * @swagger
 * /api/v1/students/document/{id}:
 *   delete:
 *     summary: Delete a specific document
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
 *         description: The database ID of the document
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "success": true,
 *                 "message": "Document deleted successfully",
 *                 "data": null
 *               }
 *       403:
 *         description: Forbidden - not owner or profile locked
 *       404:
 *         description: Document not found
 */
documentRouter.delete(
    '/:id',
    deleteDocumentController
);

export { documentRouter };
