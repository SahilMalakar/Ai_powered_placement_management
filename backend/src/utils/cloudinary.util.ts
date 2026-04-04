import cloudinary from "../configs/cloudinary.config.js";

// Uploads a local file to Cloudinary and returns the result.
export const uploadToCloudinary = async (filePath: string, folder: string = "ats_resumes") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto", // Automatically detects PDF/Raw
    });
    return result;
  } catch (error: any) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Deletes a resource from Cloudinary using its public ID.
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    console.error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};
