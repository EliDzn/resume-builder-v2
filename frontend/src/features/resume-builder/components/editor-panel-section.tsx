type EditorPanelSectionProps = { children: React.ReactNode };

export default function EditorPanelSection({
  children
}: EditorPanelSectionProps) {
  return (
    <section className="w-full flex flex-col p-4 border-y border-y-foreground">
      {children}
    </section>
  );
}
