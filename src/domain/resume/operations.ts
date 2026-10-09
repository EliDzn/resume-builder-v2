import type {
  Bullet,
  Certification,
  Education,
  Experience,
  Project,
  Resume,
  ResumeSection,
  SkillCategory
} from "./types";

export type OperationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export type ResumeOperation =
  | {
      type: "ADD_EXPERIENCE";
      experience: Experience;
    }
  | {
      type: "UPDATE_EXPERIENCE";
      id: string;
      changes: Partial<Experience>;
    }
  | {
      type: "REMOVE_EXPERIENCE";
      id: string;
    }
  | {
      type: "REORDER_EXPERIENCE";
      fromIndex: number;
      toIndex: number;
    }
  | {
      type: "ADD_PROJECT";
      project: Project;
    }
  | {
      type: "UPDATE_PROJECT";
      id: string;
      changes: Partial<Project>;
    }
  | {
      type: "REMOVE_PROJECT";
      id: string;
    }
  | {
      type: "REORDER_PROJECT";
      fromIndex: number;
      toIndex: number;
    }
  | {
      type: "ADD_EDUCATION";
      education: Education;
    }
  | {
      type: "UPDATE_EDUCATION";
      id: string;
      changes: Partial<Education>;
    }
  | {
      type: "REMOVE_EDUCATION";
      id: string;
    }
  | {
      type: "ADD_SKILL_CATEGORY";
      skillCategory: SkillCategory;
    }
  | {
      type: "UPDATE_SKILL_CATEGORY";
      id: string;
      changes: Partial<SkillCategory>;
    }
  | {
      type: "REMOVE_SKILL_CATEGORY";
      id: string;
    }
  | {
      type: "ADD_CERTIFICATION";
      certification: Certification;
    }
  | {
      type: "UPDATE_CERTIFICATION";
      id: string;
      changes: Partial<Certification>;
    }
  | {
      type: "REMOVE_CERTIFICATION";
      id: string;
    }
  | {
      type: "ADD_BULLET";
      section: "experience" | "project";
      parentId: string;
      bullet: Bullet;
    }
  | {
      type: "UPDATE_BULLET";
      section: "experience" | "project";
      parentId: string;
      bulletId: string;
      changes: Partial<Bullet>;
    }
  | {
      type: "REMOVE_BULLET";
      section: "experience" | "project";
      parentId: string;
      bulletId: string;
    }
  | {
      type: "REORDER_BULLET";
      section: "experience" | "project";
      parentId: string;
      fromIndex: number;
      toIndex: number;
    }
  | {
      type: "REORDER_SECTION";
      fromIndex: number;
      toIndex: number;
    };

function moveItem<T>(
  items: T[],
  fromIndex: number,
  toIndex: number
): OperationResult<T[]> {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length
  ) {
    return {
      success: false,
      error: "Invalid reorder index."
    };
  }

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);

  if (item === undefined) {
    return {
      success: false,
      error: "Item not found."
    };
  }

  next.splice(toIndex, 0, item);

  return {
    success: true,
    data: next
  };
}

function updateById<T extends { id: string }>(
  items: T[],
  id: string,
  changes: Partial<T>
): OperationResult<T[]> {
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return {
      success: false,
      error: `Item with id "${id}" not found.`
    };
  }

  return {
    success: true,
    data: items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...changes, id: item.id } : item
    )
  };
}

function removeById<T extends { id: string }>(
  items: T[],
  id: string
): OperationResult<T[]> {
  if (!items.some((item) => item.id === id)) {
    return {
      success: false,
      error: `Item with id "${id}" not found.`
    };
  }

  return {
    success: true,
    data: items.filter((item) => item.id !== id)
  };
}

function addBullet(
  resume: Resume,
  section: "experience" | "project",
  parentId: string,
  bullet: Bullet
): OperationResult<Resume> {
  if (section === "experience") {
    const index = resume.experience.findIndex(
      (experience) => experience.id === parentId
    );

    if (index === -1) {
      return {
        success: false,
        error: `Experience with id "${parentId}" not found.`
      };
    }

    const experience = resume.experience[index];

    if (!experience) {
      return {
        success: false,
        error: "Experience not found."
      };
    }

    const nextExperience: Experience = {
      ...experience,
      bullets: [...experience.bullets, bullet]
    };

    return {
      success: true,
      data: {
        ...resume,
        experience: resume.experience.map((item, itemIndex) =>
          itemIndex === index ? nextExperience : item
        )
      }
    };
  }

  const index = resume.projects.findIndex((project) => project.id === parentId);

  if (index === -1) {
    return {
      success: false,
      error: `Project with id "${parentId}" not found.`
    };
  }

  const project = resume.projects[index];

  if (!project) {
    return {
      success: false,
      error: "Project not found."
    };
  }

  const nextProject: Project = {
    ...project,
    bullets: [...project.bullets, bullet]
  };

  return {
    success: true,
    data: {
      ...resume,
      projects: resume.projects.map((item, itemIndex) =>
        itemIndex === index ? nextProject : item
      )
    }
  };
}

