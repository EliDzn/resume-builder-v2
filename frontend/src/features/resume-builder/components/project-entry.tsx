import InputField from "@/components/ui/input-field";
import EditorPanelFieldset from "./editor-panel-fieldset";
import EditorPanelLegend from "./editor-panel-legend";
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
  const moveProject = useResumeStore((state) => state.moveProject);

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

    if (activeId && activeId !== project.id) {
      moveProject(activeId, project.id);
    }
  };

  return (
    <EditorPanelFieldset
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <EditorPanelLegend
        variant="draggable"
        onClear={clearProject}
        onDelete={() => removeProject(project.id)}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", project.id);
        }}
      >
        {project.name || "Project"}
      </EditorPanelLegend>

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
