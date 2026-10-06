import SidePanel from "./side-panel";
import InputField from "@/components/ui/input-field";
import EditorPanelSection from "./editor-panel-section";

export default function EditorPanel() {
  return (
    <SidePanel variant="left">
      <div className="flex h-full flex-col">
        <header className="shrink-0 border-b px-4 py-9">
          <h2 className="text-2xl font-bold">Optimized Resume Builder (v2)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A local-first resume builder! Need a guide? AI is there to help you!
          </p>
        </header>

        <EditorPanelSection>
          <h3>Personal</h3>
          <fieldset className="space-y-3">
            <legend>Basic Information</legend>
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
              name="role"
              label="Location"
              placeholder="Manila,Philippines"
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
              name="role"
              label="Email"
              placeholder="john@email.com"
              type="email"
            />
            <InputField
              id="linkedin"
              label="LinkedIn"
              name="linkedin"
              placeholder="linkedin.com/in/john-doe"
              type="url"
            />
            <InputField
              id="github"
              label="Github"
              name="github"
              placeholder="github.com/JohnDoe"
              type="url"
            />
          </fieldset>
        </EditorPanelSection>
      </div>
    </SidePanel>
  );
}
