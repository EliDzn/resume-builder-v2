import type { LabelHTMLAttributes } from "react";

type LabelProps = {
  required?: boolean;
  error: boolean;
} & LabelHTMLAttributes<HTMLLabelElement>;

export default function Label({
  children,
  required,
  error,
  ...props
}: LabelProps) {
  return (
    <label
      {...props}
      className={`font-semibold text-caption ${
        error ? "text-error" : "text-default group-focus-within:text-foreground"
      }`}
    >
      {children}
      {required && <span className="text-error"> *</span>}
    </label>
  );
}
