import EditorPanelLegend from "./editor-panel-legend";

type EditorPanelFieldsetProps = {
  hasLegend?: boolean;
  legend?: string;
  isDraggable?: boolean;
  children: React.ReactNode;
  onDragOver?: React.DragEventHandler<HTMLFieldSetElement>;
  onDrop?: React.DragEventHandler<HTMLFieldSetElement>;
};

export default function EditorPanelFieldset({
  hasLegend = true,
  legend,
  isDraggable = false,
  children,
  onDragOver,
  onDrop
}: EditorPanelFieldsetProps) {
  return (
    <fieldset
      className="mb-8 flex flex-col gap-3 border-b pb-4"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {hasLegend && (
        <EditorPanelLegend isDraggable={isDraggable}>
          {legend}
        </EditorPanelLegend>
      )}

      {children}
    </fieldset>
  );
}
