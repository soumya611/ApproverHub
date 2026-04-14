import { create } from "zustand";

export interface ChecklistQuestion {
  id: string;
  question: string;
  description: string;
  answerType: "pass_fail";
  selectedAnswer: "pass" | "fail" | null;
  isExpanded: boolean;
}

export interface ChecklistSection {
  id: string;
  sectionName: string;
  sectionTitle: string;
  isExpanded: boolean;
  questions: ChecklistQuestion[];
}

interface ChecklistBuilderState {
  sections: ChecklistSection[];
  draggedQuestionId: string | null;
  draggedSectionId: string | null;
  dragOverQuestionId: string | null;
  dragOverSectionId: string | null;
  setSectionTitle: (sectionId: string, title: string) => void;
  toggleSectionExpanded: (sectionId: string) => void;
  updateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<ChecklistQuestion>
  ) => void;
  addQuestion: (sectionId: string) => void;
  removeQuestion: (sectionId: string, questionId: string) => void;
  toggleQuestionExpanded: (sectionId: string, questionId: string) => void;
  reorderQuestions: (sectionId: string, sourceId: string, targetId: string) => void;
  addSection: () => void;
  setDragContext: (
    draggedQuestionId: string | null,
    draggedSectionId: string | null
  ) => void;
  setDragOverContext: (
    dragOverQuestionId: string | null,
    dragOverSectionId: string | null
  ) => void;
  clearDragContext: () => void;
  resetBuilder: () => void;
  setSections: (sections: ChecklistSection[]) => void;
}

const createDefaultQuestion = (seed: string): ChecklistQuestion => ({
  id: `q-${seed}`,
  question: "",
  description: "",
  answerType: "pass_fail",
  selectedAnswer: null,
  isExpanded: true,
});

const createDefaultSection = (index: number): ChecklistSection => ({
  id: `section-${Date.now()}-${index}`,
  sectionName: `Section ${index}`,
  sectionTitle: "",
  isExpanded: true,
  questions: [createDefaultQuestion(`${Date.now()}-${index}-0`)],
});

export const createDefaultChecklistSections = (): ChecklistSection[] => [createDefaultSection(1)];

const normalizeSectionSequence = (sections: ChecklistSection[]): ChecklistSection[] =>
  sections.map((section, index) => ({
    ...section,
    sectionName: `Section ${index + 1}`,
  }));

export const useChecklistBuilderStore = create<ChecklistBuilderState>((set) => ({
  sections: createDefaultChecklistSections(),
  draggedQuestionId: null,
  draggedSectionId: null,
  dragOverQuestionId: null,
  dragOverSectionId: null,

  setSectionTitle: (sectionId, title) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId ? { ...section, sectionTitle: title } : section
      ),
    })),

  toggleSectionExpanded: (sectionId) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      ),
    })),

  updateQuestion: (sectionId, questionId, updates) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId ? { ...question, ...updates } : question
              ),
            }
          : section
      ),
    })),

  addQuestion: (sectionId) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: [
                ...section.questions,
                createDefaultQuestion(`${Date.now()}-${section.questions.length}`),
              ],
            }
          : section
      ),
    })),

  removeQuestion: (sectionId, questionId) =>
    set((state) => ({
      sections: (() => {
        const sectionsWithQuestionRemoved = state.sections
          .map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  questions: section.questions.filter((question) => question.id !== questionId),
                }
              : section
          )
          .filter((section) => section.questions.length > 0);

        if (!sectionsWithQuestionRemoved.length) {
          return createDefaultChecklistSections();
        }

        return normalizeSectionSequence(sectionsWithQuestionRemoved);
      })(),
    })),

  toggleQuestionExpanded: (sectionId, questionId) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? { ...question, isExpanded: !question.isExpanded }
                  : question
              ),
            }
          : section
      ),
    })),

  reorderQuestions: (sectionId, sourceId, targetId) =>
    set((state) => ({
      sections: state.sections.map((section) => {
        if (section.id !== sectionId || sourceId === targetId) return section;
        const sourceIndex = section.questions.findIndex((item) => item.id === sourceId);
        const targetIndex = section.questions.findIndex((item) => item.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1) return section;
        const nextQuestions = [...section.questions];
        const [moved] = nextQuestions.splice(sourceIndex, 1);
        nextQuestions.splice(targetIndex, 0, moved);
        return { ...section, questions: nextQuestions };
      }),
    })),

  addSection: () =>
    set((state) => ({
      sections: normalizeSectionSequence([
        ...state.sections,
        createDefaultSection(state.sections.length + 1),
      ]),
    })),

  setDragContext: (draggedQuestionId, draggedSectionId) =>
    set({ draggedQuestionId, draggedSectionId }),

  setDragOverContext: (dragOverQuestionId, dragOverSectionId) =>
    set({ dragOverQuestionId, dragOverSectionId }),

  clearDragContext: () =>
    set({
      draggedQuestionId: null,
      draggedSectionId: null,
      dragOverQuestionId: null,
      dragOverSectionId: null,
    }),

  resetBuilder: () =>
    set({
      sections: createDefaultChecklistSections(),
      draggedQuestionId: null,
      draggedSectionId: null,
      dragOverQuestionId: null,
      dragOverSectionId: null,
    }),

  setSections: (sections) =>
    set({
      sections: sections.length
        ? normalizeSectionSequence(sections)
        : createDefaultChecklistSections(),
      draggedQuestionId: null,
      draggedSectionId: null,
      dragOverQuestionId: null,
      dragOverSectionId: null,
    }),
}));

