import type { ReactNode } from "react";

type PreviewToolbarButtonProps = {
  children: ReactNode;
  // icon: string;
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
};

function PreviewToolbarButtonGroup({
  children
}: PreviewToolbarButtonGroupProps) {
  return (
    <div className="flex flex-row divide-x border-x divide-x-foreground">
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
      <PreviewToolbarButtonGroup>
        <PreviewToolbarButton>undo</PreviewToolbarButton>
        <PreviewToolbarButton>redo</PreviewToolbarButton>
      </PreviewToolbarButtonGroup>
      <PreviewToolbarButtonGroup>
        <PreviewToolbarButton>font</PreviewToolbarButton>
        <PreviewToolbarButton>zoom in</PreviewToolbarButton>
        <PreviewToolbarButton>zoom out</PreviewToolbarButton>
      </PreviewToolbarButtonGroup>
    </div>
  );
}
