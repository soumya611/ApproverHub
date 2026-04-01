import { create } from "zustand";
import type {
  JobInfoOption,
  JobInfoQuestion,
  JobInfoTemplate,
} from "../types/jobInformation";

interface JobInformationState {
  enabled: boolean;
  templates: JobInfoTemplate[];
  setEnabled: (enabled: boolean) => void;
  addTemplate: (template: JobInfoTemplate) => void;
  updateTemplate: (id: string, updates: Partial<JobInfoTemplate>) => void;
  setActiveTemplate: (id: string, active: boolean) => void;
  duplicateTemplate: (id: string) => void;
}

export const JOB_INFORMATION_STORAGE_KEY = "job_information_store_v1";

const createOption = (label: string): JobInfoOption => ({
  id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  label,
});

const createDefaultQuestions = (): JobInfoQuestion[] => [
  {
    id: "q1",
    text: "Is this for external use ?",
    type: "choice",
    required: true,
    options: [
      { ...createOption("Yes"), nextQuestionId: "q2" },
      { ...createOption("No"), nextQuestionId: "q2" },
    ],
  },
  {
    id: "q2",
    text: "Is this for UK use ?",
    type: "choice",
    required: true,
    options: [createOption("Yes"), createOption("No")],
  },
];

const DEFAULT_TEMPLATES: JobInfoTemplate[] = [
  {
    id: "job-info-v2",
    name: "Job Information",
    version: "V2",
    isActive: true,
    questions: createDefaultQuestions(),
  },
  {
    id: "job-info-v1",
    name: "Job Information",
    version: "V1",
    isActive: false,
    questions: createDefaultQuestions(),
  },
];

const readStoredState = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(JOB_INFORMATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      enabled: boolean;
      templates: JobInfoTemplate[];
    };
    if (!parsed || !Array.isArray(parsed.templates)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const persistState = (state: { enabled: boolean; templates: JobInfoTemplate[] }) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(JOB_INFORMATION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence errors.
  }
};

const cloneQuestions = (questions: JobInfoQuestion[]): JobInfoQuestion[] => {
  const idMap = new Map<string, string>();
  const cloned = questions.map((question) => {
    const newId = `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    idMap.set(question.id, newId);
    return {
      ...question,
      id: newId,
      options: question.options.map((option) => ({
        ...option,
        id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      })),
    };
  });

  return cloned.map((question, index) => ({
    ...question,
    options: question.options.map((option, optionIndex) => {
      const originalOption = questions[index]?.options[optionIndex];
      const originalNext = originalOption?.nextQuestionId;
      return {
        ...option,
        nextQuestionId: originalNext ? idMap.get(originalNext) : undefined,
      };
    }),
    fallbackNextQuestionId: questions[index]?.fallbackNextQuestionId
      ? idMap.get(questions[index].fallbackNextQuestionId) ??
        questions[index].fallbackNextQuestionId
      : undefined,
  }));
};

const getVersionNumber = (value: string) => {
  const match = value.match(/V(\d+)/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

const getNextVersion = (templates: JobInfoTemplate[]) => {
  const highestVersion = templates.reduce((maxVersion, template) => {
    const versionNumber = getVersionNumber(template.version);
    if (versionNumber === null) return maxVersion;
    return Math.max(maxVersion, versionNumber);
  }, 0);
  return `V${highestVersion + 1}`;
};

export const useJobInformationStore = create<JobInformationState>((set, get) => {
  const stored = readStoredState();
  const initialTemplates = stored?.templates ?? DEFAULT_TEMPLATES;
  const initialEnabled = stored?.enabled ?? true;

  return {
    enabled: initialEnabled,
    templates: initialTemplates,
    setEnabled: (enabled) => {
      set((state) => {
        persistState({ enabled, templates: state.templates });
        return { enabled };
      });
    },
    addTemplate: (template) => {
      set((state) => {
        const templates = [template, ...state.templates];
        persistState({ enabled: state.enabled, templates });
        return { templates };
      });
    },
    updateTemplate: (id, updates) => {
      set((state) => {
        const templates = state.templates.map((template) =>
          template.id === id ? { ...template, ...updates } : template
        );
        persistState({ enabled: state.enabled, templates });
        return { templates };
      });
    },
    setActiveTemplate: (id, active) => {
      set((state) => {
        const templates = state.templates.map((template) =>
          template.id === id
            ? { ...template, isActive: active }
            : active
              ? { ...template, isActive: false }
              : template
        );
        persistState({ enabled: state.enabled, templates });
        return { templates };
      });
    },
    duplicateTemplate: (id) => {
      const template = get().templates.find((item) => item.id === id);
      if (!template) return;
      const duplicated: JobInfoTemplate = {
        ...template,
        id: `job-info-${Date.now()}`,
        version: getNextVersion(get().templates),
        isActive: false,
        questions: cloneQuestions(template.questions),
      };
      set((state) => {
        const templates = [duplicated, ...state.templates];
        persistState({ enabled: state.enabled, templates });
        return { templates };
      });
    },
  };
});
