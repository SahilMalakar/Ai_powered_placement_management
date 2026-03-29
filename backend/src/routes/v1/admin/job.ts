import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../../middlewares/rbac.middleware.js";
import { validateParams, validateRequest } from "../../../middlewares/validate.middlware.js";
import { createJobSchema, updateJobSchema } from "../../../types/admin/job.js";
import { createJobController, updateJobByIdController } from "../../../modules/admin/controllers/job.controller.js";
import { idSchema } from "../../../types/auth.js";

const jobRouter:Router = Router();

jobRouter.post(
    "/jobs",
    authMiddleware,
    requireAdmin,
    validateRequest(createJobSchema),
    createJobController
)

jobRouter.patch(
    "/jobs/:id",
    authMiddleware,
    requireAdmin,
    validateParams(idSchema),
    validateRequest(updateJobSchema),
    updateJobByIdController
)

export { jobRouter }