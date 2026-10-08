import type { ReactNode } from "react";

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
        <PreviewToolbarButton>font</PreviewToolbarButton>
        <PreviewToolbarButton>zoom in</PreviewToolbarButton>
        <PreviewToolbarButton>zoom out</PreviewToolbarButton>
      </PreviewToolbarButtonGroup>
    </div>
  );
}
