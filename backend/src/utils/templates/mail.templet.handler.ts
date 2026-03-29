import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";
import { InternalServerError } from "../errors/httpErrors.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function readMailTemplate(
  templateId: string,
  params: Record<string, any>,
): Promise<string> {
  try {
    const templatePath = path.join(__dirname, `${templateId}.hbs`);

    const fileContent = await fs.readFile(templatePath, "utf-8");

    const compiledTemplate = Handlebars.compile(fileContent);

    return compiledTemplate(params);
  } catch (error) {
    console.error(`Read email template error for ${templateId}:`, error);
    throw new InternalServerError(`Template not found: ${templateId}`);
  }
}
