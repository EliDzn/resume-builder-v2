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

export default function EditorPanel() {
  const { ref: scrollRef, isOverflowing } = useOverflowDetect<HTMLDivElement>();

  const personal = useResumeStore((state) => state.personal);
  const summary = useResumeStore((state) => state.summary);
  const experiences = useResumeStore((state) => state.experiences);
  const projects = useResumeStore((state) => state.projects);
  const certifications = useResumeStore((state) => state.certifications);

  const updatePersonal = useResumeStore((state) => state.updatePersonal);
  const updateSummary = useResumeStore((state) => state.updateSummary);
  const addExperience = useResumeStore((state) => state.addExperience);
  const addProject = useResumeStore((state) => state.addProject);
  const addCertification = useResumeStore((state) => state.addCertification);

  return (
    <SidePanel variant="left">
      <header className="shrink-0 px-4 py-9">
        <h1 className="text-h1 font-bold">Optimized Resume Builder (v2)</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          A local-first resume builder! Need a guide? AI is there to help you!
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
              value={personal.fullName}
              required
              onChange={(event) =>
                updatePersonal({ fullName: event.target.value })
              }
            />

            <InputField
              id="role"
              name="role"
              label="Role"
              placeholder="Associate"
              value={personal.role}
              onChange={(event) => updatePersonal({ role: event.target.value })}
            />

            <InputField
              id="location"
              name="location"
              label="Location"
              placeholder="Manila, Philippines"
              value={personal.location}
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
              onChange={(event) => updateSummary(event.target.value)}
            />
          </EditorPanelFieldset>
        </EditorPanelSection>

        <EditorPanelSection title="Experience">
          {experiences.map((experience) => (
            <ExperienceEntry key={experience.id} experience={experience} />
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
          {projects.map((project) => (
            <ProjectEntry key={project.id} project={project} />
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
          {certifications.map((certification) => (
            <CertificationEntry
              key={certification.id}
              certification={certification}
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
      </div>
    </SidePanel>
  );
}
