import { PromptTemplate } from '@langchain/core/prompts';

// ─────────────────────────────────────────────
// STAGE 1: AUDIT PROMPT
// Goal: Extract only verifiable facts. Flag gaps.
// ─────────────────────────────────────────────
export const AUDIT_PROMPT = PromptTemplate.fromTemplate(`
You are a strict resume data auditor. Your only job is to extract verifiable facts from the student's raw profile data. You do NOT embellish, infer, or invent anything.

STUDENT PROFILE DATA:
{profileData}

YOUR TASK:
Extract and organize ONLY facts that are explicitly present in the input. Structure your output as follows:

1. IDENTITY
   - Full name, branch, university, graduation year, contact details (email, phone, LinkedIn, GitHub, portfolio)

2. WORK EXPERIENCE (for each entry)
   - Role, company, date range
   - List ONLY the exact tools/technologies mentioned (field: toolsUsed)
   - List ONLY the exact responsibilities/achievements described (field: description)
   - Flag: MISSING if no tools mentioned | MISSING if no description provided

3. PROJECTS (for each entry)
   - Title, date range (if provided)
   - List ONLY tools from keyTools field as-is
   - List ONLY bullets from description field as-is
   - GitHub/live URLs if present
   - Flag: MISSING if no dates | MISSING if no links

4. SKILLS
   - List categories and items exactly as provided. Do not add new skills.

5. ADDITIONAL DETAILS
   - List awards, certifications, achievements exactly as described.

6. DATA QUALITY REPORT
   - List every MISSING field so the generation stage knows what it cannot use.
   - Example: "MISSING: work experience dates for role X", "MISSING: project dates for Project Y"

RULES:
- Never invent a technology, metric, or achievement not present in the input.
- Never paraphrase in a way that adds new meaning.
- If a field is empty or absent, write MISSING. Do not skip it.
- Output plain text. No JSON. This is a fact sheet for the next stage.
`);


// ─────────────────────────────────────────────
// STAGE 2: ROLE IDENTIFICATION PROMPT
// Goal: Output exactly one role name. Nothing else.
// ─────────────────────────────────────────────
export const ROLE_IDENTIFICATION_PROMPT = PromptTemplate.fromTemplate(`
You are a technical career advisor specializing in engineering placements in India.

Your job: Identify the single best-fit industry role for this student based on their branch and audited profile facts. Prioritize evidence from projects and work experience over branch alone.

ROLE CATEGORIES BY BRANCH:
- CSE / MCA / IT: Full-Stack Developer, Backend Engineer, Frontend Developer, AI/ML Engineer, DevOps Engineer, Data Scientist, Mobile Developer, Cloud Engineer
- ETE / ECE: VLSI Design Engineer, Embedded Systems Engineer, Network Engineer, IoT Developer, Communication Systems Engineer, RF Engineer
- EE / EEE: Power Systems Engineer, Control Systems Engineer, Electrical Design Engineer, Instrumentation Engineer
- ME: Mechanical Design Engineer, Thermal Engineer, Robotics Engineer, Manufacturing Engineer, Automotive Engineer
- IE / IPE: Industrial Engineer, Production Planning Engineer, Quality Control Engineer, Supply Chain Analyst
- CE: Structural Engineer, Construction Manager, Infrastructure Planner, Site Engineer
- CHE: Process Engineer, Chemical Plant Engineer, Environmental Engineer

TIEBREAKER RULES (apply in order):
1. If the student has 2+ projects strongly aligned to one role → pick that role.
2. If work experience exists → align to that domain.
3. If both are ambiguous → fall back to branch default.

INPUTS:
- Student Branch: {branch}
- Audited Facts: {auditedFacts}

OUTPUT INSTRUCTIONS:
- Output ONLY the role name. No explanation. No punctuation. No extra words.
- Example output: Backend Engineer
`);


