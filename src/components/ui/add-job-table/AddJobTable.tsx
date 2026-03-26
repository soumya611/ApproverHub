import { TableHeaderRow } from "../table";
import type { JobRow as JobRowType } from "../../jobs/types";
import AddJobTableRow from "./AddJobTableRow";

const ADD_JOB_COLUMNS = [
  { id: "job_id", label: "Job ID", width: "150px" },
  { id: "job_name", label: "Job name", width: "220px" },
  { id: "created", label: "Created", width: "120px" },
  { id: "status", label: "Status", width: "130px" },
  { id: "owner", label: "Owner", width: "160px" },
];

const ACTION_COLUMN_WIDTH = "120px";

interface AddJobTableProps {
  jobs: JobRowType[];
  addedIds?: Set<string>;
  onAddJob: (job: JobRowType) => void;
}

export default function AddJobTable({
  jobs,
  addedIds,
  onAddJob,
}: AddJobTableProps) {
  const renderColGroup = () => (
    <colgroup>
      {ADD_JOB_COLUMNS.map((column) => (
        <col key={column.id} style={{ width: column.width }} />
      ))}
      <col style={{ width: ACTION_COLUMN_WIDTH }} />
    </colgroup>
  );

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[860px]">
        <table className="w-full table-fixed text-sm">
          {renderColGroup()}
          <thead>
            <TableHeaderRow
              className="text-left text-xs font-semibold text-gray-500"
              columns={ADD_JOB_COLUMNS}
              getColumnKey={(column) => column.id}
              renderColumn={(column) => column.label}
              columnClassName="px-4 py-2"
              suffixCells={[{ className: "px-4 py-2 text-right", content: "" }]}
            />
          </thead>
        </table>

        <div className="mt-2 rounded-xl border border-gray-200 bg-white p-2">
          <table className="w-full table-fixed border-separate border-spacing-y-2 text-sm">
            {renderColGroup()}
            <tbody>
              {jobs.map((job) => (
                <AddJobTableRow
                  key={job.id}
                  job={job}
                  isAdded={addedIds?.has(job.id)}
                  onAdd={() => onAddJob(job)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
