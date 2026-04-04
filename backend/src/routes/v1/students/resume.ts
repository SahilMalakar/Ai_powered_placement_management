import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireStudent } from "../../../middlewares/rbac.middleware.js";
import { generateResumeController, getResumeByIdController, getStudentResumesController, updateResumeController, exportResumeController } from "../../../modules/students/controllers/resume.controller.js";

const resumeRouter: Router = Router();


resumeRouter.post(
  "/resumes/generate",
  authMiddleware,
  requireStudent,
  generateResumeController
);

resumeRouter.get(
  "/resumes/",
  authMiddleware,
  requireStudent,
  getStudentResumesController
);

resumeRouter.get(
  "/resumes/:id",
  authMiddleware,
  requireStudent,
  getResumeByIdController
);

resumeRouter.patch(
  "/resumes/:id",
  authMiddleware,
  requireStudent,
  updateResumeController 
);

resumeRouter.get(
  "/resumes/:id/export",
  authMiddleware,
  requireStudent,
  exportResumeController
);

export { resumeRouter };
