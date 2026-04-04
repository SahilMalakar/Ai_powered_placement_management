import { uploadToCloudinary } from "../../../utils/cloudinary.util.js";
import { extractTextFromPdf } from "../../../utils/pdfParser.util.js";
import { extractTextFromDocx } from "../../../utils/docxParser.util.js";
import { addAtsJobToQueue } from "../../../queues/ats.queue.js";
import { countAtsAnalysesToday, findAtsResultsByUserId } from "../repositories/ats.repository.js";
import { BadRequestError, ForbiddenError } from "../../../utils/errors/httpErrors.js";
import path from "path";

// Service to handle ATS analysis requests.
export const requestAtsAnalysisService = async (userId: number, filePath: string, jobDescription: string) => {
  // Rate Limiting: Check if the user has reached the 5/day limit
  const todayCount = await countAtsAnalysesToday(userId);
  if (todayCount >= 5) {
    throw new ForbiddenError("Daily ATS analysis limit (5/day) reached. Try again tomorrow.");
  }

  // Text Extraction: Based on file extension
  const ext = path.extname(filePath).toLowerCase();
  let resumeText = "";
  
  if (ext === ".pdf") {
    resumeText = await extractTextFromPdf(filePath);
  } else if (ext === ".doc" || ext === ".docx") {
    resumeText = await extractTextFromDocx(filePath);
  } else {
    throw new BadRequestError("Unsupported file format. Please upload PDF or DOCX.");
  }

  if (!resumeText || resumeText.trim().length === 0) {
    throw new BadRequestError("Could not extract text from the resume. Please ensure the file is not corrupted.");
  }

  // Cloudinary Upload: Securely store the resume for reference
  const uploadResult = await uploadToCloudinary(filePath);
  const resumeUrl = uploadResult.secure_url;

  // En-queue for AI Analysis: Background processing via BullMQ
  const job = await addAtsJobToQueue({
    userId,
    resumeText,
    jobDescription,
    resumeUrl,
  });

  return { 
    message: "ATS analysis is being processed. It will appear in your history shortly.",
    jobId: job.id,
    resumeUrl 
  };
};

// Service to fetch all previous analysis results for a student.
export const getAtsResultsService = async (userId: number) => {
  return await findAtsResultsByUserId(userId);
};
