import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendSuccess } from "../../../utils/ApiResonse.js";
import { HTTP_STATUS } from "../../../utils/httpStatus.js";
import { UnauthorizedError } from "../../../utils/errors/httpErrors.js";
import { generateResumeService, getResumeByIdService, getStudentResumesService, updateResumeService, exportResumePdfService } from "../services/resume.service.js";

/**
 * Controller for Resume operations.
 */

/**
 * AI-Driven Resume Generation.
 * Derives content entirely from profile facts without user text input.
 */
export const generateResumeController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new UnauthorizedError("Unauthorized access.");
  }

  const userId = req.user.userId;
  const result = await generateResumeService(userId);

  return sendSuccess(
    res,
    result,
    "Resume generated successfully.",
    HTTP_STATUS.CREATED
  );
});

export const getStudentResumesController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new UnauthorizedError("Unauthorized access.");
  }

  const userId = req.user.userId;
  const result = await getStudentResumesService(userId);

  return sendSuccess(
    res,
    result,
    "Resumes fetched successfully.",
    HTTP_STATUS.OK
  );
});

export const getResumeByIdController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new UnauthorizedError("Unauthorized access.");
  }

  const userId = req.user.userId;
  const resumeId = parseInt(req.params.id as string);
  const result = await getResumeByIdService(resumeId, userId);

  return sendSuccess(
    res,
    result,
    "Resume fetched successfully.",
    HTTP_STATUS.OK
  );
});

export const updateResumeController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new UnauthorizedError("Unauthorized access.");
  }

  const userId = req.user.userId;
  const resumeId = parseInt(req.params.id as string);
  const result = await updateResumeService(resumeId, userId, req.body);

  return sendSuccess(
    res,
    result,
    "Resume updated successfully",
    HTTP_STATUS.OK
  );
});

export const exportResumeController = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "STUDENT") {
    throw new UnauthorizedError("Only authenticated students can perform this action.");
  }

  const userId = req.user.userId;
  const resumeId = parseInt(req.params.id as string);
  
  const pdfBuffer = await exportResumePdfService(resumeId, userId);

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="resume_${resumeId}.pdf"`);
  
  // Send the buffer
  res.end(pdfBuffer);
});
