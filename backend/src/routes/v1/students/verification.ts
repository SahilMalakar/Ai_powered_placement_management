import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireStudent } from "../../../middlewares/rbac.middleware.js";
import { initiateVerificationController } from "../../../modules/students/controllers/verification.controller.js";

const verificationRouter: Router = Router();

/**
 * Route to trigger student document verification.
 * Sets status to PROCESSING and kicks off extraction jobs.
 */
verificationRouter.post(
  "/verification",
  authMiddleware,
  requireStudent,
  initiateVerificationController
);

export { verificationRouter };
