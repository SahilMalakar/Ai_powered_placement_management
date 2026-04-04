import { uploadToCloudinary, deleteFromCloudinary } from "../../../utils/fileHandler/cloudinary.js";
import { extractTextFromPdf } from "../../../utils/fileHandler/pdfParser.js";
import { extractTextFromDocx } from "../../../utils/fileHandler/docxParser.js";
import { addAtsJobToQueue } from "../../../queues/ats.queue.js";
import { countAtsAnalysesToday, findLatestAtsResultByUserId } from "../repositories/ats.repository.js";
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
  const { secure_url, public_id } = uploadResult;

  try {
    // En-queue for AI Analysis: Background processing via BullMQ
    const job = await addAtsJobToQueue({
      userId,
      resumeText,
      jobDescription,
      resumeUrl: secure_url,
    });

    return {
      message: "ATS analysis is being processed. It will appear in your history shortly.",
      jobId: job.id,
      resumeUrl: secure_url
    };
  } catch (error) {
    // Rollback: Delete from Cloudinary if queueing fails to maintain consistency
    await deleteFromCloudinary(public_id);
    throw error;
  }
};

// Service to fetch the latest analysis result for a student.
export const getAtsResultsService = async (userId: number) => {
  return await findLatestAtsResultByUserId(userId);
};
