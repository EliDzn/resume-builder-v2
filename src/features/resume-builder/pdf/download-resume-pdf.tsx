import { Document, pdf } from "@react-pdf/renderer";
import type { ResumeData } from "../model/resume-type";
import ResumeDocument from "./resume-document";

function createFileName(fullName: string) {
  const safeName = [...fullName.trim()]
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;

      return (
        codePoint >= 0x20 &&
        codePoint !== 0x7f &&
        !/[<>:"/\\|?*]/.test(character)
      );
    })
    .join("")
    .replace(/\s+/g, "_");

  return `${safeName || "resume"}.pdf`;
}

export async function downloadResumePdf(resume: ResumeData): Promise<void> {
  const blob = await pdf(
    <Document title={resume.personal.fullName || "Resume"}>
      <ResumeDocument resume={resume} />
    </Document>
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = createFileName(resume.personal.fullName);
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
