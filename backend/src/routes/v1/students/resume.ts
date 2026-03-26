import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireStudent } from "../../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middlware.js";
import { requestResumeSchema } from "../../../types/students/resume.js";
import { generateResumeController, getResumeByIdController, getStudentResumesController, updateResumeController, exportResumeController } from "../../../modules/students/controllers/resume.controller.js";

const resumeRouter: Router = Router();


resumeRouter.post(
  "/generate",
  authMiddleware,
  requireStudent,
  validateRequest(requestResumeSchema),
  generateResumeController
);

resumeRouter.get(
  "/",
  authMiddleware,
  requireStudent,
  getStudentResumesController
);

resumeRouter.get(
  "/:id",
  authMiddleware,
  requireStudent,
  getResumeByIdController
);

resumeRouter.patch(
  "/:id",
  authMiddleware,
  requireStudent,
  updateResumeController 
);

resumeRouter.get(
  "/:id/export",
  authMiddleware,
  requireStudent,
  exportResumeController
);

export { resumeRouter };
