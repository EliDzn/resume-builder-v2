import PreviewToolbar from "./preview-toolbar";

export default function PreviewPanel() {
  return (
    <section className="flex h-full min-h-0 w-full flex-col items-center text-center">
      <PreviewToolbar />

      <div className="flex flex-col min-h-0 flex-1 items-center justify-center overflow-auto p-2 border-dotted border-foreground">
        <p> Already have a resume? </p>
        <p>Upload it here</p>
      </div>
    </section>
  );
}
