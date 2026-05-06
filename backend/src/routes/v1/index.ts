import { Router } from 'express';
import { authRouter } from './auth/auth.js';
import { profileRouter } from './students/profile.js';
import { experienceRouter } from './students/experience.js';
import { socialLinkRouter } from './students/socialLink.js';
import { projectRouter } from './students/project.js';
import { skillRouter } from './students/skill.js';
import { additionalDetailRouter } from './students/additionalDetail.js';
import { resumeRouter } from './students/resume.js';
import { jobRouter } from './admin/job.js';
import { atsRouter } from './students/ats.js';
import { documentRouter } from './students/document.js';
import { verificationRouter } from './students/verification.js';
import { applicationRouter } from './students/application.js';
import studentRouter from './admin/students.js';

const router: Router = Router();

router.use('/v1/auth', authRouter);
router.use('/v1/students/profile', profileRouter);
router.use('/v1/students/profile/experience', experienceRouter);
router.use('/v1/students/profile/socialLink', socialLinkRouter);
router.use('/v1/students/profile/project', projectRouter);
router.use('/v1/students/profile/skill', skillRouter);
router.use('/v1/students/profile/additionalDetail', additionalDetailRouter);
router.use('/v1/students/resume', resumeRouter);
router.use('/v1/students/ats', atsRouter);
router.use('/v1/students/document', documentRouter);
router.use('/v1/students/verification', verificationRouter);
router.use('/v1/students/application', applicationRouter);
router.use('/v1/admin/job', jobRouter);
router.use("/v1/admin/students",studentRouter)

export { router };
