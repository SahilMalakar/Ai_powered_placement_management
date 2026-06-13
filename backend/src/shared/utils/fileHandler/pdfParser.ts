import { PDFParse } from 'pdf-parse';
import fs from 'fs/promises';

// Extracts text from a PDF file buffer locally.
export const extractTextFromPdf = async (filePath: string): Promise<string> => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        // Instantiate the modern PDFParse class
        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        return result.text;
    } catch (error: unknown) {
        throw new Error(
            `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
            {
                cause: error,
            }
        );
    }
};

// Extracts directly from an in-memory buffer
export const extractTextFromPdfBuffer = async (
    buffer: Buffer
): Promise<string> => {
    try {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        return result.text;
    } catch (error: unknown) {
        throw new Error(
            `Failed to extract text from PDF buffer: ${error instanceof Error ? error.message : 'Unknown error'}`,
            { cause: error }
        );
    }
};
