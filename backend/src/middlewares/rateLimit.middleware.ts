import rateLimit from "express-rate-limit";
import { ForbiddenError } from "../utils/errors/httpErrors.js";


// Rate limiter for authentication routes (Login & Signup)
// Limits each IP to 5 requests per 15 minutes.

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
  standardHeaders: "draft-7", // Set `RateLimit` and `RateLimit-Policy` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    error: "Too Many Requests",
    message: "Too many login or signup attempts from this IP, please try again after 15 minutes"
  },
  // Skip successful requests if needed, but for auth, we usually want to limit all attempts to prevent brute force
  skipSuccessfulRequests: false,
});


// 
// Custom rate limiter for job applications.
// Limit: 5 applications per 24 hours (1440 minutes).
// Partitioned by User ID for precision.
// 
export const applicationRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // Limit each student to 5 applications per day
  keyGenerator: (req: any) => {
    // We use User ID from the authMiddleware as the primary key
    return req.user?.userId?.toString() || req.ip;
  },
  validate: { default: false },
  handler: (req, res, next) => {
    next(new ForbiddenError("Daily application limit reached. You can only apply to 5 jobs per day."));
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
