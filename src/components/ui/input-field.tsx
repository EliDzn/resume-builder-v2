import Input from "./input";
import Label from "./label";

type InputFieldProps = {
  label: string;
} & React.ComponentProps<"input">;

export default function InputField({
  label,
  id,
  required,
  ...props
}: InputFieldProps) {
  return (
    <div className="group flex flex-col gap-1 w-full">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <Input id={id} required={required} {...props} />
    </div>
  );
}
