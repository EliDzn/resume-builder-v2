import type { ReactNode } from "react";

type PageGridProps = {
  children: ReactNode;
  className?: string;
};

export default function PageGrid({ children, className }: PageGridProps) {
  return (
    <div
      className={[
        "grid",
        "w-full",
        "grid-cols-4",
        "gap-(--spacing-grid-mobile)",
        "md:grid-cols-8",
        "md:gap-(--spacing-grid-tablet)",
        "lg:grid-cols-12",
        "lg:gap-(--spacing-grid-desktop)",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
