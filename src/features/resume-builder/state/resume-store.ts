import { create } from "zustand";
import type {
  Certification,
  Experience,
  PersonalInfo,
  Project,
  ResumeData
} from "../model/resume-type";

type ResumeStore = ResumeData & {
  updatePersonal: (changes: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;

  addExperience: () => void;
  updateExperience: (
    id: string,
    changes: Partial<Omit<Experience, "id">>
  ) => void;
  removeExperience: (id: string) => void;
  addExperienceBullet: (experienceId: string) => void;
  updateExperienceBullet: (
    experienceId: string,
    bulletIndex: number,
    value: string
  ) => void;
  removeExperienceBullet: (experienceId: string, bulletIndex: number) => void;
  moveExperience: (activeId: string, targetId: string) => void;

  addProject: () => void;
  updateProject: (id: string, changes: Partial<Omit<Project, "id">>) => void;
  removeProject: (id: string) => void;
  addProjectBullet: (projectId: string) => void;
  updateProjectBullet: (
    projectId: string,
    bulletIndex: number,
    value: string
  ) => void;
  removeProjectBullet: (projectId: string, bulletIndex: number) => void;
  moveProject: (activeId: string, targetId: string) => void;

  addCertification: () => void;
  updateCertification: (
    id: string,
    changes: Partial<Omit<Certification, "id">>
  ) => void;
  removeCertification: (id: string) => void;
};

const createId = () => crypto.randomUUID();

const createEmptyExperience = (): Experience => ({
  id: createId(),
  role: "",
  company: "",
  startDate: "",
  endDate: "",
  bullets: [""]
});

const createEmptyProject = (): Project => ({
  id: createId(),
  name: "",
  techStack: "",
  bullets: [""]
});

const createEmptyCertification = (): Certification => ({
  id: createId(),
  provider: "",
  title: "",
  completedDate: ""
});

const initialPersonal: PersonalInfo = {
  fullName: "",
  role: "",
  location: "",
  phone: "",
  email: "",
  linkedin: "",
  github: ""
};

function moveItem<T extends { id: string }>(
  items: T[],
  activeId: string,
  targetId: string
): T[] {
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const targetIndex = items.findIndex((item) => item.id === targetId);

  if (activeIndex === -1 || targetIndex === -1 || activeIndex === targetIndex) {
    return items;
  }

  const nextItems = [...items];
  const [activeItem] = nextItems.splice(activeIndex, 1);

  nextItems.splice(targetIndex, 0, activeItem);

  return nextItems;
}

export const useResumeStore = create<ResumeStore>()((set) => ({
  personal: initialPersonal,
  summary: "",
  experiences: [createEmptyExperience()],
  projects: [createEmptyProject()],
  certifications: [createEmptyCertification()],

  updatePersonal: (changes) =>
    set((state) => ({
      personal: {
        ...state.personal,
        ...changes
      }
    })),

  updateSummary: (summary) => set({ summary }),

  addExperience: () =>
    set((state) => ({
      experiences: [...state.experiences, createEmptyExperience()]
    })),

  updateExperience: (id, changes) =>
    set((state) => ({
      experiences: state.experiences.map((experience) =>
        experience.id === id ? { ...experience, ...changes } : experience
      )
    })),

  removeExperience: (id) =>
    set((state) => ({
      experiences: state.experiences.filter(
        (experience) => experience.id !== id
      )
    })),

  addExperienceBullet: (experienceId) =>
    set((state) => ({
      experiences: state.experiences.map((experience) =>
        experience.id === experienceId
          ? {
              ...experience,
              bullets: [...experience.bullets, ""]
            }
          : experience
      )
    })),

  updateExperienceBullet: (experienceId, bulletIndex, value) =>
    set((state) => ({
      experiences: state.experiences.map((experience) =>
        experience.id === experienceId
          ? {
              ...experience,
              bullets: experience.bullets.map((bullet, index) =>
                index === bulletIndex ? value : bullet
              )
            }
          : experience
      )
    })),

  removeExperienceBullet: (experienceId, bulletIndex) =>
    set((state) => ({
      experiences: state.experiences.map((experience) =>
        experience.id === experienceId
          ? {
              ...experience,
              bullets: experience.bullets.filter(
                (_, index) => index !== bulletIndex
              )
            }
          : experience
      )
    })),

  moveExperience: (activeId, targetId) =>
    set((state) => ({
      experiences: moveItem(state.experiences, activeId, targetId)
    })),

  addProject: () =>
    set((state) => ({
      projects: [...state.projects, createEmptyProject()]
    })),

  updateProject: (id, changes) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, ...changes } : project
      )
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id)
    })),

  addProjectBullet: (projectId) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              bullets: [...project.bullets, ""]
            }
          : project
      )
    })),

  updateProjectBullet: (projectId, bulletIndex, value) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              bullets: project.bullets.map((bullet, index) =>
                index === bulletIndex ? value : bullet
              )
            }
          : project
      )
    })),

  removeProjectBullet: (projectId, bulletIndex) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              bullets: project.bullets.filter(
                (_, index) => index !== bulletIndex
              )
            }
          : project
      )
    })),

  moveProject: (activeId, targetId) =>
    set((state) => ({
      projects: moveItem(state.projects, activeId, targetId)
    })),

  addCertification: () =>
    set((state) => ({
      certifications: [...state.certifications, createEmptyCertification()]
    })),

  updateCertification: (id, changes) =>
    set((state) => ({
      certifications: state.certifications.map((certification) =>
        certification.id === id
          ? { ...certification, ...changes }
          : certification
      )
    })),

  removeCertification: (id) =>
    set((state) => ({
      certifications: state.certifications.filter(
        (certification) => certification.id !== id
      )
    }))
}));
