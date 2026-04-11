import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireStudent } from '../../../middlewares/rbac.middleware.js';
import { documentUpload } from '../../../utils/fileHandler/multer.js';
import {
    uploadDocumentsController,
    deleteDocumentController,
} from '../../../modules/students/controllers/document.controller.js';

const documentRouter: Router = Router();

// Route to handle bulk upload of semester marksheets, CGPA, and other certificates.
// Expects multipart/form-data with fields: sem1..sem8, cgpa, other.
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

// Route to manually delete a document and its Cloudinary resource.
documentRouter.delete(
    '/documents/:id',
    authMiddleware,
    requireStudent,
    deleteDocumentController
);

export { documentRouter };
