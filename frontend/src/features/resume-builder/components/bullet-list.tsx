import InputField from "@/components/ui/input-field";
import Button from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

type BulletListProps = {
  bullets: string[];
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
};

export default function BulletList({
  bullets,
  onAdd,
  onChange,
  onRemove
}: BulletListProps) {
  return (
    <div className="flex flex-col gap-3">
      {bullets.map((bullet, index) => (
        <div key={index} className="flex items-end gap-2">
          <InputField
            id={`bullet-${index}`}
            name={`bullet-${index}`}
            label={`Bullet ${index + 1}`}
            value={bullet}
            onChange={(event) => onChange(index, event.target.value)}
          />

          <Button
            type="button"
            variant="Secondary"
            disabled={bullets.length === 1}
            className="shrink-0 px-3"
            aria-label={`Remove bullet ${index + 1}`}
            onClick={() => onRemove(index)}
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="Secondary" onClick={onAdd}>
        <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
        Add Bullet
      </Button>
    </div>
  );
}
