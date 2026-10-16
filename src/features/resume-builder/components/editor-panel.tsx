import { useState } from "react";
import SidePanel from "./side-panel";
import InputField from "@/components/ui/input-field";
import TextareaField from "@/components/ui/textarea-field";
import EditorPanelSection from "./editor-panel-section";
import EditorPanelFieldset from "./editor-panel-fieldset";
import Button from "@/components/ui/button";
import ExperienceEntry from "./experience-entry";
import ProjectEntry from "./project-entry";
import CertificationEntry from "./certification-entry";
import { useOverflowDetect } from "../hooks/use-overflow";
import { useResumeStore } from "../state/resume-store";
import { resumeSchema } from "../model/resume-schema";
import type { ResumeData, ResumeSkills } from "../model/resume-type";
import Checkbox from "@/components/ui/checkbox";

const skillGroups: {
  key: keyof ResumeSkills;
  label: string;
  options: string[];
}[] = [
  {
    key: "frontend",
    label: "Frontend",
    options: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Vue",
      "Angular"
    ]
  },
  {
    key: "backend",
    label: "Backend",
    options: [
      "Node.js",
      "Express",
      "Python",
      "Django",
      "Java",
      "Spring Boot",
      "C#",
      ".NET",
      "Go",
      "PHP"
    ]
  },
  {
    key: "tools",
    label: "Tools",
    options: [
      "Git",
      "GitHub",
      "Docker",
      "PostgreSQL",
      "MongoDB",
      "AWS",
      "Azure",
      "Figma",
      "Jest",
      "Vite"
    ]
  }
];

