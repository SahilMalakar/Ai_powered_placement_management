import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireStudent } from '../../../middlewares/rbac.middleware.js';
import { validateRequest } from '../../../middlewares/validate.middlware.js';
import {
    createProfileSchema,
    updateProfileSchema,
} from '../../../types/students/profile.js';
import {
    createStudentProfileController,
    getStudentProfileController,
    updateProfileController,
} from '../../../modules/students/controllers/student.controller.js';

const profileRouter: Router = Router();

profileRouter.patch(
    '/profile',
    authMiddleware,
    requireStudent,
    validateRequest(updateProfileSchema),
    updateProfileController
);

profileRouter.get(
    '/profile',
    authMiddleware,
    requireStudent,
    getStudentProfileController
);

profileRouter.post(
    '/profile',
    authMiddleware,
    requireStudent,
    validateRequest(createProfileSchema),
    createStudentProfileController
);

export { profileRouter };
