import React, { type ReactElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  asChild?: boolean;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xs hover:cursor-pointer transform-color duration-200 ease-out h-10 py-2 px-4",
  {
    variants: {
      variant: {
        Primary:
          "bg-foreground text-background hover:bg-subtle hover:text-strong active:bg-strong active:text-background font-medium",
        Secondary:
          "border border-foreground text-foreground hover:bg-strong hover:text-background hover:border-strong active:bg-muted active:text-background active:border-muted font-medium",
        Disabled: "cursor-not-allowed bg-default text-background"
      }
    },
    defaultVariants: {
      variant: "Primary"
    }
  }
);

export default function Button({
  variant,
  children,
  className,
  disabled,
  asChild = false,
  ...props
}: ButtonProps) {
  const combinedClassName = twMerge(buttonVariants({ variant }), className);
  const isDisabled = disabled || variant === "Disabled";

  if (asChild && React.isValidElement(children)) {
    const child = React.Children.only(children) as ReactElement<{
      className?: string;
    }>;

    return React.cloneElement(child, {
      ...props,
      className: twMerge(combinedClassName, child.props.className)
    });
  }

  return (
    <button disabled={isDisabled} className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
