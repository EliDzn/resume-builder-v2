import { useState, type ComponentProps } from "react";
import Badge from "./badge";

type CheckboxProps = Omit<
  ComponentProps<typeof Badge>,
  "variant" | "onClick" | "role" | "aria-checked"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export default function Checkbox({
  children,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  className,
  ...props
}: CheckboxProps) {
  const [uncontrolledChecked, setUncontrolledChecked] =
    useState(defaultChecked);
  const isChecked = checked ?? uncontrolledChecked;

  function toggle() {
    const nextChecked = !isChecked;

    if (checked === undefined) {
      setUncontrolledChecked(nextChecked);
    }

    onCheckedChange?.(nextChecked);
  }

  return (
    <Badge
      {...props}
      type="button"
      variant="Primary"
      role="checkbox"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={toggle}
      className={[
        "aria-checked:border-strong aria-checked:bg-strong aria-checked:text-background hover:cursor-pointer",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Badge>
  );
}