function updateBullet(
  resume: Resume,
  section: "experience" | "project",
  parentId: string,
  bulletId: string,
  changes: Partial<Bullet>
): OperationResult<Resume> {
  if (section === "experience") {
    const experienceIndex = resume.experience.findIndex(
      (experience) => experience.id === parentId
    );

    if (experienceIndex === -1) {
      return {
        success: false,
        error: `Experience with id "${parentId}" not found.`
      };
    }

    const experience = resume.experience[experienceIndex];

    if (!experience) {
      return {
        success: false,
        error: "Experience not found."
      };
    }

    const result = updateById(experience.bullets, bulletId, changes);

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: {
        ...resume,
        experience: resume.experience.map((item, index) =>
          index === experienceIndex ? { ...item, bullets: result.data } : item
        )
      }
    };
  }

  const projectIndex = resume.projects.findIndex(
    (project) => project.id === parentId
  );

  if (projectIndex === -1) {
    return {
      success: false,
      error: `Project with id "${parentId}" not found.`
    };
  }

  const project = resume.projects[projectIndex];

  if (!project) {
    return {
      success: false,
      error: "Project not found."
    };
  }

  const result = updateById(project.bullets, bulletId, changes);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: {
      ...resume,
      projects: resume.projects.map((item, index) =>
        index === projectIndex ? { ...item, bullets: result.data } : item
      )
    }
  };
}

function removeBullet(
  resume: Resume,
  section: "experience" | "project",
  parentId: string,
  bulletId: string
): OperationResult<Resume> {
  if (section === "experience") {
    const experienceIndex = resume.experience.findIndex(
      (experience) => experience.id === parentId
    );

    if (experienceIndex === -1) {
      return {
        success: false,
        error: `Experience with id "${parentId}" not found.`
      };
    }

    const experience = resume.experience[experienceIndex];

    if (!experience) {
      return {
        success: false,
        error: "Experience not found."
      };
    }

    const result = removeById(experience.bullets, bulletId);

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: {
        ...resume,
        experience: resume.experience.map((item, index) =>
          index === experienceIndex ? { ...item, bullets: result.data } : item
        )
      }
    };
  }

  const projectIndex = resume.projects.findIndex(
    (project) => project.id === parentId
  );

  if (projectIndex === -1) {
    return {
      success: false,
      error: `Project with id "${parentId}" not found.`
    };
  }

  const project = resume.projects[projectIndex];

  if (!project) {
    return {
      success: false,
      error: "Project not found."
    };
  }

  const result = removeById(project.bullets, bulletId);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: {
      ...resume,
      projects: resume.projects.map((item, index) =>
        index === projectIndex ? { ...item, bullets: result.data } : item
      )
    }
  };
}

function reorderBullet(
  resume: Resume,
  section: "experience" | "project",
  parentId: string,
  fromIndex: number,
  toIndex: number
): OperationResult<Resume> {
  if (section === "experience") {
    const experienceIndex = resume.experience.findIndex(
      (experience) => experience.id === parentId
    );

    if (experienceIndex === -1) {
      return {
        success: false,
        error: `Experience with id "${parentId}" not found.`
      };
    }

    const experience = resume.experience[experienceIndex];

    if (!experience) {
      return {
        success: false,
        error: "Experience not found."
      };
    }

    const result = moveItem(experience.bullets, fromIndex, toIndex);

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: {
        ...resume,
        experience: resume.experience.map((item, index) =>
          index === experienceIndex ? { ...item, bullets: result.data } : item
        )
      }
    };
  }

  const projectIndex = resume.projects.findIndex(
    (project) => project.id === parentId
  );

  if (projectIndex === -1) {
    return {
      success: false,
      error: `Project with id "${parentId}" not found.`
    };
  }

  const project = resume.projects[projectIndex];

  if (!project) {
    return {
      success: false,
      error: "Project not found."
    };
  }

  const result = moveItem(project.bullets, fromIndex, toIndex);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: {
      ...resume,
      projects: resume.projects.map((item, index) =>
        index === projectIndex ? { ...item, bullets: result.data } : item
      )
    }
  };
}

