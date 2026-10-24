import { useEffect, useRef, useState } from "react";
import SidePanel from "./side-panel";
import Button from "@/components/ui/button";
import TextareaField from "@/components/ui/textarea-field";
import { useResumeStore } from "../state/resume-store";
import type { ResumeData } from "../model/resume-type";
import { generateResumeSuggestions } from "@/lib/api-client";
import type { ResumeSuggestions } from "../model/gemini-suggestions";
import { downloadResumePdf } from "../pdf/download-resume-pdf";
import ImportFileButton from "./import-file-button";
import InsightEntry from "./insight-entry";
import { usePreviewData } from "./use-preview-data";

const SEVERITY_ORDER = {
  Error: 0,
  Warning: 1,
  Success: 2
} as const;

export default function InsightPanel() {
  const personal = useResumeStore((state) => state.personal);
  const summary = useResumeStore((state) => state.summary);
  const experiences = useResumeStore((state) => state.experiences);
  const projects = useResumeStore((state) => state.projects);
  const certifications = useResumeStore((state) => state.certifications);
  const skills = useResumeStore((state) => state.skills);
  const fontFamily = useResumeStore((state) => state.fontFamily);
  const hasHydrated = useResumeStore((state) => state.hasHydrated);

  // Use the existing preview hook to determine whether the resume has content.
  const { hasResumeContent } = usePreviewData();

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ResumeSuggestions | null>(
    null
  );

  const requestControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const previousHasResumeContentRef = useRef(hasResumeContent);

  const resume: ResumeData = {
    personal,
    summary,
    experiences,
    projects,
    certifications,
    skills,
    fontFamily
  };

  // Clear AI state only when the resume transitions from populated to empty.
  useEffect(() => {
    const wasPopulated = previousHasResumeContentRef.current;
    previousHasResumeContentRef.current = hasResumeContent;

    if (!wasPopulated || hasResumeContent) {
      return;
    }

    requestIdRef.current += 1;
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;

    setJobDescription("");
    setSuggestions(null);
    setGenerationError(null);
    setIsGenerating(false);
  }, [hasResumeContent]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      requestControllerRef.current?.abort();
    };
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      await downloadResumePdf(resume);
    } catch (error) {
      console.error("PDF export failed:", error);
      setExportError(
        error instanceof Error ? error.message : "Could not export resume."
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    requestControllerRef.current?.abort();

    const controller = new AbortController();
    requestControllerRef.current = controller;

    const requestId = ++requestIdRef.current;

    setIsGenerating(true);
    setGenerationError(null);
    setSuggestions(null);

    try {
      const result = await generateResumeSuggestions(
        jobDescription,
        resume,
        controller.signal
      );

      if (controller.signal.aborted || requestId !== requestIdRef.current) {
        return;
      }

      setSuggestions(result);
    } catch (error) {
      if (
        controller.signal.aborted ||
        (error instanceof Error && error.name === "AbortError")
      ) {
        return;
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      setGenerationError(
        error instanceof Error
          ? error.message
          : "Could not generate suggestions."
      );
    } finally {
      if (requestId === requestIdRef.current) {
        requestControllerRef.current = null;
        setIsGenerating(false);
      }
    }
  };

  const sortedInsights = suggestions
    ? [...suggestions.insights].sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
      )
    : [];

  return (
    <SidePanel variant="right">
      <div className="flex flex-row gap-2 px-4 pb-2 pt-4">
        <ImportFileButton variant="Secondary" className="flex-1" />

        <Button
          type="button"
          variant="Primary"
          className="flex-1"
          onClick={handleExport}
          disabled={!hasHydrated || isExporting}
          aria-busy={isExporting}
        >
          {isExporting ? "Preparing PDF..." : "Export Resume"}
        </Button>
      </div>

      {exportError && (
        <p className="px-4 text-sm text-error" role="alert">
          {exportError}
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-h2 font-semibold">Job Details</h2>

          <TextareaField
            label="Job Description"
            placeholder="Paste the job description to get targeted resume suggestions."
            value={jobDescription}
            error=""
            maxLength={12000}
            onChange={(event) => setJobDescription(event.target.value)}
          />

          <Button
            type="button"
            variant="Primary"
            className="w-full"
            onClick={handleGenerateSuggestions}
            disabled={
              !hasHydrated ||
              !hasResumeContent ||
              isGenerating ||
              jobDescription.trim().length < 30
            }
            aria-busy={isGenerating}
          >
            {isGenerating ? "Generating…" : "Generate Insights"}
          </Button>
        </div>

        {generationError && (
          <p className="text-sm text-error" role="alert">
            {generationError}
          </p>
        )}

        {suggestions && (
          <section aria-live="polite" className="flex flex-col gap-4 pb-4">
            <h3 className="font-semibold">Resume Insights</h3>

            {sortedInsights.length > 0 ? (
              sortedInsights.map((insight, index) => (
                <InsightEntry
                  key={`${insight.severity}-${insight.title}-${index}`}
                  title={insight.title}
                  variant={insight.severity}
                >
                  {insight.detail}
                </InsightEntry>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No additional insights for this resume and job description.
              </p>
            )}
          </section>
        )}
      </div>
    </SidePanel>
  );
}
