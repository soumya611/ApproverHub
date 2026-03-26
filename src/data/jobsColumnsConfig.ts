import type { ColumnConfigItem } from "./columnsConfig";

export const DEFAULT_JOB_COLUMNS: ColumnConfigItem[] = [
  { id: "campaign_id", label: "Campaign ID", checked: true, required: true },
  { id: "job_number", label: "Job Number", checked: true, required: true },
  { id: "job_name", label: "Job Name", checked: true, required: true },
  { id: "created", label: "Created", checked: true },
  { id: "status", label: "Status", checked: true },
  { id: "action", label: "Action", checked: true },
  { id: "owner", label: "Owner", checked: true },
  { id: "assignee", label: "Assignee", checked: true },
];