export function applyOperation(
  resume: Resume,
  operation: ResumeOperation
): OperationResult<Resume> {
  switch (operation.type) {
    case "ADD_EXPERIENCE":
      return {
        success: true,
        data: {
          ...resume,
          experience: [...resume.experience, operation.experience]
        }
      };

    case "UPDATE_EXPERIENCE": {
      const result = updateById(
        resume.experience,
        operation.id,
        operation.changes
      );

      return result.success
        ? { success: true, data: { ...resume, experience: result.data } }
        : result;
    }

    case "REMOVE_EXPERIENCE": {
      const result = removeById(resume.experience, operation.id);

      return result.success
        ? { success: true, data: { ...resume, experience: result.data } }
        : result;
    }

    case "REORDER_EXPERIENCE": {
      const result = moveItem(
        resume.experience,
        operation.fromIndex,
        operation.toIndex
      );

      return result.success
        ? { success: true, data: { ...resume, experience: result.data } }
        : result;
    }

    case "ADD_PROJECT":
      return {
        success: true,
        data: {
          ...resume,
          projects: [...resume.projects, operation.project]
        }
      };

    case "UPDATE_PROJECT": {
      const result = updateById(
        resume.projects,
        operation.id,
        operation.changes
      );

      return result.success
        ? { success: true, data: { ...resume, projects: result.data } }
        : result;
    }

    case "REMOVE_PROJECT": {
      const result = removeById(resume.projects, operation.id);

      return result.success
        ? { success: true, data: { ...resume, projects: result.data } }
        : result;
    }

    case "REORDER_PROJECT": {
      const result = moveItem(
        resume.projects,
        operation.fromIndex,
        operation.toIndex
      );

      return result.success
        ? { success: true, data: { ...resume, projects: result.data } }
        : result;
    }

    case "ADD_EDUCATION":
      return {
        success: true,
        data: {
          ...resume,
          education: [...resume.education, operation.education]
        }
      };

    case "UPDATE_EDUCATION": {
      const result = updateById(
        resume.education,
        operation.id,
        operation.changes
      );

      return result.success
        ? { success: true, data: { ...resume, education: result.data } }
        : result;
    }

    case "REMOVE_EDUCATION": {
      const result = removeById(resume.education, operation.id);

      return result.success
        ? { success: true, data: { ...resume, education: result.data } }
        : result;
    }

    case "ADD_SKILL_CATEGORY":
      return {
        success: true,
        data: {
          ...resume,
          skills: [...resume.skills, operation.skillCategory]
        }
      };

    case "UPDATE_SKILL_CATEGORY": {
      const result = updateById(resume.skills, operation.id, operation.changes);

      return result.success
        ? { success: true, data: { ...resume, skills: result.data } }
        : result;
    }

    case "REMOVE_SKILL_CATEGORY": {
      const result = removeById(resume.skills, operation.id);

      return result.success
        ? { success: true, data: { ...resume, skills: result.data } }
        : result;
    }

    case "ADD_CERTIFICATION":
      return {
        success: true,
        data: {
          ...resume,
          certifications: [...resume.certifications, operation.certification]
        }
      };

    case "UPDATE_CERTIFICATION": {
      const result = updateById(
        resume.certifications,
        operation.id,
        operation.changes
      );

      return result.success
        ? { success: true, data: { ...resume, certifications: result.data } }
        : result;
    }

    case "REMOVE_CERTIFICATION": {
      const result = removeById(resume.certifications, operation.id);

      return result.success
        ? { success: true, data: { ...resume, certifications: result.data } }
        : result;
    }

    case "ADD_BULLET":
      return addBullet(
        resume,
        operation.section,
        operation.parentId,
        operation.bullet
      );

    case "UPDATE_BULLET":
      return updateBullet(
        resume,
        operation.section,
        operation.parentId,
        operation.bulletId,
        operation.changes
      );

    case "REMOVE_BULLET":
      return removeBullet(
        resume,
        operation.section,
        operation.parentId,
        operation.bulletId
      );

    case "REORDER_BULLET":
      return reorderBullet(
        resume,
        operation.section,
        operation.parentId,
        operation.fromIndex,
        operation.toIndex
      );

    case "REORDER_SECTION": {
      const result = moveItem(
        resume.sectionOrder,
        operation.fromIndex,
        operation.toIndex
      );

      return result.success
        ? {
            success: true,
            data: {
              ...resume,
              sectionOrder: result.data as ResumeSection[]
            }
          }
        : result;
    }
  }
}
