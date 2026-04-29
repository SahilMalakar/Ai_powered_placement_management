import { z } from 'zod';
import { DocumentType } from '../../prisma/generated/prisma/enums.js';

export const uploadDocumentSchema = z.object({
    type: z.nativeEnum(DocumentType, {
        error: "Invalid document type. Must be SGPA, CGPA, or OTHER"
    }),
    semester: z.preprocess(
        (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
        z.number().min(1).max(8).optional()
    ),
}).refine(data => {
    if (data.type === DocumentType.SGPA && !data.semester) {
        return false;
    }
    return true;
}, {
    message: "Semester is required for SGPA documents",
    path: ["semester"]
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
