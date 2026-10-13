import { useState, useEffect, useRef } from "react";
import PreviewToolbar from "./preview-toolbar";
import ResumePreview from "./resume-preview/resume-preview";
import { useResumeStore } from "../state/resume-store";
import type { ResumeData } from "../model/resume-type";

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
        <ResumePreview resume={resume} zoom={zoom} />
      </div>
    </section>
  );
}
