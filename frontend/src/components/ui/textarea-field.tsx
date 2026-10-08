import Textarea from "./textarea";
import Label from "./label";

type TextareaFieldProps = {
  label: string;
} & React.ComponentProps<"textarea">;

export default function TextareaField({
  label,
  id,
  required,
  ...props
}: TextareaFieldProps) {
  return (
    <div className="group flex w-full flex-col gap-0.5">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <Textarea required={required} {...props} />
    </div>
  );
}
