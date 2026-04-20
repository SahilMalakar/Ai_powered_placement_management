import cloudinary from '../../configs/cloudinary.config.js';

// Uploads a local file to Cloudinary and returns the result.
export const uploadToCloudinary = async (
    filePath: string,
    folder: string = 'ats_resumes',
    resourceType: 'auto' | 'image' | 'raw' | 'video' = 'auto'
) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: resourceType,
            access_mode: 'public', // Ensures the file is publicly accessible via URL
        });
        return result;
    } catch (error: unknown) {
        throw new Error(
            `Cloudinary upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            {
                cause: error,
            }
        );
    }
};

/**
 * Uploads a buffer directly to Cloudinary using a stream.
 * satisfy the "Remove local disk save logic" requirement.
 */
import { Readable } from 'node:stream';
import { type UploadApiResponse } from 'cloudinary';

export const uploadBufferToCloudinary = (
    buffer: Buffer,
    folder: string = 'ats_resumes',
    resourceType: 'auto' | 'image' | 'raw' | 'video' = 'auto'
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
                access_mode: 'public',
            },
            (error, result) => {
                if (error) {
                    return reject(
                        new Error(
                            `Cloudinary buffer upload failed: ${error.message}`
                        )
                    );
                }
                if (!result) {
                    return reject(
                        new Error('Cloudinary buffer upload failed: No result')
                    );
                }
                resolve(result);
            }
        );

        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);
        stream.pipe(uploadStream);
    });
};

// Deletes a resource from Cloudinary using its public ID.
export const deleteFromCloudinary = async (publicId: string) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error: unknown) {
        console.error(
            `Failed to delete from Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
