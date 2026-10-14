import { useState } from "react";
import SidePanel from "./side-panel";
import Button from "@/components/ui/button";
import TextareaField from "@/components/ui/textarea-field";
import { useResumeStore } from "../state/resume-store";
import type { ResumeData } from "../model/resume-type";
import { downloadResumePdf } from "../pdf/download-resume-pdf";
import ImportFileButton from "./import-file-button";

export default function InsightPanel() {
  const personal = useResumeStore((state) => state.personal);
  const summary = useResumeStore((state) => state.summary);
  const experiences = useResumeStore((state) => state.experiences);
  const projects = useResumeStore((state) => state.projects);
  const certifications = useResumeStore((state) => state.certifications);
  const fontFamily = useResumeStore((state) => state.fontFamily);
  const hasHydrated = useResumeStore((state) => state.hasHydrated);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const resume: ResumeData = {
    personal,
    summary,
    experiences,
    projects,
    certifications,
    fontFamily
  };

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

      <div className="flex flex-col gap-4 px-4">
        <div className="flex flex-col gap-2 ">
          <h2 className="text-h2 font-semibold">Job Details</h2>
          <TextareaField
            label="Job Description"
            placeholder="Copy and paste the job description here to tailor your resume to the job requirements"
          />
          <Button variant="Primary" className="flex-1">
            Generate Insights
          </Button>
        </div>
        <div>
          <p>insights here</p>
        </div>
      </div>
    </SidePanel>
  );
}
