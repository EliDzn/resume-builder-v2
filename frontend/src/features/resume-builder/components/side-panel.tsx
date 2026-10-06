import type { ReactNode } from "react";

type SidePanelVariant = "left" | "right";

type SidePanelProps = {
  children: ReactNode;
  className?: string;
  variant: SidePanelVariant;
};

export default function SidePanel({
  children,
  variant,
  className
}: SidePanelProps) {
  return (
    <aside
      className={[
        "bg-background flex h-full w-full flex-col overflow-hidden",
        variant === "left" && "border-r",
        variant === "right" && "border-l",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </aside>
  );
}
