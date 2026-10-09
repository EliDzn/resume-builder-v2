import type { ResumeData } from "../../model/resume-type";
import styles from "./resume-preview.module.css";

type ResumePreviewProps = {
  resume: ResumeData;
};

function BulletList({ bullets }: { bullets: string[] }) {
  const visibleBullets = bullets.filter((bullet) => bullet.trim());

  if (visibleBullets.length === 0) {
    return null;
  }

  return (
    <ul className={styles.bullets}>
      {visibleBullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`}>{bullet}</li>
      ))}
    </ul>
  );
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
  const { personal } = resume;

  return (
    <article className={styles.paper}>
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
            .join(" • ")}
        </p>
      </header>

      {resume.summary.trim() && (
        <section className={styles.section}>
          <h2>Summary</h2>
          <p>{resume.summary}</p>
        </section>
      )}

      {resume.experiences.length > 0 && (
        <section className={styles.section}>
          <h2>Experience</h2>

          {resume.experiences.map((experience) => (
            <article className={styles.entry} key={experience.id}>
              <div className={styles.entryHeader}>
                <h3>{experience.role || "Untitled Role"}</h3>

                <span>
                  {[experience.startDate, experience.endDate]
                    .filter(Boolean)
                    .join(" - ")}
                </span>
              </div>

              {experience.company && (
                <p className={styles.muted}>{experience.company}</p>
              )}

              <BulletList bullets={experience.bullets} />
            </article>
          ))}
        </section>
      )}

      {resume.projects.length > 0 && (
        <section className={styles.section}>
          <h2>Projects</h2>

          {resume.projects.map((project) => (
            <article className={styles.entry} key={project.id}>
              <h3>{project.name || "Untitled Project"}</h3>

              {project.techStack && (
                <p className={styles.muted}>{project.techStack}</p>
              )}

              <BulletList bullets={project.bullets} />
            </article>
          ))}
        </section>
      )}

      {resume.certifications.length > 0 && (
        <section className={styles.section}>
          <h2>Certifications</h2>

          {resume.certifications.map((certification) => (
            <article className={styles.entry} key={certification.id}>
              <div className={styles.entryHeader}>
                <h3>{certification.title || "Certification"}</h3>

                <span>{certification.completedDate}</span>
              </div>

              {certification.provider && (
                <p className={styles.muted}>{certification.provider}</p>
              )}
            </article>
          ))}
        </section>
      )}
    </article>
  );
}
