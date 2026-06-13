import fs from 'fs/promises';
import path from 'path';

/**
 * Clears all files in the public/uploads directory.
 * Useful for cleaning up temporary files left behind by server crashes.
 */
export const clearUploadsDirectory = async () => {
    const uploadDir = path.join(process.cwd(), 'public/uploads');

    try {
        const files = await fs.readdir(uploadDir);
        
        for (const file of files) {
            // Avoid deleting the directory itself or hidden files if any
            if (file === '.gitkeep') continue;
            
            const filePath = path.join(uploadDir, file);
            await fs.unlink(filePath).catch(() => {});
        }
        
        console.log(`[Cleanup] Successfully cleared temporary uploads directory.`);
    } catch (error) {
        console.warn(`[Cleanup] Could not clear uploads directory:`, error);
    }
};
