import InputField from "@/components/ui/input-field";
import EditorPanelFieldset from "./editor-panel-fieldset";
import EditorPanelLegend from "./editor-panel-legend";
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
  const moveExperience = useResumeStore((state) => state.moveExperience);

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

    if (activeId && activeId !== experience.id) {
      moveExperience(activeId, experience.id);
    }
  };

  return (
    <EditorPanelFieldset
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <EditorPanelLegend
        variant="draggable"
        onClear={clearExperience}
        onDelete={() => removeExperience(experience.id)}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", experience.id);
        }}
      >
        {experience.role || "Experience"}
      </EditorPanelLegend>

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
