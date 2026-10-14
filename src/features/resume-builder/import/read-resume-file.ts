import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function readResumeFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Choose a file smaller than 20 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension !== "docx" && extension !== "pdf") {
    throw new Error("Choose a DOCX or PDF file.");
  }

  let text: string;

  if (extension === "docx") {
    const result = await mammoth.extractRawText({
      arrayBuffer: await file.arrayBuffer()
    });
    text = result.value;
  } else {
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer())
    });
    const document = await loadingTask.promise;

    try {
      const pages: string[] = [];

      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();

        pages.push(
          content.items
            .map((item) => {
              if (!("str" in item)) return "";
              return `${item.str}${item.hasEOL ? "\n" : " "}`;
            })
            .join("")
        );
      }

      text = pages.join("\n");
    } finally {
      await loadingTask.destroy();
    }
  }

  const normalizedText = text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!normalizedText) {
    throw new Error(
      extension === "pdf"
        ? "No selectable text found. This PDF may be scanned."
        : "No text found in this DOCX file."
    );
  }

  return normalizedText;
}
