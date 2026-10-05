import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      {...props}
      className="p-2 border-2 border-gray-500 rounded-xs"
    />
  );
}
