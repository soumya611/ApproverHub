export type ColumnConfigItem = {
  id: string;
  defaultLabel?: string;
  label: string;
  dataType?: CampaignFieldDataType;
  checked: boolean;
  required?: boolean;
};

export const CAMPAIGN_FIELD_DATA_TYPES = [
  "String",
  "Text",
  "Long Text",
  "Number",
  "Integer",
  "Decimal",
  "Currency",
  "Percentage",
  "Date",
  "Date Time",
  "Time",
  "Boolean",
  "Email",
  "Phone",
  "URL",
  "UUID",
  "JSON",
] as const;

export type CampaignFieldDataType = (typeof CAMPAIGN_FIELD_DATA_TYPES)[number];

export const DEFAULT_CAMPAIGN_FIELD_DATA_TYPE: CampaignFieldDataType = "String";

export const DEFAULT_COLUMNS: ColumnConfigItem[] = [
  {
    id: "campaign_id",
    defaultLabel: "Campaign Id",
    label: "Campaign Id",
    dataType: "String",
    checked: true,
    required: true,
  },
  {
    id: "campaign_name",
    defaultLabel: "Campaign name",
    label: "Campaign name",
    dataType: "String",
    checked: true,
    required: true,
  },
  {
    id: "owner",
    defaultLabel: "Owner",
    label: "Owner",
    dataType: "String",
    checked: true,
  },
  {
    id: "business_area",
    defaultLabel: "Business Area",
    label: "Business Area",
    dataType: "String",
    checked: true,
  },
  {
    id: "job_status",
    defaultLabel: "Job Status",
    label: "Job Status",
    dataType: "String",
    checked: true,
  },
  {
    id: "campaign_status",
    defaultLabel: "Campaign Status",
    label: "Campaign Status",
    dataType: "String",
    checked: true,
  },
  {
    id: "action",
    defaultLabel: "Action",
    label: "Action",
    dataType: "String",
    checked: true,
  },
  {
    id: "campaign_type",
    defaultLabel: "Campaign Type",
    label: "Campaign Type",
    dataType: "String",
    checked: false,
  },
  {
    id: "created_date",
    defaultLabel: "Created Date",
    label: "Created Date",
    dataType: "Date",
    checked: false,
  },
  {
    id: "start_date",
    defaultLabel: "Start Date",
    label: "Start Date",
    dataType: "Date",
    checked: false,
  },
  {
    id: "end_date",
    defaultLabel: "End Date",
    label: "End Date",
    dataType: "Date",
    checked: false,
  },
  {
    id: "versions",
    defaultLabel: "Versions",
    label: "Versions",
    dataType: "String",
    checked: false,
  },
  {
    id: "stage",
    defaultLabel: "Stage",
    label: "Stage",
    dataType: "String",
    checked: false,
  },
  {
    id: "job_name",
    defaultLabel: "Job Name",
    label: "Job Name",
    dataType: "String",
    checked: false,
  },
  {
    id: "job_id",
    defaultLabel: "Job ID",
    label: "Job ID",
    dataType: "String",
    checked: false,
  },
];

export const normalizeColumns = (items: ColumnConfigItem[]): ColumnConfigItem[] =>
  items.map((item, index) => {
    const fallbackLabel = `Field ${index + 1}`;
    const normalizedDefaultLabel =
      item.defaultLabel?.trim() || item.label?.trim() || fallbackLabel;
    const normalizedLabel = item.label?.trim() || normalizedDefaultLabel;
    const normalizedDataType = CAMPAIGN_FIELD_DATA_TYPES.includes(
      item.dataType as CampaignFieldDataType
    )
      ? (item.dataType as CampaignFieldDataType)
      : DEFAULT_CAMPAIGN_FIELD_DATA_TYPE;
    const required = Boolean(item.required);

    return {
      ...item,
      defaultLabel: normalizedDefaultLabel,
      label: normalizedLabel,
      dataType: normalizedDataType,
      required,
      checked: required ? true : Boolean(item.checked),
    };
  });
