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

          <button
            disabled={bullets.length === 1}
            className="border-2 border-default rounded-xs text-default hover:bg-strong hover:text-background hover:border-strong active:bg-muted active:text-background active:border-muted hover:cursor-pointer py-2.5 px-2.5"
            aria-label={`Remove bullet ${index + 1}`}
            onClick={() => onRemove(index)}
          >
            <Trash2 aria-hidden="true" size={20} />
          </button>
        </div>
      ))}

      <Button type="button" variant="Secondary" onClick={onAdd}>
        <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
        Add Bullet
      </Button>
    </div>
  );
}
