import { Document, pdf } from "@react-pdf/renderer";
import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "pdfjs-dist/web/pdf_viewer.css";
import PreviewToolbar from "./preview-toolbar";
import ImportFileButton from "./import-file-button";
import ResumeDocument from "../pdf/resume-document";
import { usePreviewData } from "./use-preview-data";
import type { ResumeData } from "../model/resume-type";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.05;
const PREVIEW_DEBOUNCE_MS = 20;

export default function PreviewPanelReactPdf() {
  const {
    personal,
    summary,
    experiences,
    projects,
    certifications,
    skills,
    fontFamily,
    hasHydrated,
    hasResumeContent
  } = usePreviewData();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [result, setResult] = useState<{
    key: string;
    error?: string;
  } | null>(null);

  const previewKey = JSON.stringify([
    personal,
    summary,
    experiences,
    projects,
    certifications,
    skills,
    fontFamily,
    zoom
  ]);
  const currentResult = result?.key === previewKey ? result : null;
  const isGenerating = hasResumeContent && currentResult === null;

  useEffect(() => {
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
  }, [hasHydrated, hasResumeContent]);

  useEffect(() => {
    const output = pagesRef.current;
    if (!hasHydrated || !hasResumeContent || !output) return;

    let active = true;
    let loadingTask: ReturnType<typeof pdfjs.getDocument> | undefined;
    const textLayers = new Set<pdfjs.TextLayer>();

    const destroyLoadingTask = () => {
      const task = loadingTask;
      loadingTask = undefined;
      void task?.destroy().catch(() => undefined);
    };

    const renderPreview = async () => {
      try {
        const resume: ResumeData = {
          personal,
          summary,
          experiences,
          projects,
          certifications,
          skills,
          fontFamily
        };
        const blob = await pdf(
          <Document title={personal.fullName || "Resume"}>
            <ResumeDocument resume={resume} />
          </Document>
        ).toBlob();

        if (!active) return;

        loadingTask = pdfjs.getDocument({
          data: new Uint8Array(await blob.arrayBuffer())
        });

        const pdfDocument = await loadingTask.promise;
        const staging = document.createElement("div");
        staging.className =
          "flex min-h-full w-max min-w-full flex-col items-center gap-6";

        const availableWidth = Math.max(1, output.clientWidth - 32);
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);

        for (
          let pageNumber = 1;
          pageNumber <= pdfDocument.numPages;
          pageNumber++
        ) {
          if (!active) return;

          const page = await pdfDocument.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale =
            Math.min(1.25, availableWidth / baseViewport.width) * zoom;
          const viewport = page.getViewport({ scale });
          const frame = document.createElement("div");
          frame.className =
            "relative mx-auto overflow-hidden bg-white shadow-md";
          frame.style.width = `${viewport.width}px`;
          frame.style.setProperty("--total-scale-factor", String(scale));
          frame.style.setProperty("--user-unit", "1");

          const canvas = document.createElement("canvas");
          canvas.setAttribute("aria-hidden", "true");
          canvas.style.display = "block";
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);

          const context = canvas.getContext("2d");
          if (!context) throw new Error("Could not create PDF preview canvas.");

          const textLayerElement = document.createElement("div");
          textLayerElement.className = "textLayer";
          const textLayer = new pdfjs.TextLayer({
            textContentSource: page.streamTextContent(),
            container: textLayerElement,
            viewport
          });
          textLayers.add(textLayer);

          frame.append(canvas, textLayerElement);
          staging.appendChild(frame);

          await Promise.all([
            page.render({
              canvas,
              canvasContext: context,
              viewport,
              transform:
                outputScale === 1
                  ? undefined
                  : [outputScale, 0, 0, outputScale, 0, 0]
            }).promise,
            textLayer.render()
          ]);
          textLayers.delete(textLayer);
        }

        if (!active) return;

        const scroller = scrollerRef.current;
        const scrollTop = scroller?.scrollTop ?? 0;
        const scrollLeft = scroller?.scrollLeft ?? 0;
        output.replaceChildren(staging);
        if (scroller) {
          scroller.scrollTop = scrollTop;
          scroller.scrollLeft = scrollLeft;
        }
        setHasRendered(true);
        setResult({ key: previewKey });
      } catch (cause) {
        if (active) {
          setResult({
            key: previewKey,
            error:
              cause instanceof Error
                ? cause.message
                : "Could not render the React-PDF preview."
          });
        }
      } finally {
        destroyLoadingTask();
      }
    };

    const renderTimer = window.setTimeout(() => {
      void renderPreview();
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(renderTimer);
      textLayers.forEach((textLayer) => textLayer.cancel());
      destroyLoadingTask();
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
    fontFamily,
    zoom,
    previewKey
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
      {hasResumeContent ? (
        <div
          key="resume-preview"
          ref={scrollerRef}
          className="relative min-h-0 flex-1 overflow-auto bg-subtle p-4"
        >
          <div
            ref={pagesRef}
            className="flex min-h-full flex-col items-center gap-6"
          />

          <div className="pointer-events-none absolute right-2 top-2 z-10 flex flex-col items-end gap-2">
            {isGenerating && (
              <p
                role="status"
                className="w-fit bg-foreground px-2 py-1 text-sm text-background shadow"
              >
                {hasRendered ? "Updating preview…" : "Generating preview…"}
              </p>
            )}

            {currentResult?.error && (
              <p
                role="alert"
                className="w-fit bg-foreground px-2 py-1 text-sm text-destructive shadow"
              >
                Preview update failed: {currentResult.error}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div
          key="empty-preview"
          ref={scrollerRef}
          className="min-h-0 flex-1 overflow-auto bg-subtle p-8"
        >
          <div className="mx-auto flex min-h-full flex-col items-center justify-center text-center">
            <h2 className="font-semibold">Already have a resume?</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Import an existing DOCX or PDF, or start adding resume details in
              the editor.
            </p>
            <ImportFileButton className="w-full max-w-xs" />
          </div>
        </div>
      )}
    </section>
  );
}
