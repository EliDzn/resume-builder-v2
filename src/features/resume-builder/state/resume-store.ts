import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  Certification,
  CustomSkillOptions,
  Experience,
  PersonalInfo,
  Project,
  ResumeData,
  ResumeFont,
  ResumeSkills
} from "../model/resume-type";

const DATABASE_NAME = "resume-builder-db";
const OBJECT_STORE_NAME = "resume-storage";
const STORAGE_KEY = "resume-builder-storage";
const HISTORY_LIMIT = 20;
const TYPING_HISTORY_DELAY = 750;

type HistoryMode = "typing" | "discrete";

type ResumeStore = ResumeData & {
  hasHydrated: boolean;
  past: ResumeData[];
  future: ResumeData[];
  customSkillOptions: CustomSkillOptions;

  updateFontFamily: (fontFamily: ResumeFont) => void;
  updatePersonal: (changes: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  updateSkills: (changes: Partial<ResumeSkills>) => void;
  addCustomSkillOption: (category: keyof ResumeSkills, skill: string) => void;
  clearResume: () => void;
  undo: () => void;
  redo: () => void;

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

  replaceResume: (resume: ResumeData) => void;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        database.createObjectStore(OBJECT_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const indexedDbStorage = {
  async getItem(name: string) {
    const database = await openDatabase();

    return new Promise<string | null>((resolve, reject) => {
      const transaction = database.transaction(OBJECT_STORE_NAME, "readonly");
      const request = transaction.objectStore(OBJECT_STORE_NAME).get(name);

      request.onsuccess = () => {
        database.close();
        resolve(request.result ?? null);
      };

      request.onerror = () => {
        database.close();
        reject(request.error);
      };
    });
  },

  async setItem(name: string, value: string) {
    const database = await openDatabase();

    return new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(OBJECT_STORE_NAME, "readwrite");

      transaction.objectStore(OBJECT_STORE_NAME).put(value, name);

      transaction.oncomplete = () => {
        database.close();
        resolve();
      };

      transaction.onerror = () => {
        database.close();
        reject(transaction.error);
      };
    });
  },

  async removeItem(name: string) {
    const database = await openDatabase();

    return new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(OBJECT_STORE_NAME, "readwrite");

      transaction.objectStore(OBJECT_STORE_NAME).delete(name);

      transaction.oncomplete = () => {
        database.close();
        resolve();
      };

      transaction.onerror = () => {
        database.close();
        reject(transaction.error);
      };
    });
  }
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
  endDate: "",
  bullets: [""]
});

