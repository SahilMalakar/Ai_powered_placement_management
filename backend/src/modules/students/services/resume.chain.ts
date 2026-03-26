import { RunnableSequence } from "@langchain/core/runnables";
import { llm } from "../../../configs/langchain.config.js";
import { resumeJsonSchema, type ResumeGenerationInput } from "../../../types/students/resume.js";
import { AUDIT_PROMPT, GENERATION_PROMPT } from "../../../utils/prompts/resumePrompts.js";



const structuredLlm = llm.withStructuredOutput(resumeJsonSchema);

export const resumeGenerationChain = RunnableSequence.from([
  {
    // Step 1: Run auditor in the background
    auditedFacts: async (input: ResumeGenerationInput) => {
      const chain = AUDIT_PROMPT.pipe(llm);
      const res = await (chain as any).invoke({ profileData: JSON.stringify(input.profileData) });
      return res.content;
    },
    // Pass along core inputs
    targetRole: (input: ResumeGenerationInput) => input.targetRole,
    additionalContext: (input: ResumeGenerationInput) => input.additionalContext || "Not provided",
    branch: (input: ResumeGenerationInput) => input.branch,
  },
  // Step 2: Final Generation
  GENERATION_PROMPT,
  structuredLlm
]);
