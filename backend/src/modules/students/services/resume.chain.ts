import { RunnableSequence } from "@langchain/core/runnables";
import { llm } from "../../../configs/langchain.config.js";
import { resumeJsonSchema, type ResumeGenerationInput } from "../../../types/students/resume.js";
import { AUDIT_PROMPT, GENERATION_PROMPT, ROLE_IDENTIFICATION_PROMPT } from "../../../utils/prompts/resumePrompts.js";

const structuredLlm = llm.withStructuredOutput(resumeJsonSchema);

export const resumeGenerationChain = RunnableSequence.from([
  {
    // Stage 1: Fact Audit
    auditedFacts: async (input: ResumeGenerationInput) => {
      const chain = AUDIT_PROMPT.pipe(llm);
      const res = await (chain as any).invoke({ profileData: JSON.stringify(input.profileData) });
      return res.content;
    },
    // Pass along raw inputs
    branch: (input: ResumeGenerationInput) => input.branch,
    profileData: (input: ResumeGenerationInput) => JSON.stringify(input.profileData),
  },
  {
    // Stage 2: Branch-Specific Role Identification
    identifiedRole: async (input: any) => {
      const chain = ROLE_IDENTIFICATION_PROMPT.pipe(llm);
      const res = await (chain as any).invoke({
        auditedFacts: input.auditedFacts,
        branch: input.branch
      });
      return res.content;
    },
    // Pass along previous audit and full context
    auditedFacts: (input: any) => input.auditedFacts,
    branch: (input: any) => input.branch,
    profileData: (input: any) => input.profileData,
  },
  // Stage 3: High-Impact Fresher Generation (Directly to Structured Output)
  GENERATION_PROMPT,
  structuredLlm
]);
