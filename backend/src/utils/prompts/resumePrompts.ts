import { PromptTemplate } from "@langchain/core/prompts";

/**
 * Stage 1: Fact Extraction and Audit Prompt. 
 */
export const AUDIT_PROMPT = PromptTemplate.fromTemplate(`
  You are a professional technical auditor. Analyze this student's profile data.
  Identify the core achievements, tech stack, and responsibilities.
  
  Student Data: {profileData}
  
  Output a concise summary of raw facts. Explicitly note missing profile data as MISSING.
`);

/**
 * Stage 2: Branch-Specific Role Identification Prompt.
 */
export const ROLE_IDENTIFICATION_PROMPT = PromptTemplate.fromTemplate(`
  Identify the most suitable industry role for this student.
  
  MANDATORY SELECTION CATEGORIES:
  - Tech: Full-stack, Software Dev, AI/ML, DevOps, Data Science.
  - ETE Core: VLSI Design, Embedded Systems, Networking, Communication Hardware.
  - ME Core: Mechanical Design (CAD), Thermal Engineering, Robotics, Manufacturing.
  - EE Core: Power Systems, Control Engineering, Electrical Systems Design.
  - CE Core: Structural Engineering, Infrastructure Planning, Site Management.
  - Non-Tech: Technical Sales, Business Development, Product Management, Operations.

  INPUTS:
  - Student Branch: {branch}
  - Audited Facts: {auditedFacts}
  
  Output ONLY the identified role name.
`);

/**
 * Stage 3: High-Impact Generation.
 * Focuses on professional expansion and power-verb phrasing.
 */
export const GENERATION_PROMPT = PromptTemplate.fromTemplate(`
  You are an expert resume writer. Generate a high-impact, ONE-PAGE resume in JSON format.
  
  INPUT DATA:
  - Audited Facts: {auditedFacts}
  - Original Profile Context: {profileData}
  - Identified Role: {identifiedRole}
  - Branch: {branch}
  
  EXPANSION RULES:
  1. WORK EXPERIENCE: Expand EVERY experience into 1-2 professional bullet points. 
  2. PROJECTS: Expand EVERY project into 2-3 high-impact bullet points.
  3. ACHIEVEMENTS: Strictly 1 line. Use metrics (e.g., "Reduced X by 20%").
  
  AESTHETIC RULES (CRITICAL):
  1. DATE FORMAT: Use abbreviated month (3 letters) followed by year (e.g., "Aug 2024", "Jan 2025").
  2. EDUCATION TIMELINE: For "graduationDate", provide a full range (e.g., "Aug 2022 – Aug 2026").
  3. HIGH-IMPACT BOLDING (ONLY IN DESCRIPTIONS): Use markdown bolding (double asterisks **word**) strictly within bullet points for Work Experience, Projects, and Achievements. 
     - DO NOT use bolding in the Summary, Technical Skills list, Project Titles, or any other section.
     - Bold: Technical Tools, Impact Metrics, and Core Achievements within allowed bullets.
  
  WRITING STYLE:
  - Use Power Verbs: Engineered, Orchestrated, Optimized, Architected.
  - Tailor language to the "{identifiedRole}". 
  
  STRICT RULES:
  - NO HALLUCINATION: Only use the data provided in profile/audit. If missing, skip the field.
  - NO PLACEHOLDERS: Do not use "abc@email.com", "0.0 GPA", or "Company Name".
  
  Return the output in the specified JSON schema.
`);
