import type { ReactNode } from "react";
import { useResumeStore } from "../state/resume-store";
import type { ResumeFont } from "../model/resume-type";
import { Undo2, Redo2, Eraser, Plus, Minus } from "lucide-react";

type PreviewToolbarProps = {
  onZoomOut: () => void;
  onZoomIn: () => void;
  canZoomOut: boolean;
  canZoomIn: boolean;
};

type PreviewToolbarButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel: string;
};

function PreviewToolbarButton({
  children,
  disabled = false,
  onClick,
  ariaLabel
}: PreviewToolbarButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex shrink-0 flex-row items-center gap-2 p-4 font-semibold transition-colors duration-150 hover:cursor-pointer hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50 "
    >
      {children}
    </button>
  );
}

type PreviewToolbarButtonGroupProps = {
  children: ReactNode;
  className?: string;
};

function PreviewToolbarButtonGroup({
  children,
  className
}: PreviewToolbarButtonGroupProps) {
  return (
    <div
      className={`flex min-w-0 flex-row divide-x divide-x-foreground ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function ToolbarLabel({ children }: { children: string }) {
  return <span className="hidden lg:inline">{children}</span>;
}

function ToolbarIcon({ children }: { children: ReactNode }) {
  return <span>{children}</span>;
}

function PreviewToolbarSelect() {
  const fontFamily = useResumeStore((state) => state.fontFamily);
  const updateFontFamily = useResumeStore((state) => state.updateFontFamily);

  return (
    <label className="flex h-full items-center px-2 sm:px-3">
      <span className="sr-only">Resume font</span>
      <select
        value={fontFamily}
        aria-label="Resume font"
        className="font-semibold text-strong outline-none sm:w-auto"
        onChange={(event) => updateFontFamily(event.target.value as ResumeFont)}
      >
        <option value="inter">Inter</option>
        <option value="times">Times</option>
      </select>
    </label>
  );
}

export default function PreviewToolbar({
  onZoomOut,
  onZoomIn,
  canZoomOut,
  canZoomIn
}: PreviewToolbarProps) {
  const clearResume = useResumeStore((state) => state.clearResume);
  const hasHydrated = useResumeStore((state) => state.hasHydrated);
  const undo = useResumeStore((state) => state.undo);
  const redo = useResumeStore((state) => state.redo);
  const canUndo = useResumeStore((state) => state.past.length > 0);
  const canRedo = useResumeStore((state) => state.future.length > 0);

  return (
    <div
      role="toolbar"
      aria-label="Resume preview controls"
      className="flex w-full min-w-0 flex-row items-center justify-between overflow-x-auto border-t lg:border-t-0 border-b border-foreground bg-background "
    >
      <PreviewToolbarButtonGroup className="border-r">
        <PreviewToolbarButton
          onClick={undo}
          disabled={!canUndo}
          ariaLabel="Undo"
        >
          <ToolbarLabel>Undo</ToolbarLabel>
          <ToolbarIcon>
            <Undo2 aria-hidden="true" />
          </ToolbarIcon>
        </PreviewToolbarButton>

        <PreviewToolbarButton
          onClick={redo}
          disabled={!canRedo}
          ariaLabel="Redo"
        >
          <ToolbarLabel>Redo</ToolbarLabel>
          <ToolbarIcon>
            <Redo2 aria-hidden="true" />
          </ToolbarIcon>
        </PreviewToolbarButton>

        <PreviewToolbarButton
          onClick={clearResume}
          disabled={!hasHydrated}
          ariaLabel="Clear resume"
        >
          <ToolbarLabel>Clear</ToolbarLabel>
          <ToolbarIcon>
            <Eraser aria-hidden="true" />
          </ToolbarIcon>
        </PreviewToolbarButton>
      </PreviewToolbarButtonGroup>

      <PreviewToolbarButtonGroup className="border-l h-full">
        <PreviewToolbarSelect />

        <PreviewToolbarButton
          onClick={onZoomOut}
          disabled={!canZoomOut}
          ariaLabel="Zoom out"
        >
          <ToolbarLabel>Zoom out</ToolbarLabel>
          <ToolbarIcon>
            <Minus aria-hidden="true" />
          </ToolbarIcon>
        </PreviewToolbarButton>

        <PreviewToolbarButton
          onClick={onZoomIn}
          disabled={!canZoomIn}
          ariaLabel="Zoom in"
        >
          <ToolbarLabel>Zoom in</ToolbarLabel>
          <ToolbarIcon>
            <Plus aria-hidden="true" />
          </ToolbarIcon>
        </PreviewToolbarButton>
      </PreviewToolbarButtonGroup>
    </div>
  );
}
