import { PDFParse } from "pdf-parse";
import fs from "fs/promises";

// Extracts text from a PDF file buffer.
export const extractTextFromPdf = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    // Instantiate the modern PDFParse class
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    return result.text;
  } catch (error: any) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};
