import type {
  CampaignStatus,
  CampaignSubRow,
} from "../components/ui/campaign-table-row/CampaignTableRow";
import type { WorkflowMember, WorkflowStage } from "../types/workflow.types";

export interface CampaignMember {
  id: string;
  name: string;
  initials: string;
  className: string;
}

export type StatusCategory =
  | "complete"
  | "in_progress"
  | "on_hold"
  | "not_started"
  | "live"
  | "archive";

export interface CampaignRowData {
  id: string;
  campaignId: string;
  title: string;
  endDate: string;
  jobProgress: string;
  campaignStatus: CampaignStatus;
  jobStatusTag?: "Late" | null;
  ownerName: string;
  ownerAvatarUrl?: string;
  subRows?: CampaignSubRow[];
  team?: string;
  reviewerName?: string;
  campaignName?: string;
  statusCategory: StatusCategory;
  dueDateCategory: StatusCategory;
  businessArea?: string;
  campaignType?: string;
  createdDate?: string;
  startDate?: string;
  brief?: string;
  members?: CampaignMember[];
  workflowStages?: WorkflowStage[];
  assetTitle?: string;
  assetFormat?: string;
}

const toWorkflowMembers = (members: CampaignMember[]): WorkflowMember[] =>
  members.map((member) => ({
    id: member.id,
    initials: member.initials,
    className: member.className,
  }));

const MEMBERS_A: CampaignMember[] = [
  // { id: "m-1", name: "Krutika", initials: "K", className: "bg-cyan-600 text-white" },
  // { id: "m-2", name: "Ukas", initials: "U", className: "bg-slate-900 text-white" },
  { id: "m-3", name: "Mamta", initials: "M", className: "bg-slate-500 text-white" },
  // { id: "m-4", name: "Pranali", initials: "P", className: "bg-teal-600 text-white" },
];

const MEMBERS_B: CampaignMember[] = [
  { id: "m-5", name: "Girish", initials: "G", className: "bg-indigo-600 text-white" },
  { id: "m-6", name: "Manasi", initials: "M", className: "bg-emerald-600 text-white" },
  { id: "m-7", name: "Pooja", initials: "P", className: "bg-rose-500 text-white" },
];

const MEMBERS_C: CampaignMember[] = [
  { id: "m-8", name: "Kiran", initials: "K", className: "bg-blue-600 text-white" },
  { id: "m-9", name: "Nishant", initials: "N", className: "bg-slate-700 text-white" },
  { id: "m-10", name: "Priya", initials: "P", className: "bg-amber-500 text-white" },
  { id: "m-11", name: "Saloni", initials: "S", className: "bg-violet-600 text-white" },
];

const STAGES_A: WorkflowStage[] = [
  {
    id: "cam-1-s1",
    stepLabel: "S1",
    name: "Content Edit",
    status: "In Progress",
    dueDate: "28 Jan 26",
    commentsCount: 3,
    members: toWorkflowMembers(MEMBERS_A),
  },
  {
    id: "cam-1-s2",
    stepLabel: "S2",
    name: "Content Edit",
    status: "Not Started",
    dueDate: "28 Jan 26",
    commentsCount: 3,
    members: toWorkflowMembers(MEMBERS_A),
  },
  {
    id: "cam-1-s3",
    stepLabel: "S3",
    name: "Legal",
    status: "Not Started",
    dueDate: "02 Feb 26",
    members: toWorkflowMembers(MEMBERS_A),
  },
  {
    id: "cam-1-s4",
    stepLabel: "S4",
    name: "Final",
    status: "Not Started",
    dueDate: "02 Feb 26",
    members: toWorkflowMembers(MEMBERS_A),
  },
];

const STAGES_B: WorkflowStage[] = [
  {
    id: "cam-2-s1",
    stepLabel: "S1",
    name: "Review",
    status: "Approved",
    dueDate: "18 Jan 26",
    commentsCount: 2,
    members: toWorkflowMembers(MEMBERS_B),
  },
  {
    id: "cam-2-s2",
    stepLabel: "S2",
    name: "Design",
    status: "In Progress",
    dueDate: "25 Jan 26",
    commentsCount: 2,
    members: toWorkflowMembers(MEMBERS_B),
  },
  {
    id: "cam-2-s3",
    stepLabel: "S3",
    name: "Legal",
    status: "Not Started",
    dueDate: "02 Feb 26",
    members: toWorkflowMembers(MEMBERS_B),
  },
  {
    id: "cam-2-s4",
    stepLabel: "S4",
    name: "Final",
    status: "Not Started",
    dueDate: "02 Feb 26",
    members: toWorkflowMembers(MEMBERS_B),
  },
];

const STAGES_C: WorkflowStage[] = [
  {
    id: "cam-3-s1",
    stepLabel: "S1",
    name: "Content Edit",
    status: "Approved",
    dueDate: "20 Jan 26",
    commentsCount: 4,
    members: toWorkflowMembers(MEMBERS_C),
  },
  {
    id: "cam-3-s2",
    stepLabel: "S2",
    name: "Review",
    status: "In Progress",
    dueDate: "26 Jan 26",
    commentsCount: 2,
    members: toWorkflowMembers(MEMBERS_C),
  },
  {
    id: "cam-3-s3",
    stepLabel: "S3",
    name: "Legal",
    status: "Not Started",
    dueDate: "02 Feb 26",
    members: toWorkflowMembers(MEMBERS_C),
  },
  {
    id: "cam-3-s4",
    stepLabel: "S4",
    name: "Final",
    status: "Not Started",
    dueDate: "02 Feb 26",
    members: toWorkflowMembers(MEMBERS_C),
  },
];

