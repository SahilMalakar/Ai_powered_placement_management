// import { ChatGroq } from '@langchain/groq';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { serverConfig } from '../configs/index.js';

/**
 * LangChain Configuration for Google Gemini
 * Includes a robust fallback mechanism to handle model unavailability or rate limits.
 */

if (!serverConfig.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in serverConfig');
}

// Model names to try in order (Primary -> Fallbacks)
// gemini-2.5-flash has the best free tier quota; 2.0-flash and 2.0-flash-lite as fallbacks.
const MODEL_NAMES = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
];

const createModel = (modelName: string) => {
    return new ChatGoogleGenerativeAI({
        model: modelName,
        temperature: 0.1,
        apiKey: serverConfig.GEMINI_API_KEY,
    });
};

const [primaryModelName, ...fallbackModelNames] = MODEL_NAMES;

// Initialize the primary model
const primaryModel = createModel(primaryModelName!);

// Initialize fallback models
const fallbackModels = fallbackModelNames.map((name) => createModel(name));

/**
 * Exported LLM instance with automated fallback mechanism.
 * 
 * WHY USE A PROXY?
 * LangChain's .withFallbacks() returns a Runnable, which lacks model-specific methods 
 * like 'withStructuredOutput'. Since our workers rely on these methods, we use a 
 * Proxy to intercept calls and apply the fallback logic to both structured 
 * and unstructured execution paths.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const llm: any = new Proxy(primaryModel, {
    get(target, prop, receiver) {
        // Intercept 'withStructuredOutput' to return a structured chain with fallbacks
        if (prop === 'withStructuredOutput') {
            return (schema: any, config?: any) => {
                const primaryStructured = primaryModel.withStructuredOutput(schema, config);
                const fallbackStructureds = fallbackModels.map(f => f.withStructuredOutput(schema, config));
                return primaryStructured.withFallbacks(fallbackStructureds);
            };
        }

        // Intercept execution methods to use the fallback-enabled chain
        const executionMethods = ['invoke', 'stream', 'batch', 'pipe', 'streamLog', 'streamEvents'];
        if (typeof prop === 'string' && executionMethods.includes(prop)) {
            const fallbackChain = primaryModel.withFallbacks(fallbackModels);
            const method = (fallbackChain as any)[prop];
            return typeof method === 'function' ? method.bind(fallbackChain) : method;
        }

        // Delegate everything else to the primary model
        return Reflect.get(target, prop, receiver);
    }
});

/*
// Previous Groq Configuration (Commented out as requested)
export const llm = new ChatGroq({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.1,
    apiKey: serverConfig.GROQ_API_KEY,
});
*/
