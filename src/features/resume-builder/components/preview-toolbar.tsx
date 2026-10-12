import type { ReactNode } from "react";
import { useResumeStore } from "../state/resume-store";
import type { ResumeFont } from "../model/resume-type";

type PreviewToolbarButtonProps = {
  children: ReactNode;
};

function PreviewToolbarButton({ children }: PreviewToolbarButtonProps) {
  return (
    <button className="p-4 hover:cursor-pointer hover:text-background hover:bg-foreground font-semibold duration-150 transform-color ease-out">
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
    <label className="flex items-center border-foreground px-3 h-full">
      <span className="sr-only">Resume font</span>

      <select
        value={fontFamily}
        aria-label="Resume font"
        className="bg-transparent text-sm text-strong outline-none"
        onChange={(event) => updateFontFamily(event.target.value as ResumeFont)}
      >
        <option value="inter">Inter</option>
        <option value="times">Times New Roman</option>
      </select>
    </label>
  );
}

export default function PreviewToolbar() {
  return (
    <div
      role="toolbar"
      className="w-full bg-background flex flex-row justify-between border-b border-foreground"
    >
      <PreviewToolbarButtonGroup className="border-r">
        <PreviewToolbarButton>undo</PreviewToolbarButton>
        <PreviewToolbarButton>redo</PreviewToolbarButton>
      </PreviewToolbarButtonGroup>
      <PreviewToolbarButtonGroup className="border-l">
        <PreviewToolbarSelect />{" "}
        <PreviewToolbarButton>zoom out</PreviewToolbarButton>
        <PreviewToolbarButton>zoom in</PreviewToolbarButton>
      </PreviewToolbarButtonGroup>
    </div>
  );
}
