import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { VerticalDots } from "../../../icons";
import Popup, { type PopupItem } from "../popup/Popup";
import ProfileTableCheckbox from "./ProfileTableCheckbox";
import { TableHeaderRow } from "../table";
import ToggleSwitch from "../toggle/ToggleSwitch";
import UserCell from "../user-cell/UserCell";

const WORKFLOW_COLUMNS = [
  { id: "workflow_id", label: "Workflow ID" },
  { id: "workflow_name", label: "Workflow Name" },
  { id: "stages", label: "Stages" },
  { id: "linked_jobs", label: "Linked Jobs" },
  { id: "status", label: "Status" },
  { id: "owner", label: "Owner" },
];

export interface ProfileWorkflowRow {
  id: string;
  workflowId: string;
  workflowName: string;
  stages: number;
  linkedJobs: number;
  status: "In Progress" | "Not Started" | "Complete";
  ownerInitials: string;
  ownerName?: string;
  ownerAvatarUrl?: string;
}

const getWorkflowStatusClassName = (status: ProfileWorkflowRow["status"]) => {
  switch (status) {
    case "In Progress":
      return "bg-[#FFF7E6] text-[#D98B00]";
    case "Complete":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

interface ProfileAssociatedWorkflowTableProps {
  workflows: ProfileWorkflowRow[];
  selectedIds: Set<string>;
  onToggleSelectAll: () => void;
  onToggleSelect: (workflowId: string) => void;
  checkboxClassName?: string;
  getIsActive?: (workflow: ProfileWorkflowRow) => boolean;
  onToggleActive?: (workflowId: string, isActive: boolean) => void;
  getRowActionItems?: (workflow: ProfileWorkflowRow) => PopupItem[];
}

export default function ProfileAssociatedWorkflowTable({
  workflows,
  selectedIds,
  onToggleSelectAll,
  onToggleSelect,
  checkboxClassName = "",
  getIsActive,
  onToggleActive,
  getRowActionItems,
}: ProfileAssociatedWorkflowTableProps) {
  const allSelected = workflows.length > 0 && selectedIds.size === workflows.length;
  const hasRows = workflows.length > 0;
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!openActionId) return;
    const hasWorkflow = workflows.some((workflow) => workflow.id === openActionId);
    if (!hasWorkflow) {
      setOpenActionId(null);
    }
  }, [openActionId, workflows]);

  useEffect(() => {
    if (!openActionId) return;
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest(".profile-workflow-row-actions")) {
        setOpenActionId(null);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [openActionId]);

  return (
    <div className="overflow-x-auto px-3 py-3">
      <table className="w-full min-w-[980px] border-separate border-spacing-y-3 text-sm">
        <thead>
          <TableHeaderRow
            className="text-left text-sm text-gray-700"
            columns={WORKFLOW_COLUMNS}
            getColumnKey={(column) => column.id}
            renderColumn={(column) => column.label}
            columnClassName="px-4 py-2 !font-medium"
            prefixCells={[
              {
                className: "px-4 py-2",
                content: (
                  <ProfileTableCheckbox
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    label="Select all"
                    inputClassName={checkboxClassName}
                  />
                ),
              },
            ]}
            suffixCells={[{ className: "px-4 py-2 text-right", content: "" }]}
          />
        </thead>
        <tbody>
          {hasRows ? (
            workflows.map((workflow) => {
              const baseCellClass = "border-y border-gray-200 bg-white px-4 py-3 align-middle";
              const leftCellClass = `${baseCellClass} border-l rounded-l-lg`;
              const rightCellClass = `${baseCellClass} border-r rounded-r-lg text-right`;
              const isActive = getIsActive ? getIsActive(workflow) : true;
              const rowActionItems = (getRowActionItems?.(workflow) ?? []).map((item) => ({
                ...item,
                onClick: item.onClick
                  ? (event: ReactMouseEvent<HTMLButtonElement>) => {
                      item.onClick?.(event);
                      setOpenActionId(null);
                    }
                  : undefined,
              }));
              const hasActionItems = rowActionItems.length > 0;

              return (
                <tr key={workflow.id} className="text-sm text-gray-700">
                  <td className={leftCellClass}>
                    <ProfileTableCheckbox
                      checked={selectedIds.has(workflow.id)}
                      onChange={() => onToggleSelect(workflow.id)}
                      aria-label={`Select ${workflow.workflowName}`}
                      inputClassName={checkboxClassName}
                    />
                  </td>
                  <td className={baseCellClass}>{workflow.workflowId}</td>
                  <td className={baseCellClass}>{workflow.workflowName}</td>
                  <td className={baseCellClass}>{workflow.stages}</td>
                  <td className={baseCellClass}>{workflow.linkedJobs}</td>
                  <td className={baseCellClass}>
                    {onToggleActive ? (
                      <div className="flex items-center gap-2">
                        <ToggleSwitch
                          checked={isActive}
                          onChange={(checked) => onToggleActive(workflow.id, checked)}
                          showLabel={false}
                          size="sm"
                        />
                        <span className="text-sm text-gray-600">
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getWorkflowStatusClassName(
                          workflow.status
                        )}`}
                      >
                        {workflow.status}
                      </span>
                    )}
                  </td>
                  <td className={baseCellClass}>
                    <UserCell
                      // title={workflow.ownerName ?? workflow.ownerInitials}
                      avatarAlt={workflow.ownerInitials}
                      avatarUrl={workflow.ownerAvatarUrl}
                      avatarSize="xsmall"
                      avatarFallback="initials"
                      className="min-w-[120px] items-center"
                      titleClassName="text-xs font-medium text-gray-700"
                      contentClassName="max-w-[130px]"
                    />
                  </td>
                  <td className={rightCellClass}>
                    <div className="profile-workflow-row-actions relative inline-flex">
                      <button
                        type="button"
                        onClick={() => {
                          if (!hasActionItems) return;
                          setOpenActionId((current) =>
                            current === workflow.id ? null : workflow.id
                          );
                        }}
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600"
                        aria-label={`More options for ${workflow.workflowName}`}
                      >
                        <VerticalDots className="h-4 w-4" />
                      </button>
                      {hasActionItems && openActionId === workflow.id ? (
                        <div className="absolute right-0 top-full z-40 mt-2">
                          <Popup items={rowActionItems} className="!min-w-[120px] rounded-lg" />
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={WORKFLOW_COLUMNS.length + 2}
                className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400"
              >
                No associated workflows found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
