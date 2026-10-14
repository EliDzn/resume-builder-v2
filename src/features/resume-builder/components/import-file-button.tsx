import { useRef, useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import Button from "@/components/ui/button";
import { parseResumeText } from "../import/parse-resume-text";
import { readResumeFile } from "../import/read-resume-file";
import { useResumeStore } from "../state/resume-store";

type ResumeImportButtonProps = {
  className?: string;
  variant?: "Primary" | "Secondary";
};

export default function ImportFileButton({
  className,
  variant = "Primary"
}: ResumeImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasHydrated = useResumeStore((state) => state.hasHydrated);
  const replaceResume = useResumeStore((state) => state.replaceResume);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";

    if (!file) return;

    setError(null);
    setIsImporting(true);

    try {
      const text = await readResumeFile(file);
      replaceResume(parseResumeText(text));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not import this file."
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept=".docx,.pdf"
        className="sr-only"
        tabIndex={-1}
        onChange={handleFileChange}
      />

      <Button
        type="button"
        variant={variant}
        className="w-full"
        disabled={!hasHydrated || isImporting}
        aria-busy={isImporting}
        onClick={() => inputRef.current?.click()}
      >
        <Upload aria-hidden="true" className="mr-2 h-4 w-4" />
        {isImporting ? "Importing..." : "Import Resume"}
      </Button>

      {error && (
        <p className="mt-2 text-caption text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
