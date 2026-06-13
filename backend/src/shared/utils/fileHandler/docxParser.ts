import mammoth from 'mammoth';
import fs from 'fs/promises';

// Extracts raw text from a .docx file using mammoth.
export const extractTextFromDocx = async (
    filePath: string
): Promise<string> => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        return result.value;
    } catch (error: unknown) {
        throw new Error(
            `Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`,
            {
                cause: error,
            }
        );
    }
};
