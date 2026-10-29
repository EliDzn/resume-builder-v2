import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  storage: {
    getItem: vi.fn(async (_name: string) => {
      void _name;
      return null;
    }),
    setItem: vi.fn(async (_name: string, _value: unknown) => {
      void _name;
      void _value;
    }),
    removeItem: vi.fn(async (_name: string) => {
      void _name;
    })
  }
}));

vi.mock("zustand/middleware", async (importOriginal) => {
  const actual = await importOriginal<typeof import("zustand/middleware")>();

  return {
    ...actual,
    createJSONStorage: () => mocks.storage
  };
});

import { useResumeStore } from "./resume-store";

const initialState = {
  personal: {
    fullName: "",
    role: "",
    location: "",
    phone: "",
    email: "",
    linkedin: "",
    github: ""
  },
  summary: "",
  experiences: [
    {
      id: "experience-1",
      role: "",
      company: "",
      startDate: "",
      endDate: "",
      bullets: [""]
    }
  ],
  projects: [
    {
      id: "project-1",
      name: "",
      techStack: "",
      endDate: "",
      bullets: [""]
    }
  ],
  certifications: [
    {
      id: "certification-1",
      title: "",
      completedDate: ""
    }
  ],
  skills: {
    frontend: [],
    backend: [],
    tools: []
  },
  fontFamily: "inter" as const,
  customSkillOptions: {
    frontend: [],
    backend: [],
    tools: []
  },
  past: [],
  future: []
};

async function waitForHydration() {
  if (useResumeStore.getState().hasHydrated) return;

  await new Promise<void>((resolve) => {
    const unsubscribe = useResumeStore.subscribe((state) => {
      if (state.hasHydrated) {
        unsubscribe();
        resolve();
      }
    });
  });
}

describe("resume store", () => {
  beforeEach(async () => {
    await waitForHydration();
    mocks.storage.setItem.mockClear();

    useResumeStore.setState(initialState);
    await Promise.resolve();
    mocks.storage.setItem.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("clears resume data and custom skill options", () => {
    const store = useResumeStore.getState();

    store.updatePersonal({ fullName: "Jane Doe" });
    store.addCustomSkillOption("frontend", "Svelte");
    store.updateSkills({ frontend: ["Svelte"] });

    useResumeStore.getState().clearResume();

    const cleared = useResumeStore.getState();

    expect(cleared.personal.fullName).toBe("");
    expect(cleared.skills).toEqual({
      frontend: [],
      backend: [],
      tools: []
    });
    expect(cleared.customSkillOptions).toEqual({
      frontend: [],
      backend: [],
      tools: []
    });
    expect(cleared.experiences).toHaveLength(1);
    expect(cleared.experiences[0].role).toBe("");
  });

  it("trims custom skill options and prevents case-insensitive duplicates", () => {
    const store = useResumeStore.getState();

    store.addCustomSkillOption("frontend", " Svelte ");
    useResumeStore.getState().addCustomSkillOption("frontend", "svelte");

    expect(useResumeStore.getState().customSkillOptions.frontend).toEqual([
      "Svelte"
    ]);
  });

  it("keeps a custom option when skill selection is removed", () => {
    useResumeStore.getState().addCustomSkillOption("frontend", "Svelte");
    useResumeStore.getState().updateSkills({ frontend: ["Svelte"] });
    useResumeStore.getState().updateSkills({ frontend: [] });

    expect(useResumeStore.getState().skills.frontend).toEqual([]);
    expect(useResumeStore.getState().customSkillOptions.frontend).toEqual([
      "Svelte"
    ]);
  });

  it("undoes and redoes discrete resume changes", () => {
    useResumeStore.getState().addExperience();

    expect(useResumeStore.getState().experiences).toHaveLength(2);

    useResumeStore.getState().undo();
    expect(useResumeStore.getState().experiences).toHaveLength(1);

    useResumeStore.getState().redo();
    expect(useResumeStore.getState().experiences).toHaveLength(2);
  });

  it("persists custom skill options", async () => {
    useResumeStore.getState().addCustomSkillOption("tools", "Playwright");
    await Promise.resolve();

    const lastWrite = mocks.storage.setItem.mock.calls.at(-1);
    expect(lastWrite).toBeDefined();

    const persistedValue = lastWrite?.[1] as {
      state: { customSkillOptions: typeof initialState.customSkillOptions };
    };

    expect(persistedValue.state.customSkillOptions.tools).toEqual([
      "Playwright"
    ]);
  });
});
