import { useEffect, useMemo, useState } from "react";
import type { JobColumnId, JobRow as JobRowType, JobStatus } from "./types";
import { getStatusClass } from "./types";
import Popup, { type PopupItem } from "../ui/popup/Popup";
import Avatar from "../ui/avatar/Avatar";
import { ChevronDownIcon, EditDetailsIcon, InfoIcon, StatusIcon } from "../../icons";

const TAG_CLASS =
  "inline-flex w-fit items-center rounded-sm border border-red-400 bg-red-100 px-2 py-0.1 text-[9px] font-semibold text-red-600";

const DEFAULT_COLUMN_ORDER: JobColumnId[] = [
  "campaign_id",
  "job_number",
  "job_name",
  "created",
  "status",
  "action",
  "owner",
  "assignee",
];

const getDefaultActions = (
  status: JobStatus
): { label: string; items: PopupItem[] } => {
  if (status === "Start Pending") {
    return {
      label: "Start",
      items: [
        { id: "start-job", label: "Start Job" },
        { id: "start-on-date", label: "Start on date" },
      ],
    };
  }

  if (status === "Complete") {
    return {
      label: "Move To",
      items: [{ id: "archive", label: "Archive" }],
    };
  }

  if (status === "In Progress") {
    return {
      label: "Action",
      items: [{ id: "hold-job", label: "Hold Job" }],
    };
  }

  return {
    label: "Action",
    items: [],
  };
};

export default function JobRow({
  job,
  isSelected,
  onToggleSelect,
  onEdit,
  onAssigneeClick,
  onAction,
  visibleColumns,
  showSelection = true,
  showEdit = true,
}: {
  job: JobRowType;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onAssigneeClick?: (jobId: string) => void;
  onAction?: (jobId: string, actionId: string) => void;
  visibleColumns?: JobColumnId[];
  showSelection?: boolean;
  showEdit?: boolean;
}) {
  const [isActionOpen, setIsActionOpen] = useState(false);
  const defaultActionConfig = useMemo(
    () => getDefaultActions(job.status),
    [job.status]
  );
  const resolvedActionLabel = defaultActionConfig.label;
  const resolvedItems = defaultActionConfig.items;
  const hasActions = resolvedItems.length > 0;
  const resolvedColumns = visibleColumns ?? DEFAULT_COLUMN_ORDER;
  const showFailureReason = job.status === "Upload Failed";
  const failureReasonText = job.statusReason ?? "Upload failed";

  const menuItems = useMemo(
    () =>
      resolvedItems.map((item) => ({
        ...item,
        onClick: (event) => {
          item.onClick?.(event);
          onAction?.(job.id, item.id);
          setIsActionOpen(false);
        },
      })),
    [resolvedItems, onAction, job.id]
  );

  useEffect(() => {
    if (!isActionOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".job-action-menu")) return;
      setIsActionOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isActionOpen]);

  const renderCell = (columnId: JobColumnId) => {
    switch (columnId) {
      case "campaign_id":
        return (
          <td key={columnId} className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-gray-400"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18 9V3" />
                  <path d="M12 3v6" />
                  <path d="M6 3v12" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">
                {job.campaignId}
              </span>
            </div>
          </td>
        );
      case "job_number":
        return (
          <td key={columnId} className="py-3 px-4 text-gray-600 text-sm">
            {job.jobNumber}
          </td>
        );
      case "job_name":
        return (
          <td key={columnId} className="py-3 px-4">
            <div className="flex flex-col gap-0.5">
              {job.tag && <span className={TAG_CLASS}>{job.tag}</span>}
              <span className="text-gray-900">{job.jobName}</span>
            </div>
          </td>
        );
      case "created":
        return (
          <td key={columnId} className="py-3 px-4 text-gray-600 text-sm">
            {job.created}
          </td>
        );
      case "status":
        return (
          <td key={columnId} className="py-3 px-4">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(
                job.status
              )}`}
            >
              {job.status}
              {showFailureReason ? (
                <span className="relative group">
                  <InfoIcon className="w-3.5 h-3.5" />
                  <span className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-2 w-max max-w-[220px] -translate-x-1/2 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-600 shadow-lg opacity-0 transition group-hover:opacity-100">
                    {failureReasonText}
                  </span>
                </span>
              ) : null}
            </span>
          </td>
        );
      case "action":
        return (
          <td key={columnId} className="py-3 px-4">
            {hasActions ? (
              <div className="job-action-menu relative inline-flex">
                <button
                  type="button"
                  onClick={() => setIsActionOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50"
                  aria-haspopup="menu"
                  aria-expanded={isActionOpen}
                >
                  {resolvedActionLabel}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                {isActionOpen ? (
                  <div className="absolute right-0 top-full z-30 mt-2">
                    <Popup items={menuItems} className="!min-w-[170px] rounded-lg" />
                  </div>
                ) : null}
              </div>
            ) : (
              <span className="text-xs text-gray-300">--</span>
            )}
          </td>
        );
      case "owner":
        return (
          <td key={columnId} className="py-3 px-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-400">
              {job.owner}
            </span>
          </td>
        );
      case "assignee":
        return (
          <td key={columnId} className="py-3 px-4">
            {job.assignee ? (
              <Avatar
                src=""
                alt={job.assignee}
                size="small"
                fallbackType="initials"
              />
            ) : (
              <button
                type="button"
                onClick={() => onAssigneeClick?.(job.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-amber-600 transition hover:bg-amber-200"
                aria-label="Add assignee"
                title="Add assignee"
              >
               <StatusIcon className="h-8 w-8" />
              </button>
            )}
          </td>
        );
      default:
        return (
          <td key={columnId} className="py-3 px-4 text-gray-300">
            --
          </td>
        );
    }
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
      <td className="py-3 px-4 w-10">
        {showSelection ? (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 columns-checkbox"
          />
        ) : null}
      </td>
      {resolvedColumns.map((columnId) => renderCell(columnId))}
      <td className="py-3 px-4 w-10">
        {showEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-[#007B8C] rounded"
            aria-label="Edit"
          >
            <EditDetailsIcon className="w-4 h-4" />
          </button>
        ) : null}
      </td>
      <td className="py-3 px-4 w-10" />
    </tr>
  );
}
