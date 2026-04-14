import { create } from "zustand";
import type { ChecklistSection } from "./checklistBuilderStore";

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  active: boolean;
  ownerName: string;
  ownerAvatarUrl?: string;
  sections: ChecklistSection[];
}

interface ChecklistTemplatesState {
  checklistTemplates: ChecklistTemplate[];
  createChecklistTemplate: (
    payload: Omit<ChecklistTemplate, "id" | "createdAt" | "active">
  ) => string;
  updateChecklistTemplate: (
    id: string,
    updates: Partial<Omit<ChecklistTemplate, "id" | "createdAt">>
  ) => void;
  toggleChecklistTemplateStatus: (id: string, active: boolean) => void;
  removeChecklistTemplate: (id: string) => void;
  duplicateChecklistTemplate: (id: string) => void;
}

const nowIso = () => new Date().toISOString();

const INITIAL_TEMPLATES: ChecklistTemplate[] = [
  {
    id: "cl-001",
    name: "Marketing Checklist",
    description: "Validate marketing material for compliance before approval",
    createdAt: nowIso(),
    active: true,
    ownerName: "Admin",
    sections: [],
  },
  {
    id: "cl-002",
    name: "Campaign Launch Checklist",
    description: "Pre-launch content and legal checks",
    createdAt: nowIso(),
    active: false,
    ownerName: "Admin",
    sections: [],
  },
];

export const useChecklistTemplatesStore = create<ChecklistTemplatesState>((set, get) => ({
  checklistTemplates: INITIAL_TEMPLATES,

  createChecklistTemplate: (payload) => {
    const id = `cl-${Date.now()}`;
    const nextTemplate: ChecklistTemplate = {
      id,
      createdAt: nowIso(),
      active: true,
      ...payload,
    };

    set((state) => ({
      checklistTemplates: [nextTemplate, ...state.checklistTemplates],
    }));

    return id;
  },

  updateChecklistTemplate: (id, updates) =>
    set((state) => ({
      checklistTemplates: state.checklistTemplates.map((template) =>
        template.id === id ? { ...template, ...updates } : template
      ),
    })),

  toggleChecklistTemplateStatus: (id, active) =>
    get().updateChecklistTemplate(id, { active }),

  removeChecklistTemplate: (id) =>
    set((state) => ({
      checklistTemplates: state.checklistTemplates.filter((template) => template.id !== id),
    })),

  duplicateChecklistTemplate: (id) =>
    set((state) => {
      const index = state.checklistTemplates.findIndex((template) => template.id === id);
      if (index === -1) return state;

      const template = state.checklistTemplates[index];
      const duplicated: ChecklistTemplate = {
        ...template,
        id: `cl-${Date.now()}`,
        name: `${template.name} (Copy)`,
      };

      return {
        checklistTemplates: [
          ...state.checklistTemplates.slice(0, index + 1),
          duplicated,
          ...state.checklistTemplates.slice(index + 1),
        ],
      };
    }),
}));

