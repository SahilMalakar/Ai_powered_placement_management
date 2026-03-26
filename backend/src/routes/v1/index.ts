import { Router } from "express";
import { authRouter } from "./auth/auth.js";
import { profileRouter } from "./students/profile.js";
import { resumeRouter } from "./students/resume.js";

const router: Router = Router();

router.use("/v1/auth", authRouter);
router.use("/v1/students", profileRouter);
router.use("/v1/students/resumes", resumeRouter);

export  {router};
