import type { LoginInput, SignupInput } from "../../../types/auth.js";
import { InvalidCredentialsError } from "../../../utils/errors/authErrors.js";
import { UniqueConstraintError } from "../../../utils/errors/databaseErrors.js";
import {
  ForbiddenError,
  NotFoundError,
} from "../../../utils/errors/httpErrors.js";
import { generateToken } from "../../../utils/jwt/generateToken.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../repositories/auth.repository.js";
import bcrypt from "bcrypt";

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

  const token = await generateToken({
    userId: user.id,
    role: user.role,
  });

  return { user, token };
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

  const token = await generateToken({
    userId: isUserExist.id,
    role: isUserExist.role,
  });

  return { isUserExist, token };
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