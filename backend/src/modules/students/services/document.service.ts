import {
    addDocumentJobToQueue,
    type DocumentJobFile,
} from '../../../shared/queues/document.queue.js';
import { deleteFromCloudinary } from '../../../shared/utils/fileHandler/cloudinary.js';
import {
    hardDeleteDocumentRecord,
    findDocumentById,
    findDocumentsByUserId,
} from '../repositories/document.repository.js';
import { resetVerificationState } from '../repositories/verification.repository.js';
import { DocumentType, VerificationStatus } from '../../../prisma/generated/prisma/enums.js';
import {
    ForbiddenError,
    NotFoundError,
} from '../../../shared/utils/errors/httpErrors.js';
import { getProfileRepo } from '../repositories/profile.repository.js';
import { getRedisConnectionForCaching } from '../../../infra/redis.config.js';
import { CACHE_KEYS } from '../../../shared/utils/cacheKeys.js';
import {
    invalidateDocumentCache,
    invalidateStudentCache
} from '../../../shared/utils/cacheInvalidation.js';
import type { UploadDocumentInput } from '../../../shared/types/students/document.js';

/**
 * Service to fetch all documents for the student.
 * Uses Redis caching for performance.
 */
export const getDocumentsService = async (userId: number) => {
    const cacheKey = CACHE_KEYS.STUDENT_DOCUMENTS(userId);
    const cacheClient = getRedisConnectionForCaching();

    const cached = await cacheClient.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const documents = await findDocumentsByUserId(userId);

    await cacheClient.set(cacheKey, JSON.stringify(documents), 'EX', 600);

    return documents;
};

/**
 * Service to enqueue a single document upload job.
 */
export const uploadSingleDocumentService = async (
    userId: number,
    data: UploadDocumentInput,
    file: Express.Multer.File
) => {
    // 1. Profile Verification Check: Students cannot change documents if verification is PROCESSING
    const profile = await getProfileRepo(userId);
    if (!profile) {
        throw new NotFoundError('Student profile not found.');
    }
    if (profile.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError(
            'Cannot upload documents while profile is under verification.'
        );
    }

    const { type, semester } = data;
    const folder = type === DocumentType.SGPA ? 'marksheets' : 'certificates';

    const jobFile: DocumentJobFile = {
        fieldname: file.fieldname,
        filePath: file.path,
        type: type as DocumentType,
        folder,
        semester: semester ?? null,
    };

    // Enqueue job for background processing (Cloudinary upload + DB write)
    const job = await addDocumentJobToQueue({ userId, files: [jobFile] });

    // Invalidate cache immediately to ensure fresh data on next fetch
    await invalidateDocumentCache(userId);
    await invalidateStudentCache(userId);

    return {
        jobId: job.id,
        type,
        semester,
        message: 'Document is being processed in the background.',
    };
};

/**
 * Service to delete a document and clean up its associated Cloudinary resource.
 */
export const deleteDocumentService = async (
    userId: number,
    documentId: number
) => {
    // 1. Check if profile is under verification
    const profile = await getProfileRepo(userId);
    if (profile?.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError(
            'Cannot delete documents while profile is under verification.'
        );
    }

    const doc = await findDocumentById(documentId);
    if (!doc) {
        throw new NotFoundError('Document not found.');
    }
    if (doc.userId !== userId) {
        throw new ForbiddenError(
            'You are not authorized to delete this document.'
        );
    }

    // 2. Permanent Hard Delete from DB
    await hardDeleteDocumentRecord(documentId);

    // 3. Verification Integrity Check: If an SGPA document is deleted, reset the verification status.
    if (doc.type === DocumentType.SGPA) {
        await resetVerificationState(userId);
    }

    // 4. Cleanup from Cloudinary
    if (doc.publicId) {
        await deleteFromCloudinary(doc.publicId).catch((err) =>
            console.error(
                `[Cloudinary] Failed to delete resource ${doc.publicId}:`,
                err.message
            )
        );
    }

    // 5. Invalidate cache
    await invalidateDocumentCache(userId);
    await invalidateStudentCache(userId);

    return { message: 'Document removed successfully.' };
};
