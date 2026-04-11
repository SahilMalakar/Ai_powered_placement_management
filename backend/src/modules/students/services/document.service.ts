import {
    addDocumentJobToQueue,
    type DocumentJobFile,
} from '../../../queues/document.queue.js';
import { deleteFromCloudinary } from '../../../utils/fileHandler/cloudinary.js';
import {
    deleteDocumentRecord,
    findDocumentById,
} from '../repositories/document.repository.js';
import { DocumentType } from '../../../prisma/generated/prisma/enums.js';
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
} from '../../../utils/errors/httpErrors.js';

// Service to enqueue a bulk document upload job.
// Returns immediately after queueing — actual Cloudinary/DB work is done by the worker.
export const uploadBulkDocumentsService = async (
    userId: number,
    files: { [fieldname: string]: Express.Multer.File[] }
) => {
    const jobFiles: DocumentJobFile[] = [];

    for (const [fieldname, fileArray] of Object.entries(files)) {
        const file = fileArray[0];
        let type: DocumentType;
        let semester: number | null;
        let folder = 'marksheets';

        // Map field names to document types and Cloudinary folders
        if (fieldname.startsWith('sem')) {
            const semNum = parseInt(fieldname.replace('sem', ''), 10);
            if (isNaN(semNum) || semNum < 1 || semNum > 8) {
                throw new BadRequestError(
                    `Invalid semester field: ${fieldname}`
                );
            }
            type = DocumentType.SGPA;
            semester = semNum;
        } else if (fieldname === 'other') {
            type = DocumentType.OTHER;
            folder = 'certificates';
            semester = null;
        } else {
            continue; // Skip unknown fields
        }

        jobFiles.push({
            fieldname,
            filePath: file!.path, // Local temp file path (worker will cleanup after upload)
            type,
            folder,
            semester,
        });
    }

    if (jobFiles.length === 0) {
        throw new BadRequestError('No valid document files found to process.');
    }

    // Enqueue a single job with all files → worker processes them
    const job = await addDocumentJobToQueue({ userId, files: jobFiles });

    return {
        jobId: job.id,
        queued: jobFiles.map((f) => f.fieldname),
        message: 'Documents are being processed in the background.',
    };
};

// Service to delete a document and clean up its associated Cloudinary resource.
export const deleteDocumentService = async (
    userId: number,
    documentId: number
) => {
    const doc = await findDocumentById(documentId);
    if (!doc) {
        throw new NotFoundError('Document not found.');
    }
    if (doc.userId !== userId) {
        throw new ForbiddenError(
            'You are not authorized to delete this document.'
        );
    }

    // 1. Soft-delete from DB first
    await deleteDocumentRecord(documentId);

    // 2. Cleanup from Cloudinary
    if (doc.publicId) {
        await deleteFromCloudinary(doc.publicId).catch((err) =>
            console.error(
                `[Cloudinary] Failed to delete resource ${doc.publicId}:`,
                err.message
            )
        );
    }

    return { message: 'Document deleted successfully.' };
};
