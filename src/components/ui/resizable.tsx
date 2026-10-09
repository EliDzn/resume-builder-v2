import { GripVertical } from "lucide-react";
import { cn } from "cn";
import * as ResizablePrimitive from "react-resizable-panels";

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full min-w-0 max-w-full overflow-hidden aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle = true,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      aria-label="Resize panels"
      className={cn(
        "relative flex shrink-0 grow-0 basis-px cursor-col-resize items-center justify-center transition-colors hover:bg-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:cursor-row-resize",
        className
      )}
      {...props}
    >
      {withHandle && (
        <span className="absolute z-10 flex h-8 w-4 items-center justify-center rounded-sm bg-strong text-background shadow-md transition-colors">
          <GripVertical
            aria-hidden="true"
            className="h-4 w-4 aria-[orientation=horizontal]:rotate-90"
          />
        </span>
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
