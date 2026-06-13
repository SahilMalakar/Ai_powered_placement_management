import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { requireStudent } from '../../../shared/middlewares/rbac.middleware.js';
import {
    requestOptimizeResume,
    getAllResumes,
    getResumeById,
    deleteResume,
    getOptimizeResumeJobStatus,
} from '../../../modules/students/controllers/optimizeResume.controller.js';
import { BadRequestError } from '../../../shared/utils/errors/httpErrors.js';

const optimizeResumeUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new BadRequestError('Only PDF and DOCX files are allowed.'));
        }
    },
});

const optimizeResumeRouter: Router = Router();

optimizeResumeRouter.use(authMiddleware, requireStudent);

optimizeResumeRouter.post('/', optimizeResumeUpload.single('resume'), requestOptimizeResume);
optimizeResumeRouter.get('/jobs/:jobId/status', getOptimizeResumeJobStatus);
optimizeResumeRouter.get('/', getAllResumes);
optimizeResumeRouter.get('/:id', getResumeById);
optimizeResumeRouter.delete('/:id', deleteResume);

export { optimizeResumeRouter };
