import { Router } from "express";
import { authRouter } from "./auth/auth.js";

const router:Router = Router();

// mount modules
router.use("/v1/auth", authRouter);

export  {router};
