import type { ResumeJson } from "../../types/students/resume.js";

/**
 * Utility to convert markdown bold (**text**) to HTML strong tags.
 */
const formatMarkdown = (text: string | undefined): string => {
  if (!text) return "";
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};

export const generateResumeHtml = (data: ResumeJson): string => {
  const { personalInfo, experience, projects, skills, education, achievements } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${personalInfo.fullName} Resume</title>
    <style>
        :root {
            --text-color: #000;
            --font-main: 'Times New Roman', Times, serif;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--font-main);
            color: var(--text-color);
            background: white;
            font-size: 10.5pt;
            line-height: 1.2;
            padding: 0.5in; 
            max-width: 8.5in;
            margin: 0 auto;
        }

        h1 {
            font-size: 24pt;
            font-weight: normal;
            text-align: center;
            margin-bottom: 2px;
        }

        .contact-info {
            text-align: center;
            font-size: 10pt;
            margin-bottom: 8px;
        }

        .contact-info a {
            color: var(--text-color);
            text-decoration: none;
        }

        .contact-info a:hover {
            text-decoration: underline;
        }

        .contact-info span.separator {
            margin: 0 4px;
        }

        .section {
            margin-bottom: 8px;
        }

        .section-title {
            font-size: 11pt;
            text-transform: uppercase;
            font-weight: normal;
            border-bottom: 1px solid var(--text-color);
            margin-bottom: 4px;
            padding-bottom: 1px;
        }

        .d-flex {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }

        .item {
            margin-bottom: 6px;
        }

        .item-title {
            font-weight: bold;
        }

        .item-subtitle {
            font-style: italic;
        }

        .item-date {
            min-width: 140px; /* Increased to accommodate range */
            text-align: right;
        }

        ul {
            margin-top: 2px;
            margin-bottom: 2px;
            padding-left: 20px;
        }

        li {
            margin-bottom: 2px;
            text-align: justify;
        }

        .summary-text {
            text-align: justify;
            margin-bottom: 6px;
        }

        .skills-container {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .skill-group {
            display: flex;
            align-items: baseline;
        }

        .skill-category {
            font-weight: bold;
            margin-right: 5px;
        }
    </style>
</head>
<body>
    <header>
        <h1>${personalInfo.fullName}</h1>
        <div class="contact-info">
            ${personalInfo.phoneNumber ? `<span>${personalInfo.phoneNumber}</span> <span class="separator">|</span> ` : ''}
            ${personalInfo.email ? `<a href="mailto:${personalInfo.email}">${personalInfo.email}</a> <span class="separator">|</span> ` : ''}
            ${personalInfo.links && personalInfo.links.length > 0 
                ? personalInfo.links.map((link: any) => `<a href="${link.url}">${link.url.replace('https://', '').replace('http://', '').replace('www.', '')}</a>`).join(' <span class="separator">|</span> ') 
                : ''}
            ${personalInfo.location ? ` <span class="separator">|</span> <span>${personalInfo.location}</span>` : ''}
        </div>
    </header>

    ${personalInfo.summary ? `
    <div class="section">
        <h2 class="section-title">Summary</h2>
        <div class="summary-text">${personalInfo.summary}</div>
    </div>
    ` : ''}

    ${skills && skills.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Technical Skills</h2>
        <div class="skills-container">
            ${skills.map((skill: any) => `
            <div class="skill-group">
                <span class="skill-category">${skill.category}:</span>
                <span>${skill.items.join(', ')}</span>
            </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    ${experience && experience.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Work Experience</h2>
        ${experience.map((exp: any) => `
        <div class="item">
            <div class="d-flex">
                <span class="item-title">${exp.role}</span>
                <span class="item-date">${exp.startDate} – ${exp.endDate || 'Present'}</span>
            </div>
            <div class="d-flex">
                <span class="item-subtitle">${exp.company}</span>
                <span class="item-date">${exp.location || ''}</span>
            </div>
            <ul>
                ${exp.description.map((desc: any) => `<li>${formatMarkdown(desc)}</li>`).join('')}
            </ul>
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${projects && projects.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Projects</h2>
        ${projects.map((proj: any) => `
        <div class="item">
            <div class="d-flex">
                <span>
                    <span class="item-title">${proj.title}</span> 
                    ${proj.links && proj.links.length > 0 ? ` | ${proj.links.map((l: any) => `<a href="${l.url}">${l.label}</a>`).join(', ')}` : ''}
                </span>
                <span class="item-date">${proj.startDate ? `${proj.startDate} – ${proj.endDate || 'Present'}` : ''}</span>
            </div>
            ${proj.keyTools ? `<div style="font-style: italic; font-size: 9.5pt; margin-bottom: 2px;">Technologies: ${proj.keyTools}</div>` : ''}
            <ul>
                ${proj.description.map((desc: any) => `<li>${formatMarkdown(desc)}</li>`).join('')}
            </ul>
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${education && education.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Education</h2>
        ${education.map((edu: any) => `
        <div class="item">
            <div class="d-flex">
                <span class="item-title">${edu.university}</span>
                <span class="item-date">${edu.location || ''}</span>
            </div>
            <div class="d-flex">
                <span class="item-subtitle">${edu.degree} ${edu.cgpa ? `(CGPA: ${edu.cgpa})` : ''}</span>
                <span class="item-date">${edu.graduationDate || ''}</span>
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${achievements && achievements.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Additional Details</h2>
        <ul>
        ${achievements.map((ach: any) => `
            <li><strong>${ach.title}</strong>${ach.date ? ` (${ach.date})` : ''}${ach.description ? `: ${formatMarkdown(ach.description)}` : ''}</li>
        `).join('')}
        </ul>
    </div>
    ` : ''}

</body>
</html>
  `;
};
