import { describe, expect, it } from "vitest";
import { parseResumeText } from "./parse-resume-text";

describe("parseResumeText", () => {
  it("parses contact details, summary, and categorized skills", () => {
    const resume = parseResumeText(`Jane Doe
jane@example.com
+1 (555) 123-4567
linkedin.com/in/janedoe
github.com/janedoe

Professional Summary:
Frontend developer with accessibility experience.

Skills:
Frontend: React, TypeScript
Backend: Node.js; Express
Tools: Git, Playwright`);

    expect(resume.personal).toMatchObject({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+1 (555) 123-4567",
      linkedin: "linkedin.com/in/janedoe",
      github: "github.com/janedoe"
    });
    expect(resume.summary).toBe(
      "Frontend developer with accessibility experience."
    );
    expect(resume.skills).toEqual({
      frontend: ["React", "TypeScript"],
      backend: ["Node.js", "Express"],
      tools: ["Git", "Playwright"]
    });
  });

  it("parses dated experience and joins wrapped bullet lines", () => {
    const resume = parseResumeText(`Jane Doe

Experience:
Acme Corp Jan 2022 - Dec 2023
Senior Engineer
• Built accessible web applications
Improved keyboard navigation

Other Co Mar 2020 - Present
Developer
- Maintained production services`);

    expect(
      resume.experiences.map(
        ({ company, role, startDate, endDate, bullets }) => ({
          company,
          role,
          startDate,
          endDate,
          bullets
        })
      )
    ).toEqual([
      {
        company: "Acme Corp",
        role: "Senior Engineer",
        startDate: "2022-01",
        endDate: "2023-12",
        bullets: [
          "Built accessible web applications Improved keyboard navigation"
        ]
      },
      {
        company: "Other Co",
        role: "Developer",
        startDate: "2020-03",
        endDate: "",
        bullets: ["Maintained production services"]
      }
    ]);
  });

  it("parses projects and ignores education content", () => {
    const resume = parseResumeText(`Jane Doe

Projects:
Resume Builder Jan 2024
React, TypeScript
• Created a resume editor

Education:
Example University
Bachelor of Science`);

    expect(
      resume.projects.map(({ name, techStack, endDate, bullets }) => ({
        name,
        techStack,
        endDate,
        bullets
      }))
    ).toEqual([
      {
        name: "Resume Builder",
        techStack: "React, TypeScript",
        endDate: "2024-01",
        bullets: ["Created a resume editor"]
      }
    ]);
  });

  it("creates one certification per line and preserves commas in titles", () => {
    const resume = parseResumeText(`Jane Doe

Licenses & Certifications:
• AWS Certified Solutions Architect: Associate — Jan 2024
Google Cloud Professional Data Engineer, Google Cloud — Feb 2023`);

    expect(
      resume.certifications.map(({ title, completedDate }) => ({
        title,
        completedDate
      }))
    ).toEqual([
      {
        title: "AWS Certified Solutions Architect: Associate",
        completedDate: "2024-01"
      },
      {
        title: "Google Cloud Professional Data Engineer, Google Cloud",
        completedDate: "2023-02"
      }
    ]);
  });

  it("leaves completion date empty when certification has no date", () => {
    const resume = parseResumeText(`Jane Doe

Certifications:
First Aid Certification`);

    expect(resume.certifications).toHaveLength(1);
    expect(resume.certifications[0]).toMatchObject({
      title: "First Aid Certification",
      completedDate: ""
    });
  });
});
