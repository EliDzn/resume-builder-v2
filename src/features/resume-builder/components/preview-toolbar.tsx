import type { ReactNode } from "react";
import { useResumeStore } from "../state/resume-store";
import type { ResumeFont } from "../model/resume-type";

type PreviewToolbarButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
};

function PreviewToolbarButton({
  children,
  disabled = false,
  onClick,
  type = "button",
  ariaLabel
}: PreviewToolbarButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className="p-4 font-semibold transition-colors duration-150 hover:cursor-pointer hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className={`flex flex-row divide-x divide-x-foreground ${className}`}>
      {children}
    </div>
  );
}

function PreviewToolbarSelect() {
  const fontFamily = useResumeStore((state) => state.fontFamily);
  const updateFontFamily = useResumeStore((state) => state.updateFontFamily);

  return (
    <label className="flex h-full items-center border-foreground px-3">
      <span className="sr-only">Resume font</span>

      <select
        value={fontFamily}
        aria-label="Resume font"
        className="text-strong outline-none font-semibold"
        onChange={(event) => updateFontFamily(event.target.value as ResumeFont)}
      >
        <option value="inter">Inter</option>
        <option value="times">Times New Roman</option>
      </select>
    </label>
  );
}

export default function PreviewToolbar() {
  const clearResume = useResumeStore((state) => state.clearResume);
  const hasHydrated = useResumeStore((state) => state.hasHydrated);
  const undo = useResumeStore((state) => state.undo);
  const redo = useResumeStore((state) => state.redo);
  const canUndo = useResumeStore((state) => state.past.length > 0);
  const canRedo = useResumeStore((state) => state.future.length > 0);

  return (
    <div
      role="toolbar"
      className="flex w-full flex-row justify-between border-b border-foreground bg-background"
    >
      <PreviewToolbarButtonGroup className="border-r">
        <PreviewToolbarButton
          onClick={undo}
          disabled={!canUndo}
          ariaLabel="Undo"
        >
          undo
        </PreviewToolbarButton>
        <PreviewToolbarButton
          onClick={redo}
          disabled={!canRedo}
          ariaLabel="Redo"
        >
          redo
        </PreviewToolbarButton>
        <PreviewToolbarButton
          onClick={clearResume}
          disabled={!hasHydrated}
          ariaLabel="Clear resume"
        >
          clear
        </PreviewToolbarButton>
      </PreviewToolbarButtonGroup>

      <PreviewToolbarButtonGroup className="border-l">
        <PreviewToolbarSelect />
        <PreviewToolbarButton disabled>zoom out</PreviewToolbarButton>
        <PreviewToolbarButton disabled>zoom in</PreviewToolbarButton>
      </PreviewToolbarButtonGroup>
    </div>
  );
}
