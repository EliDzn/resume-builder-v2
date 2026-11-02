import { z } from "zod";
import type { ResumeData } from "../features/resume-builder/model/resume-type";
import {
  ResumeSuggestionsRequestSchema,
  ResumeSuggestionsSchema,
  type ResumeSuggestions
} from "../features/resume-builder/model/gemini-suggestions";

const AIQuotaStatusSchema = z
  .object({
    used: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    remaining: z.number().int().nonnegative()
  })
  .strict();

export type AIQuotaStatus = z.infer<typeof AIQuotaStatusSchema>;

function getErrorMessage(payload: unknown, fallback: string): string {
  const result = z.object({ error: z.string() }).safeParse(payload);
  return result.success ? result.data.error : fallback;
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const URL_PATTERN =
  /\b(?:https?:\/\/|www\.)[^\s<>()]+|\b(?:[A-Z0-9-]+\.)+(?:com|org|net|edu|gov|io|co|dev|app|me|info|biz)(?:\/[^\s<>()]*)?/gi;
const PHONE_PATTERN =
  /(^|[^\w])((?:\+1[ -.]?)?(?:\(\d{3}\)[ -]?\d{3}[-.]\d{4}|\d{3}[-.]\d{3}[-.]\d{4}))(?=$|[^\w])/g;

function createRedactor(resume: ResumeData) {
  const knownNames = [
    resume.personal.fullName,
    ...resume.experiences.map(({ company }) => company),
    ...resume.projects.map(({ name }) => name)
  ]
    .map((value) => value.trim())
    .filter((value) => value.length > 2)
    .sort((a, b) => b.length - a.length);

  const knownNamesPattern = knownNames.length
    ? new RegExp(knownNames.map(escapeRegExp).join("|"), "gi")
    : null;

  return (text: string) => {
    const scrubbed = knownNamesPattern
      ? text.replace(knownNamesPattern, "[REDACTED]")
      : text;

    return scrubbed
      .replace(EMAIL_PATTERN, "[REDACTED]")
      .replace(URL_PATTERN, "[REDACTED]")
      .replace(
        PHONE_PATTERN,
        (_match, prefix: string) => `${prefix}[REDACTED]`
      );
  };
}

function toResumeAIContext(
  resume: ResumeData,
  scrub: (text: string) => string
) {
  return {
    role: scrub(resume.personal.role),
    summary: scrub(resume.summary),
    experiences: resume.experiences.map(({ role, bullets }) => ({
      role: scrub(role),
      bullets: bullets.filter((bullet) => bullet.trim()).map(scrub)
    })),
    projects: resume.projects.map(({ techStack, bullets }, index) => ({
      label: `Project ${index + 1}`,
      techStack: scrub(techStack),
      bullets: bullets.filter((bullet) => bullet.trim()).map(scrub)
    })),
    certifications: resume.certifications.map(({ title }) => ({
      title: scrub(title)
    })),
    skills: {
      frontend: resume.skills.frontend.map(scrub),
      backend: resume.skills.backend.map(scrub),
      tools: resume.skills.tools.map(scrub)
    }
  };
}

export async function getAIQuotaStatus(): Promise<AIQuotaStatus> {
  const response = await fetch("/api/ai/suggestions", {
    method: "GET",
    cache: "no-store"
  });

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload, "Could not retrieve AI quota status.")
    );
  }

  const result = AIQuotaStatusSchema.safeParse(payload);

  if (!result.success) {
    throw new Error("The server returned an invalid quota response.");
  }

  return result.data;
}

export async function generateResumeSuggestions(
  jobDescription: string,
  resume: ResumeData,
  signal?: AbortSignal
): Promise<ResumeSuggestions> {
  const scrub = createRedactor(resume);
  const request = ResumeSuggestionsRequestSchema.safeParse({
    jobDescription: scrub(jobDescription),
    resume: toResumeAIContext(resume, scrub)
  });

  if (!request.success) {
    throw new Error(request.error.issues[0]?.message ?? "Check the request.");
  }

  const response = await fetch("/api/ai/suggestions", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(request.data),
    signal
  });

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload, "Could not generate suggestions.")
    );
  }

  const result = ResumeSuggestionsSchema.safeParse(payload);

  if (!result.success) {
    throw new Error("The server returned an invalid response.");
  }

  return result.data;
}
