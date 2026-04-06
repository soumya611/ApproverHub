import { useMemo, type ReactNode } from "react";
import { TableHeaderRow } from "../ui/table";
import type { ColumnConfigItem } from "../../data/columnsConfig";
import type { JobColumnId, JobRow as JobRowType } from "./types";
import JobRow from "./JobRow";

interface JobsTableProps {
  jobs: JobRowType[];
  selectedIds: Set<string>;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onAssigneeClick?: (jobId: string) => void;
  onAction?: (jobId: string, actionId: string) => void;
  columns: ColumnConfigItem[];
  columnsMenu?: ReactNode;
  minWidth?: number;
  showSelection?: boolean;
  showEdit?: boolean;
}

export default function JobsTable({
  jobs,
  selectedIds,
  onToggleSelectAll,
  onToggleSelect,
  onEdit,
  onAssigneeClick,
  onAction,
  columns,
  columnsMenu,
  minWidth,
  showSelection = true,
  showEdit = true,
}: JobsTableProps) {
  const allSelected =
    jobs.length > 0 && jobs.every((job) => selectedIds.has(job.id));
  const visibleColumnIds = useMemo(
    () => columns.map((column) => column.id as JobColumnId),
    [columns]
  );

  return (
    <table
      className="w-full min-w-[900px] text-sm"
      style={minWidth ? { minWidth: `${minWidth}px` } : undefined}
    >
      <thead>
        <TableHeaderRow
          className="border-b border-gray-200 bg-gray-50/80 text-center text-[12px] font-bold text-gray-600"
          columns={columns}
          getColumnKey={(column) => column.id}
          renderColumn={(column) => column.label}
          columnClassName="py-3 px-4"
          prefixCells={[
            {
              className: "text-left py-3 px-4 text-gray-300",
              content: showSelection ? (
                <label className="flex items-center gap-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    className="h-4 w-4 columns-checkbox cursor-pointer"
                    aria-label="Select all jobs"
                  />
                  Select All
                </label>
              ) : null,
            },
          ]}
          suffixCells={[
            { className: "w-10 py-3 px-4", content: null },
            {
              className: "w-10 py-3 px-4",
              content: columnsMenu ?? null,
            },
          ]}
        />
      </thead>
      <tbody>
        {jobs.map((job) => (
          <JobRow
            key={job.id}
            job={job}
            isSelected={selectedIds.has(job.id)}
            onToggleSelect={() => onToggleSelect(job.id)}
            onEdit={() => onEdit(job.id)}
            onAssigneeClick={onAssigneeClick}
            onAction={onAction}
            visibleColumns={visibleColumnIds}
            showSelection={showSelection}
            showEdit={showEdit}
          />
        ))}
      </tbody>
    </table>

  );
}
