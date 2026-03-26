import { ChatGroq } from "@langchain/groq";
import { serverConfig } from "./index.js";

if (!serverConfig.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not defined in serverConfig");
}

export const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.1, 
  apiKey: serverConfig.GROQ_API_KEY,
});
