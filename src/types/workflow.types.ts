export type WorkflowStatus = "Approved" | "In Progress" | "Not Started";

export interface WorkflowMember {
  id: string;
  initials: string;
  className: string;
}

export interface WorkflowStage {
  id: string;
  stepLabel: string;
  name: string;
  status: WorkflowStatus;
  dueDate: string;
  commentsCount?: number;
  members: WorkflowMember[];
}

export interface JobTrackerSummary {
  imageUrl: string;
  format: string;
  title: string;
  version: string;
  statusText: string;
  dueDate: string;
  ageText: string;
}

export interface JobTrackerItem {
  id: string;
  summary: JobTrackerSummary;
  stages: WorkflowStage[];
}
