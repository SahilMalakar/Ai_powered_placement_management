import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { uploadBulkDocumentsService, deleteDocumentService } from "../services/document.service.js";
import { sendSuccess } from "../../../utils/ApiResonse.js";
import { BadRequestError } from "../../../utils/errors/httpErrors.js";
import { HTTP_STATUS } from "../../../utils/httpStatus.js";

// Controller to handle multi-field (Bulk) document uploads.
export const uploadDocumentsController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new BadRequestError("Unauthorized user session.");
  }

  // Check if any files were uploaded by Multer
  if (!req.files || Object.keys(req.files).length === 0) {
    throw new BadRequestError("No files provided for upload.");
  }

  // Delegate processing to the service
  const results = await uploadBulkDocumentsService(
    req.user.userId, 
    req.files as { [fieldname: string]: Express.Multer.File[] }
  );
  
  return sendSuccess(
    res, 
    results, 
    "Documents queued for processing. They will be available shortly.", 
    HTTP_STATUS.ACCEPTED  // 202: Request accepted, processing in background
  );
});

// Controller to handle deletion of a specific document.
export const deleteDocumentController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new BadRequestError("Unauthorized user session.");
  }
  
  const { id } = req.params;
  if (!id) {
    throw new BadRequestError("Document ID is required for deletion.");
  }
  const numericId = parseInt(id as string, 10);
  if (isNaN(numericId)) {
    throw new BadRequestError("Invalid document ID format.");
  }
  
  const result = await deleteDocumentService(req.user.userId, numericId);
  
  return sendSuccess(res, result, "Document removed successfully.");
});
