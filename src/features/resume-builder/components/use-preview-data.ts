import { useResumeStore } from "../state/resume-store";

export function usePreviewData() {
  const personal = useResumeStore((state) => state.personal);
  const summary = useResumeStore((state) => state.summary);
  const experiences = useResumeStore((state) => state.experiences);
  const projects = useResumeStore((state) => state.projects);
  const certifications = useResumeStore((state) => state.certifications);
  const skills = useResumeStore((state) => state.skills);
  const fontFamily = useResumeStore((state) => state.fontFamily);
  const hasHydrated = useResumeStore((state) => state.hasHydrated);

  const hasResumeContent =
    Object.values(personal).some((value) => value.trim()) ||
    summary.trim().length > 0 ||
    experiences.some((item) =>
      [
        item.role,
        item.company,
        item.startDate,
        item.endDate,
        ...item.bullets
      ].some((value) => value.trim())
    ) ||
    projects.some((item) =>
      [item.name, item.techStack, item.endDate, ...item.bullets].some((value) =>
        value.trim()
      )
    ) ||
    certifications.some((item) =>
      [item.provider, item.title, item.completedDate].some((value) =>
        value.trim()
      )
    ) ||
    Object.values(skills).some((values) => values.length > 0);

  return {
    personal,
    summary,
    experiences,
    projects,
    certifications,
    skills,
    fontFamily,
    hasHydrated,
    hasResumeContent
  };
}
