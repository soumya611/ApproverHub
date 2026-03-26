import type { JobRow as JobRowType } from "../../jobs/types";
import { TableHeaderRow } from "../table";
import AssociatedJobsTableRow from "./AssociatedJobsTableRow";

const ASSOCIATED_COLUMNS = [
  { id: "campaign_id", label: "Campaign ID" },
  { id: "job_id", label: "Job ID" },
  { id: "job_name", label: "Job Name" },
  { id: "created", label: "Created" },
  { id: "deadline", label: "Deadline" },
  { id: "status", label: "Status" },
  { id: "owner", label: "Owner" },
];

interface AssociatedJobsTableProps {
  jobs: JobRowType[];
  selectedIds: Set<string>;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onRemoveJob?: (id: string) => void;
  getCreated?: (job: JobRowType) => string;
  getDeadline?: (job: JobRowType) => string;
}

export default function AssociatedJobsTable({
  jobs,
  selectedIds,
  onToggleSelectAll,
  onToggleSelect,
  onRemoveJob,
  getCreated,
  getDeadline,
}: AssociatedJobsTableProps) {
  const allSelected = jobs.length > 0 && selectedIds.size === jobs.length;
  const hasJobs = jobs.length > 0;

  return (
    <div className="overflow-x-auto ">
      <table className="w-full min-w-[900px] border-separate border-spacing-y-2 text-sm px-4">
        {hasJobs ? (
          <thead>
            <TableHeaderRow
              className="border-b border-gray-200 text-left text-sm font-medium text-gray-600"
              columns={ASSOCIATED_COLUMNS}
              getColumnKey={(column) => column.id}
              renderColumn={(column) => column.label}
              columnClassName="px-4 py-3"
              prefixCells={[
                {
                  className: "px-4 py-3 whitespace-nowrap",
                  content: (
                    <label className="inline-flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={onToggleSelectAll}
                        className="columns-checkbox h-4 w-4"
                      />
                      Select all
                    </label>
                  ),
                },
              ]}
              suffixCells={[{ className: "px-4 py-3 text-right", content: "" }]}
            />
          </thead>
        ) : null}
        <tbody>
          {!hasJobs ? (
            <tr>
              <td
                colSpan={ASSOCIATED_COLUMNS.length + 2}
                className="px-4 py-10 text-center text-sm text-gray-400"
              >
                No jobs associated as of now
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <AssociatedJobsTableRow
                key={job.id}
                job={job}
                created={getCreated?.(job) ?? job.created}
                deadline={getDeadline?.(job) ?? "--"}
                isSelected={selectedIds.has(job.id)}
                onToggleSelect={() => onToggleSelect(job.id)}
                onRemove={() => onRemoveJob?.(job.id)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
