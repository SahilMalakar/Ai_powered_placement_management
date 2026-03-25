import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors/AppError.js";
import { sendError } from "../utils/ApiResonse.js";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = err;

    // for unknow error
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || "Internal Server Error",
      500,
      "INTERNAL_ERROR",
      false,
    );
  }

  if (error.code === "P2002") {
    error = new AppError("Duplicate field value", 409, "UNIQUE_CONSTRAINT");
  }

  const stackArray = error.stack
    ? error.stack.split("\n").map((line: string) => line.trim()).filter(Boolean)
    : [];

  console.error({
    message: error.message,
    errorCode: error.errorCode,
    statusCode: error.statusCode,
    path: req.originalUrl,
    method: req.method,
    stack: stackArray,
  });

  return sendError(
    res,
    error.message,
    error.statusCode,
    error.errorCode,
    error.stack,
  );
};
