import type { ResumeData } from "../../model/resume-type";
import styles from "./resume-preview.module.css";

type ResumePreviewProps = {
  resume: ResumeData;
};

function formatMonthYear(value: string) {
  if (!value) {
    return "";
  }

  const [year, month] = value.split("-");

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(new Date(Number(year), Number(month) - 1));
}

function formatDateRange(startDate: string, endDate: string) {
  return [formatMonthYear(startDate), formatMonthYear(endDate)]
    .filter(Boolean)
    .join(" - ");
}

function BulletList({ bullets }: { bullets: string[] }) {
  const visibleBullets = bullets.filter((bullet) => bullet.trim());

  if (visibleBullets.length === 0) {
    return null;
  }

  return (
    <ul className={styles.bullets}>
      {visibleBullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`}>• {bullet}</li>
      ))}
    </ul>
  );
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
  const { personal } = resume;

  return (
    <div className={styles.paper} data-font={resume.fontFamily}>
      <header className={styles.header}>
        <h1>{personal.fullName || "Your Name"}</h1>

        {personal.role && <p className={styles.role}>{personal.role}</p>}

        <p className={styles.contact}>
          {[
            personal.location,
            personal.phone,
            personal.email,
            personal.linkedin,
            personal.github
          ]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </header>

      {resume.summary.trim() && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Summary</h2>
          <p>{resume.summary}</p>
        </section>
      )}

      {resume.experiences.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Experience</h2>

          {resume.experiences.map((experience) => (
            <div className={styles.entry} key={experience.id}>
              <div className={styles.entryHeader}>
                <h3>{experience.company || "Untitled Company"}</h3>

                <span>
                  {formatDateRange(experience.startDate, experience.endDate)}
                </span>
              </div>

              {experience.role && (
                <p className={styles.subEntry}>{experience.role}</p>
              )}

              <BulletList bullets={experience.bullets} />
            </div>
          ))}
        </section>
      )}

      {resume.projects.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Projects</h2>

          {resume.projects.map((project) => (
            <div className={styles.entry} key={project.id}>
              <div className={styles.entryHeader}>
                <h3>{project.name || "Untitled Project"}</h3>
                <span>{formatMonthYear(project.endDate ?? "")}</span>
              </div>

              {project.techStack && (
                <p className={styles.subEntry}>{project.techStack}</p>
              )}

              <BulletList bullets={project.bullets} />
            </div>
          ))}
        </section>
      )}

      {resume.certifications.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Certifications</h2>

          {resume.certifications.map((certification) => (
            <div key={certification.id}>
              <div className={styles.certEntry}>
                <h3>
                  {[certification.provider, certification.title]
                    .filter(Boolean)
                    .join(" ") || "Certification"}
                </h3>

                <span>{formatMonthYear(certification.completedDate)}</span>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
