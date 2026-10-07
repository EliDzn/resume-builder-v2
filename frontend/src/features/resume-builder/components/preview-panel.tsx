import PreviewToolbar from "./preview-toolbar";

export default function PreviewPanel() {
  return (
    <section className="flex h-full min-h-0 w-full flex-col items-center text-center">
      <PreviewToolbar />

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
        Already have a resume? Upload it here
      </div>
    </section>
  );
}
