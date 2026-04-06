import { rateLimit } from "express-rate-limit";

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
