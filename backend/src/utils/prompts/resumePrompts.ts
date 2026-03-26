import { PromptTemplate } from "@langchain/core/prompts";

/**
 * Stage 1: Fact Extraction and Audit Prompt.
 * Focuses on pulling raw, verifiable data from the student profile.
 */
export const AUDIT_PROMPT = PromptTemplate.fromTemplate(`
  You are a professional technical auditor. Analyze this student's profile data.
  Extract core facts, project metrics, and technical skills used. 
  Focus on identifying achievements that can be measured or quantified.
  
  Student Data: {profileData}
  
  Output a concise summary of raw facts.
`);

/**
 * Stage 2: Final Resume Generation Prompt.
 * Applies the career pivot logic and professional formatting.
 */
export const GENERATION_PROMPT = PromptTemplate.fromTemplate(`
  You are an expert technical resume writer. Your job is to generate a high-impact resume in JSON format.
  
  CONTEXT:
  - Branch: {branch}
  - Target Role: {targetRole}
  - Additional Context: {additionalContext}
  - Facts to Use: {auditedFacts}
  
  CORE RULES:
  1. GROUNDING: Use ONLY the provided facts. DO NOT hallucinate work experience.
  2. ADAPTABILITY: If the "Target Role" differs from the student's "Branch", pivot the language to highlight "Transferable Skills". 
     - e.g. For a coder going into Sales, highlight communication and logic over pure syntax.
  3. READABILITY: Use strong action verbs (Synthesized, Optimized, Orchestrated).
  4. SUMMARY: Write a professional summary that bridges their education and target role.
`);
