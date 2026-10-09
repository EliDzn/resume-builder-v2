import { GripVertical } from "lucide-react";
import InputField from "@/components/ui/input-field";
import Button from "@/components/ui/button";
import EditorPanelFieldset from "./editor-panel-fieldset";
import BulletList from "./bullet-list";
import { useResumeStore } from "../state/resume-store";
import type { Project } from "../model/resume-type";
type ProjectEntryProps = {
  project: Project;
};

export default function ProjectEntry({ project }: ProjectEntryProps) {
  const updateProject = useResumeStore((state) => state.updateProject);
  const removeProject = useResumeStore((state) => state.removeProject);
  const addProjectBullet = useResumeStore((state) => state.addProjectBullet);
  const updateProjectBullet = useResumeStore(
    (state) => state.updateProjectBullet
  );
  const removeProjectBullet = useResumeStore(
    (state) => state.removeProjectBullet
  );

  const clearProject = () => {
    updateProject(project.id, {
      name: "",
      techStack: "",
      bullets: [""]
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLFieldSetElement>) => {
    event.preventDefault();

    const activeId = event.dataTransfer.getData("text/plain");

    if (!activeId || activeId === project.id) {
      return;
    }

    useResumeStore.getState().moveProject(activeId, project.id);
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
          aria-label={`Drag ${project.name || "project"} entry`}
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", project.id);
          }}
        >
          <GripVertical aria-hidden="true" className="h-5 w-5" />
        </button>

        <span className="font-semibold">{project.name || "Project"}</span>

        <span aria-hidden="true" className="flex-1 border-t border-strong" />

        <Button type="button" variant="Secondary" onClick={clearProject}>
          Clear
        </Button>

        <Button
          type="button"
          variant="Secondary"
          onClick={() => removeProject(project.id)}
        >
          Delete
        </Button>
      </legend>

      <InputField
        id={`${project.id}-name`}
        name={`${project.id}-name`}
        label="Project Name"
        placeholder="Project Name"
        value={project.name}
        onChange={(event) =>
          updateProject(project.id, {
            name: event.target.value
          })
        }
      />

      <InputField
        id={`${project.id}-tech-stack`}
        name={`${project.id}-tech-stack`}
        label="Tech Stack"
        placeholder="React, TypeScript, PostgreSQL"
        value={project.techStack}
        onChange={(event) =>
          updateProject(project.id, {
            techStack: event.target.value
          })
        }
      />

      <BulletList
        bullets={project.bullets}
        onAdd={() => addProjectBullet(project.id)}
        onChange={(index, value) =>
          updateProjectBullet(project.id, index, value)
        }
        onRemove={(index) => removeProjectBullet(project.id, index)}
      />
    </EditorPanelFieldset>
  );
}
