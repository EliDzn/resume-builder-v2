import { cn } from "@/lib/utils";

type TextareaProps = {
  required?: boolean;
  className?: string;
} & React.ComponentProps<"textarea">;

export default function Textarea({
  className,
  required,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        "rounded-xs border-2 border-default p-2 placeholder:text-muted focus-visible:border-foreground min-h-8",
        className
      )}
      required={required}
      rows={4}
      {...props}
    />
  );
}
