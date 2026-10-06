import PreviewToolbar from "./preview-toolbar";

export default function PreviewPanel() {
  return (
    <section className="w-full h-full flex flex-col items-center justify-center text-center">
      <PreviewToolbar />
      <div className="h-full w-full flex items-center justify-center">
        Already have a resume? Upload it here
      </div>
    </section>
  );
}
