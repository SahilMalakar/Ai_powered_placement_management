import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { BadRequestError } from '../errors/httpErrors.js';

// Ensure the local upload directory exists synchronously at startup
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer disk storage.
// Files are temporarily stored in public/uploads.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
        );
    },
});

// File filter to only allow PDF and DOCX files.
const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(
            new BadRequestError(
                'Only PDF, .doc, and .docx formats are allowed.'
            )
        );
    }
};

// Multer upload middleware configured for ATS resumes.
// Limit: 2MB
export const atsUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
});

// Multer upload middleware for bulk student documents (Marksheets & Certificates)
// Limit: 5MB per file
export const documentUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
