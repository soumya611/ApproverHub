export type ColumnConfigItem = {
  id: string;
  label: string;
  checked: boolean;
  required?: boolean;
};

export const DEFAULT_COLUMNS: ColumnConfigItem[] = [
  { id: "campaign_id", label: "Campaign Id", checked: true, required: true },
  { id: "campaign_name", label: "Campaign name", checked: true, required: true },
  { id: "owner", label: "Owner", checked: true },
  { id: "business_area", label: "Business Area", checked: true },
  { id: "job_status", label: "Job Status", checked: true },
  { id: "campaign_status", label: "Campaign Status", checked: true },
  { id: "action", label: "Action", checked: true },
  { id: "campaign_type", label: "Campaign Type", checked: false },
  { id: "created_date", label: "Created Date", checked: false },
  { id: "start_date", label: "Start Date", checked: false },
  { id: "end_date", label: "End Date", checked: false },
  { id: "versions", label: "Versions", checked: false },
  { id: "stage", label: "Stage", checked: false },
  { id: "job_name", label: "Job Name", checked: false },
  { id: "job_id", label: "Job ID", checked: false },
];

export const normalizeColumns = (items: ColumnConfigItem[]) =>
  items.map((item) => (item.required ? { ...item, checked: true } : item));
