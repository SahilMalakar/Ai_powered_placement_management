import type { Request, Response } from "express";
import { sendSuccess } from "../../../utils/ApiResonse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { HTTP_STATUS } from "../../../utils/httpStatus.js";
import { requestAtsAnalysisService, getAtsResultsService } from "../services/ats.service.js";
import { BadRequestError } from "../../../utils/errors/httpErrors.js";
import fs from "fs/promises";

// Controller to handle POST /students/ats
// Initiates the multi-step ATS Analysis flow.
export const requestAtsAnalysisController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new BadRequestError("Unauthorized user session.");
  }

  // 1. File availability check (Multer middleware handles the upload first)
  if (!req.file) {
    throw new BadRequestError("Please upload a resume file (PDF/DOCX).");
  }

  const { jobDescription } = req.body;
  if (!jobDescription) {
    // Multer creates a file even if JD is missing, so we must clean it up
    await fs.unlink(req.file.path);
    throw new BadRequestError("Job Description text is required for ATS comparison.");
  }

  try {
    const userId = req.user.userId;
    const filePath = req.file.path;

    // 2. Delegate logic to the service
    const status = await requestAtsAnalysisService(userId, filePath, jobDescription);

    // 3. Cleanup local buffer storage as requested
    await fs.unlink(filePath);

    return sendSuccess(
      res,
      status,
      "ATS Analysis successfully queued. We'll update your results in a moment.",
      HTTP_STATUS.ACCEPTED
    );
  } catch (error: any) {
    // Ensure local file cleanup if service execution fails
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    throw error;
  }
});

// Controller to fetch all ATS analysis reports for the authenticated student.
export const getAtsResultsController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new BadRequestError("Unauthorized user session.");
  }

  const results = await getAtsResultsService(req.user.userId);

  return sendSuccess(
    res,
    results,
    "ATS reports fetched successfully."
  );
});
