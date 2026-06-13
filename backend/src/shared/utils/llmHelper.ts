import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { llm } from '../../infra/langchain.config.js';

function stripMarkdownFences(text: string): string {
    return text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
}

export async function callLLM(systemPrompt: string, userContent: string): Promise<unknown> {
    const messages = [new SystemMessage(systemPrompt), new HumanMessage(userContent)];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (llm as any).invoke(messages);
    const raw = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    const cleaned = stripMarkdownFences(raw);
    return JSON.parse(cleaned);
}

export async function callLLMText(systemPrompt: string, userContent: string): Promise<string> {
    const messages = [new SystemMessage(systemPrompt), new HumanMessage(userContent)];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (llm as any).invoke(messages);
    return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
}

