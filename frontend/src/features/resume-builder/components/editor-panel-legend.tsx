type EditorPanelLegendProps = {
  children: React.ReactNode;
};

export default function EditorPanelLegend({
  children
}: EditorPanelLegendProps) {
  return (
    <legend className="w-full mb-1">
      <div className="flex flex-row items-center text-strong font-semibold gap-2 w-full">
        <span>{children}</span>
        <span aria-hidden="true" className="flex-1 border-t border-strong" />
      </div>
    </legend>
  );
}
