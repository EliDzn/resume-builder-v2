import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const insightEntryVariants = cva("flex flex-col p-2 rounded-xs border-2", {
  variants: {
    variant: {
      Success: "border-success text-success bg-success/10",
      Error: "border-error text-error bg-error/10",
      Warning: "border-warning text-warning bg-warning/10"
    }
  }
});

type InsightEntryProps = {
  children: ReactNode;
  title: string;
} & VariantProps<typeof insightEntryVariants>;

export default function InsightEntry({
  children,
  title,
  variant
}: InsightEntryProps) {
  return (
    <div className={insightEntryVariants({ variant })}>
      <p className="font-medium ">{title}</p>
      <p className="text-foreground">{children}</p>
    </div>
  );
}
