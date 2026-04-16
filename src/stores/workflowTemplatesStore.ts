import { create } from "zustand";
import type { JobWorkflowConfig } from "@/components/jobs/types";

export interface WorkflowTemplate {
  id: string;
  name: string;
  createdAt: string;
  active: boolean;
  ownerName: string;
  ownerAvatarUrl?: string;
  workflowConfig: JobWorkflowConfig;
}

interface WorkflowTemplatesState {
  workflowTemplates: WorkflowTemplate[];
  createWorkflowTemplate: (payload: {
    workflowConfig: JobWorkflowConfig;
    ownerName: string;
    ownerAvatarUrl?: string;
  }) => string;
  updateWorkflowTemplate: (id: string, workflowConfig: JobWorkflowConfig) => void;
  toggleWorkflowTemplateStatus: (id: string, active: boolean) => void;
  removeWorkflowTemplate: (id: string) => void;
}

const nowIso = () => new Date().toISOString();

const createSeedWorkflowConfig = (id: string, name: string): JobWorkflowConfig => ({
  id,
  name,
  stages: [
    {
      id: `${id}-stage-1`,
      stepLabel: "S1",
      name: "Compliance",
      startRule: "immediately",
      startOnDeadline: false,
      lockRule: "never",
      skipRule: "never",
      deadline: "",
      checklistIds: [],
      finalStatus: "",
      decisionMakerIds: [],
    },
  ],
  reviewers: [],
  permissions: {
    stages: {},
    reviewers: {},
  },
});

const INITIAL_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "wf-001",
    name: "Content team approval",
    createdAt: nowIso(),
    active: true,
    ownerName: "Admin",
    workflowConfig: createSeedWorkflowConfig("wf-001", "Content team approval"),
  },
  {
    id: "wf-002",
    name: "Marketing campaign",
    createdAt: nowIso(),
    active: false,
    ownerName: "Admin",
    workflowConfig: createSeedWorkflowConfig("wf-002", "Marketing campaign"),
  },
  {
    id: "wf-003",
    name: "Marketing job",
    createdAt: nowIso(),
    active: true,
    ownerName: "Admin",
    workflowConfig: createSeedWorkflowConfig("wf-003", "Marketing job"),
  },
];

export const useWorkflowTemplatesStore = create<WorkflowTemplatesState>((set, get) => ({
  workflowTemplates: INITIAL_TEMPLATES,

  createWorkflowTemplate: ({ workflowConfig, ownerName, ownerAvatarUrl }) => {
    const id = workflowConfig.id || `wf-${Date.now()}`;
    const normalizedConfig: JobWorkflowConfig = {
      ...workflowConfig,
      id,
      name: workflowConfig.name.trim() || "Untitled workflow",
    };
    const nextTemplate: WorkflowTemplate = {
      id,
      name: normalizedConfig.name,
      createdAt: nowIso(),
      active: true,
      ownerName: ownerName || "Admin",
      ownerAvatarUrl,
      workflowConfig: normalizedConfig,
    };
    set((state) => ({ workflowTemplates: [nextTemplate, ...state.workflowTemplates] }));
    return id;
  },

  updateWorkflowTemplate: (id, workflowConfig) =>
    set((state) => ({
      workflowTemplates: state.workflowTemplates.map((template) =>
        template.id === id
          ? {
              ...template,
              name: workflowConfig.name.trim() || template.name,
              workflowConfig: { ...workflowConfig, id },
            }
          : template
      ),
    })),

  toggleWorkflowTemplateStatus: (id, active) =>
    set((state) => ({
      workflowTemplates: state.workflowTemplates.map((template) =>
        template.id === id ? { ...template, active } : template
      ),
    })),

  removeWorkflowTemplate: (id) =>
    set((state) => ({
      workflowTemplates: state.workflowTemplates.filter((template) => template.id !== id),
    })),
}));

