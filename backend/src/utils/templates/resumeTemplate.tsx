import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Link,
} from '@react-pdf/renderer';
import { type ResumeJson } from '../../types/students/resume.js';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.4,
    },
    // Header
    header: {
        marginBottom: 8,
        textAlign: 'center',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'Helvetica-Bold',
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 6,
        color: '#444',
        fontSize: 9,
    },
    link: {
        color: '#1a0dab',
        textDecoration: 'none',
    },
    separator: {
        color: '#999',
        marginHorizontal: 2,
    },
    // Section
    section: {
        marginTop: 10,
        marginBottom: 2,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        borderBottomWidth: 0.75,
        borderBottomColor: '#000',
        paddingBottom: 2,
        marginBottom: 6,
    },
    summary: {
        textAlign: 'justify',
        lineHeight: 1.5,
    },
    // Skills
    skillRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    skillCategory: {
        fontFamily: 'Helvetica-Bold',
        width: 140,
    },
    skillItems: {
        flex: 1,
    },
    // Experience & Projects
    entryBlock: {
        marginBottom: 6,
    },
    entryHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    entryTitle: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
    },
    entrySubtitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    subtitleText: {
        fontFamily: 'Helvetica-Oblique',
        color: '#333',
        fontSize: 9.5,
    },
    dateText: {
        fontSize: 9,
        color: '#333',
    },
    // Bullets
    bullet: {
        marginLeft: 12,
        flexDirection: 'row',
        marginBottom: 1.5,
    },
    bulletDot: {
        width: 10,
        fontSize: 10,
    },
    bulletText: {
        flex: 1,
        textAlign: 'justify',
    },
    // Inline bold highlight
    highlight: {
        fontFamily: 'Helvetica-Bold',
    },
    // Education
    eduRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    eduDegree: {
        fontFamily: 'Helvetica-Oblique',
        color: '#333',
    },
    // Fallback page
    fallbackPage: {
        padding: 40,
        fontFamily: 'Helvetica',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

/**
 * Handles inline **bold** markdown syntax within bullet text.
 * Wraps **text** segments in bold styling for high-impact keywords.
 */
const FormattedText = ({ text }: { text: string }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <Text>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <Text key={i} style={styles.highlight}>
                            {part.slice(2, -2)}
                        </Text>
                    );
                }
                return <Text key={i}>{part}</Text>;
            })}
        </Text>
    );
};

