import type { JobTrackerItem, JobTrackerSummary, WorkflowStage } from "../types";

const PRODUCT_SHEET_STAGES: WorkflowStage[] = [
  {
    id: "s1",
    stepLabel: "S1",
    name: "Content Edit",
    status: "Approved",
    dueDate: "28 Jan 26",
    commentsCount: 3,
    members: [
      { id: "m1", initials: "KL", className: "bg-cyan-700 text-white" },
      { id: "m2", initials: "UP", className: "bg-slate-900 text-white" },
      { id: "m3", initials: "MW", className: "bg-slate-500 text-white" },
    ],
  },
  {
    id: "s2",
    stepLabel: "S2",
    name: "Creative Review",
    status: "In Progress",
    dueDate: "28 Jan 26",
    commentsCount: 3,
    members: [
      { id: "m4", initials: "KL", className: "bg-cyan-700 text-white" },
      { id: "m5", initials: "UP", className: "bg-slate-900 text-white" },
      { id: "m6", initials: "MW", className: "bg-slate-500 text-white" },
    ],
  },
  {
    id: "s3",
    stepLabel: "S3",
    name: "Legal",
    status: "Not Started",
    dueDate: "02 Feb 26",
    members: [
      { id: "m7", initials: "KL", className: "bg-cyan-700 text-white" },
      { id: "m8", initials: "UP", className: "bg-slate-900 text-white" },
      { id: "m9", initials: "MW", className: "bg-slate-500 text-white" },
    ],
  },
  {
    id: "s4",
    stepLabel: "S4",
    name: "Final",
    status: "Not Started",
    dueDate: "02 Feb 26",
    members: [],
  },
];

const PRODUCT_SHEET_SUMMARY: JobTrackerSummary = {
  imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=320&q=80",
  format: "IMG",
  title: "Product Sheet",
  version: "V1",
  statusText: "New request",
  dueDate: "12 Mar 26",
  ageText: "3 days ago",
};

const SALES_DECK_STAGES: WorkflowStage[] = [
  {
    id: "s1",
    stepLabel: "S1",
    name: "Brief Review",
    status: "Approved",
    dueDate: "10 Mar 26",
    commentsCount: 1,
    members: [
      { id: "m11", initials: "SR", className: "bg-cyan-700 text-white" },
      { id: "m12", initials: "UP", className: "bg-slate-900 text-white" },
    ],
  },
  {
    id: "s2",
    stepLabel: "S2",
    name: "Design Pass",
    status: "In Progress",
    dueDate: "14 Mar 26",
    commentsCount: 4,
    members: [
      { id: "m13", initials: "AM", className: "bg-cyan-700 text-white" },
      { id: "m14", initials: "MW", className: "bg-slate-500 text-white" },
    ],
  },
  {
    id: "s3",
    stepLabel: "S3",
    name: "Legal",
    status: "Not Started",
    dueDate: "18 Mar 26",
    members: [],
  },
];

const SALES_DECK_SUMMARY: JobTrackerSummary = {
  imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=320&q=80",
  format: "PPT",
  title: "Sales Deck",
  version: "V3",
  statusText: "New request",
  dueDate: "14 Mar 26",
  ageText: "1 day ago",
};

export const JOB_TRACKER_ITEMS: JobTrackerItem[] = [
  {
    id: "jt-1",
    summary: PRODUCT_SHEET_SUMMARY,
    stages: PRODUCT_SHEET_STAGES,
  },
  {
    id: "jt-2",
    summary: SALES_DECK_SUMMARY,
    stages: SALES_DECK_STAGES,
  },
];
