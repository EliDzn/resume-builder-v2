import Textarea from "./textarea";
import Label from "./label";

type TextareaFieldProps = {
  label: string;
  error: string;
} & React.ComponentProps<"textarea">;

export default function TextareaField({
  label,
  id,
  error,
  required,
  ...props
}: TextareaFieldProps) {
  const hasError = Boolean(error);

  return (
    <div className="group flex w-full flex-col  gap-1">
      <Label htmlFor={id} required={required} error={hasError}>
        {label}
      </Label>
      <Textarea
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
