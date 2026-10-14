import { useState, useEffect, useRef } from "react";
import PreviewToolbar from "./preview-toolbar";
import ResumePreview from "./resume-preview/resume-preview";
import { useResumeStore } from "../state/resume-store";
import type { ResumeData } from "../model/resume-type";
import ImportFileButton from "./import-file-button";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.05;

export default function PreviewPanel() {
  const personal = useResumeStore((state) => state.personal);
  const summary = useResumeStore((state) => state.summary);
  const experiences = useResumeStore((state) => state.experiences);
  const projects = useResumeStore((state) => state.projects);
  const certifications = useResumeStore((state) => state.certifications);
  const fontFamily = useResumeStore((state) => state.fontFamily);
  const hasHydrated = useResumeStore((state) => state.hasHydrated);

  const [zoom, setZoom] = useState(1);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;

      event.preventDefault();
      setZoom((current) =>
        Math.min(
          MAX_ZOOM,
          Math.max(
            MIN_ZOOM,
            Number(
              (current + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)).toFixed(2)
            )
          )
        )
      );
    };

    scroller.addEventListener("wheel", handleWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", handleWheel);
  }, [hasHydrated]);

  const resume: ResumeData = {
    personal,
    summary,
    experiences,
    projects,
    certifications,
    fontFamily
  };

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
      [item.name, item.techStack, ...item.bullets].some((value) => value.trim())
    ) ||
    certifications.some((item) =>
      [item.provider, item.title, item.completedDate].some((value) =>
        value.trim()
      )
    );

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

      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-auto bg-subtle p-8"
      >
        {hasResumeContent ? (
          <ResumePreview resume={resume} zoom={zoom} />
        ) : (
          <div className="mx-auto flex min-h-full flex-col items-center justify-center gtext-center">
            <h2 className="font-semibold">Already have a resume?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Import an existing DOCX or PDF, or start adding resume details in
              the editor.
            </p>
            <ImportFileButton className="w-full max-w-xs" />
          </div>
        )}
      </div>
    </section>
  );
}
