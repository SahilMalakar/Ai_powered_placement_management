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

// Service to handle bulk uploads of different student documents (SGPA, Certificates).
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

    // Track newly uploaded Cloudinary file for compensating delete on DB failure
    let newPublicId: string | null = null;

    try {
      // 1. Conflict Check: See if an existing doc needs replacing for Cloudinary cleanup
      const existing = await findDocumentBySemester(userId, type, semester);
      const oldPublicId = existing?.publicId;

      // 2. Cloudinary Upload: Folder depends on the document type
      const cloudRes = await uploadToCloudinary(file!.path, folder);
      newPublicId = cloudRes.public_id;

      // 3. Sync with DB: Update existing or create new
      // IMPORTANT: If this throws, the catch block will delete the newly uploaded Cloudinary file
      await upsertDocument(userId, type, cloudRes.secure_url, cloudRes.public_id, semester);

      // 4. DB write confirmed — now safely cleanup the old Cloudinary file (Asynchronous)
      if (oldPublicId) {
        deleteFromCloudinary(oldPublicId).catch((err) => 
          console.error(`[Cloudinary Cleanup] Failed to delete ${oldPublicId}:`, err.message)
        );
      }

      uploadResults.push({ fieldname, status: "completed", url: cloudRes.secure_url });
    } catch (err) {
      // Compensating action: DB failed after Cloudinary upload succeeded → orphan prevention
      if (newPublicId) {
        deleteFromCloudinary(newPublicId).catch((e) =>
          console.error(`[Cloudinary Compensation] Failed to remove orphaned file ${newPublicId}:`, e.message)
        );
      }
      throw err; // Re-throw to return error response to the client
    } finally {
      // Always free up local disk space — runs on both success and failure
      await fs.unlink(file!.path).catch(() => {});
    }
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
