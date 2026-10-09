import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "text-fine-print inline-flex items-center justify-center py-0.5 px-2 font-semibold transition-colors duration-200 ease-out",
  {
    variants: {
      variant: {
        Primary:
          "rounded-full border border-foreground text-foreground hover:border-strong hover:bg-strong hover:text-background active:border-muted active:bg-foreground active:text-background",
        Secondary:
          "rounded-xs border border-foreground text-foreground hover:border-strong hover:bg-strong hover:text-background active:border-foreground active:bg-foreground active:text-background"
      }
    },
    defaultVariants: {
      variant: "Primary"
    }
  }
);

type BadgeProps = {
  children: React.ReactNode;
} & VariantProps<typeof badgeVariants> &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Badge({
  children,
  variant,
  className,
  type = "button",
  ...props
}: BadgeProps) {
  return (
    <button
      type={type}
      className={`${badgeVariants({ variant })}
       ${className ?? ""}
       `}
      {...props}
    >
      {children}
    </button>
  );
}
