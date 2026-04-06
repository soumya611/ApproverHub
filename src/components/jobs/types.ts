import type { WorkflowMember, WorkflowStage, WorkflowStatus } from "../../types/workflow.types";

export type JobStatus =
  | "In Progress"
  | "Start Pending"
  | "Uploading..."
  | "Upload Failed"
  | "Complete"
  | "Changes required"
  | "On hold";

export type JobTag = "Urgent" | "Expiry Due" | "Late" | "Expired" | null;

export interface JobMember {
  id: string;
  name: string;
  initials: string;
  className: string;
  avatarUrl?: string;
  email?: string;
  role?: "Approver" | "Creator" | "Reviewer" | "Viewer";
  share?: boolean;
}

export interface JobVersion {
  id: string;
  label: string;
  fileName?: string;
  uploadedAt?: string;
}

export interface JobWorkflowStageConfig {
  id: string;
  stepLabel: string;
  name: string;
  startRule: string;
  startOnDeadline: boolean;
  lockRule: string;
  skipRule: string;
  deadline: string;
  checklistIds: string[];
  finalStatus: string;
  decisionMakerIds: string[];
}

export interface JobWorkflowPermissions {
  stages: Record<string, boolean>;
  reviewers: Record<string, boolean>;
}

export interface JobWorkflowConfig {
  id: string;
  name: string;
  stages: JobWorkflowStageConfig[];
  reviewers: JobMember[];
  permissions: JobWorkflowPermissions;
}

export type JobColumnId =
  | "campaign_id"
  | "job_number"
  | "job_name"
  | "created"
  | "status"
  | "action"
  | "owner"
  | "assignee";

export interface JobRow {
  id: string;
  campaignId: string;
  jobNumber: string;
  jobName: string;
  tag: JobTag;
  created: string;
  status: JobStatus;
  statusReason?: string;
  owner: string;
  assignee: string | null;
  brief?: string;
  urgent?: boolean;
  files?: Array<{ name: string; size?: number }>;
  jobInformation?: Record<string, string | string[]>;
  workflowId?: string;
  workflowLabel?: string;
  members?: JobMember[];
  workflowStages?: WorkflowStage[];
  assetTitle?: string;
  assetFormat?: string;
  workflowConfig?: JobWorkflowConfig;
  versions?: JobVersion[];
  thumbnailUrl?: string;
}

const toWorkflowMembers = (members: JobMember[]): WorkflowMember[] =>
  members.map((member) => ({
    id: member.id,
    initials: member.initials,
    className: member.className,
  }));

const JOB_MEMBERS_A: JobMember[] = [
  {
    id: "jm-1",
    name: "Krutika Gawankar",
    initials: "KG",
    className: "bg-cyan-600 text-white",
    email: "krutika@perivan.com",
    role: "Approver",
  },
  {
    id: "jm-2",
    name: "Thomas Anree",
    initials: "TA",
    className: "bg-slate-900 text-white",
    email: "thomas@perivan.com",
    role: "Reviewer",
  },
  {
    id: "jm-3",
    name: "Ananya Shah",
    initials: "AS",
    className: "bg-emerald-600 text-white",
    email: "ananya@perivan.com",
    role: "Approver",
  },
];

const JOB_MEMBERS_B: JobMember[] = [
  {
    id: "jm-4",
    name: "Manasi Patil",
    initials: "MP",
    className: "bg-indigo-600 text-white",
    email: "manasi@perivan.com",
    role: "Creator",
  },
  {
    id: "jm-5",
    name: "Pooja G",
    initials: "PG",
    className: "bg-rose-500 text-white",
    email: "pooja@perivan.com",
    role: "Reviewer",
  },
  {
    id: "jm-6",
    name: "Girish M",
    initials: "GM",
    className: "bg-amber-500 text-white",
    email: "girish@perivan.com",
    role: "Viewer",
  },
];

const JOB_MEMBERS_C: JobMember[] = [
  {
    id: "jm-7",
    name: "Jaya Kulkarni",
    initials: "JK",
    className: "bg-blue-600 text-white",
    email: "jaya@perivan.com",
    role: "Approver",
  },
  {
    id: "jm-8",
    name: "Nishant K",
    initials: "NK",
    className: "bg-slate-700 text-white",
    email: "nishant@perivan.com",
    role: "Reviewer",
  },
  {
    id: "jm-9",
    name: "Priya K",
    initials: "PK",
    className: "bg-violet-600 text-white",
    email: "priya@perivan.com",
    role: "Approver",
  },
];

const JOB_MEMBERS_EXTRA: JobMember[] = [
  {
    id: "jm-10",
    name: "Holly Westgarth",
    initials: "HW",
    className: "bg-orange-500 text-white",
    email: "holly@perivan.com",
    role: "Approver",
  },
  {
    id: "jm-11",
    name: "Pranali Gosavi",
    initials: "PR",
    className: "bg-teal-600 text-white",
    email: "pranali@perivan.com",
    role: "Reviewer",
  },
  {
    id: "jm-12",
    name: "Kartik Mehta",
    initials: "KM",
    className: "bg-fuchsia-600 text-white",
    email: "kartik@perivan.com",
    role: "Creator",
  },
  {
    id: "jm-13",
    name: "Saloni Verma",
    initials: "SV",
    className: "bg-lime-600 text-white",
    email: "saloni@perivan.com",
    role: "Viewer",
  },
];

