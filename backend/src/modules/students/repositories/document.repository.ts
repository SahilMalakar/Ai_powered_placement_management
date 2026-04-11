import { prisma } from '../../../prisma/prisma.js';
import { DocumentType } from '../../../prisma/generated/prisma/enums.js';

// Fetches a specific document by its unique database ID.
export const findDocumentById = async (id: number) => {
    return await prisma.document.findFirst({
        where: { id, deletedAt: null },
    });
};

// Finds an existing document for a student by type and semester (for SGPA).
// 'includeDeleted' allows finding soft-deleted records to prevent unique constraint violations on re-upload.
export const findDocumentBySemester = async (
    userId: number,
    type: DocumentType,
    semester?: number,
    includeDeleted = false
) => {
    return await prisma.document.findFirst({
        where: {
            userId,
            type,
            semester: semester ?? null,
            ...(includeDeleted ? {} : { deletedAt: null }),
        },
    });
};

// Creates or updates a document record. If a soft-deleted record exists, it restores it.
export const upsertDocument = async (
    userId: number,
    type: DocumentType,
    url: string,
    publicId: string,
    semester?: number
) => {
    // Search for ANY existing record (including soft-deleted) to prevent unique constraint errors
    const existing = await findDocumentBySemester(userId, type, semester, true);

    if (existing) {
        return await prisma.document.update({
            where: { id: existing.id },
            data: {
                url,
                publicId,
                deletedAt: null, // Restore if it was soft-deleted
            },
        });
    }

    return await prisma.document.create({
        data: { userId, type, url, publicId, semester: semester ?? null },
    });
};

// Soft-deletes a document. Guard on deletedAt: null prevents double-delete race conditions.
export const deleteDocumentRecord = async (id: number) => {
    return await prisma.document.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
    });
};
