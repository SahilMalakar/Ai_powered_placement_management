import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { llm } from '../../infra/langchain.config.js';
import { jsonrepair } from 'jsonrepair';

function stripMarkdownFences(text: string): string {
    return text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
}

export async function callLLM(systemPrompt: string, userContent: string): Promise<unknown> {
    const messages = [new SystemMessage(systemPrompt), new HumanMessage(userContent)];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (llm as any).invoke(messages);
    const raw = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    const cleaned = stripMarkdownFences(raw);

    // Try direct parse first; if it fails, repair the malformed LLM JSON
    try {
        return JSON.parse(cleaned);
    } catch {
        const repaired = jsonrepair(cleaned);
        return JSON.parse(repaired);
    }
}

export async function callLLMText(systemPrompt: string, userContent: string): Promise<string> {
    const messages = [new SystemMessage(systemPrompt), new HumanMessage(userContent)];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (llm as any).invoke(messages);
    return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
}
