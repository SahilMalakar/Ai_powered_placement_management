import jwt from "jsonwebtoken";
import { serverConfig } from "../../../configs/index.js";
import type { ChangePasswordInput, ForgetPasswordInput, LoginInput, ResetPasswordInput, SignupInput } from "../../../types/auth.js";
import { InvalidCredentialsError } from "../../../utils/errors/authErrors.js";
import { UniqueConstraintError } from "../../../utils/errors/databaseErrors.js";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../../utils/errors/httpErrors.js";
import { generateRefreshToken, generateToken } from "../../../utils/jwt/generateToken.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserWithPasswordById,
  updateUserPassword,
} from "../repositories/auth.repository.js";
import bcrypt from "bcrypt";
import crypto from "crypto";



export const signupService = async (signupData: SignupInput) => {
  const isUserExist = await findUserByEmail(signupData.email);

  if (isUserExist) {
    throw new UniqueConstraintError("User already exists");
  }

  const hashedPassword = await bcrypt.hash(signupData.password, 10);

  const user = await createUser({
    email: signupData.email,
    password: hashedPassword,
  });

   // Generate both tokens
  const accessToken = await generateToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = await generateRefreshToken({
    userId: user.id,
    role: user.role
  });

  return { user, accessToken, refreshToken };
};

export const loginService = async (loginData: LoginInput) => {
  const isUserExist = await findUserByEmail(loginData.email);

  if (!isUserExist) {
    throw new NotFoundError("User not found ");
  }

  if (isUserExist.deletedAt) {
    throw new ForbiddenError("Account is deactivated");
  }

  const isMatch = await bcrypt.compare(
    loginData.password,
    isUserExist.password,
  );

  if (!isMatch) {
    throw new InvalidCredentialsError("Invalid email and password");
  }

  const accessToken = await generateToken({
    userId: isUserExist.id,
    role: isUserExist.role,
  });

  const refreshToken = await generateRefreshToken({
    userId: isUserExist.id,
    role: isUserExist.role
  }) // will store refresh token in Redis or Db for recocation/rotation

  return { isUserExist, accessToken, refreshToken };
};

export const meService = async (userId: number) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.deletedAt) {
    throw new ForbiddenError("Account is deactivated");
  }

  return user;
};

export const logoutService = async () => {
  // Future: invalidate refresh token / blacklist token

  return true;
};


export const changePasswordService = async (userId: number, data: ChangePasswordInput) => {
  const user = await findUserWithPasswordById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isMatch = await bcrypt.compare(data.oldPassword, user.password);

  if (!isMatch) {
    throw new InvalidCredentialsError("Invalid old password");
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  // will Handle idempotency using Idempotency-Key if required in future

  await updateUserPassword(userId, hashedPassword);

  return true;
}


export const forgetPasswordService = async (data: ForgetPasswordInput) => {
  const user = await findUserByEmail(data.email);

  // Do not reveal if email exists or not
  if (!user || user.deletedAt) {
    return true;
  }

  // generate 6-digit otp
  const otp = crypto.randomInt(100000, 999999).toString();

  // TODO: Handle token storage using Redis (otp:reset:{email} -> otp) with 10m TTL


  // TODO: Use BullMQ email.queue to push sending job with OTP


  return true;
}


export const resetPasswordService = async (data: ResetPasswordInput) => {
  //  Fetch OTP from Redis and verify
  const user = await findUserByEmail(data.email);
  if (!user || user.deletedAt) {
    throw new NotFoundError("User not found");
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  await updateUserPassword(user.id, hashedPassword);

  // delete otp from redis

  return true;
}


export const refreshTokenService = async (oldRefreshToken: string) => {
  try {
    const payload = jwt.verify(oldRefreshToken, serverConfig.REFRESH_TOKEN_SECRET) as {
      userId: number,
      role: string
    }

    // verify if the token exists in Redis/db not revoked

    const user = await findUserById(payload.userId);

    if (!user || user.deletedAt) {
      throw new ForbiddenError("User not found or account deactivated");
    }

    const newAccessToken = await generateToken({
      userId: user.id,
      role: user.role
    })

    const newRefreshToken = await generateRefreshToken({
      userId: user.id,
      role: user.role
    })

    // update the refresh token in Redis/db (rotation)

    return { newAccessToken, newRefreshToken };
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}