export const CAMPAIGN_DATA: CampaignRowData[] = [
  {
    id: "cam-1",
    campaignId: "CAM114025",
    title: "Summer allergies",
    endDate: "27 Oct 25",
    jobProgress: "1 of 3 completed",
    campaignStatus: "Started",
    ownerName: "Krutika",
    ownerAvatarUrl: "/uploads/avatar-1.jpg",
    team: "Team 1",
    reviewerName: "Pranali Goswami",
    campaignName: "Campaign Name 1",
    statusCategory: "in_progress",
    dueDateCategory: "in_progress",
    businessArea: "Dermatology",
    campaignType: "Seasonal",
    createdDate: "12 Sep 25",
    startDate: "18 Sep 25",
    members: MEMBERS_A,
    workflowStages: STAGES_A,
    assetTitle: "Summer allergies PPT",
    assetFormat: "PPT",
  },
  {
    id: "cam-2",
    campaignId: "CAM254953",
    title: "Employee roster",
    endDate: "02 Oct 25",
    jobProgress: "0 of 2 completed",
    campaignStatus: "Start Pending",
    ownerName: "Manasi",
    team: "Team 2",
    reviewerName: "Manasi P",
    campaignName: "Campaign Name 2",
    statusCategory: "not_started",
    dueDateCategory: "not_started",
    businessArea: "HR",
    campaignType: "Internal",
    createdDate: "28 Sep 25",
    startDate: "02 Oct 25",
    members: MEMBERS_B,
    workflowStages: STAGES_B,
    assetTitle: "Employee roster PPT",
    assetFormat: "PPT",
  },
  {
    id: "cam-3",
    campaignId: "CAM124040",
    title: "Winter campaign",
    endDate: "16 Oct 25",
    jobProgress: "4 of 4 completed",
    campaignStatus: "Completed",
    ownerName: "Girish",
    team: "Team 3",
    reviewerName: "Krutika K",
    campaignName: "Campaign Name 3",
    statusCategory: "complete",
    dueDateCategory: "complete",
    businessArea: "Wellness",
    campaignType: "Retention",
    createdDate: "05 Sep 25",
    startDate: "10 Sep 25",
    members: MEMBERS_C,
    workflowStages: STAGES_C,
    assetTitle: "Winter campaign PPT",
    assetFormat: "PPT",
  },
  {
    id: "cam-4",
    campaignId: "CAM124041",
    title: "Fall Vacay",
    endDate: "05 Oct 25",
    jobProgress: "2 of 4 completed",
    campaignStatus: "Started",
    jobStatusTag: "Late",
    ownerName: "Pooja",
    team: "Team 1",
    reviewerName: "Girish M",
    campaignName: "Campaign Name 4",
    statusCategory: "on_hold",
    dueDateCategory: "on_hold",
    businessArea: "Travel",
    campaignType: "Promo",
    createdDate: "21 Sep 25",
    startDate: "25 Sep 25",
    members: MEMBERS_B,
    workflowStages: STAGES_B,
    assetTitle: "Fall Vacay PPT",
    assetFormat: "PPT",
  },
  {
    id: "cam-5",
    campaignId: "CAM254954",
    title: "Summer campaign 2",
    endDate: "12 Nov 25",
    jobProgress: "0 of 3 completed",
    campaignStatus: "Start Pending",
    ownerName: "Kiran",
    team: "Team 2",
    reviewerName: "Pranali Goswami",
    campaignName: "Campaign Name 1",
    statusCategory: "not_started",
    dueDateCategory: "not_started",
    businessArea: "Benefits",
    campaignType: "Internal",
    createdDate: "02 Oct 25",
    startDate: "07 Oct 25",
    members: MEMBERS_A,
    workflowStages: STAGES_A,
    assetTitle: "Summer campaign 2 PPT",
    assetFormat: "PPT",
    subRows: [
      {
        id: "cam-5-sub-1",
        jobNumber: "JB61601",
        title: "Employee booklet DOC",
        endDate: "DD/MM/YY",
        jobProgress: "0 of 3 completed",
        campaignStatus: "Start Pending",
        ownerName: "Kiran",
      },
      {
        id: "cam-5-sub-2",
        jobNumber: "JB61602",
        title: "Employee booklet Dft",
        endDate: "DD/MM/YY",
        jobProgress: "0 of 3 completed",
        campaignStatus: "Start Pending",
        ownerName: "Kiran",
      },
      {
        id: "cam-5-sub-3",
        jobNumber: "JB61603",
        title: "Employee booklet PPT",
        endDate: "DD/MM/YY",
        jobProgress: "0 of 3 completed",
        campaignStatus: "Start Pending",
        ownerName: "Kiran",
      },
    ],
  },
  {
    id: "cam-6",
    campaignId: "CAM778812",
    title: "Holiday offers",
    endDate: "30 Nov 25",
    jobProgress: "1 of 6 completed",
    campaignStatus: "Started",
    ownerName: "Pranali",
    team: "Team 3",
    reviewerName: "Manasi P",
    campaignName: "Campaign Name 2",
    statusCategory: "live",
    dueDateCategory: "archive",
    businessArea: "Retail",
    campaignType: "Launch",
    createdDate: "14 Oct 25",
    startDate: "18 Oct 25",
    members: MEMBERS_C,
    workflowStages: STAGES_C,
    assetTitle: "Holiday offers PPT",
    assetFormat: "PPT",
  },
];
