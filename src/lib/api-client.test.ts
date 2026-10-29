import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ResumeData } from "../features/resume-builder/model/resume-type";
import { generateResumeSuggestions, getAIQuotaStatus } from "./api-client";

const resume: ResumeData = {
  personal: {
    fullName: "Jane Doe",
    role: "Frontend Developer",
    location: "",
    phone: "",
    email: "",
    linkedin: "",
    github: ""
  },
  summary: "Frontend developer experienced with accessible web applications.",
  experiences: [],
  projects: [],
  certifications: [
    {
      id: "cert-1",
      title: "Cloud Developer Certification",
      completedDate: "2024-01"
    }
  ],
  skills: {
    frontend: ["TypeScript"],
    backend: [],
    tools: []
  },
  fontFamily: "inter"
};

const suggestions = {
  insights: [
    {
      severity: "Success",
      title: "Relevant frontend experience",
      detail: "Your resume highlights TypeScript experience."
    }
  ]
};

const validJobDescription =
  "We need an experienced frontend developer with TypeScript skills.";

describe("AI API client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retrieves and validates quota status", async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({ used: 2, limit: 5, remaining: 3 })
    );

    await expect(getAIQuotaStatus()).resolves.toEqual({
      used: 2,
      limit: 5,
      remaining: 3
    });

    expect(fetch).toHaveBeenCalledWith("/api/ai/suggestions", {
      method: "GET",
      cache: "no-store"
    });
  });

  it("reports quota endpoint errors", async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json(
        { error: "Rate protection is unavailable." },
        { status: 503 }
      )
    );

    await expect(getAIQuotaStatus()).rejects.toThrow(
      "Rate protection is unavailable."
    );
  });

  it("sends a validated generation request and returns suggestions", async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json(suggestions));

    await expect(
      generateResumeSuggestions(validJobDescription, resume)
    ).resolves.toEqual(suggestions);

    expect(fetch).toHaveBeenCalledTimes(1);

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(options?.method).toBe("POST");

    const body = JSON.parse(String(options?.body));
    expect(body.resume.certifications).toEqual([
      { title: "Cloud Developer Certification" }
    ]);
  });

  it("does not send a request when the job description is invalid", async () => {
    await expect(
      generateResumeSuggestions("Too short", resume)
    ).rejects.toThrow();

    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects malformed suggestion responses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({ insights: [{ title: "Missing fields" }] })
    );

    await expect(
      generateResumeSuggestions(validJobDescription, resume)
    ).rejects.toThrow("The server returned an invalid response.");
  });

  it("rejects malformed quota responses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({ used: -1, limit: 5, remaining: 6 })
    );

    await expect(getAIQuotaStatus()).rejects.toThrow(
      "The server returned an invalid quota response."
    );
  });

  it("forwards the abort signal and omits blank resume bullets", async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json(suggestions));

    const controller = new AbortController();
    const resumeWithBlankBullet: ResumeData = {
      ...resume,
      experiences: [
        {
          id: "experience-1",
          role: "Engineer",
          company: "Example Co.",
          startDate: "2023-01",
          endDate: "",
          bullets: ["Built accessible pages", "   "]
        }
      ]
    };

    await generateResumeSuggestions(
      validJobDescription,
      resumeWithBlankBullet,
      controller.signal
    );

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(options?.signal).toBe(controller.signal);

    const body = JSON.parse(String(options?.body));
    expect(body.resume.experiences).toEqual([
      {
        role: "Engineer",
        bullets: ["Built accessible pages"]
      }
    ]);
  });

  it("uses a fallback message when generation error response has no error", async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json({}, { status: 500 }));

    await expect(
      generateResumeSuggestions(validJobDescription, resume)
    ).rejects.toThrow("Could not generate suggestions.");
  });
});
