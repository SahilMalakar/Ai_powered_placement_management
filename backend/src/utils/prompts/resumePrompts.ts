import { PromptTemplate } from '@langchain/core/prompts';

// =============================================================
// STAGE 1: AUDIT PROMPT
// Goal: Extract only verifiable facts. Flag gaps.
// Gemini note: Plain text output avoids JSON fence injection issues.
// =============================================================
export const AUDIT_PROMPT = PromptTemplate.fromTemplate(`
You are a strict resume data auditor. Extract only verifiable facts from the student profile. Do not embellish, infer, or invent anything.

STUDENT PROFILE DATA:
{profileData}

Extract and organize ONLY facts explicitly present in the input, using this structure:

1. IDENTITY
   - Full name, branch, university, graduation year
   - Contact: email, phone, LinkedIn, GitHub, portfolio

2. WORK EXPERIENCE (repeat for each role)
   - Role title | Company | Date range
   - toolsUsed: list only exact tools/technologies named
   - description: list only exact responsibilities or achievements stated
   - Flag MISSING if no tools mentioned
   - Flag MISSING if no description provided
   - Flag MISSING if no dates provided

3. PROJECTS (repeat for each project)
   - Title | Date range (if present)
   - keyTools: list only tools from the input as-is
   - description: list only bullets from the input as-is
   - GitHub URL | Live URL (if present)
   - Flag MISSING if no dates
   - Flag MISSING if no links

4. SKILLS
   - List categories and items exactly as provided. Do not add skills.

5. ADDITIONAL DETAILS
   - Awards, certifications, achievements — exactly as described

6. DATA QUALITY REPORT
   - List every MISSING field explicitly so the next stage knows what it cannot use
   - Example: "MISSING: work experience dates for role X"
   - Example: "MISSING: project links for Project Y"

RULES:
- Never invent a technology, metric, or achievement not in the input.
- Never paraphrase in a way that adds new meaning.
- If a field is absent or empty, write MISSING. Do not skip it.
- Output plain text only. No JSON. No markdown headers. This is a fact sheet.
`);


// =============================================================
// STAGE 2: ROLE IDENTIFICATION PROMPT
// Goal: Output exactly one role name — nothing else.
// Gemini note: Gemini often adds explanation. The closing rule is firm.
// =============================================================
export const ROLE_IDENTIFICATION_PROMPT = PromptTemplate.fromTemplate(`
You are a technical career advisor for engineering placements in India.

Identify the single best-fit industry role for this student. Use branch as a fallback only — prioritize evidence from projects and work experience.

ROLE OPTIONS BY BRANCH:
- CSE / MCA / IT: Full-Stack Developer, Backend Engineer, Frontend Developer, AI/ML Engineer, DevOps Engineer, Data Scientist, Mobile Developer, Cloud Engineer
- ETE / ECE: VLSI Design Engineer, Embedded Systems Engineer, Network Engineer, IoT Developer, Communication Systems Engineer, RF Engineer
- EE / EEE: Power Systems Engineer, Control Systems Engineer, Electrical Design Engineer, Instrumentation Engineer
- ME: Mechanical Design Engineer, Thermal Engineer, Robotics Engineer, Manufacturing Engineer, Automotive Engineer
- IE / IPE: Industrial Engineer, Production Planning Engineer, Quality Control Engineer, Supply Chain Analyst
- CE: Structural Engineer, Construction Manager, Infrastructure Planner, Site Engineer
- CHE: Process Engineer, Chemical Plant Engineer, Environmental Engineer

TIEBREAKER (apply in order):
1. 2+ projects strongly aligned to one role → pick that role
2. Work experience exists → align to that domain
3. Both ambiguous → use branch default

INPUTS:
Student Branch: {branch}
Audited Facts: {auditedFacts}

YOUR OUTPUT:
Write the role name only. No explanation. No punctuation. No preamble. No extra words.
If you write anything other than the role name, your output is invalid.

Example of correct output:
Backend Engineer
`);


