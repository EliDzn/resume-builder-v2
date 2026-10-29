import mammoth from "mammoth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readResumeFile } from "./read-resume-file";

const pdfMocks = vi.hoisted(() => ({
  getDocument: vi.fn(),
  getPage: vi.fn(),
  destroy: vi.fn()
}));

vi.mock("mammoth", () => ({
  default: {
    extractRawText: vi.fn()
  }
}));

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: pdfMocks.getDocument
}));

describe("readResumeFile", () => {
  beforeEach(() => {
    vi.mocked(mammoth.extractRawText).mockReset();
    pdfMocks.getDocument.mockReset();
    pdfMocks.getPage.mockReset();
    pdfMocks.destroy.mockReset();
    pdfMocks.destroy.mockResolvedValue(undefined);
  });

  it("extracts and normalizes text from a DOCX file", async () => {
    vi.mocked(mammoth.extractRawText).mockResolvedValue({
      value: "Jane Doe\n\nCERTIFICATIONS\nAWS Certificate",
      messages: []
    });

    const file = new File(["docx content"], "resume.docx");

    await expect(readResumeFile(file)).resolves.toBe(
      "Jane Doe\n\nCERTIFICATIONS\nAWS Certificate"
    );
  });

  it("extracts text from every PDF page and destroys the loading task", async () => {
    pdfMocks.getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 2,
        getPage: pdfMocks.getPage
      }),
      destroy: pdfMocks.destroy
    });

    pdfMocks.getPage
      .mockResolvedValueOnce({
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { str: "Jane Doe", hasEOL: true },
            { str: "Frontend Developer", hasEOL: true }
          ]
        })
      })
      .mockResolvedValueOnce({
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: "TypeScript", hasEOL: true }]
        })
      });

    const file = new File(["pdf content"], "resume.pdf");

    await expect(readResumeFile(file)).resolves.toBe(
      "Jane Doe\nFrontend Developer\n\nTypeScript"
    );

    expect(pdfMocks.getPage).toHaveBeenNthCalledWith(1, 1);
    expect(pdfMocks.getPage).toHaveBeenNthCalledWith(2, 2);
    expect(pdfMocks.destroy).toHaveBeenCalledOnce();
  });

  it("rejects PDFs without selectable text and still destroys the loading task", async () => {
    pdfMocks.getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: pdfMocks.getPage
      }),
      destroy: pdfMocks.destroy
    });

    pdfMocks.getPage.mockResolvedValue({
      getTextContent: vi.fn().mockResolvedValue({ items: [] })
    });

    const file = new File(["scanned PDF"], "resume.pdf");

    await expect(readResumeFile(file)).rejects.toThrow(
      "No selectable text found. This PDF may be scanned."
    );
    expect(pdfMocks.destroy).toHaveBeenCalledOnce();
  });

  it("rejects files larger than 20 MB", async () => {
    const file = new File(["content"], "resume.docx");
    Object.defineProperty(file, "size", { value: 20 * 1024 * 1024 + 1 });

    await expect(readResumeFile(file)).rejects.toThrow(
      "Choose a file smaller than 20 MB."
    );

    expect(mammoth.extractRawText).not.toHaveBeenCalled();
    expect(pdfMocks.getDocument).not.toHaveBeenCalled();
  });

  it("rejects unsupported file types", async () => {
    const file = new File(["content"], "resume.txt");

    await expect(readResumeFile(file)).rejects.toThrow(
      "Choose a DOCX or PDF file."
    );
  });

  it("rejects a DOCX file when Mammoth extracts no text", async () => {
    vi.mocked(mammoth.extractRawText).mockResolvedValue({
      value: " \n ",
      messages: []
    });

    const file = new File(["docx content"], "resume.docx");

    await expect(readResumeFile(file)).rejects.toThrow(
      "No text found in this DOCX file."
    );
  });
});
