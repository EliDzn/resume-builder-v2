import { z } from "zod";

const optionalEmail = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    "Enter a valid email address."
  );

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;

    try {
      const url = new URL(value.includes("://") ? value : `https://${value}`);
      return url.hostname.includes(".");
    } catch {
      return false;
    }
  }, "Enter a valid URL.");

const monthValue = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{4}-(0[1-9]|1[0-2])$/.test(value),
    "Enter a valid month and year."
  );

const hasContent = (values: string[]) =>
  values.some((value) => value.trim().length > 0);

const addRequiredIssues = (
  fields: Record<string, { value: string; label: string }>,
  context: z.RefinementCtx
) => {
  for (const [field, { value, label }] of Object.entries(fields)) {
    if (!value.trim()) {
      context.addIssue({
        code: "custom",
        path: [field],
        message: `${label} is required.`
      });
    }
  }
};

const addBulletIssues = (bullets: string[], context: z.RefinementCtx) => {
  if (bullets.length === 0) {
    context.addIssue({
      code: "custom",
      path: ["bullets"],
      message: "Add at least one bullet."
    });
  }

  bullets.forEach((bullet, index) => {
    if (!bullet.trim()) {
      context.addIssue({
        code: "custom",
        path: ["bullets", index],
        message: "Bullet is required."
      });
    }
  });
};

const experienceSchema = z
  .object({
    id: z.string(),
    role: z.string(),
    company: z.string(),
    startDate: monthValue,
    endDate: monthValue,
    bullets: z.array(z.string())
  })
  .superRefine((experience, context) => {
    if (
      !hasContent([
        experience.role,
        experience.company,
        experience.startDate,
        experience.endDate,
        ...experience.bullets
      ])
    ) {
      return;
    }

    addRequiredIssues(
      {
        role: { value: experience.role, label: "Role" },
        company: { value: experience.company, label: "Company" },
        startDate: { value: experience.startDate, label: "Start date" }
      },
      context
    );
    addBulletIssues(experience.bullets, context);

    if (
      experience.startDate &&
      experience.endDate &&
      experience.endDate < experience.startDate
    ) {
      context.addIssue({
        code: "custom",
        path: ["dateRange"],
        message: "End date must be after the start date."
      });
    }
  });

const projectSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    techStack: z.string(),
    endDate: monthValue,
    bullets: z.array(z.string())
  })
  .superRefine((project, context) => {
    if (
      !hasContent([
        project.name,
        project.techStack,
        project.endDate,
        ...project.bullets
      ])
    ) {
      return;
    }

    addRequiredIssues(
      {
        name: { value: project.name, label: "Project name" },
        techStack: { value: project.techStack, label: "Tech stack" },
        endDate: { value: project.endDate, label: "Project end date" }
      },
      context
    );
    addBulletIssues(project.bullets, context);
  });

const certificationSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    completedDate: monthValue
  })
  .superRefine((certification, context) => {
    if (!hasContent([certification.title, certification.completedDate])) {
      return;
    }

    addRequiredIssues(
      {
        title: { value: certification.title, label: "Certification title" },
        completedDate: {
          value: certification.completedDate,
          label: "Completion date"
        }
      },
      context
    );
  });

export const resumeSchema = z
  .object({
    personal: z.object({
      fullName: z.string().trim().min(1, "Enter your full name."),
      role: z.string(),
      location: z.string(),
      phone: z.string(),
      email: optionalEmail,
      linkedin: optionalUrl,
      github: optionalUrl
    }),
    summary: z.string(),
    experiences: z.array(experienceSchema),
    projects: z.array(projectSchema),
    certifications: z.array(certificationSchema),
    skills: z.object({
      frontend: z.array(z.string()),
      backend: z.array(z.string()),
      tools: z.array(z.string())
    }),
    fontFamily: z.enum(["inter", "times"])
  })
  .superRefine((resume, context) => {
    const hasNamedExperience = resume.experiences.some(
      (item) => item.role.trim() || item.company.trim()
    );
    const hasNamedProject = resume.projects.some((item) => item.name.trim());
    const hasNamedCertification = resume.certifications.some((item) =>
      item.title.trim()
    );
    const hasSkills = Object.values(resume.skills).some(
      (values) => values.length
    );

    if (
      !hasNamedExperience &&
      !hasNamedProject &&
      !hasNamedCertification &&
      !hasSkills
    ) {
      context.addIssue({
        code: "custom",
        message: "Add an experience, project, certification, or skill."
      });
    }
  });
