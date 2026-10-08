import EditorPanelLegend from "./editor-panel-legend";

type EditorPanelFieldsetProps = {
  hasLegend?: boolean;
  legend?: string;
  children: React.ReactNode;
};

export default function EditorPanelFieldset({
  hasLegend,
  legend,
  children
}: EditorPanelFieldsetProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      {hasLegend && <EditorPanelLegend>{legend}</EditorPanelLegend>}
      {children}
    </fieldset>
  );
}
