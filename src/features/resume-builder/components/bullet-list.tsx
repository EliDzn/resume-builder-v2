import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

type BulletListProps = {
  bullets: string[];
  errors?: string[];
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
};

export default function BulletList({
  bullets,
  errors,
  onAdd,
  onChange,
  onRemove
}: BulletListProps) {
  return (
    <div className="flex flex-col gap-3">
      {bullets.map((bullet, index) => {
        const id = `bullet-${index}`;
        const error = errors?.[index] ?? "";

        return (
          <div
            key={index}
            className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-2"
          >
            <Label htmlFor={id} error={Boolean(error)}>
              Bullet {index + 1}
            </Label>
            <span aria-hidden="true" />

            <Input
              id={id}
              name={id}
              value={bullet}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) => onChange(index, event.target.value)}
            />

            <button
              type="button"
              disabled={bullets.length === 1}
              className="rounded-xs border-2 border-default px-2.5 py-2.5 text-default hover:cursor-pointer hover:border-strong hover:bg-strong hover:text-background active:border-muted active:bg-muted active:text-background disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Remove bullet ${index + 1}`}
              onClick={() => onRemove(index)}
            >
              <Trash2 aria-hidden="true" size={20} />
            </button>

            {error && (
              <p
                id={`${id}-error`}
                className="col-span-2 text-error text-caption font-medium"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
        );
      })}

      <Button type="button" variant="Secondary" onClick={onAdd}>
        <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
        Add Bullet
      </Button>
    </div>
  );
}
