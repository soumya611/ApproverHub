import { create } from "zustand";
import type {
  JobInfoOption,
  JobInfoQuestion,
  JobInfoTemplate,
} from "../types/jobInformation";
import {
  createJobInfoConditionId,
  createJobInfoOptionId,
  createJobInfoQuestionId,
  createJobInfoRuleId,
  normalizeJobInfoQuestions,
} from "@/utils/jobInformationBranching";

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
  id: createJobInfoOptionId(),
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
    branchRules: [],
  },
  {
    id: "q2",
    text: "Is this for UK use ?",
    type: "choice",
    required: true,
    options: [createOption("Yes"), createOption("No")],
    branchRules: [],
  },
];

const DEFAULT_TEMPLATES: JobInfoTemplate[] = [
  {
    id: "job-info-v2",
    name: "Job Information",
    version: "V2",
    isActive: true,
    questions: normalizeJobInfoQuestions(createDefaultQuestions()),
  },
  {
    id: "job-info-v1",
    name: "Job Information",
    version: "V1",
    isActive: false,
    questions: normalizeJobInfoQuestions(createDefaultQuestions()),
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
    return {
      enabled: Boolean(parsed.enabled),
      templates: parsed.templates.map((template) => ({
        ...template,
        questions: normalizeJobInfoQuestions(template.questions ?? []),
      })),
    };
  } catch {
    return null;
  }
};

const persistState = (state: { enabled: boolean; templates: JobInfoTemplate[] }) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      JOB_INFORMATION_STORAGE_KEY,
      JSON.stringify({
        ...state,
        templates: state.templates.map((template) => ({
          ...template,
          questions: normalizeJobInfoQuestions(template.questions),
        })),
      })
    );
  } catch {
    // Ignore persistence errors.
  }
};

const cloneQuestions = (questions: JobInfoQuestion[]): JobInfoQuestion[] => {
  const idMap = new Map<string, string>();
  const normalizedQuestions = normalizeJobInfoQuestions(questions);
  const cloned = normalizedQuestions.map((question) => {
    const newId = createJobInfoQuestionId();
    idMap.set(question.id, newId);
    return {
      ...question,
      id: newId,
      options: question.options.map((option) => ({
        ...option,
        id: createJobInfoOptionId(),
      })),
      branchRules: question.branchRules.map((rule) => ({
        ...rule,
        id: createJobInfoRuleId(),
        conditions: rule.conditions.map((condition) => ({
          ...condition,
          id: createJobInfoConditionId(),
        })),
      })),
    };
  });

  return cloned.map((question, index) => ({
    ...question,
    options: question.options.map((option, optionIndex) => {
      const originalOption = normalizedQuestions[index]?.options[optionIndex];
      const originalNext = originalOption?.nextQuestionId;
      return {
        ...option,
        nextQuestionId: originalNext ? idMap.get(originalNext) : undefined,
      };
    }),
    branchRules: question.branchRules.map((rule, ruleIndex) => {
      const originalRule = normalizedQuestions[index]?.branchRules[ruleIndex];
      return {
        ...rule,
        conditions: rule.conditions.map((condition, conditionIndex) => {
          const originalCondition = originalRule?.conditions[conditionIndex];
          const originalOptionId = originalCondition?.optionId;
          const originalOptionIndex = normalizedQuestions[index]?.options.findIndex(
            (option) => option.id === originalOptionId
          );
          return {
            ...condition,
            optionId:
              typeof originalOptionIndex === "number" && originalOptionIndex >= 0
                ? question.options[originalOptionIndex]?.id ?? condition.optionId
                : condition.optionId,
          };
        }),
        targetQuestionId: originalRule?.targetQuestionId
          ? idMap.get(originalRule.targetQuestionId) ?? originalRule.targetQuestionId
          : undefined,
      };
    }),
    fallbackNextQuestionId: normalizedQuestions[index]?.fallbackNextQuestionId
      ? idMap.get(normalizedQuestions[index].fallbackNextQuestionId) ??
        normalizedQuestions[index].fallbackNextQuestionId
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
        const templates = [
          {
            ...template,
            questions: normalizeJobInfoQuestions(template.questions),
          },
          ...state.templates,
        ];
        persistState({ enabled: state.enabled, templates });
        return { templates };
      });
    },
    updateTemplate: (id, updates) => {
      set((state) => {
        const templates = state.templates.map((template) =>
          template.id === id
            ? {
                ...template,
                ...updates,
                questions: updates.questions
                  ? normalizeJobInfoQuestions(updates.questions)
                  : template.questions,
              }
            : template
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
