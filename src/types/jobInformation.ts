export type JobInfoQuestionType = "choice" | "checkbox";

export type JobInfoOption = {
  id: string;
  label: string;
  nextQuestionId?: string;
};

export type JobInfoBranchCondition = {
  id: string;
  optionId: string;
};

export type JobInfoBranchRule = {
  id: string;
  conditions: JobInfoBranchCondition[];
  targetQuestionId?: string;
};

export type JobInfoQuestionPosition = {
  x: number;
  y: number;
};

export type JobInfoQuestion = {
  id: string;
  text: string;
  type: JobInfoQuestionType;
  required: boolean;
  options: JobInfoOption[];
  branchRules: JobInfoBranchRule[];
  fallbackNextQuestionId?: string;
  graphPosition?: JobInfoQuestionPosition;
};

export type JobInfoTemplate = {
  id: string;
  name: string;
  version: string;
  isActive: boolean;
  questions: JobInfoQuestion[];
};

export type JobInfoAnswers = Record<string, string | string[]>;
