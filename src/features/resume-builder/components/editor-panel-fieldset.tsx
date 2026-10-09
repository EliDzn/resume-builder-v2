import type { ReactNode } from "react";

type EditorPanelFieldsetProps = {
  children: ReactNode;
  onDragOver?: React.DragEventHandler<HTMLFieldSetElement>;
  onDrop?: React.DragEventHandler<HTMLFieldSetElement>;
};

export default function EditorPanelFieldset({
  children,
  onDragOver,
  onDrop
}: EditorPanelFieldsetProps) {
  return (
    <fieldset
      className="mb-4 flex min-w-0 flex-col gap-6"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
    </fieldset>
  );
}
