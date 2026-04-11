import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireStudent } from '../../../middlewares/rbac.middleware.js';
import { atsUpload } from '../../../utils/fileHandler/multer.js';
import {
    requestAtsAnalysisController,
    getAtsResultsController,
} from '../../../modules/students/controllers/ats.controller.js';

const atsRouter: Router = Router();

// Endpoint to initiate an ATS Analysis.
// Method: POST /
// Auth: Student Only
// Input: multipart/form-data (resume file + jobDescription text)
atsRouter.post(
    '/ats',
    authMiddleware,
    requireStudent,
    atsUpload.single('resume'), // Field name in the form must be 'resume'
    requestAtsAnalysisController
);

// Endpoint to fetch student's own ATS analysis history.
// Method: GET /
atsRouter.get('/ats', authMiddleware, requireStudent, getAtsResultsController);

export { atsRouter };
