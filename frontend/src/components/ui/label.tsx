import type { LabelHTMLAttributes } from "react";

type LabelProps = {
  required?: boolean;
} & LabelHTMLAttributes<HTMLLabelElement>;

export default function Label({ children, required, ...props }: LabelProps) {
  return (
    <label
      {...props}
      className="font-semibold text-default group-focus-within:text-foreground"
    >
      {children}
      {required && <span className="text-error"> *</span>}
    </label>
  );
}
