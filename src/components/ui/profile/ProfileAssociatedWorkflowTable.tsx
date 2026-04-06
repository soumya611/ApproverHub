import { VerticalDots } from "../../../icons";
import ProfileTableCheckbox from "./ProfileTableCheckbox";
import { TableHeaderRow } from "../table";
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
}

export default function ProfileAssociatedWorkflowTable({
  workflows,
  selectedIds,
  onToggleSelectAll,
  onToggleSelect,
  checkboxClassName = "",
}: ProfileAssociatedWorkflowTableProps) {
  const allSelected = workflows.length > 0 && selectedIds.size === workflows.length;
  const hasRows = workflows.length > 0;

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
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getWorkflowStatusClassName(
                        workflow.status
                      )}`}
                    >
                      {workflow.status}
                    </span>
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
                    <button
                      type="button"
                      className="rounded-full p-1 text-gray-400 hover:text-gray-600"
                      aria-label={`More options for ${workflow.workflowName}`}
                    >
                      <VerticalDots className="h-4 w-4" />
                    </button>
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
