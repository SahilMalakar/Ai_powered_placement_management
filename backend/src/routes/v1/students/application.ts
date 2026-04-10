import { Router } from "express";
import { applyToJobController } from "../../../modules/students/controllers/application.controller.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireStudent } from "../../../middlewares/rbac.middleware.js";
import { validateParams, validateRequest } from "../../../middlewares/validate.middlware.js";
import { applicationRateLimiter } from "../../../middlewares/rateLimit.middleware.js";
import { applyToJobParamsSchema, applyToJobBodySchema } from "../../../types/students/application.js";

const router: Router = Router();

router.post(
  "/jobs/:jobId/apply",
  authMiddleware,
  requireStudent,
  applicationRateLimiter,
  validateParams(applyToJobParamsSchema),
  validateRequest(applyToJobBodySchema),
  applyToJobController
);

export { router as applicationRouter };
