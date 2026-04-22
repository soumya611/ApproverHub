import { create } from "zustand";

export type EmailTemplateStatus = "Active" | "Inactive";

export interface EmailTemplate {
  id: string;
  event: string;
  name: string;
  subject: string;
  status: EmailTemplateStatus;
  lastUpdated: string;
  body: string;
  recipients: string;
  contextMode: "intro_only" | "always_above";
}

// ── Group 1: Reviewer Notifications ──
export const REVIEWER_EVENTS = [
  "New job to review",
  "Multiple jobs pending",
  "New version uploaded by Owner",
  "Stage started",
  "New version uploaded by reviewer or approver",
  "Job/stage assigned",
];

// ── Group 2: Job Owner Notifications ──
export const JOB_OWNER_EVENTS = [
  "Job started",
  "Reviewer assigned",
  "Decision made",
  "Comments added",
  "Reply to comments",
  "Stage complete",
  "Final approval",
  "Overdue escalated",
  "Expiry warning",
];

// ── Group 3: Deadline Reminders ──
export const DEADLINE_EVENTS = [
  "Before deadline",
  "On deadline",
  "After deadline",
];


// All events combined — Reviewer → Job Owner → Deadline, Expiry warning appears once inside Job Owner group
export const ALL_EVENTS = [
  ...REVIEWER_EVENTS,
  ...JOB_OWNER_EVENTS,
  ...DEADLINE_EVENTS,
];

const SEED_TEMPLATES: EmailTemplate[] = [
  {
    id: "1",
    event: "New job to review",
    name: "New job to review",
    subject: "New job to review: <job.name>",
    status: "Active",
    lastUpdated: "2 days ago",
    body: "",
    recipients: "Sender signature",
    contextMode: "intro_only",
  },
  {
    id: "2",
    event: "Multiple jobs pending",
    name: "Multiple jobs pending",
    subject: "<jobs.count> new jobs to review",
    status: "Active",
    lastUpdated: "2 days ago",
    body: "",
    recipients: "Sender signature",
    contextMode: "intro_only",
  },
  {
    id: "3",
    event: "New version uploaded by Owner",
    name: "New version uploaded by Owner",
    subject: "New version to review: <job.name>",
    status: "Inactive",
    lastUpdated: "2 days ago",
    body: "",
    recipients: "Sender signature",
    contextMode: "intro_only",
  },
  {
    id: "4",
    event: "Stage started",
    name: "Stage started",
    subject: "Stage <stage.name> started: <job.name>",
    status: "Active",
    lastUpdated: "2 days ago",
    body: "",
    recipients: "Sender signature",
    contextMode: "intro_only",
  },
  {
    id: "5",
    event: "New version uploaded by reviewer or approver",
    name: "New version uploaded by reviewer or approver",
    subject: "New version to review: <job.name>",
    status: "Active",
    lastUpdated: "2 days ago",
    body: "",
    recipients: "Sender signature",
    contextMode: "intro_only",
  },
  {
    id: "6",
    event: "Job/stage assigned",
    name: "Job/stage assigned",
    subject: "No further Action Required",
    status: "Active",
    lastUpdated: "2 days ago",
    body: "",
    recipients: "Sender signature",
    contextMode: "intro_only",
  },
];

interface EmailTemplatesState {
  templates: EmailTemplate[];
  searchQuery: string;
  page: number;
  pageSize: number;
  setSearchQuery: (q: string) => void;
  setPage: (p: number) => void;
  addTemplate: (t: Omit<EmailTemplate, "id" | "lastUpdated">) => void;
  updateTemplate: (id: string, t: Partial<EmailTemplate>) => void;
  toggleStatus: (id: string) => void;
  getById: (id: string) => EmailTemplate | undefined;
}

export const useEmailTemplatesStore = create<EmailTemplatesState>((set, get) => ({
  templates: SEED_TEMPLATES,
  searchQuery: "",
  page: 0,
  pageSize: 50,

  setSearchQuery: (q) => set({ searchQuery: q, page: 0 }),
  setPage: (p) => set({ page: p }),

  addTemplate: (t) =>
    set((s) => ({
      templates: [
        ...s.templates,
        { ...t, id: String(Date.now()), lastUpdated: "Just now" },
      ],
    })),

  updateTemplate: (id, t) =>
    set((s) => ({
      templates: s.templates.map((tmpl) =>
        tmpl.id === id ? { ...tmpl, ...t, lastUpdated: "Just now" } : tmpl
      ),
    })),

  toggleStatus: (id) =>
    set((s) => ({
      templates: s.templates.map((tmpl) =>
        tmpl.id === id
          ? { ...tmpl, status: tmpl.status === "Active" ? "Inactive" : "Active" }
          : tmpl
      ),
    })),

  getById: (id) => get().templates.find((t) => t.id === id),
}));