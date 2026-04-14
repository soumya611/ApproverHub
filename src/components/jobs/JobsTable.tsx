import { useMemo, type ReactNode } from "react";
import { TableHeaderRow } from "../ui/table";
import type { ColumnConfigItem } from "../../data/columnsConfig";
import type { JobColumnId, JobRow as JobRowType } from "./types";
import JobRow from "./JobRow";
import { getStickyColumns } from "@/utils/stickyColumns";

const STICKY_SELECTION_COLUMN_WIDTH = 140;
const DEFAULT_STICKY_COLUMN_COUNT = 2;
const DEFAULT_STICKY_DATA_COLUMN_WIDTH = 150;

const DEFAULT_STICKY_COLUMN_WIDTHS: Partial<Record<JobColumnId, number>> = {
  campaign_id: 150,
  job_number: 150,
  job_name: 260,
  created: 140,
  status: 160,
  action: 140,
  owner: 120,
  assignee: 120,
};

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
  stickyColumnCount?: number;
  stickyColumnWidths?: Partial<Record<JobColumnId, number>>;
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
  stickyColumnCount = DEFAULT_STICKY_COLUMN_COUNT,
  stickyColumnWidths = DEFAULT_STICKY_COLUMN_WIDTHS,
}: JobsTableProps) {
  const allSelected =
    jobs.length > 0 && jobs.every((job) => selectedIds.has(job.id));
  const visibleColumnIds = useMemo(
    () => columns.map((column) => column.id as JobColumnId),
    [columns]
  );
  const stickyColumns = useMemo(
    () =>
      getStickyColumns({
        stickyColumnCount,
        prefixColumnWidths: [STICKY_SELECTION_COLUMN_WIDTH],
        visibleColumnIds,
        dataColumnWidths: stickyColumnWidths,
        defaultDataColumnWidth: DEFAULT_STICKY_DATA_COLUMN_WIDTH,
      }),
    [stickyColumnCount, stickyColumnWidths, visibleColumnIds]
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
          columnClassName={(column) => {
            const columnId = column.id as JobColumnId;
            const isSticky = stickyColumns.stickyDataColumnIds.has(columnId);

            return `py-3 px-4 ${
              isSticky
                ? "sticky z-20 bg-gray-50/80 shadow-[4px_0_6px_-6px_rgba(15,23,42,0.2)]"
                : ""
            }`;
          }}
          columnStyle={(column) => {
            const columnId = column.id as JobColumnId;

            if (!stickyColumns.stickyDataColumnIds.has(columnId)) {
              return undefined;
            }

            const width =
              stickyColumnWidths[columnId] ?? DEFAULT_STICKY_DATA_COLUMN_WIDTH;

            return {
              left: `${stickyColumns.stickyDataOffsets[columnId] ?? 0}px`,
              minWidth: `${width}px`,
              width: `${width}px`,
            };
          }}
          prefixCells={[
            {
              className: `${
                stickyColumns.stickyPrefixIndexes.has(0)
                  ? "sticky z-30 shadow-[4px_0_6px_-6px_rgba(15,23,42,0.2)]"
                  : ""
              } min-w-[140px] bg-gray-50/80 py-3 px-4 text-left text-gray-300`,
              style: {
                left: `${stickyColumns.stickyPrefixOffsets[0] ?? 0}px`,
                minWidth: `${STICKY_SELECTION_COLUMN_WIDTH}px`,
                width: `${STICKY_SELECTION_COLUMN_WIDTH}px`,
              },
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
            stickyDataColumnIds={stickyColumns.stickyDataColumnIds}
            stickyDataColumnOffsets={stickyColumns.stickyDataOffsets}
            stickyColumnWidths={stickyColumnWidths}
            stickySelectionColumnWidth={STICKY_SELECTION_COLUMN_WIDTH}
            isSelectionColumnSticky={stickyColumns.stickyPrefixIndexes.has(0)}
            selectionColumnOffset={stickyColumns.stickyPrefixOffsets[0] ?? 0}
            showSelection={showSelection}
            showEdit={showEdit}
          />
        ))}
      </tbody>
    </table>

  );
}
