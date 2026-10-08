import SidePanel from "./side-panel";
import InputField from "@/components/ui/input-field";
import TextareaField from "@/components/ui/textarea-field";
import EditorPanelSection from "./editor-panel-section";
import EditorPanelFieldset from "./editor-panel-fieldset";
import EditorPanelLegend from "./editor-panel-legend";
import Button from "@/components/ui/button";
import { useOverflowDetect } from "../hooks/use-overflow";

export default function EditorPanel() {
  const { ref: scrollRef, isOverflowing } = useOverflowDetect<HTMLDivElement>();
  return (
    <SidePanel variant="left">
      <header className="px-4 py-9">
        <h1 className="text-h1 font-bold">Optimized Resume Builder (v2)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A local-first resume builder! Need a guide? AI is there to help you!
        </p>
      </header>
      <div
        ref={scrollRef}
        className={[
          "divide-y divide-foreground overflow-auto",
          isOverflowing ? "border-t" : "border-y",
          "border-foreground"
        ].join(" ")}
      >
        <EditorPanelSection title="Personal" defaultOpen={true}>
          <EditorPanelFieldset>
            <EditorPanelLegend>Basic Information</EditorPanelLegend>
            <InputField
              id="full-name"
              name="full-name"
              label="Full name"
              placeholder="John Doe"
              required
            />

            <InputField
              id="role"
              name="role"
              label="Role"
              placeholder="Associate"
            />

            <InputField
              id="location"
              name="location"
              label="Location"
              placeholder="Manila, Philippines"
            />

            <InputField
              id="number"
              name="number"
              label="Number"
              placeholder="123-4567"
              type="tel"
            />

            <InputField
              id="email"
              name="email"
              label="Email"
              placeholder="john@email.com"
              type="email"
            />

            <InputField
              id="linkedin"
              name="linkedin"
              label="LinkedIn"
              placeholder="linkedin.com/in/john-doe"
              type="url"
            />

            <InputField
              id="github"
              name="github"
              label="Github"
              placeholder="github.com/JohnDoe"
              type="url"
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
            />
          </EditorPanelFieldset>
        </EditorPanelSection>
        <EditorPanelSection title="Experience">
          <EditorPanelFieldset>
            <EditorPanelLegend>Experience</EditorPanelLegend>
            <InputField
              id="occupation-1"
              name="occupation-1"
              label="Occupation Role"
              placeholder="Experience Name"
              required
            />
            <InputField
              id="experience-1"
              name="experience-1"
              label="Company Name"
              placeholder="Experience Name"
              required
            />
            <InputField
              id="experience-1"
              name="experience-1"
              label="Company Name"
              placeholder="Experience Name"
              required
            />
            <Button variant="Primary" className="w-full">
              Add Experience
            </Button>
          </EditorPanelFieldset>
        </EditorPanelSection>
        <EditorPanelSection title="Projects">
          <EditorPanelFieldset>
            <EditorPanelLegend>Project 1</EditorPanelLegend>
            <InputField
              id="project-1"
              name="project-1"
              label="Project Name"
              placeholder="Project Name"
              required
            />
            <InputField
              id="project-1"
              name="project-1"
              label="Tech Stack"
              placeholder="Tech Stack"
              required
            />
            <TextareaField
              id="project-bullet"
              name="project-1"
              label="Project Description"
              placeholder="Project Description"
              required
            />

            <Button variant="Primary" className="w-full">
              Add Project
            </Button>
          </EditorPanelFieldset>
        </EditorPanelSection>
        <EditorPanelSection title="Certifications">
          <EditorPanelFieldset>
            <EditorPanelLegend>Project 1</EditorPanelLegend>
            <InputField
              id="cert-provider-1"
              name="certification-1"
              label="Provider"
              placeholder="Provider"
            />
            <InputField
              id="cert-title-1"
              name="cert-title-1"
              label="Certification Title"
              placeholder="Certification Title"
            />
            <InputField
              id="cert-title-1"
              name="cert-title-1"
              label="Date Completed"
              placeholder="Date Completed"
              type="month"
            />

            <Button variant="Primary" className="w-full">
              Add Certification
            </Button>
          </EditorPanelFieldset>
        </EditorPanelSection>
      </div>
    </SidePanel>
  );
}
