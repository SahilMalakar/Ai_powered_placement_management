import type { NextFunction, Request, Response } from "express";
import { InvalidCredentialsError, TokenExpiredError } from "../utils/errors/authErrors.js";
import jwt from "jsonwebtoken";
import { serverConfig } from "../configs/index.js";

type JwtPayload = {
  userId: number;
  role: "STUDENT" | "ADMIN" | "SUPER_ADMIN";
  email: string;
};

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const token = req.cookies?.token;

    if (!token) {
        throw new InvalidCredentialsError("Unauthorized: No token provided");
    }

    console.log("type of token : ",typeof token);
    console.log("auth token : ", token);
    try {
        const decoded = jwt.verify(
            token,
            serverConfig.JWT_SECRET
        ) as JwtPayload;
        req.user = decoded;

        next();
    } catch (error) {
        return next(
          new TokenExpiredError("Unauthorized: Invalid or expired token"),
        );
    }
};