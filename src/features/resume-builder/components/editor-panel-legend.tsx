import type { DragEventHandler, ReactNode } from "react";
import { GripVertical } from "lucide-react";
import Badge from "@/components/ui/badge";

type EditorPanelLegendProps = {
  children: ReactNode;
  variant?: "static" | "draggable";
  onClear?: () => void;
  onDelete?: () => void;
  onDragStart?: DragEventHandler<HTMLButtonElement>;
};

export default function EditorPanelLegend({
  children,
  variant = "static",
  onClear,
  onDelete,
  onDragStart
}: EditorPanelLegendProps) {
  return (
    <legend className="mb-2 w-full">
      <div className="flex w-full min-w-0 items-center gap-2 text-strong">
        {variant === "draggable" && (
          <button
            type="button"
            draggable
            aria-label={`Drag ${children}`}
            className="shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
            onDragStart={onDragStart}
          >
            <GripVertical aria-hidden="true" className="h-5 w-5" />
          </button>
        )}

        <span className="min-w-0 truncate font-semibold">{children}</span>

        <span aria-hidden="true" className="flex-1 border-t border-strong" />

        <div className="flex shrink-0 gap-1">
          {onClear && (
            <Badge variant="Secondary" onClick={onClear}>
              Clear
            </Badge>
          )}

          {onDelete && (
            <Badge variant="Secondary" onClick={onDelete}>
              Delete
            </Badge>
          )}
        </div>
      </div>
    </legend>
  );
}
