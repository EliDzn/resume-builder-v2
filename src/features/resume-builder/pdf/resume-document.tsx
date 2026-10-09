import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "../model/resume-type";

type ResumeDocumentProps = {
  resume: ResumeData;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    color: "#202124",
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4
  },
  header: {
    marginBottom: 24,
    borderBottom: "1 solid #202124",
    paddingBottom: 12
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4
  },
  role: {
    fontSize: 12,
    color: "#555555",
    marginBottom: 8
  },
  contact: {
    fontSize: 9,
    color: "#555555"
  },
  section: {
    marginBottom: 18
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
    textTransform: "uppercase"
  },
  entry: {
    marginBottom: 12
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: 700
  },
  date: {
    fontSize: 9,
    color: "#555555"
  },
  company: {
    fontSize: 10,
    color: "#555555",
    marginBottom: 4
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2
  },
  bulletMark: {
    width: 12
  },
  bulletText: {
    flex: 1
  }
});

function BulletList({ bullets }: { bullets: string[] }) {
  return (
    <View>
      {bullets
        .filter((bullet) => bullet.trim())
        .map((bullet, index) => (
          <View key={`${bullet}-${index}`} style={styles.bullet}>
            <Text style={styles.bulletMark}>•</Text>
            <Text style={styles.bulletText}>{bullet}</Text>
          </View>
        ))}
    </View>
  );
}

export default function ResumeDocument({ resume }: ResumeDocumentProps) {
  const { personal } = resume;

  return (
    <Document title={personal.fullName || "Resume"}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{personal.fullName || "Your Name"}</Text>

          {personal.role && <Text style={styles.role}>{personal.role}</Text>}

          <Text style={styles.contact}>
            {[
              personal.location,
              personal.phone,
              personal.email,
              personal.linkedin,
              personal.github
            ]
              .filter(Boolean)
              .join("  •  ")}
          </Text>
        </View>

        {resume.summary.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text>{resume.summary}</Text>
          </View>
        )}

        {resume.experiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>

            {resume.experiences.map((experience) => (
              <View key={experience.id} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {experience.role || "Untitled Role"}
                  </Text>

                  <Text style={styles.date}>
                    {[experience.startDate, experience.endDate]
                      .filter(Boolean)
                      .join(" - ")}
                  </Text>
                </View>

                {experience.company && (
                  <Text style={styles.company}>{experience.company}</Text>
                )}

                <BulletList bullets={experience.bullets} />
              </View>
            ))}
          </View>
        )}

        {resume.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>

            {resume.projects.map((project) => (
              <View key={project.id} style={styles.entry}>
                <Text style={styles.entryTitle}>
                  {project.name || "Untitled Project"}
                </Text>

                {project.techStack && (
                  <Text style={styles.company}>{project.techStack}</Text>
                )}

                <BulletList bullets={project.bullets} />
              </View>
            ))}
          </View>
        )}

        {resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>

            {resume.certifications.map((certification) => (
              <View key={certification.id} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {certification.title || "Untitled Certification"}
                  </Text>

                  <Text style={styles.date}>{certification.completedDate}</Text>
                </View>

                {certification.provider && (
                  <Text style={styles.company}>{certification.provider}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
