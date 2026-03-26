import { Router } from "express";
import { authRouter } from "./auth/auth.js";
import { profileRouter } from "./students/profile.js";

const router:Router = Router();

// mount modules
router.use("/v1/auth", authRouter);
router.use("/v1/students",profileRouter);

export  {router};
