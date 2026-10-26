import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ type, className, ...props }: InputProps) {
  return (
    <input
      type={type}
      {...props}
      className={cn(
        "rounded-xs border-2 border-default p-2 placeholder:text-muted focus-visible:border-foreground aria-invalid:border-error aria-invalid:focus-visible:border-error focus-within:border-foreground focus-visible:outline-none",
        className
      )}
    />
  );
}
