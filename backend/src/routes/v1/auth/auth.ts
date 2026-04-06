import { Router } from "express";
import { validateRequest } from "../../../middlewares/validate.middlware.js";
import {  changePasswordSchma, forgetPasswordSchema, loginSchema, resetPasswordSchema, signupSchema } from "../../../types/auth.js";
import { changePasswordController, forgetPasswordController, loginController, logoutController, meController, refreshTokenController, resetPasswordController, signupController } from "../../../modules/auth/controllers/auth.controller.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { authRateLimit } from "../../../configs/auth.rateLimit.js";

const authRouter: Router = Router();

authRouter.post(
    "/signup",
    authRateLimit,
    validateRequest(signupSchema),
    signupController
);

authRouter.post(
    "/login",
    authRateLimit,
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

authRouter.patch(
    "/change-password",
    authMiddleware,
    validateRequest(changePasswordSchma),
    changePasswordController
)

authRouter.post(
    "/forget-password",
    validateRequest(forgetPasswordSchema),
    forgetPasswordController
)

authRouter.patch(
    "/reset-password",
    validateRequest(resetPasswordSchema),
    resetPasswordController
)

authRouter.post(
    "/refresh-token",
    refreshTokenController
)

export { authRouter };