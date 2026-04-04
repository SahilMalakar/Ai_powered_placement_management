// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse.js";
import fs from "fs/promises";

// Extracts text from a PDF file buffer.
export const extractTextFromPdf = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error: any) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};
