import { z } from "zod";

const resumeContextSchema = z
  .object({
    role: z.string().trim().max(160),
    summary: z.string().trim().max(3000),
    experiences: z
      .array(
        z.object({
          role: z.string().trim().max(160),
          bullets: z.array(z.string().trim().max(700)).max(8)
        })
      )
      .max(10),
    projects: z
      .array(
        z.object({
          name: z.string().trim().max(200),
          techStack: z.string().trim().max(300),
          bullets: z.array(z.string().trim().max(700)).max(8)
        })
      )
      .max(10),
    certifications: z
      .array(
        z.object({
          title: z.string().trim().max(200)
        })
      )
      .max(15),
    skills: z.object({
      frontend: z.array(z.string().trim().min(1).max(80)).max(30),
      backend: z.array(z.string().trim().min(1).max(80)).max(30),
      tools: z.array(z.string().trim().min(1).max(80)).max(30)
    })
  })
  .strict();

export const ResumeSuggestionsRequestSchema = z
  .object({
    jobDescription: z.string().trim().min(30).max(12000),
    resume: resumeContextSchema
  })
  .strict();

export const ResumeInsightSchema = z
  .object({
    severity: z.enum(["Error", "Warning", "Success"]),
    title: z.string().trim().min(1).max(120),
    detail: z.string().trim().min(1).max(500)
  })
  .strict();

export const ResumeSuggestionsSchema = z
  .object({
    insights: z.array(ResumeInsightSchema).max(18)
  })
  .strict();

export type ResumeInsight = z.infer<typeof ResumeInsightSchema>;
export type ResumeSuggestions = z.infer<typeof ResumeSuggestionsSchema>;
