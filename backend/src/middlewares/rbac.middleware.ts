import type { Request, Response, NextFunction } from "express";

import { ForbiddenError, UnauthorizedError } from "../utils/errors/httpErrors.js";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
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
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return next(
      new ForbiddenError("Forbidden: Admin access required",),
    );
  }

  next();
};

export const requireStudent = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // ensure authenticated
  if (!req.user) {
    return next(
      new UnauthorizedError("Unauthorized: No user found"),
    );
  }

  //  check role
  if (req.user.role !== "STUDENT") {
    return next(
      new ForbiddenError("Forbidden: Student access required",),
    );
  }

  next();
};  