import { sendSuccess } from "../../../utils/ApiResonse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { cookieOption } from "../../../utils/cookieOption.js";
import { UnauthorizedError } from "../../../utils/errors/httpErrors.js";
import { HTTP_STATUS } from "../../../utils/httpStatus.js";
import {
  loginService,
  logoutService,
  meService,
  signupService,
} from "../services/auth.service.js";

export const signupController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await signupService({ email, password });

  res.cookie("token", token, cookieOption);

  return sendSuccess(res, {
    data: user,
    message: "Signup successful",
    statusCode: HTTP_STATUS.CREATED,
  });
});

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { isUserExist, token } = await loginService({ email, password });

  console.log("login token : ", token);
  

  res.cookie("token", token, cookieOption);

  return sendSuccess(
    res,
    {
      id: isUserExist.id,
      email: isUserExist.email,
      role: isUserExist.role,
      isProfileCompleted: isUserExist.isProfileCompleted,
    },
    "Login successful",
    HTTP_STATUS.OK,
  );
});

export const meController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new UnauthorizedError("Unauthorized");
  }

  const { userId } = req.user;

  const user = await meService(userId);

  return sendSuccess(res, user, "User fetched successfully", HTTP_STATUS.OK);
});

export const logoutController = asyncHandler(async (req, res) => {
  await logoutService();

  // clear cookie
  res.clearCookie("token", {
    ...cookieOption,
  });

  return sendSuccess(
    res,
    null,
    "Logged out successfully",
    HTTP_STATUS.OK
  );
});