import { useEffect, useMemo, useState } from "react";
import Avatar from "../avatar/Avatar";
import Popup, { type PopupItem } from "../popup/Popup";
import { ChevronDownIcon, ChevronUpIcon, EditDetailsIcon } from "../../../icons";
import Tag, { TagTone } from "../tag";
import { JobTag } from "../../jobs";

export type CampaignStatus = "Start Pending" | "Started" | "Completed";
export type CampaignColumnId = string;

const DEFAULT_COLUMN_ORDER: CampaignColumnId[] = [
  "campaign_id",
  "campaign_name",
  "end_date",
  "job_status",
  "campaign_status",
  "action",
  "owner",
];

const TAG_TONE_MAP: Record<Exclude<JobTag, null>, TagTone> = {
  Urgent: "urgent",
  "Expiry Due": "warning",
  Late: "urgent",
  Expired: "neutral",
};
export interface CampaignSubRow {
  id: string;
  jobNumber: string;
  title: string;
  endDate: string;
  jobProgress: string;
  campaignStatus: CampaignStatus;
  ownerName: string;
  ownerAvatarUrl?: string;
  actionItems?: PopupItem[];
  actionLabel?: string;
}

export interface CampaignTableRowProps {
  campaignId: string;
  title: string;
  endDate: string;
  jobProgress: string;
  campaignStatus: CampaignStatus;
  jobStatusTag?: "Late" | null;
  ownerName: string;
  ownerAvatarUrl?: string;
  businessArea?: string;
  campaignType?: string;
  createdDate?: string;
  startDate?: string;
  campaignName?: string;
  subRows?: CampaignSubRow[];
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  actionItems?: PopupItem[];
  actionLabel?: string;
  onAction?: (actionId: string) => void;
  onEdit?: () => void;
  className?: string;
  visibleColumns?: CampaignColumnId[];
}

const STATUS_CLASS: Record<CampaignStatus, string> = {
  "Start Pending": "text-gray-400",
  Started: "text-gray-500",
  Completed: "text-gray-500",
};

const getDefaultActions = (
  status: CampaignStatus
): { label: string; items: PopupItem[] } => {
  if (status === "Start Pending") {
    return {
      label: "Start",
      items: [
        { id: "start-campaign", label: "Start Campaign" },
        { id: "start-on-date", label: "Start on date" },
      ],
    };
  }

  if (status === "Completed") {
    return {
      label: "Archive",
      items: [{ id: "archive", label: "Archive" }],
    };
  }

  return {
    label: "Action",
    items: [],
  };
};

