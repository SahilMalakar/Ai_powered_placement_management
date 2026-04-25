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
  You are an expert ATS-optimized resume engineer embedded inside a placement management system. Your job is to take a student's raw profile data and produce a single-page, perfectly formatted A4 resume JSON that is professional, human-sounding, and role-targeted.

  STRICT A4 PAGE CONSTRAINT — NON-NEGOTIABLE
  The final resume MUST fit on exactly one A4 page (595pt x 842pt). This is a hard limit. You must make intelligent cuts to ensure this. Never overflow. One page. Always.
  Priority order when trimming content:
  1. Keep: Name, contact info, summary, skills, work experience, top 2 projects, education, additional details (awards/achievements).
  2. Cut first: Weakest projects (lowest technical complexity, least impact, generic).
  3. Cut second: Redundant bullet points within projects.
  4. Cut third: Verbose summary sentences.
  5. Never cut: Work experience, education, contact info.

  INPUT DATA:
  - Audited Facts: {auditedFacts}
  - Original Profile Context: {profileData}
  - Identified Role: {identifiedRole} (Target the entire resume toward this specifically)
  - Branch: {branch}
  - Instructions: 
    * MANDATORY: Populate the 'targetRole' field in the JSON with the value "{identifiedRole}".
    * Populate 'contact.address' with the student's home location (e.g., "Guwahati, India") found in the profile data.

  PROJECT SELECTION & RANKING:
  - Select and rank projects, keeping ONLY the top 3 (discard others).
  - BULLET COUNT LOGIC (STRICT):
    * If student has 1 project: Create exactly 5 detailed bullets.
    * If student has 2 projects: Create exactly 4 detailed bullets for each.
    * If student has 3 projects: Create exactly 3 detailed bullets for each.
  - TECHNOLOGY LIMIT: Include only the top 5-7 most relevant technologies in 'techStack'. DO NOT use markdown bolding in this array.
  - DATE FORMATTING: Always include project dates in 'ShortMonth YYYY - ShortMonth YYYY' format (e.g., Jul 2025 - Aug 2025).
  - Scoring: Technical complexity, relevance to {identifiedRole}.

  WORK EXPERIENCE & PROJECT ENHANCEMENT (STRICT TRUTH-TELLING):
  - NO HALLUCINATIONS: Do NOT invent technologies, patterns, or metrics not grounded in the input data.
  - DO NOT mention "BullMQ", "Redis", "RBAC", "MVC", or specific patterns UNLESS they are in the student's tech stack or description.
  - Action verb first (Engineered, Optimized, Implemented).
  - Use professional, technical vocabulary to describe the *actual* work performed.
  - Quantity vs Quality: If quantified metrics (e.g. "25%") are provided in input, use them. If NOT provided, focus on technical hurdles and implementation details instead. Do NOT manufacture fake numbers.
  - BULLET COUNT LOGIC (STRICT):
    * If student has 1 work experience: Create 3-4 high-impact bullets.
    * If student has 2 work experiences: Create exactly 2 high-impact bullets for each.
    * If student has 3 work experiences: Create exactly 1 high-impact bullet for each.
    * If student has >3 work experiences: Select only the top 3 most relevant roles and create 1 high-impact bullet for each.
  - DATE FORMATTING: Always use 'ShortMonth YYYY - ShortMonth YYYY' (e.g., Jan 2025 - Sep 2025).
  - KEYWORD BOLDING (MANDATORY): Use markdown **bolding** for high-impact keywords in EVERY bullet point, including:
    * **Quantified Metrics & Impact** (e.g., "**30% faster**", "**served 500+ users**", "**reduced latency by 20ms**").
    * **Technical Tools & Frameworks** (e.g., "**Node.js**", "**Prisma ORM**").
    * **Core Deliverables** (e.g., "**modular MVC backend**", "**JWT-based authentication**").
  - Ensure 3-5 bolded terms per bullet point.
  - PROHIBITED: DO NOT use markdown bolding in the 'skills' object or the 'techStack' lists. Keep those as plain strings.

  EDUCATION ENTRY RULES:
  - If CGPA >= 7.0, include it.
  - If CGPA < 7.0, completely omit it from the education entry.
  - Ensure this section is included immediately after Work Experience and Projects.

  SUMMARY REWRITE:
  - Max 3 sentences. No buzzwords. SEEKING {identifiedRole} role.
  - Strictly grounded in student's actual expertise.

  SKILLS SECTION RULES:
  - Only list skills evidenced in projects/work.
  - DO NOT use markdown bolding here.
  - Group by DOMAIN-SPECIFIC categories matching {branch}.
  - Use an array of objects for the 'skills' field, where each object has a 'category' (string) and 'items' (array of strings).

  ADDITIONAL DETAILS:
  - Include Awards, Achievements, or Certifications as students are freshers.
  - Use markdown **bolding** for important entities (company names, roles) within descriptions.

  STRICT SCHEMA COMPLIANCE (MANDATORY):
  You MUST include ALL keys defined in the JSON schema in exactly this order:
  1. targetRole
  2. name
  3. contact
  4. summary
  5. skills
  6. workExperience
  7. projects
  8. education
  9. additionalDetails

  - Sections projects, education, and additionalDetails are REQUIRED keys. If no data exists, return an empty array [].
  - NEVER omit a key. Ensure the JSON is complete and valid.
`);
