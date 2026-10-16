import { useEffect, useRef, useState } from "react";
import { Previewer } from "pagedjs";
import ImportFileButton from "./import-file-button";
import PreviewToolbar from "./preview-toolbar";
import ResumePreview from "./resume-preview/resume-preview";
import previewStyles from "./resume-preview/resume-preview.module.css";
import { useResumeStore } from "../state/resume-store";
import type { ResumeData } from "../model/resume-type";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.05;

export default function PreviewPanel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const renderedRootRef = useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState(1);

  const personal = useResumeStore((state) => state.personal);
  const summary = useResumeStore((state) => state.summary);
  const experiences = useResumeStore((state) => state.experiences);
  const projects = useResumeStore((state) => state.projects);
  const certifications = useResumeStore((state) => state.certifications);
  const skills = useResumeStore((state) => state.skills);
  const fontFamily = useResumeStore((state) => state.fontFamily);
  const hasHydrated = useResumeStore((state) => state.hasHydrated);

  const resume: ResumeData = {
    personal,
    summary,
    experiences,
    projects,
    certifications,
    skills,
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

  useEffect(() => {
    if (!hasHydrated) return;

    if (!hasResumeContent) {
      renderedRootRef.current?.remove();
      renderedRootRef.current = null;
      return;
    }

    const source = sourceRef.current;
    const target = pagesRef.current;
    if (!source || !target) return;

    const stylesheet = {
      [window.location.href]: `
        @page {
          size: Letter;
          margin: 18pt;
        }

        .${previewStyles.entry} {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .${previewStyles.sectionTitle} {
          break-after: avoid;
          page-break-after: avoid;
        }
      `
    };

    let disposed = false;
    let pendingRoot: HTMLDivElement | null = null;

    const timer = window.setTimeout(() => {
      if (disposed) return;

      const nextRoot = document.createElement("div");
      nextRoot.style.position = "fixed";
      nextRoot.style.left = "-10000px";
      nextRoot.style.top = "0";
      nextRoot.style.width = "8.5in";
      nextRoot.style.opacity = "0";
      nextRoot.style.pointerEvents = "none";
      pendingRoot = nextRoot;
      document.body.appendChild(nextRoot);

      void new Previewer()
        .preview(source.cloneNode(true) as HTMLElement, [stylesheet], nextRoot)
        .then(() => {
          if (disposed) {
            nextRoot.remove();
            return;
          }
          renderedRootRef.current?.remove();
          target.appendChild(nextRoot);

          nextRoot.style.position = "static";
          nextRoot.style.left = "";
          nextRoot.style.top = "";
          nextRoot.style.width = "";
          nextRoot.style.opacity = "";
          nextRoot.style.pointerEvents = "";

          renderedRootRef.current = nextRoot;
          pendingRoot = null;
        })
        .catch((error) => {
          nextRoot.remove();
          if (!disposed) {
            console.error("Resume preview pagination failed:", error);
          }
        });
    }, 5);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      pendingRoot?.remove();
    };
  }, [
    hasHydrated,
    hasResumeContent,
    personal,
    summary,
    experiences,
    projects,
    certifications,
    skills,
    fontFamily
  ]);

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
          <>
            <div
              aria-hidden="true"
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                width: "calc(8.5in - 36pt)",
                opacity: 0,
                pointerEvents: "none"
              }}
            >
              <div ref={sourceRef}>
                <ResumePreview resume={resume} />
              </div>
            </div>

            <div
              ref={pagesRef}
              className={previewStyles.pageOutput}
              style={{ zoom }}
            />
          </>
        ) : (
          <div className="mx-auto flex min-h-full flex-col items-center justify-center text-center">
            <h2 className="font-semibold">Already have a resume?</h2>
            <p className="mb-4 text-sm text-muted-foreground">
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
