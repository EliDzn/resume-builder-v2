import { describe, expect, it } from "vitest";
import { resumeSchema } from "./resume-schema";
import type { ResumeData } from "./resume-type";

function createValidResume(): ResumeData {
  return {
    personal: {
      fullName: "Jane Doe",
      role: "",
      location: "",
      phone: "",
      email: "",
      linkedin: "",
      github: ""
    },
    summary: "",
    experiences: [
      {
        id: "experience-1",
        role: "Developer",
        company: "Example Co.",
        startDate: "2023-01",
        endDate: "2024-01",
        bullets: ["Built a web application."]
      }
    ],
    projects: [],
    certifications: [],
    skills: {
      frontend: [],
      backend: [],
      tools: []
    },
    fontFamily: "inter" as const
  };
}

describe("resumeSchema", () => {
  it("accepts a valid resume", () => {
    expect(resumeSchema.safeParse(createValidResume()).success).toBe(true);
  });

  it("rejects a missing full name", () => {
    const resume = createValidResume();
    resume.personal.fullName = "   ";

    const result = resumeSchema.safeParse(resume);

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ["personal", "fullName"]
      })
    );
  });

  it("rejects an invalid email address", () => {
    const resume = createValidResume();
    resume.personal.email = "not-an-email";

    const result = resumeSchema.safeParse(resume);

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ["personal", "email"]
      })
    );
  });

  it("rejects a month outside the valid range", () => {
    const resume = createValidResume();
    resume.experiences[0].startDate = "2024-13";

    const result = resumeSchema.safeParse(resume);

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ["experiences", 0, "startDate"]
      })
    );
  });

  it("rejects an experience whose end date is before its start date", () => {
    const resume = createValidResume();
    resume.experiences[0].startDate = "2024-06";
    resume.experiences[0].endDate = "2024-05";

    const result = resumeSchema.safeParse(resume);

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ["experiences", 0, "dateRange"]
      })
    );
  });

  it("requires a completion date when certification has a title", () => {
    const resume = createValidResume();
    resume.certifications = [
      {
        id: "certification-1",
        title: "Example Certification",
        completedDate: ""
      }
    ];

    const result = resumeSchema.safeParse(resume);

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ["certifications", 0, "completedDate"]
      })
    );
  });

  it("allows an empty end date for a current experience", () => {
    const resume = createValidResume();
    resume.experiences[0].endDate = "";

    expect(resumeSchema.safeParse(resume).success).toBe(true);
  });

  it("rejects an invalid LinkedIn URL", () => {
    const resume = createValidResume();
    resume.personal.linkedin = "not a url";

    const result = resumeSchema.safeParse(resume);

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ["personal", "linkedin"]
      })
    );
  });

  it("requires a project name, tech stack, date, and bullet when project has content", () => {
    const resume = createValidResume();
    resume.projects = [
      {
        id: "project-1",
        name: "Portfolio",
        techStack: "",
        endDate: "2024-01",
        bullets: []
      }
    ];

    const result = resumeSchema.safeParse(resume);

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({ path: ["projects", 0, "techStack"] })
    );
    expect(result.error.issues).toContainEqual(
      expect.objectContaining({ path: ["projects", 0, "bullets"] })
    );
  });

  it("rejects a resume with no experience, project, certification, or skill", () => {
    const resume = createValidResume();
    resume.experiences = [];
    resume.projects = [];
    resume.certifications = [];

    const result = resumeSchema.safeParse(resume);

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        message: "Add an experience, project, certification, or skill."
      })
    );
  });
});
