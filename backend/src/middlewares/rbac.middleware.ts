import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors/AppError.js";
import { HTTP_STATUS } from "../utils/httpStatus.js";
import { ForbiddenError, UnauthorizedError } from "../utils/errors/httpErrors.js";

enum Role {
  SUPER_ADMIN,
  ADMIN,
}
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. ensure authenticated
  if (!req.user) {
    return next(
      new UnauthorizedError("Unauthorized: No user found"),
    );
  }

  // 2. check role
  if (req.user.role !== Role.ADMIN && req.user.role !== Role.SUPER_ADMIN) {
    return next(
      new ForbiddenError("Forbidden: Admin access required",),
    );
  }

  next();
};
