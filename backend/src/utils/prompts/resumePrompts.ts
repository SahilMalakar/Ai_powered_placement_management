import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Stage 1: Fact Extraction and Audit Prompt.
 * Extracts verifiable facts from the student's raw profile data.
 */
export const AUDIT_PROMPT = PromptTemplate.fromTemplate(`
  You are a professional resume auditor. Analyze this student's profile data.
  Identify core achievements, tools/technologies used, and key responsibilities.
  
  Student Data: {profileData}
  
  Output a concise summary of raw facts. Explicitly note missing profile data as MISSING.
`);

/**
 * Stage 2: Branch-Specific Role Identification Prompt.
 * Identifies the best-fit industry role based on branch and profile data.
 */
export const ROLE_IDENTIFICATION_PROMPT = PromptTemplate.fromTemplate(`
  Identify the most suitable industry role for this student based on their branch and profile.
  
  ROLE CATEGORIES BY BRANCH:
  - CSE / MCA: Full-Stack Developer, Backend Engineer, AI/ML Engineer, DevOps Engineer, Data Scientist, Mobile Developer.
  - ETE: VLSI Design Engineer, Embedded Systems Engineer, Network Engineer, Communication Systems Engineer, IoT Developer.
  - EE: Power Systems Engineer, Control Systems Engineer, Electrical Design Engineer, Instrumentation Engineer.
  - ME: Mechanical Design Engineer (CAD/CAM), Thermal Engineer, Robotics Engineer, Manufacturing Engineer, Automotive Engineer.
  - IE: Industrial Engineer, Production Planning Engineer, Quality Control Engineer, Supply Chain Analyst.
  - CE: Structural Engineer, Construction Manager, Infrastructure Planner, Site Engineer, Transportation Engineer.
  - CHE: Process Engineer, Chemical Plant Engineer, Environmental Engineer, Petrochemical Engineer.
  - IPE: Production Engineer, Process Optimization Engineer, Industrial Automation Engineer.
  - Cross-Domain: Technical Sales, Business Development, Product Management, Operations, Technical Writer.

  INPUTS:
  - Student Branch: {branch}
  - Audited Facts: {auditedFacts}
  
  Output ONLY the identified role name.
`);

/**
 * Stage 3: High-Impact Resume Generation.
 * Generates a professional, one-page resume JSON from audited facts.
 */
export const GENERATION_PROMPT = PromptTemplate.fromTemplate(`
  You are an expert resume writer for fresh graduates. Generate a high-impact, ONE-PAGE resume in JSON format.
  
  INPUT DATA:
  - Audited Facts: {auditedFacts}
  - Original Profile Context: {profileData}
  - Identified Role: {identifiedRole}
  - Branch: {branch}
  
  EXPANSION RULES:
  1. WORK EXPERIENCE: Expand EVERY experience into 1-2 professional bullet points. Use field "toolsUsed" to list the key technologies used (comma-separated string).
  2. PROJECTS: Expand EVERY project into 2-3 high-impact bullet points.
  3. ADDITIONAL DETAILS: Keep each entry as a single concise line. Use metrics where possible.
  
  AESTHETIC RULES (CRITICAL):
  1. DATE FORMAT: Use abbreviated month + year (e.g., "Aug 2024", "Jan 2025").
  2. EDUCATION: For "graduationDate", provide a full range (e.g., "Aug 2022 – Aug 2026").
  3. BOLDING: Use markdown **word** syntax ONLY in bullet point descriptions (experience, projects, additionalDetails).
     - Bold: Technical Tools, Impact Metrics, and Core Achievements within bullets.
     - DO NOT bold anything in Summary, Skills, Project Titles, or section headers.
  
  FIELD MAPPING (CRITICAL — match exactly):
  - Skills array: each entry has "category" (string) and "skills" (string array). NOT "items".
  - Additional details: each entry has "title" (string), "description" (string array), and optional "date" (string). NOT "achievements".
  - Experience "toolsUsed": a comma-separated string of tools/technologies.
  - Project "keyTools": a comma-separated string of the tech stack used.
  
  WRITING STYLE:
  - Use Power Verbs: Engineered, Orchestrated, Optimized, Architected, Designed, Implemented.
  - Tailor language to "{identifiedRole}" and "{branch}" context.
  - For non-CS branches: emphasize domain-specific tools (e.g., AutoCAD, MATLAB, ETAP, STAAD Pro, CATIA).
  
  STRICT RULES:
  - NO HALLUCINATION: Only use data from the profile/audit. If missing, skip the field entirely.
  - NO PLACEHOLDERS: Do not use "abc@email.com", "0.0 GPA", or "Company Name".
  - If profile has no work experience, set "experience" to null.
  
  Return the output in the specified JSON schema.
`);