const createEmptyCertification = (): Certification => ({
  id: createId(),
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

function createInitialResumeData(): ResumeData {
  return {
    fontFamily: "inter",
    personal: { ...initialPersonal },
    summary: "",
    experiences: [createEmptyExperience()],
    projects: [createEmptyProject()],
    certifications: [createEmptyCertification()],
    skills: { frontend: [], backend: [], tools: [] }
  };
}

function createEmptyCustomSkillOptions(): CustomSkillOptions {
  return { frontend: [], backend: [], tools: [] };
}

function getResumeData(state: ResumeStore): ResumeData {
  return {
    personal: state.personal,
    summary: state.summary,
    experiences: state.experiences,
    projects: state.projects,
    certifications: state.certifications,
    skills: state.skills,
    fontFamily: state.fontFamily
  };
}

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

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => {
      let typingTimer: ReturnType<typeof setTimeout> | undefined;
      let typingGroupOpen = false;

      const updateResume = (
        updater: (resume: ResumeData) => ResumeData,
        historyMode: HistoryMode = "discrete",
        additionalState: Partial<ResumeStore> = {}
      ) =>
        set((state) => {
          const currentResume = getResumeData(state);
          const nextResume = updater(currentResume);

          if (
            JSON.stringify(currentResume) === JSON.stringify(nextResume) &&
            Object.keys(additionalState).length === 0
          ) {
            return state;
          }

          let nextPast = state.past;

          if (historyMode === "discrete" || !typingGroupOpen) {
            nextPast = [...state.past, currentResume].slice(-HISTORY_LIMIT);
          }

          if (historyMode === "typing") {
            typingGroupOpen = true;

            if (typingTimer) {
              clearTimeout(typingTimer);
            }

            typingTimer = setTimeout(() => {
              typingGroupOpen = false;
              typingTimer = undefined;
            }, TYPING_HISTORY_DELAY);
          } else {
            typingGroupOpen = false;

            if (typingTimer) {
              clearTimeout(typingTimer);
              typingTimer = undefined;
            }
          }

          return {
            ...nextResume,
            ...additionalState,
            past: nextPast,
            future: []
          };
        });

      const closeTypingGroup = () => {
        typingGroupOpen = false;

        if (typingTimer) {
          clearTimeout(typingTimer);
          typingTimer = undefined;
        }
      };

      return {
        ...createInitialResumeData(),
        hasHydrated: false,
        past: [],
        future: [],
        customSkillOptions: createEmptyCustomSkillOptions(),

        updateFontFamily: (fontFamily) =>
          updateResume((resume) => ({ ...resume, fontFamily })),

        updatePersonal: (changes) =>
          updateResume(
            (resume) => ({
              ...resume,
              personal: { ...resume.personal, ...changes }
            }),
            "typing"
          ),

        updateSummary: (summary) =>
          updateResume((resume) => ({ ...resume, summary }), "typing"),

        updateSkills: (changes) =>
          updateResume(
            (resume) => ({
              ...resume,
              skills: { ...resume.skills, ...changes }
            }),
            "typing"
          ),

        addCustomSkillOption: (category, value) => {
          const skill = value.trim();
          if (!skill) return;

          set((state) => {
            const options = state.customSkillOptions[category];

            if (
              options.some((item) => item.toLowerCase() === skill.toLowerCase())
            ) {
              return state;
            }

            return {
              customSkillOptions: {
                ...state.customSkillOptions,
                [category]: [...options, skill]
              }
            };
          });
        },

        replaceResume: (resume) => updateResume(() => resume),

        clearResume: () =>
          updateResume(() => createInitialResumeData(), "discrete", {
            customSkillOptions: createEmptyCustomSkillOptions()
          }),

        undo: () => {
          closeTypingGroup();

          set((state) => {
            const previous = state.past[state.past.length - 1];

            if (!previous) {
              return state;
            }

            return {
              ...previous,
              past: state.past.slice(0, -1),
              future: [getResumeData(state), ...state.future].slice(
                0,
                HISTORY_LIMIT
              )
            };
          });
        },

        redo: () => {
          closeTypingGroup();

          set((state) => {
            const next = state.future[0];

            if (!next) {
              return state;
            }

            return {
              ...next,
              past: [...state.past, getResumeData(state)].slice(-HISTORY_LIMIT),
              future: state.future.slice(1)
            };
          });
        },

        addExperience: () =>
          updateResume((resume) => ({
            ...resume,
            experiences: [...resume.experiences, createEmptyExperience()]
          })),

        updateExperience: (id, changes) =>
          updateResume(
            (resume) => ({
              ...resume,
              experiences: resume.experiences.map((experience) =>
                experience.id === id
                  ? { ...experience, ...changes }
                  : experience
              )
            }),
            "typing"
          ),

        removeExperience: (id) =>
          updateResume((resume) => ({
            ...resume,
            experiences: resume.experiences.filter(
              (experience) => experience.id !== id
            )
          })),

        addExperienceBullet: (experienceId) =>
          updateResume((resume) => ({
            ...resume,
            experiences: resume.experiences.map((experience) =>
              experience.id === experienceId
                ? { ...experience, bullets: [...experience.bullets, ""] }
                : experience
            )
          })),

        updateExperienceBullet: (experienceId, bulletIndex, value) =>
          updateResume(
            (resume) => ({
              ...resume,
              experiences: resume.experiences.map((experience) =>
                experience.id === experienceId
                  ? {
                      ...experience,
                      bullets: experience.bullets.map((bullet, index) =>
                        index === bulletIndex ? value : bullet
                      )
                    }
                  : experience
              )
            }),
            "typing"
          ),

        removeExperienceBullet: (experienceId, bulletIndex) =>
          updateResume((resume) => ({
            ...resume,
            experiences: resume.experiences.map((experience) =>
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
          updateResume((resume) => ({
            ...resume,
            experiences: moveItem(resume.experiences, activeId, targetId)
          })),

        addProject: () =>
          updateResume((resume) => ({
            ...resume,
            projects: [...resume.projects, createEmptyProject()]
          })),

        updateProject: (id, changes) =>
          updateResume(
            (resume) => ({
              ...resume,
              projects: resume.projects.map((project) =>
                project.id === id ? { ...project, ...changes } : project
              )
            }),
            "typing"
          ),

        removeProject: (id) =>
          updateResume((resume) => ({
            ...resume,
            projects: resume.projects.filter((project) => project.id !== id)
          })),

        addProjectBullet: (projectId) =>
          updateResume((resume) => ({
            ...resume,
            projects: resume.projects.map((project) =>
              project.id === projectId
                ? { ...project, bullets: [...project.bullets, ""] }
                : project
            )
          })),

        updateProjectBullet: (projectId, bulletIndex, value) =>
          updateResume(
            (resume) => ({
              ...resume,
              projects: resume.projects.map((project) =>
                project.id === projectId
                  ? {
                      ...project,
                      bullets: project.bullets.map((bullet, index) =>
                        index === bulletIndex ? value : bullet
                      )
                    }
                  : project
              )
            }),
            "typing"
          ),

        removeProjectBullet: (projectId, bulletIndex) =>
          updateResume((resume) => ({
            ...resume,
            projects: resume.projects.map((project) =>
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
          updateResume((resume) => ({
            ...resume,
            projects: moveItem(resume.projects, activeId, targetId)
          })),

        addCertification: () =>
          updateResume((resume) => ({
            ...resume,
            certifications: [
              ...resume.certifications,
              createEmptyCertification()
            ]
          })),

        updateCertification: (id, changes) =>
          updateResume(
            (resume) => ({
              ...resume,
              certifications: resume.certifications.map((certification) =>
                certification.id === id
                  ? { ...certification, ...changes }
                  : certification
              )
            }),
            "typing"
          ),

        removeCertification: (id) =>
          updateResume((resume) => ({
            ...resume,
            certifications: resume.certifications.filter(
              (certification) => certification.id !== id
            )
          }))
      };
    },
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => indexedDbStorage),
      version: 3,
      partialize: (state) => ({
        ...getResumeData(state),
        customSkillOptions: state.customSkillOptions
      }),
      migrate: (persistedState) => {
        const state = persistedState as Partial<ResumeData> & {
          skills?: Partial<Record<keyof ResumeSkills, unknown>>;
          customSkillOptions?: Partial<Record<keyof ResumeSkills, unknown>>;
        };

        const toSkillArray = (value: unknown): string[] => {
          if (Array.isArray(value)) {
            return value.filter(
              (item): item is string => typeof item === "string"
            );
          }

          return typeof value === "string"
            ? value
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean)
            : [];
        };

        return {
          ...state,
          skills: {
            frontend: toSkillArray(state.skills?.frontend),
            backend: toSkillArray(state.skills?.backend),
            tools: toSkillArray(state.skills?.tools)
          },
          customSkillOptions: {
            frontend: toSkillArray(state.customSkillOptions?.frontend),
            backend: toSkillArray(state.customSkillOptions?.backend),
            tools: toSkillArray(state.customSkillOptions?.tools)
          }
        };
      },
      onRehydrateStorage: () => () => {
        useResumeStore.setState({ hasHydrated: true });
      }
    }
  )
);