// =============================================================
// STAGE 3: RESUME GENERATION PROMPT
// Goal: Valid, schema-compliant resume JSON — no hallucinations.
// Gemini notes:
//   - Use responseSchema (Gemini native) alongside this prompt when possible
//   - Gemini wraps JSON in fences by default — the closing rule forbids this
//   - Gemini respects numbered self-checks better than bullet checklists
// =============================================================
export const GENERATION_PROMPT = PromptTemplate.fromTemplate(`
You are a professional resume engineer. Generate a single-page ATS-optimized resume as a JSON object for a student targeting a {identifiedRole} role.

You will be graded on:
1. Exact schema compliance — no missing keys, correct types, correct key order
2. Zero hallucinations — every tool, metric, and achievement must come from the audited facts
3. Bullet quality — action-verb-led, technically specific, professionally phrased
4. A4 fit — all content must fit on one printed A4 page

=== INPUTS ===
Audited Facts (source of truth — use ONLY facts from here):
{auditedFacts}

Original Profile (for contact details and supplementary context only):
{profileData}

Target Role: {identifiedRole}
Branch: {branch}

=== HALLUCINATION RULE ===
Before writing any bullet, ask: "Is this tool, metric, or pattern explicitly in the Audited Facts?"
- YES → use it
- NO → do not use it, not even as a reasonable assumption

=== CONTENT ENHANCEMENT TIERS ===

TIER 1 — EXPLICIT FACTS (never alter)
These must be used exactly as provided:
- Named tools, technologies, software, or equipment
- Quantified metrics the student stated (e.g. "500+ students", "3-month project")
- Named methodologies, standards, certifications
- Company names, project titles, dates

TIER 2 — DOMAIN-IMPLIED CONTEXT (you may add — grounded inference only)
If a student names a tool or domain, you may add professionally accepted context that any practitioner would associate with it.

Software / Backend:
  "Used PostgreSQL" → may add: relational schema design, indexing strategies, query optimization
  "Built REST API" → may add: endpoint versioning, request validation, HTTP semantics
  "Used Docker" → may add: containerization, environment consistency, image layering

Electronics / Embedded / VLSI:
  "Designed circuit on PCB" → may add: component selection, trace routing, signal integrity
  "Used UART" → may add: serial framing, baud rate configuration, interrupt-driven receive
  "Implemented on FPGA" → may add: HDL synthesis, timing constraints, resource utilization

Mechanical / Manufacturing:
  "Designed part in SolidWorks" → may add: parametric modeling, tolerance analysis, design for manufacturability
  "Performed FEA simulation" → may add: mesh configuration, boundary conditions, stress analysis
  "Used CNC machining" → may add: G-code generation, toolpath optimization, surface finish

Civil / Structural:
  "Used AutoCAD" → may add: 2D drafting, dimension standards, drawing sheet management
  "Performed load analysis" → may add: dead/live load calculations, factor of safety, code compliance

Electrical / Power:
  "Designed power supply circuit" → may add: voltage regulation, ripple reduction, thermal dissipation
  "Used MATLAB/Simulink" → may add: system modeling, transfer function analysis, simulation validation

Chemical / Process:
  "Used Aspen for simulation" → may add: steady-state modeling, mass/energy balance, equipment sizing
  "Worked on reactor design" → may add: residence time, heat transfer analysis, safety factor

TIER 3 — FABRICATED CLAIMS (strictly prohibited — no exceptions)
Never invent:
- Percentage improvements (e.g. "improved efficiency by 35%")
- User/scale numbers not provided (e.g. "used by 1000+ users")
- Reliability or uptime claims (e.g. "99.9% uptime")
- Cost savings or business outcomes
- Test coverage percentages
- Timeline claims not stated by the student

If the student provides a metric → use it exactly as stated.
If no metric is provided → describe technical depth and implementation challenge instead.

DOMAIN VOCABULARY RULE:
Rewrite informal language into domain-appropriate professional phrasing for {identifiedRole} / {branch}.
Examples:
  "made a login system" → "Implemented JWT-based authentication with session management and secure token refresh flow"
  "fixed the circuit not working" → "Diagnosed and resolved signal integrity issue caused by impedance mismatch on high-frequency trace"
  "calculated loads for the bridge" → "Performed structural load analysis applying IS 456 provisions for dead, live, and wind load combinations"
  "ran simulation on MATLAB" → "Developed MATLAB/Simulink model to validate closed-loop PID controller response under varying input conditions"

=== A4 PAGE BUDGET ===
Section          | Hard Limit
Summary          | Max 3 sentences, ~60 words
Work Experience  | Max 3 roles
Projects         | Max 3 projects
Skills           | Max 6 categories, 5–6 items each
Additional       | Max 3 entries, 1–2 bullets each

Trimming priority (cut in this order if over budget):
1. Cut weakest projects (least technical, least relevant to {identifiedRole})
2. Cut redundant bullets within sections
3. Trim verbose summary sentences
4. Never cut: contact info, education, work experience entries

=== WORK EXPERIENCE RULES ===
Bullet count by number of roles:
  1 role  → 4 bullets
  2 roles → 3 bullets each
  3 roles → 2 bullets each
  4+ roles → select top 3 most relevant to {identifiedRole}, 2 bullets each

Date format: "MMM YYYY – MMM YYYY" (e.g. Jun 2023 – Aug 2023). Use "Present" if ongoing.
techStack: Only tools explicitly listed in toolsUsed for that role. Max 6 tools.
location: Include if provided. Otherwise set null.

Bullet rules:
- Start with a strong action verb: Engineered, Implemented, Designed, Optimized, Architected, Built, Developed, Integrated, Refactored, Automated
- Structure: [Action verb] + [what was built] + [tools used] + [outcome or challenge solved]
- Be specific. Avoid: "worked on", "helped with", "involved in"
- Bold 3–5 terms per bullet using **term** syntax:
    Bold: all tools/frameworks (e.g. **Node.js**, **PostgreSQL**)
    Bold: quantified metrics if present (e.g. **40% reduction**)
    Bold: core deliverables (e.g. **JWT authentication**)
- Do NOT bold inside techStack arrays or skills section

=== PROJECT RULES ===
Select top projects by: technical complexity + relevance to {identifiedRole}. Max 3.

Bullet count:
  1 project  → 5 bullets
  2 projects → 4 bullets each
  3 projects → 3 bullets each

techStack: Only tools from keyTools for that project. Max 7 tools. No bold in techStack.
githubUrl / liveUrl: Use link / secondaryLink if present. Otherwise null.
dateRange: "MMM YYYY – MMM YYYY". If MISSING from audited facts → set null.
Bullet rules: Same as work experience. Do not repeat the same bullet across projects.

=== SUMMARY RULES ===
- Max 3 sentences, ~60 words total
- Sentence 1: Who the student is + their primary technical domain
- Sentence 2: Their strongest verified technical strength (from projects or experience)
- Sentence 3: What role they are seeking
- Avoid: "passionate", "dynamic", "results-driven", "team player"
- Ground every claim in the audited facts

=== SKILLS RULES ===
- Include only skills evidenced in projects or work experience in the audited facts
- Do not add skills not present in the input
- Group into domain-relevant categories for {branch} and {identifiedRole}
- Max 6 categories, 5–6 items each
- No bold anywhere in this section

=== EDUCATION RULES ===
- Always include the primary degree (institution, degree, dateRange)
- cgpa: Include only if value is 7.0 or above. If below 7.0 or MISSING, set null.
- dateRange format: "YYYY – YYYY" (e.g. "2020 – 2024")

=== ADDITIONAL DETAILS RULES ===
- Include awards, certifications, open source contributions, achievements
- Max 3 entries, max 2 bullets each
- Bold important entities using **term** syntax (award names, organizations)
- date: "MMM YYYY" if available. Otherwise null.
- If none exist in the input, set additionalDetails to null — not an empty array

=== CONTACT FIELD MAPPING ===
Map socialLinks to contact fields:
  platform "LinkedIn"  → linkedin
  platform "GitHub"    → github
  platform "Portfolio" → portfolio
  platform "LeetCode"  → leetcode
  platform "Email"     → email (use core.email if a separate field exists)
address: Use student's home location if mentioned (e.g. "Guwahati, Assam"). Otherwise null.
phone: Use core.phoneNumber. Add country code if missing.

=== OUTPUT SCHEMA ===
Return a single JSON object with ALL keys in this exact order.
Do not omit any key. Do not add extra keys. Do not wrap in markdown fences.

{{
  "targetRole": string,
  "name": string,
  "contact": {{
    "email": string,
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
  "workExperience": [
    {{
      "title": string,
      "company": string,
      "location": string | null,
      "dateRange": string,
      "techStack": [string],
      "bullets": [string]
    }}
  ] | null,
  "projects": [
    {{
      "title": string,
      "techStack": [string],
      "githubUrl": string | null,
      "liveUrl": string | null,
      "dateRange": string | null,
      "bullets": [string]
    }}
  ],
  "education": [
    {{
      "institution": string,
      "degree": string,
      "dateRange": string,
      "cgpa": string | null
    }}
  ],
  "additionalDetails": [
    {{
      "title": string,
      "description": [string],
      "date": string | null
    }}
  ] | null
}}

=== SELF-CHECK (verify before outputting) ===
1. All 9 top-level keys present in the correct order?
2. Every tool, metric, and achievement sourced from the audited facts?
3. Work experience bullet counts match the rules?
4. Project bullet counts match the rules?
5. No bold text inside skills[].items or any techStack array?
6. Summary is 3 sentences or fewer and approximately 60 words?
7. education cgpa is null if below 7.0 or if MISSING?
8. All dates follow the specified formats?
9. additionalDetails is null (not []) if no data exists?
10. Output is raw JSON only — no markdown fences, no preamble, no trailing text?
`);