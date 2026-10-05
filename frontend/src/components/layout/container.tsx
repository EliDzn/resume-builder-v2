import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={[
        "w-full",
        "px-(--spacing-page-mobile)",
        "md:px-(--spacing-page-tablet)",
        "lg:px-(--spacing-page-desktop)",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
