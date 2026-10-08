import React from "react";

import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "text-fine-print inline-flex items-center justify-center hover:cursor-pointer transform-color duration-200 ease-out py-0.5 px-2 font-semibold",
  {
    variants: {
      variant: {
        Primary:
          "border border-foreground text-foreground hover:bg-strong hover:text-background hover:border-strong active:bg-foreground active:text-background active:border-muted rounded-full ",
        Secondary:
          "text-foreground border border-foreground hover:bg-strong hover:text-background hover:border-strong hover:cursor-pointer active:bg-foreground active:text-background active:border-foreground rounded-xs"
      }
    },
    defaultVariants: {
      variant: "Primary"
    }
  }
);

type BadgeProps = {
  children: React.ReactNode;
} & VariantProps<typeof badgeVariants>;

export default function Badge({ children, variant }: BadgeProps) {
  return <span className={badgeVariants({ variant })}>{children}</span>;
}
