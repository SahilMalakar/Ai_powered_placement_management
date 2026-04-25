import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Link,
} from '@react-pdf/renderer';
import { type ResumeJson } from '../../types/students/resume.js';

/**
 * Precision Template - Matches Sahil Malakar reference image exactly.
 */
const styles = StyleSheet.create({
    page: {
        paddingVertical: 35,
        paddingHorizontal: 45,
        fontFamily: 'Times-Roman',
        fontSize: 10,
        lineHeight: 1.15,
        color: '#000',
    },
    // Header Section (Safe Vertical Stack)
    header: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    name: {
        fontSize: 32,
        fontFamily: 'Times-Bold',
        textAlign: 'center',
        lineHeight: 1.2,
        marginBottom: 12, // Significant gap to prevent overlap
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: 9,
        color: '#000',
        width: '100%',
        gap: 4,
    },
    link: {
        color: '#000',
        textDecoration: 'none',
    },
    separator: {
        marginHorizontal: 3,
    },
    // Section Headers
    section: {
        marginTop: 10,
        marginBottom: 2,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: 'Times-Bold',
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 1,
        marginBottom: 5,
    },
    summaryText: {
        fontSize: 10,
        textAlign: 'justify',
    },
    // Flexible Row for metadata
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    // Type helpers
    bold: { fontFamily: 'Times-Bold' },
    italic: { fontFamily: 'Times-Italic' },
    
    // Entry Layouts
    entryBlock: {
        marginBottom: 6,
    },
    techRow: {
        fontSize: 9.5,
        fontFamily: 'Times-Italic',
        marginBottom: 2,
    },
    dateText: {
        fontSize: 9,
        fontFamily: 'Times-Roman',
        color: '#555',
    },
    projectLink: {
        fontSize: 9,
        fontFamily: 'Times-Roman',
        color: '#000',
        textDecoration: 'underline',
        marginLeft: 5,
    },
    // List Layout
    listRow: {
        flexDirection: 'row',
        marginBottom: 1,
        fontSize: 10,
    },
    listLabel: {
        fontFamily: 'Times-Bold',
        marginRight: 4,
    },
    // Bullets
    bulletRow: {
        flexDirection: 'row',
        marginLeft: 10,
        marginBottom: 1,
    },
    bulletDot: {
        width: 10,
        fontSize: 10,
    },
    bulletContent: {
        flex: 1,
        textAlign: 'justify',
        fontSize: 10,
    },
});

/**
 * Handles inline **bold** markdown within bullet text.
 */
const FormattedText = ({ text }: { text: string }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <Text>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <Text key={i} style={styles.bold}>
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
    if (!data?.name) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <Text>Resume data missing.</Text>
                </Page>
            </Document>
        );
    }

    const {
        name,
        contact,
        summary,
        skills,
        workExperience,
        projects,
        education,
        additionalDetails,
    } = data;

    const formatUrl = (url: string | null | undefined) => {
        if (!url) return '';
        return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    };

    return (
        <Document title={`${name} - Resume`}>
            <Page size="A4" style={styles.page}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <Text style={styles.name}>{name}</Text>
                    <View style={styles.contactRow}>
                        {contact.phone && (
                            <>
                                <Text>{contact.phone}</Text>
                                <Text style={styles.separator}>|</Text>
                            </>
                        )}
                        <Text>{contact.email}</Text>
                        {contact.linkedin && (
                            <>
                                <Text style={styles.separator}>|</Text>
                                <Link src={contact.linkedin} style={styles.link}>
                                    {formatUrl(contact.linkedin)}
                                </Link>
                            </>
                        )}
                        {contact.github && (
                            <>
                                <Text style={styles.separator}>|</Text>
                                <Link src={contact.github} style={styles.link}>
                                    {formatUrl(contact.github)}
                                </Link>
                            </>
                        )}
                        {contact.leetcode && (
                            <>
                                <Text style={styles.separator}>|</Text>
                                <Link src={contact.leetcode} style={styles.link}>
                                    {formatUrl(contact.leetcode)}
                                </Link>
                            </>
                        )}
                        {contact.portfolio && (
                            <>
                                <Text style={styles.separator}>|</Text>
                                <Link src={contact.portfolio} style={styles.link}>
                                    {formatUrl(contact.portfolio)}
                                </Link>
                            </>
                        )}
                    </View>
                </View>

                {/* ── Summary ── */}
                {summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <Text style={styles.summaryText}>{summary}</Text>
                    </View>
                )}

                {/* ── Skills ── */}
                {skills && skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Technical Skills</Text>
                        {skills.map((skill, i) => (
                            <View key={i} style={styles.listRow}>
                                <Text style={styles.listLabel}>{skill.category}:</Text>
                                <Text style={{ flex: 1 }}>{skill.items.join(', ')}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Work Experience ── */}
                {workExperience && workExperience.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Work Experience</Text>
                        {workExperience.map((exp, i) => (
                            <View key={i} style={styles.entryBlock} wrap={false}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.bold}>{exp.title}</Text>
                                    <Text style={styles.dateText}>{exp.dateRange}</Text>
                                </View>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.italic}>{exp.company}</Text>
                                    <Text>{exp.location}</Text>
                                </View>
                                {exp.bullets.map((bullet, j) => (
                                    <View key={j} style={styles.bulletRow}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <View style={styles.bulletContent}>
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
                        {projects.map((proj, i) => (
                            <View key={i} style={styles.entryBlock} wrap={false}>
                                <View style={styles.rowBetween}>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                        <Text style={styles.bold}>{proj.title}</Text>
                                        {proj.githubUrl && (
                                            <Link src={proj.githubUrl} style={styles.projectLink}>
                                                Github
                                            </Link>
                                        )}
                                    </View>
                                    <Text style={styles.dateText}>{proj.dateRange}</Text>
                                </View>
                                {proj.techStack && proj.techStack.length > 0 && (
                                    <Text style={styles.techRow}>
                                        Technologies: {proj.techStack.join(', ')}
                                    </Text>
                                )}
                                {proj.bullets.map((bullet, j) => (
                                    <View key={j} style={styles.bulletRow}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <View style={styles.bulletContent}>
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
                            <View key={i} style={styles.entryBlock} wrap={false}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.bold}>{edu.institution}</Text>
                                </View>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.italic}>
                                        {edu.degree}
                                        {edu.cgpa ? ` (CGPA: ${edu.cgpa})` : ''}
                                    </Text>
                                    <Text style={styles.dateText}>{edu.dateRange}</Text>
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
                            <View key={i} style={styles.listRow}>
                                <Text style={styles.listLabel}>{detail.title}:</Text>
                                <View style={{ flex: 1 }}>
                                    <FormattedText text={detail.description.join(' | ')} />
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
};