import PreviewToolbar from "./preview-toolbar";
import ResumePreview from "./resume-preview/resume-preview";
import { useResumeStore } from "../state/resume-store";

export default function PreviewPanel() {
  const personal = useResumeStore((state) => state.personal);
  const summary = useResumeStore((state) => state.summary);
  const experiences = useResumeStore((state) => state.experiences);
  const projects = useResumeStore((state) => state.projects);
  const certifications = useResumeStore((state) => state.certifications);

  const resume = {
    personal,
    summary,
    experiences,
    projects,
    certifications
  };

  return (
    <section className="flex h-full min-h-0 w-full flex-col">
      <PreviewToolbar />

      <div className="min-h-0 flex-1 overflow-auto bg-subtle p-8">
        <ResumePreview resume={resume} />
      </div>
    </section>
  );
}
