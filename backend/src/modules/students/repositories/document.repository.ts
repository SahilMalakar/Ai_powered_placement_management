import { prisma } from '../../../prisma/prisma.js';
import { DocumentType } from '../../../prisma/generated/prisma/enums.js';

/**
 * Fetches a specific document by its unique database ID.
 */
export const findDocumentById = async (id: number) => {
    return await prisma.document.findFirst({
        where: { id },
    });
};

/**
 * Finds an existing document for a student by type and semester (for SGPA).
 */
export const findDocumentBySemester = async (
    userId: number,
    type: DocumentType,
    semester?: number
) => {
    return await prisma.document.findFirst({
        where: {
            userId,
            type,
            semester: semester ?? null,
        },
    });
};

/**
 * Creates or updates a document record.
 * If a document already exists for the same semester/type, it updates the URL.
 */
export const upsertDocument = async (
    userId: number,
    type: DocumentType,
    url: string,
    publicId: string,
    semester?: number
) => {
    const existing = await findDocumentBySemester(userId, type, semester);

    if (existing) {
        return await prisma.document.update({
            where: { id: existing.id },
            data: {
                url,
                publicId,
            },
        });
    }

    return await prisma.document.create({
        data: { userId, type, url, publicId, semester: semester ?? null },
    });
};

/**
 * Hard-deletes a document permanently from the database.
 */
export const hardDeleteDocumentRecord = async (id: number) => {
    return await prisma.document.delete({
        where: { id },
    });
};
