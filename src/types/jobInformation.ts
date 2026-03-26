export type JobInfoQuestionType = "choice" | "checkbox";

export type JobInfoOption = {
  id: string;
  label: string;
  nextQuestionId?: string;
};

export type JobInfoQuestion = {
  id: string;
  text: string;
  type: JobInfoQuestionType;
  required: boolean;
  options: JobInfoOption[];
  fallbackNextQuestionId?: string;
};

export type JobInfoTemplate = {
  id: string;
  name: string;
  version: string;
  isActive: boolean;
  questions: JobInfoQuestion[];
};

export type JobInfoAnswers = Record<string, string | string[]>;
