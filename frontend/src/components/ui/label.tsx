import type { LabelHTMLAttributes } from "react";

type LabelProps = { required?: string } & LabelHTMLAttributes<HTMLLabelElement>;

export default function Label({ children, required, ...props }: LabelProps) {
  return (
    <label {...props} className="font-semibold">
      {children}
      {required && <span className="text-error"> *</span>}
    </label>
  );
}
