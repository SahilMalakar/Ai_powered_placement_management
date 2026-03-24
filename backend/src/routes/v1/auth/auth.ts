import { Router } from "express";
import { validateRequest } from "../../../middlewares/validate.middlware.js";
import { loginSchema, signupSchema } from "../../../types/auth.js";
import { loginController, logoutController, meController, signupController } from "../../../modules/admin/controllers/auth.controller.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";

const authRouter: Router = Router();

authRouter.post(
    "/signup",
    validateRequest(signupSchema),
    signupController
);

authRouter.post(
    "/login",
    validateRequest(loginSchema),
    loginController
)

authRouter.get(
    "/me",
    authMiddleware,
    meController
);

authRouter.post(
    "/logout",
    authMiddleware,
    logoutController
)

export { authRouter };