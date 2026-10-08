import SidePanel from "./side-panel";
import InputField from "@/components/ui/input-field";
import TextareaField from "@/components/ui/textarea-field";
import EditorPanelSection from "./editor-panel-section";
import EditorPanelFieldset from "./editor-panel-fieldset";
import EditorPanelLegend from "./editor-panel-legend";
import Button from "@/components/ui/button";

export default function EditorPanel() {
  return (
    <SidePanel variant="left">
      <header className="px-4 py-9">
        <h1 className="text-h1 font-bold">Optimized Resume Builder (v2)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A local-first resume builder! Need a guide? AI is there to help you!
        </p>
      </header>
      <div className="border-y border-foreground divide-y divide-foreground overflow-auto">
        <EditorPanelSection title="Personal">
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
              id="experience-1"
              name="experience-1"
              label="Experience Role"
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
      </div>
    </SidePanel>
  );
}
