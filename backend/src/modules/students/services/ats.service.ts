import { extractTextFromPdf } from '../../../utils/fileHandler/pdfParser.js';
import { extractTextFromDocx } from '../../../utils/fileHandler/docxParser.js';
import { addAtsJobToQueue } from '../../../queues/ats.queue.js';
import {
    countAtsAnalysesToday,
    createAtsResult,
    findAtsResultById,
    deleteAtsResult,
    findAtsResultsByUserId,
} from '../repositories/ats.repository.js';
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
} from '../../../utils/errors/httpErrors.js';
import path from 'path';

// Service to handle ATS analysis requests.
export const requestAtsAnalysisService = async (
    userId: number,
    filePath: string,
    jobDescription: string | null
) => {
    // Rate Limiting: Check if the user has reached the 5/day limit
    const todayCount = await countAtsAnalysesToday(userId);
    if (todayCount >= 5) {
        throw new ForbiddenError(
            'Daily ATS analysis limit (5/day) reached. Try again tomorrow.'
        );
    }

    // Text Extraction: Based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let resumeText: string;

    if (ext === '.pdf') {
        resumeText = await extractTextFromPdf(filePath);
    } else if (ext === '.doc' || ext === '.docx') {
        resumeText = await extractTextFromDocx(filePath);
    } else {
        throw new BadRequestError(
            'Unsupported file format. Please upload PDF or DOCX.'
        );
    }

    if (!resumeText || resumeText.trim().length === 0) {
        throw new BadRequestError(
            'Could not extract text from the resume. Please ensure the file is not corrupted.'
        );
    }

    // Determine analysis mode
    const analysisMode = jobDescription ? 'JD_MATCHED' : 'GENERIC';

    // 1. Create a placeholder record in the database
    const atsResult = await createAtsResult(userId, jobDescription, analysisMode);

    try {
        // 2. En-queue for AI Analysis: Background processing via BullMQ
        await addAtsJobToQueue({
            atsResultId: atsResult.id,
            userId,
            resumeText,
            jobDescription: jobDescription || '',
        });
    } catch (error: unknown) {
        // CLEANUP: If queueing fails, delete the record so it doesn't count against daily limit
        await deleteAtsResult(atsResult.id).catch(() => { });
        throw error;
    }

    return {
        atsResultId: atsResult.id,
        message: 'ATS analysis is being processed.',
    };
};

// Service to fetch the status and full info of a specific analysis.
export const getAtsStatusService = async (id: number, userId: number) => {
    const result = await findAtsResultById(id, userId);
    if (!result) {
        throw new NotFoundError('ATS analysis report not found.');
    }

    // Basic response for pending/failed jobs
    if (result.status !== 'COMPLETED') {
        return {
            id: result.id,
            status: result.status,
            analysisMode: result.analysisMode,
            createdAt: result.createdAt,
        };
    }

    // Full response for completed jobs
    return {
        id: result.id,
        status: result.status,
        analysisMode: result.analysisMode,
        detectedRole: result.detectedRole,
        score: result.score,
        keywordScore: result.keywordScore,
        formatScore: result.formatScore,
        experienceScore: result.experienceScore,
        projectScore: result.projectScore,
        skillsScore: result.skillsScore,
        additionalDetailsScore: result.additionalDetailsScore,
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        suggestions: result.suggestions,
        createdAt: result.createdAt,
    };
};


// Service to fetch paginated analysis results for a student.
export const getAtsResultsService = async (
    userId: number,
    page: number = 1,
    limit: number = 10
) => {
    const history = await findAtsResultsByUserId(userId, page, limit);
    const todayCount = await countAtsAnalysesToday(userId);
    return {
        ...history,
        todayCount,
    };
};

// Service to hard-delete a specific ATS report.
export const deleteAtsResultService = async (id: number, userId: number) => {
    const result = await findAtsResultById(id, userId);
    if (!result) {
        throw new NotFoundError('ATS analysis report not found.');
    }

    // Edge Case Guard: Prevent deletion of actively running analyses (PENDING/PROCESSING)
    // to avoid background worker failure logs or inconsistent data states.
    if (result.status === 'PENDING' || result.status === 'PROCESSING') {
        throw new BadRequestError(
            'Cannot delete an ATS analysis report while it is still processing.'
        );
    }

    return await deleteAtsResult(id);
};


