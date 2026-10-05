import type { ReactNode } from "react";

type SidePanelProps = {
  children: ReactNode;
  className?: string;
};

export default function SidePanel({ children, className }: SidePanelProps) {
  return (
    <aside
      className={[
        "flex h-full w-full flex-col overflow-hidden",
        "border-r bg-background",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </aside>
  );
}
