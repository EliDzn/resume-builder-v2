import { GripVertical } from "lucide-react";
import InputField from "@/components/ui/input-field";
import Button from "@/components/ui/button";
import EditorPanelFieldset from "./editor-panel-fieldset";
import BulletList from "./bullet-list";
import { useResumeStore } from "../state/resume-store";
import type { Experience } from "../model/resume-type";

type ExperienceEntryProps = {
  experience: Experience;
};

export default function ExperienceEntry({ experience }: ExperienceEntryProps) {
  const updateExperience = useResumeStore((state) => state.updateExperience);
  const removeExperience = useResumeStore((state) => state.removeExperience);
  const addExperienceBullet = useResumeStore(
    (state) => state.addExperienceBullet
  );
  const updateExperienceBullet = useResumeStore(
    (state) => state.updateExperienceBullet
  );
  const removeExperienceBullet = useResumeStore(
    (state) => state.removeExperienceBullet
  );

  const clearExperience = () => {
    updateExperience(experience.id, {
      role: "",
      company: "",
      startDate: "",
      endDate: "",
      bullets: [""]
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLFieldSetElement>) => {
    event.preventDefault();

    const activeId = event.dataTransfer.getData("text/plain");

    if (!activeId || activeId === experience.id) {
      return;
    }

    useResumeStore.getState().moveExperience(activeId, experience.id);
  };

  return (
    <EditorPanelFieldset
      hasLegend={false}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <legend className="mb-1 flex w-full items-center gap-2 text-strong">
        <button
          type="button"
          draggable
          aria-label={`Drag ${experience.role || "experience"} entry`}
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", experience.id);
          }}
        >
          <GripVertical aria-hidden="true" className="h-5 w-5" />
        </button>

        <span className="font-semibold">{experience.role || "Experience"}</span>

        <span aria-hidden="true" className="flex-1 border-t border-strong" />

        <Button type="button" variant="Secondary" onClick={clearExperience}>
          Clear
        </Button>

        <Button
          type="button"
          variant="Secondary"
          onClick={() => removeExperience(experience.id)}
        >
          Delete
        </Button>
      </legend>

      <InputField
        id={`${experience.id}-role`}
        name={`${experience.id}-role`}
        label="Occupation Role"
        placeholder="Frontend Developer"
        value={experience.role}
        onChange={(event) =>
          updateExperience(experience.id, {
            role: event.target.value
          })
        }
      />

      <InputField
        id={`${experience.id}-company`}
        name={`${experience.id}-company`}
        label="Company Name"
        placeholder="Company Name"
        value={experience.company}
        onChange={(event) =>
          updateExperience(experience.id, {
            company: event.target.value
          })
        }
      />

      <div className="flex w-full gap-2">
        <InputField
          id={`${experience.id}-start-date`}
          name={`${experience.id}-start-date`}
          label="Start Date"
          type="month"
          value={experience.startDate}
          onChange={(event) =>
            updateExperience(experience.id, {
              startDate: event.target.value
            })
          }
        />

        <InputField
          id={`${experience.id}-end-date`}
          name={`${experience.id}-end-date`}
          label="End Date"
          type="month"
          value={experience.endDate}
          onChange={(event) =>
            updateExperience(experience.id, {
              endDate: event.target.value
            })
          }
        />
      </div>

      <BulletList
        bullets={experience.bullets}
        onAdd={() => addExperienceBullet(experience.id)}
        onChange={(index, value) =>
          updateExperienceBullet(experience.id, index, value)
        }
        onRemove={(index) => removeExperienceBullet(experience.id, index)}
      />
    </EditorPanelFieldset>
  );
}
