import Input from "./input";
import Label from "./label";

type InputFieldProps = {
  label: string;
} & React.ComponentProps<"input">;

export default function InputField({ label, id, ...props }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}