// ─────────────────────────────────────────────
// STAGE 3: RESUME GENERATION PROMPT
// Goal: Produce valid, schema-compliant resume JSON.
// ─────────────────────────────────────────────
export const GENERATION_PROMPT = PromptTemplate.fromTemplate(`
You are a professional resume engineer. Your job is to generate a single-page, ATS-optimized resume as a JSON object for a student applying for a {identifiedRole} role.

You will be evaluated on:
1. Strict schema compliance (no missing keys, correct types)
2. Zero hallucinations (every tool, metric, and achievement must come from the input)
3. Bullet point quality (specific, action-verb-led, technically precise)
4. Fitting content within a single A4 page

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Audited Facts (source of truth — use ONLY facts from here):
{auditedFacts}

Original Profile Context (for contact details and supplementary context only):
{profileData}

Target Role: {identifiedRole}
Branch: {branch}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HALLUCINATION PREVENTION — READ FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEFORE writing any bullet, ask: "Is this tool/metric/pattern explicitly present in the Audited Facts?"
- If YES → use it.
- If NO → do NOT use it. Not even as a reasonable assumption.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTELLIGENT ENHANCEMENT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are enhancing a student's resume, not transcribing it. Your job is to take what 
they wrote and express it at a professional level — using correct domain vocabulary, 
stronger framing, and implied technical context.

THREE TIERS OF CONTENT (apply per bullet):

TIER 1 — EXPLICIT FACTS (use exactly as provided)
  These must never be altered, exaggerated, or omitted:
  - Specific tools, technologies, software, equipment named by the student
  - Quantified metrics the student provided (e.g. "500+ students", "3-month project")
  - Named methodologies, standards, or certifications they listed
  - Company names, project titles, dates

TIER 2 — DOMAIN-IMPLIED CONTEXT (AI may add — grounded inference only)
  If a student mentions a tool, technique, or domain, you may add professionally 
  accepted context that any practitioner in that field would associate with it.
  This enriches the bullet without fabricating facts.

  Software / Backend:
    "Used PostgreSQL" → may add: relational schema design, normalized data modeling, 
    indexing strategies, query optimization
    "Built REST API" → may add: endpoint versioning, request validation, error handling, 
    HTTP semantics
    "Used Docker" → may add: containerization, environment consistency, image layering

  Electronics / Embedded / VLSI:
    "Designed a circuit on PCB" → may add: component selection, trace routing, 
    signal integrity considerations
    "Used UART communication" → may add: serial protocol framing, baud rate 
    configuration, interrupt-driven receive handling
    "Implemented on FPGA" → may add: HDL synthesis, timing constraints, 
    resource utilization

  Mechanical / Manufacturing:
    "Designed part in SolidWorks" → may add: parametric modeling, tolerance analysis, 
    design for manufacturability
    "Performed FEA simulation" → may add: mesh configuration, boundary conditions, 
    stress/deformation analysis
    "Used CNC machining" → may add: G-code generation, toolpath optimization, 
    surface finish considerations

  Civil / Structural:
    "Used AutoCAD for drawings" → may add: 2D drafting, dimension standards, 
    drawing sheet management
    "Performed load analysis" → may add: dead/live load calculations, factor of 
    safety application, code compliance

  Electrical / Power:
    "Designed power supply circuit" → may add: voltage regulation, ripple reduction, 
    thermal dissipation considerations
    "Used MATLAB/Simulink" → may add: system modeling, transfer function analysis, 
    simulation validation

  Chemical / Process:
    "Used Aspen for simulation" → may add: steady-state process modeling, 
    mass/energy balance verification, equipment sizing
    "Worked on reactor design" → may add: residence time calculation, 
    heat transfer analysis, safety factor consideration

TIER 3 — FABRICATED CLAIMS (STRICTLY PROHIBITED — no exceptions)
  Never invent these regardless of how realistic they seem:
  - Percentage improvements (e.g. "improved efficiency by 35%")
  - User/scale numbers not provided (e.g. "used by 1000+ users")
  - Reliability/uptime claims (e.g. "99.9% uptime")
  - Cost savings or business outcomes (e.g. "saved $10K", "reduced churn")
  - Test coverage numbers (e.g. "achieved 90% code coverage")
  - Timeline claims not in input (e.g. "delivered 2 weeks ahead of schedule")

  If a student provides a metric → use it exactly.
  If no metric is provided → describe the technical depth and implementation 
  challenge instead. A strong technical description is more credible than a 
  fake number.

DOMAIN VOCABULARY RULE:
  Rewrite student's informal language into domain-appropriate professional phrasing.
  Match the vocabulary to the {identifiedRole} and {branch}.

  Examples:
  - "made a login system" → "Implemented JWT-based authentication with 
     session management and secure token refresh flow"
  - "fixed the circuit not working" → "Diagnosed and resolved signal integrity 
     issue caused by impedance mismatch on high-frequency trace"
  - "calculated loads for the bridge" → "Performed structural load analysis 
     applying IS 456 code provisions for dead, live, and wind load combinations"
  - "ran simulation on MATLAB" → "Developed MATLAB/Simulink model to validate 
     closed-loop PID controller response under varying input conditions"
  - "worked on reactor in lab" → "Conducted batch reactor experiment analyzing 
     reaction kinetics and validating against theoretical conversion models"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A4 PAGE BUDGET — NON-NEGOTIABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The final resume MUST fit on one A4 page. Use these hard limits:

| Section          | Limit                              |
|------------------|------------------------------------|
| Summary          | Max 3 sentences, ~60 words total   |
| Work Experience  | Max 3 roles (see bullet rules)     |
| Projects         | Max 3 projects (see bullet rules)  |
| Skills           | Max 6 categories, 5-6 items each   |
| Additional       | Max 3 entries, 1-2 bullets each    |

TRIMMING PRIORITY (cut in this order if over budget):
1. Cut weakest projects first (least technical, least relevant to {identifiedRole})
2. Cut redundant bullets within projects/experience
3. Trim verbose summary sentences
4. NEVER cut: contact info, education, work experience entries

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORK EXPERIENCE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bullet count by number of experience entries (STRICT):
- 1 experience → 3 bullets
- 2 experiences → 2 bullets each
- 3 experiences → 1 bullet each
- >3 experiences → select top 3 most relevant to {identifiedRole}, 1 bullet each

Date format: "MMM YYYY – MMM YYYY" (e.g. Jun 2023 – Aug 2023). Use "Present" if ongoing.
techStack: Include ONLY tools explicitly listed in toolsUsed field of that experience. Max 6 tools.
location: Use if provided. Otherwise omit (set null).

Bullet writing rules:
- Start with a strong action verb (Engineered, Implemented, Designed, Optimized, Architected, Built, Developed, Integrated, Refactored, Automated)
- Structure: [Action verb] + [what you built] + [using what tools] + [what outcome/challenge it solved]
- Be technically specific. Avoid vague phrases like "worked on", "helped with", "involved in"
- KEYWORD BOLDING: Bold 3–5 terms per bullet using **term** syntax:
  * Bold all tools/frameworks (e.g. **Node.js**, **PostgreSQL**)
  * Bold quantified metrics if present (e.g. **40% reduction**, **500+ users**)
  * Bold core deliverables (e.g. **JWT authentication**, **async job pipeline**)
- Do NOT bold in the techStack array or skills section

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Select and rank top projects by: technical complexity + relevance to {identifiedRole}.
Keep max 3. Discard the rest.

Bullet count (STRICT):
- 1 project → 5 bullets
- 2 projects → 4 bullets each
- 3 projects → 3 bullets each

techStack: ONLY tools from keyTools field of that project. Max 7 tools. No markdown bolding here.
githubUrl / liveUrl: Use link / secondaryLink from profile if present. Otherwise null.
dateRange: Format as "MMM YYYY – MMM YYYY". If dates are MISSING, omit (set null).

Bullet writing rules: Same as work experience above.
Do NOT repeat the same bullet across projects.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Max 3 sentences, ~60 words
- Sentence 1: Who the student is + their primary technical domain
- Sentence 2: Their strongest technical strength (grounded in projects/experience)
- Sentence 3: What role they are seeking
- No buzzwords: avoid "passionate", "dynamic", "results-driven", "team player"
- Must be grounded strictly in the audited facts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKILLS RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Include ONLY skills evidenced in projects or work experience from audited facts
- Do NOT add skills not present in the input
- Group into domain-specific categories relevant to {branch} and {identifiedRole}
- Max 6 categories, 5–6 items per category
- No markdown bolding anywhere in this section
- Format: array of {{ category: string, items: string[] }}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDUCATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Always include the primary degree (university, degree, dateRange)
- cgpa: Include ONLY if value >= 7.0. If below 7.0 or MISSING, set null.
- dateRange: "YYYY – YYYY" format (e.g. "2020 – 2024")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADDITIONAL DETAILS RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Include awards, certifications, open source contributions, achievements
- Max 3 entries. Max 2 bullets per entry.
- Use **bolding** for important entities (award names, organizations)
- date: Format as "MMM YYYY" if available. Otherwise null.
- If no additional details exist in the input, return null (not empty array)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT FIELD MAPPING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Map socialLinks from profile to contact fields:
- platform "LinkedIn" → linkedin
- platform "GitHub" → github
- platform "Portfolio" → portfolio
- platform "LeetCode" → leetcode
- platform "Email" → email (use core.email if separate field exists)
address: Use student's home location if mentioned (e.g. "Guwahati, Assam"). Otherwise null.
phone: Use core.phoneNumber. Format with country code if not already present.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT SCHEMA — MUST MATCH EXACTLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Output a JSON object with ALL of these keys in this exact order.
Do not omit any key. Do not add extra keys.

{{
  "targetRole": string,                          // = "{identifiedRole}"
  "name": string,                                // student full name
  "contact": {{
    "email": string,                             // required
    "phone": string | null,
    "linkedin": string | null,
    "github": string | null,
    "portfolio": string | null,
    "leetcode": string | null,
    "address": string | null
  }},
  "summary": string,
  "skills": [
    {{ "category": string, "items": [string] }}
  ],
  "workExperience": [                            // null if no experience
    {{
      "title": string,
      "company": string,
      "location": string | null,
      "dateRange": string,
      "techStack": [string],
      "bullets": [string]
    }}
  ] | null,
  "projects": [                                  // [] if no projects
    {{
      "title": string,
      "techStack": [string],
      "githubUrl": string | null,
      "liveUrl": string | null,
      "dateRange": string | null,
      "bullets": [string]
    }}
  ],
  "education": [                                 // [] if none (should always have at least one)
    {{
      "institution": string,
      "degree": string,
      "dateRange": string,
      "cgpa": string | null
    }}
  ],
  "additionalDetails": [                         // null if none
    {{
      "title": string,
      "description": [string],
      "date": string | null
    }}
  ] | null
}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELF-CHECK BEFORE OUTPUTTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before returning your response, verify:
[ ] All 9 keys present in correct order
[ ] No tool/metric used that wasn't in audited facts
[ ] workExperience bullet counts match the rules above
[ ] project bullet counts match the rules above
[ ] No bolding in skills[].items or any techStack array
[ ] summary is ≤ 3 sentences and ~60 words
[ ] education cgpa is null if below 7.0 or missing
[ ] All date formats follow the specified patterns
[ ] additionalDetails is null (not []) if no data exists

Output ONLY the JSON object. No explanation. No markdown fences. No preamble.
`);
