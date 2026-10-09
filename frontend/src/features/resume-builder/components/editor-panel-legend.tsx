import Badge from "@/components/ui/badge";
import { GripVertical } from "lucide-react";

type EditorPanelLegendProps = {
  children: React.ReactNode;
  isDraggable?: boolean;
};

export default function EditorPanelLegend({
  isDraggable,
  children
}: EditorPanelLegendProps) {
  return (
    <legend className="w-full mb-1 ">
      <div className="flex flex-row items-center text-strong font-semibold gap-2 w-full">
        <div className="flex flex-row items-center gap-0.5">
          {isDraggable && <GripVertical size={20} />}
          <span>{children}</span>
        </div>
        <span aria-hidden="true" className="flex-1 border-t border-strong" />
        <div className="flex flex-row gap-1">
          <Badge variant="Secondary">Clear</Badge>
          <Badge variant="Secondary">Delete</Badge>
        </div>
      </div>
    </legend>
  );
}