export const ResumeTemplate = ({ data }: { data: ResumeJson }) => {
    // Defensive guard: prevent React reconciler crash on incomplete data
    if (!data?.personalInfo?.fullName) {
        return (
            <Document>
                <Page size="A4" style={styles.fallbackPage}>
                    <Text>Resume data is incomplete. Please generate or edit your resume first.</Text>
                </Page>
            </Document>
        );
    }

    const { personalInfo, experience, projects, skills, education, additionalDetails } = data;

    return (
        <Document title={`${personalInfo.fullName} - Resume`}>
            <Page size="A4" style={styles.page}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <Text style={styles.name}>{personalInfo.fullName}</Text>
                    <View style={styles.contactRow}>
                        {personalInfo.email && <Text>{personalInfo.email}</Text>}
                        {personalInfo.phoneNumber && (
                            <>
                                <Text style={styles.separator}>|</Text>
                                <Text>{personalInfo.phoneNumber}</Text>
                            </>
                        )}
                        {personalInfo.location && (
                            <>
                                <Text style={styles.separator}>|</Text>
                                <Text>{personalInfo.location}</Text>
                            </>
                        )}
                    </View>
                    {personalInfo.links && personalInfo.links.length > 0 && (
                        <View style={[styles.contactRow, { marginTop: 2 }]}>
                            {personalInfo.links.map((link, i) => (
                                <React.Fragment key={i}>
                                    {link.url ? (
                                        <Link src={link.url} style={styles.link}>
                                            {link.url.replace(/^https?:\/\/(www\.)?/, '')}
                                        </Link>
                                    ) : (
                                        <Text>{link.platform}</Text>
                                    )}
                                    {i < (personalInfo.links?.length || 0) - 1 && (
                                        <Text style={styles.separator}>|</Text>
                                    )}
                                </React.Fragment>
                            ))}
                        </View>
                    )}
                </View>

                {/* ── Summary ── */}
                {personalInfo.summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <Text style={styles.summary}>{personalInfo.summary}</Text>
                    </View>
                )}

                {/* ── Technical Skills ── */}
                {skills && skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Technical Skills</Text>
                        {skills.map((skill, i) => (
                            <View key={i} style={styles.skillRow}>
                                <Text style={styles.skillCategory}>{skill.category}:</Text>
                                <Text style={styles.skillItems}>{skill.skills?.join(', ')}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Work Experience ── */}
                {experience && experience.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Work Experience</Text>
                        {experience.map((exp, i) => (
                            <View key={i} style={styles.entryBlock} wrap={false}>
                                {/* Row 1: Role — Dates */}
                                <View style={styles.entryHeaderRow}>
                                    <Text style={styles.entryTitle}>{exp.role}</Text>
                                    <Text style={styles.dateText}>
                                        {exp.startDate} – {exp.endDate || 'Present'}
                                    </Text>
                                </View>
                                {/* Row 2: Company — Tools | Location */}
                                <View style={styles.entrySubtitle}>
                                    <Text style={styles.subtitleText}>
                                        {exp.company}
                                        {exp.toolsUsed ? ` — ${exp.toolsUsed}` : ''}
                                    </Text>
                                    {exp.location && (
                                        <Text style={styles.subtitleText}>{exp.location}</Text>
                                    )}
                                </View>
                                {/* Bullets */}
                                {exp.description?.map((bullet, j) => (
                                    <View key={j} style={styles.bullet}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <View style={styles.bulletText}>
                                            <FormattedText text={bullet} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Projects ── */}
                {projects && projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {projects.map((project, i) => (
                            <View key={i} style={styles.entryBlock} wrap={false}>
                                {/* Row 1: Title | Links | Tech — Dates */}
                                <View style={styles.entryHeaderRow}>
                                    <Text style={styles.entryTitle}>
                                        {project.title}
                                        {project.links && project.links.length > 0 && (
                                            <Text style={{ fontFamily: 'Helvetica', fontWeight: 'normal' }}>
                                                {' | '}
                                                {project.links.map((l) => l.label).join(' | ')}
                                            </Text>
                                        )}
                                        {project.keyTools && (
                                            <Text style={{ fontFamily: 'Helvetica-Oblique', fontWeight: 'normal', fontSize: 9.5 }}>
                                                {' | '}{project.keyTools}
                                            </Text>
                                        )}
                                    </Text>
                                    <Text style={styles.dateText}>
                                        {project.startDate
                                            ? `${project.startDate}${project.endDate ? ` – ${project.endDate}` : ''}`
                                            : ''}
                                    </Text>
                                </View>
                                {/* Bullets */}
                                {project.description?.map((bullet, j) => (
                                    <View key={j} style={styles.bullet}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <View style={styles.bulletText}>
                                            <FormattedText text={bullet} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Education ── */}
                {education && education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {education.map((edu, i) => (
                            <View key={i} style={{ marginBottom: 4 }}>
                                <View style={styles.eduRow}>
                                    <Text style={styles.entryTitle}>{edu.university}</Text>
                                    <Text style={styles.dateText}>
                                        {edu.location || ''}
                                    </Text>
                                </View>
                                <View style={styles.eduRow}>
                                    <Text style={styles.eduDegree}>
                                        {edu.degree}
                                    </Text>
                                    <Text style={styles.dateText}>
                                        {edu.graduationDate || ''}
                                        {edu.cgpa ? ` | CGPA: ${edu.cgpa}` : ''}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Additional Details ── */}
                {additionalDetails && additionalDetails.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Details</Text>
                        {additionalDetails.map((detail, i) => (
                            <View key={i} style={styles.bullet}>
                                <Text style={styles.bulletDot}>•</Text>
                                <View style={styles.bulletText}>
                                    <Text>
                                        <Text style={styles.highlight}>{detail.title}</Text>
                                        {detail.description?.length > 0
                                            ? `: ${detail.description.join(', ')}`
                                            : ''}
                                        {detail.date ? ` (${detail.date})` : ''}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

            </Page>
        </Document>
    );
};
