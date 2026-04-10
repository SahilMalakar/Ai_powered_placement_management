import { Router } from "express";
import { authRouter } from "./auth/auth.js";
import { profileRouter } from "./students/profile.js";
import { resumeRouter } from "./students/resume.js";
import { jobRouter } from "./admin/job.js";
import { atsRouter } from "./students/ats.js";
import { documentRouter } from "./students/document.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { getAllJobsController } from "../../modules/admin/controllers/job.controller.js";

const router: Router = Router();

router.use("/v1/auth", authRouter);
router.use("/v1/students", profileRouter);
router.use("/v1/students", resumeRouter);
router.use("/v1/students", atsRouter);
router.use("/v1/students", documentRouter);
router.use("/v1/admin", jobRouter);

// Publicly accessible for all authenticated roles
router.get("/v1/jobs", authMiddleware, getAllJobsController);

export  {router};