export const DEFAULT_JOB_MEMBERS: JobMember[] = [
  ...JOB_MEMBERS_A,
  ...JOB_MEMBERS_B,
  ...JOB_MEMBERS_C,
  ...JOB_MEMBERS_EXTRA,
];

const buildStages = (
  baseId: string,
  members: JobMember[],
  statuses: WorkflowStatus[]
): WorkflowStage[] => {
  const workflowMembers = toWorkflowMembers(members);
  return [
    {
      id: `${baseId}-s1`,
      stepLabel: "S1",
      name: "Review",
      status: statuses[0],
      dueDate: "20 Mar 26",
      commentsCount: 3,
      members: workflowMembers,
    },
    {
      id: `${baseId}-s2`,
      stepLabel: "S2",
      name: "Content Edit",
      status: statuses[1],
      dueDate: "25 Mar 26",
      commentsCount: 2,
      members: workflowMembers,
    },
    {
      id: `${baseId}-s3`,
      stepLabel: "S3",
      name: "Legal",
      status: statuses[2],
      dueDate: "02 Apr 26",
      members: workflowMembers,
    },
  ];
};

const JOB_STAGES_A = buildStages("job-1", JOB_MEMBERS_A, [
  "Approved",
  "In Progress",
  "Not Started",
]);
const JOB_STAGES_B = buildStages("job-2", JOB_MEMBERS_B, [
  "In Progress",
  "Not Started",
  "Not Started",
]);
const JOB_STAGES_C = buildStages("job-3", JOB_MEMBERS_C, [
  "Approved",
  "Approved",
  "Not Started",
]);

export const MOCK_JOBS: JobRow[] = [
  {
    id: "1",
    campaignId: "CAM114025",
    jobNumber: "EB6160145",
    jobName: "Summer allergies Poster .V1",
    tag: "Urgent",
    created: "27 Oct 25",
    status: "In Progress",
    owner: "KG",
    assignee: "TA",
    members: JOB_MEMBERS_A,
    workflowStages: JOB_STAGES_A,
    assetTitle: "Summer allergies Poster .V1 PPT",
    assetFormat: "PPT",
    versions: [
      {
        id: "job-1-v1",
        label: "V1",
        fileName: "Summer allergies Poster .V1 PPT",
        uploadedAt: "08 Dec 25",
      },
      {
        id: "job-1-v2",
        label: "V2",
        fileName: "Summer allergies Poster .V2 PPT",
        uploadedAt: "12 Dec 25",
      },
    ],
  },
  {
    id: "2",
    campaignId: "CAM258761",
    jobNumber: "EB6160145",
    jobName: "Employee booklet .V2",
    tag: "Expiry Due",
    created: "02 Oct 25",
    status: "Start Pending",
    owner: "MP",
    assignee: null,
    members: JOB_MEMBERS_B,
    workflowStages: JOB_STAGES_B,
    assetTitle: "Employee booklet .V2 PPT",
    assetFormat: "PPT",
  },
  {
    id: "3",
    campaignId: "CAM114025",
    jobNumber: "EB6160145",
    jobName: "Winter magazine .V1",
    tag: "Late",
    created: "16 Oct 25",
    status: "Uploading...",
    owner: "GM",
    assignee: "JK",
    members: JOB_MEMBERS_C,
    workflowStages: JOB_STAGES_C,
    assetTitle: "Winter magazine .V1 PPT",
    assetFormat: "PPT",
  },
  {
    id: "4",
    campaignId: "CAM258761",
    jobNumber: "EB6160145",
    jobName: "Launch Video .V3",
    tag: null,
    created: "27 Oct 25",
    status: "Upload Failed",
    statusReason: "Wrong size uploaded",
    owner: "PG",
    assignee: null,
    members: JOB_MEMBERS_B,
    workflowStages: JOB_STAGES_B,
    assetTitle: "Launch Video .V3 PPT",
    assetFormat: "PPT",
  },
  {
    id: "5",
    campaignId: "CAM114025",
    jobNumber: "EB6160145",
    jobName: "Photos .V2",
    tag: "Expired",
    created: "02 Oct 25",
    status: "Complete",
    owner: "KG",
    assignee: "TA",
    members: JOB_MEMBERS_A,
    workflowStages: JOB_STAGES_C,
    assetTitle: "Photos .V2 PPT",
    assetFormat: "PPT",
  },
  {
    id: "6",
    campaignId: "CAM258761",
    jobNumber: "EB6160145",
    jobName: "Brochure .V1",
    tag: null,
    created: "16 Oct 25",
    status: "Changes required",
    owner: "MP",
    assignee: "GM",
    members: JOB_MEMBERS_B,
    workflowStages: JOB_STAGES_B,
    assetTitle: "Brochure .V1 PPT",
    assetFormat: "PPT"
  },
  {
    id: "7",
    campaignId: "CAM114025",
    jobNumber: "EB6160145",
    jobName: "Campaign Ad .V2",
    tag: null,
    created: "27 Oct 25",
    status: "On hold",
    owner: "GM",
    assignee: null,
    members: JOB_MEMBERS_B,
    workflowStages: JOB_STAGES_A,
    assetTitle: "Campaign Ad .V2 PPT",
    assetFormat: "PPT",
  },
];

export function getStatusClass(status: JobStatus): string {
  switch (status) {
    case "In Progress":
      return "bg-[#007B8C]/15 text-[#007B8C]";
    case "Complete":
      return "bg-green-100 text-green-800";
    case "On hold":
      return "bg-amber-100 text-amber-800";
    case "Changes required":
      return "bg-red-100 text-red-700";
    default:
      return "text-gray-400";
  }
}
