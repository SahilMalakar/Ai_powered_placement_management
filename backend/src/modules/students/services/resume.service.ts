import { getFullStudentData } from "../repositories/student.repository.js";
import { countUserResumes, createResumeRecord, findResumesByUserId, findResumeById, updateResumeJson, getLatestResumeVersion } from "../repositories/resume.repository.js";
import puppeteer from "puppeteer";
import { generateResumeHtml } from "../../../utils/templates/resumeTemplate.js";
import { resumeGenerationChain } from "./resume.chain.js";
import { BadRequestError, NotFoundError } from "../../../utils/errors/httpErrors.js";

const MAX_RESUMES = 5;

/**
 * AI-Driven Resume Generation. 
 * Entirely automatic based on student profile.
 */
export const generateResumeService = async (userId: number) => {

  // Enforce business limit (max 5 resumes per student)
  const currentCount = await countUserResumes(userId);
  if (currentCount >= MAX_RESUMES) {
    throw new BadRequestError(`Maximum limit of ${MAX_RESUMES} resumes reached. Please delete an old version to generate a new one.`);
  }

  //  Fetch student's comprehensive profile data
  const fullProfile = await getFullStudentData(userId);
  if (!fullProfile?.profile) {
    throw new NotFoundError("Student profile not found. Please complete your profile before generating a resume.");
  }

  // Orchestrate AI generation chain (Audit -> Identity Role -> Generate)
  const generatedResume = await resumeGenerationChain.invoke({
    profileData: fullProfile,
    branch: fullProfile.profile.branch
  });

  // Persistence with version tracking
  const latestVersion = await getLatestResumeVersion(userId);
  const newVersion = latestVersion + 1;

  const resume = await createResumeRecord(userId, newVersion, generatedResume);
  
  return resume;
};

export const getStudentResumesService = async (userId: number) => {
  return await findResumesByUserId(userId);
};

export const getResumeByIdService = async (id: number, userId: number) => {
  const resume = await findResumeById(id);
  if (!resume || resume.userId !== userId) {
    throw new NotFoundError("Resume not found or unauthorized access.");
  }
  return resume;
};

export const updateResumeService = async (id: number, userId: number, jsonData: any) => {
  const existing = await findResumeById(id);
  if (!existing || existing.userId !== userId) {
    throw new NotFoundError("Resume not found or unauthorized access.");
  }
  return await updateResumeJson(id, jsonData);
};

export const exportResumePdfService = async (id: number, userId: number): Promise<Buffer> => {
  const resume = await findResumeById(id);
  if (!resume || resume.userId !== userId) {
    throw new NotFoundError("Resume not found or unauthorized access.");
  }

  // Generate HTML from JSON
  const htmlContent = generateResumeHtml(resume.jsonData as any);

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Create professional PDF document
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        bottom: '0',
        left: '0',
        right: '0'
      }
    });
    
    // Puppeteer's pdf() returns a Uint8Array in newer versions, convert to Buffer if necessary
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
};
