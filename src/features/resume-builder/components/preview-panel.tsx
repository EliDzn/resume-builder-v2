import PreviewToolbar from "./preview-toolbar";
import ResumePreview from "./resume-preview/resume-preview";
import { useResumeStore } from "../state/resume-store";
import type { ResumeData } from "../model/resume-type";

export default function PreviewPanel() {
  const personal = useResumeStore((state) => state.personal);
  const summary = useResumeStore((state) => state.summary);
  const experiences = useResumeStore((state) => state.experiences);
  const projects = useResumeStore((state) => state.projects);
  const certifications = useResumeStore((state) => state.certifications);
  const fontFamily = useResumeStore((state) => state.fontFamily);

  const hasHydrated = useResumeStore((state) => state.hasHydrated);

  const resume: ResumeData = {
    personal,
    summary,
    experiences,
    projects,
    certifications,
    fontFamily
  };

  if (!hasHydrated) {
    return (
      <section className="flex h-full min-h-0 w-full items-center justify-center bg-subtle">
        <p className="text-sm text-muted-foreground">Loading resume…</p>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 w-full flex-col">
      <PreviewToolbar />

      <div className="min-h-0 flex-1 overflow-auto bg-subtle p-8">
        <ResumePreview resume={resume} />
      </div>
    </section>
  );
}