export default function EditorPanel() {
  const [customSkills, setCustomSkills] = useState<
    Record<keyof ResumeSkills, string>
  >({ frontend: "", backend: "", tools: "" });
  const { ref: scrollRef, isOverflowing } = useOverflowDetect<HTMLDivElement>();

  const personal = useResumeStore((state) => state.personal);
  const summary = useResumeStore((state) => state.summary);
  const experiences = useResumeStore((state) => state.experiences);
  const projects = useResumeStore((state) => state.projects);
  const certifications = useResumeStore((state) => state.certifications);
  const skills = useResumeStore((state) => state.skills);
  const fontFamily = useResumeStore((state) => state.fontFamily);

  const updatePersonal = useResumeStore((state) => state.updatePersonal);
  const updateSummary = useResumeStore((state) => state.updateSummary);
  const updateSkills = useResumeStore((state) => state.updateSkills);
  const addExperience = useResumeStore((state) => state.addExperience);
  const addProject = useResumeStore((state) => state.addProject);
  const addCertification = useResumeStore((state) => state.addCertification);

  const updateSkillSelection = (
    category: keyof ResumeSkills,
    skill: string,
    checked: boolean
  ) => {
    const selected = skills[category];
    const nextSkills: Partial<ResumeSkills> = {
      [category]: checked
        ? [...selected, skill]
        : selected.filter((item) => item !== skill)
    };

    updateSkills(nextSkills);
  };

  const addCustomSkill = (category: keyof ResumeSkills) => {
    const skill = customSkills[category].trim();
    if (!skill) return;

    if (
      !skills[category].some(
        (item) => item.toLowerCase() === skill.toLowerCase()
      )
    ) {
      updateSkillSelection(category, skill, true);
    }

    setCustomSkills((current) => ({ ...current, [category]: "" }));
  };

  const resume: ResumeData = {
    personal,
    summary,
    experiences,
    projects,
    certifications,
    skills,
    fontFamily
  };

  const result = resumeSchema.safeParse(resume);
  const errors: Record<string, string> = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      errors[path] ??= issue.message;
    }
  }

  return (
    <SidePanel variant="left">
      <header className="shrink-0 px-4 py-9">
        <h1 className="text-h1 font-bold">Optimized Resume Builder (v2)</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          A local-first, resume builder based of the Harvard template resume
          with built-in Gemini AI integration.
        </p>
      </header>

      <div
        ref={scrollRef}
        className={[
          "min-h-0 divide-y divide-foreground overflow-auto",
          isOverflowing ? "border-t" : "border-y",
          "border-foreground"
        ].join(" ")}
      >
        <EditorPanelSection title="Personal">
          <EditorPanelFieldset>
            <InputField
              id="full-name"
              name="fullName"
              label="Full name"
              placeholder="John Doe"
              type="text"
              value={personal.fullName}
              required
              error={errors["personal.fullName"] ?? ""}
              onChange={(event) =>
                updatePersonal({ fullName: event.target.value })
              }
            />

            <InputField
              id="role"
              name="role"
              label="Role"
              placeholder="Associate"
              type="text"
              value={personal.role}
              error=""
              onChange={(event) => updatePersonal({ role: event.target.value })}
            />

            <InputField
              id="location"
              name="location"
              label="Location"
              placeholder="Manila, Philippines"
              type="text"
              value={personal.location}
              error=""
              onChange={(event) =>
                updatePersonal({ location: event.target.value })
              }
            />

            <InputField
              id="phone"
              name="phone"
              label="Phone"
              placeholder="123-4567"
              type="tel"
              value={personal.phone}
              error=""
              onChange={(event) =>
                updatePersonal({ phone: event.target.value })
              }
            />

            <InputField
              id="email"
              name="email"
              label="Email"
              placeholder="john@email.com"
              type="email"
              value={personal.email}
              error={errors["personal.email"] ?? ""}
              onChange={(event) =>
                updatePersonal({ email: event.target.value })
              }
            />

            <InputField
              id="linkedin"
              name="linkedin"
              label="LinkedIn"
              placeholder="linkedin.com/in/john-doe"
              type="url"
              value={personal.linkedin}
              error={errors["personal.linkedin"] ?? ""}
              onChange={(event) =>
                updatePersonal({ linkedin: event.target.value })
              }
            />

            <InputField
              id="github"
              name="github"
              label="Github"
              placeholder="github.com/JohnDoe"
              type="url"
              value={personal.github}
              error={errors["personal.github"] ?? ""}
              onChange={(event) =>
                updatePersonal({ github: event.target.value })
              }
            />
          </EditorPanelFieldset>
        </EditorPanelSection>

        <EditorPanelSection title="Summary">
          <EditorPanelFieldset>
            <TextareaField
              id="summary"
              name="summary"
              label="Profile Summary"
              placeholder="A brief summary of your professional background and goals."
              value={summary}
              error=""
              onChange={(event) => updateSummary(event.target.value)}
            />
          </EditorPanelFieldset>
        </EditorPanelSection>

        <EditorPanelSection title="Experience">
          {experiences.map((experience, index) => (
            <ExperienceEntry
              key={experience.id}
              experience={experience}
              index={index}
              errors={errors}
              entryError={errors[`experiences.${index}.dateRange`] ?? ""}
            />
          ))}

          <Button
            type="button"
            variant="Ghost"
            className="w-full"
            onClick={addExperience}
          >
            Add Experience
          </Button>
        </EditorPanelSection>

        <EditorPanelSection title="Projects">
          {projects.map((project, index) => (
            <ProjectEntry
              key={project.id}
              project={project}
              index={index}
              errors={errors}
            />
          ))}

          <Button
            type="button"
            variant="Ghost"
            className="w-full"
            onClick={addProject}
          >
            Add Project
          </Button>
        </EditorPanelSection>

        <EditorPanelSection title="Certifications">
          {certifications.map((certification, index) => (
            <CertificationEntry
              key={certification.id}
              certification={certification}
              index={index}
              errors={errors}
            />
          ))}

          <Button
            type="button"
            variant="Ghost"
            className="w-full"
            onClick={addCertification}
          >
            Add Certification
          </Button>
        </EditorPanelSection>
        <EditorPanelSection title="Skills">
          <EditorPanelFieldset>
            {skillGroups.map(({ key, label, options }) => (
              <fieldset key={key} className="flex min-w-0 flex-col gap-3">
                <legend className="font-semibold">{label}</legend>
                <div className="flex flex-wrap gap-2">
                  {options.map((skill) => (
                    <Checkbox
                      key={skill}
                      checked={skills[key].includes(skill)}
                      aria-label={`${label}: ${skill}`}
                      onCheckedChange={(checked) =>
                        updateSkillSelection(key, skill, checked)
                      }
                    >
                      {skill}
                    </Checkbox>
                  ))}
                </div>
                <div className="flex items-end gap-2">
                  <InputField
                    id={`skills-${key}-custom`}
                    name={`skills.${key}.custom`}
                    label={`Custom ${label} skill`}
                    placeholder="Add another skill"
                    value={customSkills[key]}
                    error=""
                    onChange={(event) =>
                      setCustomSkills((current) => ({
                        ...current,
                        [key]: event.target.value
                      }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCustomSkill(key);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="Ghost"
                    disabled={!customSkills[key].trim()}
                    onClick={() => addCustomSkill(key)}
                  >
                    Add
                  </Button>
                </div>
              </fieldset>
            ))}
          </EditorPanelFieldset>
        </EditorPanelSection>
      </div>
    </SidePanel>
  );
}
