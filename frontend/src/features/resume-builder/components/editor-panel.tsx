import SidePanel from "./side-panel";
import InputField from "@/components/ui/input-field";

export default function EditorPanel() {
  return (
    <SidePanel>
      <div className="flex h-full flex-col">
        <header className="shrink-0 border-b px-4 py-4">
          <h2 className="text-base font-semibold">Editor</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add and edit your resume information.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Personal Information</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Start with the basics for your resume.
                </p>
              </div>

              <div className="space-y-4">
                <InputField
                  id="full-name"
                  label="Full name"
                  name="fullName"
                  placeholder="John Doe"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
