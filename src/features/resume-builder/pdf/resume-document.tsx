import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "../model/resume-type";

type ResumeDocumentProps = {
  resume: ResumeData;
};

const PAGE_PADDING = 18;
const BODY_SIZE = 11;

const styles = StyleSheet.create({
  page: {
    padding: PAGE_PADDING,
    color: "#202124",
    fontFamily: "Times-Roman",
    fontSize: BODY_SIZE,
    lineHeight: 1.2
  },
  header: {
    alignItems: "center",
    marginBottom: 0
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 8
  },
  role: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10.5
  },
  contact: {
    fontSize: 10.5,
    textAlign: "center"
  },
  section: {
    marginBottom: 2
  },
  sectionTitle: {
    fontSize: BODY_SIZE,
    fontWeight: 700,
    textTransform: "uppercase",
    borderBottomWidth: 0.75,
    borderBottomColor: "#202124",
    marginBottom: 2,
    paddingBottom: 0.5
  },
  summary: {
    marginTop: 0
  },
  entry: {
    marginBottom: 10
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 8
  },
  entryTitle: {
    flexGrow: 1,
    fontSize: BODY_SIZE,
    fontWeight: 700
  },
  date: {
    flexShrink: 0,
    fontSize: BODY_SIZE,
    textAlign: "right"
  },
  subEntry: {
    fontSize: BODY_SIZE,
    fontStyle: "italic"
  },
  bulletList: {
    marginTop: 2
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1.5
  },
  bulletMark: {
    width: 9
  },
  bulletText: {
    flexGrow: 1
  }
});

function formatMonthYear(value: string) {
  if (!value) return "";

  const [year, month] = value.split("-").map(Number);
  if (!year || month < 1 || month > 12) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(new Date(year, month - 1, 1));
}

function formatDateRange(startDate: string, endDate: string) {
  return [formatMonthYear(startDate), formatMonthYear(endDate)]
    .filter(Boolean)
    .join(" - ");
}

function BulletList({ bullets }: { bullets: string[] }) {
  const visibleBullets = bullets.filter((bullet) => bullet.trim());
  if (visibleBullets.length === 0) return null;

  return (
    <View style={styles.bulletList}>
      {visibleBullets.map((bullet, index) => (
        <Text key={`${index}-${bullet}`} style={styles.bulletText}>
          {`• ${bullet}`}
        </Text>
      ))}
    </View>
  );
}

export default function ResumeDocument({ resume }: ResumeDocumentProps) {
  const { personal } = resume;

  return (
    <Page size="LETTER" style={styles.page}>
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
            .join(" | ")}
        </Text>
      </View>

      {resume.summary.trim() && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summary}>{resume.summary}</Text>
        </View>
      )}

      {resume.experiences.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>

          {resume.experiences.map((experience) => (
            <View key={experience.id} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>
                  {experience.company || "Untitled Company"}
                </Text>
                <Text style={styles.date}>
                  {formatDateRange(experience.startDate, experience.endDate)}
                </Text>
              </View>

              {experience.role && (
                <Text style={styles.subEntry}>{experience.role}</Text>
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
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>
                  {project.name || "Untitled Project"}
                </Text>
                <Text style={styles.date}>
                  {formatMonthYear(project.endDate ?? "")}
                </Text>
              </View>

              {project.techStack && (
                <Text style={styles.subEntry}>{project.techStack}</Text>
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
              <View>
                <Text>
                  {[certification.provider, certification.title]
                    .filter(Boolean)
                    .join(" ") || "Certification"}
                </Text>
                <Text style={styles.date}>
                  {formatMonthYear(certification.completedDate)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Page>
  );
}
