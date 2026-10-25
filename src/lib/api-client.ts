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

function toResumeAIContext(resume: ResumeData) {
  return {
    role: resume.personal.role,
    summary: resume.summary,
    experiences: resume.experiences.map(({ role, bullets }) => ({
      role,
      bullets: bullets.filter((bullet) => bullet.trim())
    })),
    projects: resume.projects.map(({ name, techStack, bullets }) => ({
      name,
      techStack,
      bullets: bullets.filter((bullet) => bullet.trim())
    })),
    certifications: resume.certifications.map(({ provider, title }) => ({
      provider,
      title
    })),
    skills: resume.skills
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
  const request = ResumeSuggestionsRequestSchema.safeParse({
    jobDescription,
    resume: toResumeAIContext(resume)
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
