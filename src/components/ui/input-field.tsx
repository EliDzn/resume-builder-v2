import Input from "./input";
import Label from "./label";

type InputFieldProps = {
  label: string;
  error: string;
} & React.ComponentProps<"input">;

export default function InputField({
  label,
  id,
  error,
  required,
  ...props
}: InputFieldProps) {
  const hasError = Boolean(error);

  return (
    <div className="group flex flex-col gap-1 w-full group">
      <Label htmlFor={id} required={required} error={hasError}>
        {label}
      </Label>
      <Input
        {...props}
        id={id}
        required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />
      {hasError && (
        <p
          id={`${id}-error`}
          className="text-error text-caption font-medium"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