export default function CampaignTableRow({
  campaignId,
  title,
  endDate,
  jobProgress,
  campaignStatus,
  jobStatusTag = null,
  ownerName,
  ownerAvatarUrl,
  businessArea,
  campaignType,
  createdDate,
  startDate,
  campaignName,
  subRows,
  isSelected = false,
  onToggleSelect,
  isExpanded = false,
  onToggleExpand,
  actionItems,
  actionLabel,
  onAction,
  onEdit,
  className = "",
  visibleColumns,
}: CampaignTableRowProps) {
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const defaultActionConfig = useMemo(
    () => getDefaultActions(campaignStatus),
    [campaignStatus]
  );
  const resolvedSubRows = subRows ?? [];
  const hasSubRows = resolvedSubRows.length > 0;
  const isExpandedWithRows = isExpanded && hasSubRows;

  const resolvedActionLabel = actionLabel ?? defaultActionConfig.label;
  const resolvedItems = actionItems ?? defaultActionConfig.items;
  const hasActions = resolvedItems.length > 0;
  const resolvedColumns = visibleColumns ?? DEFAULT_COLUMN_ORDER;
  const resolvedCampaignName = campaignName ?? title;

  const menuItems = useMemo(() => {
    return resolvedItems.map((item) => ({
      ...item,
      onClick: (event) => {
        item.onClick?.(event);
        onAction?.(item.id);
        setOpenActionId(null);
      },
    }));
  }, [resolvedItems, onAction]);

  useEffect(() => {
    if (!openActionId) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".campaign-action-menu")) return;
      setOpenActionId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openActionId]);

  const showCheckbox = Boolean(onToggleSelect);
  const showExpand = Boolean(onToggleExpand && hasSubRows);
  const baseCellClass =
    "border-y border-gray-200 bg-white px-3 py-3 align-middle text-sm text-gray-600 transition-colors group-hover:bg-gray-50";
  const leftCellClass = `${baseCellClass} border-l ${
    isExpandedWithRows ? "rounded-tl-sm" : "rounded-l-sm"
  }`;
  const rightCellClass = `${baseCellClass} border-r ${
    isExpandedWithRows ? "rounded-tr-sm" : "rounded-r-sm"
  }`;
  const subBaseCellClass =
    "border-b border-gray-100 bg-white px-3 py-2 align-middle text-xs text-gray-500";

  const renderMainCell = (columnId: CampaignColumnId) => {
    switch (columnId) {
      case "campaign_id":
        return (
          <td key={columnId} className={baseCellClass}>
            <span className="font-semibold text-gray-900">{campaignId}</span>
          </td>
        );
      case "campaign_name":
        return (
          <td key={columnId} className={baseCellClass}>
            <span className="font-semibold text-gray-800">
              {resolvedCampaignName}
            </span>
          </td>
        );
      case "owner":
        return (
          <td key={columnId} className={baseCellClass}>
            <Avatar
              src={ownerAvatarUrl ?? ""}
              alt={ownerName || "Owner"}
              size="xsmall"
              fallbackType="initials"
            />
          </td>
        );
      case "business_area":
        return (
          <td key={columnId} className={baseCellClass}>
            <span className="text-gray-500">{businessArea ?? "--"}</span>
          </td>
        );
      case "job_status":
        return (
          <td key={columnId} className={baseCellClass}>
            <div className="flex flex-col gap-1">
              {jobStatusTag ? (
                <Tag tone={TAG_TONE_MAP[jobStatusTag]} size="xs" rounded="none">
                                  {jobStatusTag}
                                </Tag>
                // <span className="inline-flex w-fit items-center border border-red-400 bg-red-100 px-2 py-0.1 text-[9px] font-semibold text-red-600">
                //   {jobStatusTag}
                // </span>
              ) : null}
              <span className="font-medium text-gray-800">{jobProgress}</span>
            </div>
          </td>
        );
      case "campaign_status":
        return (
          <td key={columnId} className={baseCellClass}>
            <span
              className={`text-sm font-medium ${STATUS_CLASS[campaignStatus]}`}
            >
              {campaignStatus}
            </span>
          </td>
        );
      case "action":
        return (
          <td key={columnId} className={baseCellClass}>
            {hasActions ? (
              <div className="campaign-action-menu relative inline-flex">
                <button
                  type="button"
                  onClick={() =>
                    setOpenActionId((prev) =>
                      prev === "parent" ? null : "parent"
                    )
                  }
                  className="inline-flex items-center gap-1 bg-gray-200 px-4 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                  aria-haspopup="menu"
                  aria-expanded={openActionId === "parent"}
                >
                  {resolvedActionLabel}
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
                {openActionId === "parent" ? (
                  <div className="absolute right-0 top-full z-30 mt-2">
                    <Popup
                      items={menuItems}
                      className="!min-w-[170px] rounded-lg"
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <span className="text-xs text-gray-300">--</span>
            )}
          </td>
        );
      case "campaign_type":
        return (
          <td key={columnId} className={baseCellClass}>
            <span className="text-gray-500">{campaignType ?? "--"}</span>
          </td>
        );
      case "created_date":
        return (
          <td key={columnId} className={baseCellClass}>
            <span className="text-gray-500">{createdDate ?? "--"}</span>
          </td>
        );
      case "start_date":
        return (
          <td key={columnId} className={baseCellClass}>
            <span className="text-gray-500">{startDate ?? "--"}</span>
          </td>
        );
      case "end_date":
        return (
          <td key={columnId} className={baseCellClass}>
            <span className="text-gray-500">{endDate}</span>
          </td>
        );
      default:
        return (
          <td key={columnId} className={baseCellClass}>
            <span className="text-gray-300">--</span>
          </td>
        );
    }
  };

  const renderSubCell = (
    subRow: CampaignSubRow,
    columnId: CampaignColumnId,
    subActionLabel: string,
    subMenuItems: PopupItem[]
  ) => {
    switch (columnId) {
      case "campaign_id":
        return (
          <td key={columnId} className={subBaseCellClass}>
            <div className="relative pl-4">
              <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-gray-200" />
              <span className="text-gray-600">{subRow.jobNumber}</span>
            </div>
          </td>
        );
      case "campaign_name":
        return (
          <td key={columnId} className={subBaseCellClass}>
            <span className="text-gray-600">{subRow.title}</span>
          </td>
        );
      case "owner":
        return (
          <td key={columnId} className={subBaseCellClass}>
            <Avatar
              src={subRow.ownerAvatarUrl ?? ""}
              alt={subRow.ownerName || "Owner"}
              size="xsmall"
              fallbackType="initials"
            />
          </td>
        );
      case "business_area":
      case "campaign_type":
      case "created_date":
      case "start_date":
        return (
          <td key={columnId} className={subBaseCellClass}>
            <span className="text-[10px] text-gray-300">--</span>
          </td>
        );
      case "job_status":
        return (
          <td key={columnId} className={subBaseCellClass}>
            <span className="text-gray-600">{subRow.jobProgress}</span>
          </td>
        );
      case "campaign_status":
        return (
          <td key={columnId} className={subBaseCellClass}>
            <span className="text-xs text-gray-400">
              {subRow.campaignStatus}
            </span>
          </td>
        );
      case "action":
        return (
          <td key={columnId}  className={subBaseCellClass}>
            {subMenuItems.length ? (
              <div className="campaign-action-menu relative inline-flex">
                <button
                  type="button"
                  onClick={() =>
                    setOpenActionId((prev) =>
                      prev === subRow.id ? null : subRow.id
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1 text-[10px] font-medium text-gray-700 transition hover:bg-gray-50"
                  aria-haspopup="menu"
                  aria-expanded={openActionId === subRow.id}
                >
                  {subActionLabel}
                  <ChevronDownIcon className="h-3.5 w-3.5" />
                </button>
                {openActionId === subRow.id ? (
                  <div className="absolute right-0 top-full z-30 mt-2">
                    <Popup
                      items={subMenuItems}
                      className="!min-w-[160px] rounded-lg"
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <span className="text-[10px] text-gray-300">--</span>
            )}
          </td>
        );
      case "end_date":
        return (
          <td key={columnId} className={subBaseCellClass}>
            <span className="text-gray-400">{subRow.endDate}</span>
          </td>
        );
      default:
        return (
          <td key={columnId} className={subBaseCellClass}>
            <span className="text-[10px] text-gray-300">--</span>
          </td>
        );
    }
  };

  return (
    <>
      <tr className={`group ${className}`}>
        <td className={`${leftCellClass} w-10`}>
          {showCheckbox ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="h-4 w-4 columns-checkbox"
              aria-label={`Select ${campaignId}`}
            />
          ) : null}
        </td>
        <td className={`${baseCellClass} w-10`}>
          {showExpand ? (
            <button
              type="button"
              onClick={onToggleExpand}
              aria-label={isExpanded ? "Collapse row" : "Expand row"}
              aria-expanded={isExpanded}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          ) : null}
        </td>
        {resolvedColumns.map((columnId) => renderMainCell(columnId))}
        <td className={`${rightCellClass} w-10`}>
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-100 transition hover:bg-gray-100 hover:text-[#007B8C]"
              aria-label="Edit campaign"
            >
              <EditDetailsIcon className="h-4 w-4 text-gray-300" />
            </button>
          ) : null}
        </td>
      </tr>
      {isExpandedWithRows
        ? resolvedSubRows.map((subRow, index) => {
            const isLast = index === resolvedSubRows.length - 1;
            const subActionConfig = getDefaultActions(subRow.campaignStatus);
            const subActionLabel =
              subRow.actionLabel ?? subActionConfig.label;
            const subActionItems = subRow.actionItems ?? subActionConfig.items;
            const subMenuItems = subActionItems.map((item) => ({
              ...item,
              onClick: (event) => {
                item.onClick?.(event);
                setOpenActionId(null);
              },
            }));
            const subLeftCellClass = `${subBaseCellClass} border-l ${
              isLast ? "rounded-bl-xl" : ""
            }`;
            const subRightCellClass = `${subBaseCellClass} border-r ${
              isLast ? "rounded-br-xl" : ""
            }`;

            return (
              <tr key={subRow.id} className="group">
                <td className={`${subLeftCellClass} w-10`} />
                <td className={`${subBaseCellClass} w-10`}>
                  <div className="relative flex h-full items-stretch justify-center">
                    <span
                      className={`block w-px bg-gray-200 ${
                        isLast ? "h-4" : "h-full"
                      }`}
                    />
                  </div>
                </td>
                {resolvedColumns.map((columnId) =>
                  renderSubCell(subRow, columnId, subActionLabel, subMenuItems)
                )}
                <td className={`${subRightCellClass} w-10`} />
              </tr>
            );
          })
        : null}
    </>
  );
}
