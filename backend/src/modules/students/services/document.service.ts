import { uploadToCloudinary, deleteFromCloudinary } from "../../../utils/fileHandler/cloudinary.js";
import { 
  upsertDocument, 
  findDocumentBySemester, 
  deleteDocumentRecord, 
  findDocumentById 
} from "../repositories/document.repository.js";
import { DocumentType } from "../../../prisma/generated/prisma/enums.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../utils/errors/httpErrors.js";
import fs from "fs/promises";

// Service to handle bulk uploads of different student documents (SGPA, CGPA, Certificates).
export const uploadBulkDocumentsService = async (
  userId: number, 
  files: { [fieldname: string]: Express.Multer.File[] }
) => {
  const uploadResults = [];

  for (const [fieldname, fileArray] of Object.entries(files)) {
    const file = fileArray[0];
    let type: DocumentType = DocumentType.SGPA;
    let semester: number | undefined = undefined;
    let folder = "marksheets";

    // Determine type and semester from fieldname (e.g., 'sem1' -> SGPA Sem 1)
    if (fieldname.startsWith("sem")) {
      semester = parseInt(fieldname.replace("sem", ""), 10);
      if (isNaN(semester) || semester < 1 || semester > 8) {
        throw new BadRequestError(`Invalid semester field: ${fieldname}`);
      }
      type = DocumentType.SGPA;
    } else if (fieldname === "other") {
      type = DocumentType.OTHER;
      folder = "certificates";
    } else {
      continue; // Skip unknown fields
    }

    // 1. Conflict Check: See if an existing doc needs replacing for Cloudinary cleanup
    const existing = await findDocumentBySemester(userId, type, semester);
    const oldPublicId = existing?.publicId;

    // 2. Cloudinary Upload: Folder depends on the document type
    const cloudRes = await uploadToCloudinary(file!.path, folder);
    
    // 3. Sync with DB: Update existing or create new
    await upsertDocument(userId, type, cloudRes.secure_url, cloudRes.public_id, semester);
    
    // 4. Cleanup old file from Cloudinary (Asynchronous)
    if (oldPublicId) {
      deleteFromCloudinary(oldPublicId).catch((err) => 
        console.error(`[Cloudinary Cleanup] Failed to delete ${oldPublicId}:`, err.message)
      );
    }
    
    // 5. Cleanup local temp file stored by Multer
    await fs.unlink(file!.path).catch(() => {});
    
    uploadResults.push({ fieldname, status: "completed", url: cloudRes.secure_url });
  }

  return uploadResults;
};

// Service to delete a document and clean up its associated Cloudinary resource.
export const deleteDocumentService = async (userId: number, documentId: number) => {
  const doc = await findDocumentById(documentId);
  if (!doc) {
    throw new NotFoundError("Document not found.");
  }
  if (doc.userId !== userId) {
    throw new ForbiddenError("You are not authorized to delete this document.");
  }

  // 1. Delete from DB first
  await deleteDocumentRecord(documentId);

  // 2. Cleanup from Cloudinary
  if (doc.publicId) {
    await deleteFromCloudinary(doc.publicId).catch((err) => 
      console.error(`[Cloudinary] Failed to delete resource ${doc.publicId}:`, err.message)
    );
  }
  
  return { message: "Document deleted successfully." };
};
