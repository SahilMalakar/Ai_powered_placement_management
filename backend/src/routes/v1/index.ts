import { Router } from "express";
import { authRouter } from "./auth/auth.js";
import { profileRouter } from "./students/profile.js";
import { resumeRouter } from "./students/resume.js";
import { jobRouter } from "./admin/job.js";
import { atsRouter } from "./students/ats.js";

const router: Router = Router();

router.use("/v1/auth", authRouter);
router.use("/v1/students", profileRouter);
router.use("/v1/students", resumeRouter);
router.use("/v1/students", atsRouter);
router.use("/v1/admin", jobRouter);

export  {router};
