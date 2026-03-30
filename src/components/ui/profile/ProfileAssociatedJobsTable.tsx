import { VerticalDots } from "../../../icons";
import type { JobRow as JobRowType } from "../../jobs/types";
import ProfileJobTag from "./ProfileJobTag";
import ProfileTableCheckbox from "./ProfileTableCheckbox";
import { TableHeaderRow } from "../table";
import UserCell from "../user-cell/UserCell";

const JOB_COLUMNS = [
  { id: "campaign_id", label: "Campaign ID" },
  { id: "job_id", label: "Job ID" },
  { id: "job_name", label: "Job Name" },
  { id: "status", label: "Status" },
  { id: "owner", label: "Owner" },
];

const getStatusClassName = (status: JobRowType["status"]) => {
  switch (status) {
    case "In Progress":
      return "bg-[#FFF7E6] text-[#D98B00]";
    case "Complete":
      return "bg-green-100 text-green-700";
    case "Changes required":
      return "bg-red-100 text-red-700";
    case "On hold":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

interface ProfileAssociatedJobsTableProps {
  jobs: JobRowType[];
  selectedIds: Set<string>;
  onToggleSelectAll: () => void;
  onToggleSelect: (jobId: string) => void;
}

export default function ProfileAssociatedJobsTable({
  jobs,
  selectedIds,
  onToggleSelectAll,
  onToggleSelect,
}: ProfileAssociatedJobsTableProps) {
  const allSelected = jobs.length > 0 && selectedIds.size === jobs.length;
  const hasJobs = jobs.length > 0;

  return (
    <div className="overflow-x-auto px-3 py-3">
      <table className="w-full min-w-[900px] border-separate border-spacing-y-3 text-sm">
        <thead>
          <TableHeaderRow
            className="text-left text-sm text-gray-700"
            columns={JOB_COLUMNS}
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
                  />
                ),
              },
            ]}
            suffixCells={[{ className: "px-4 py-2 text-right", content: "" }]}
          />
        </thead>
        <tbody>
          {hasJobs ? (
            jobs.map((job) => {
              const baseCellClass = "border-y border-gray-200 bg-white px-4 py-3 align-middle";
              const leftCellClass = `${baseCellClass} border-l rounded-l-lg`;
              const rightCellClass = `${baseCellClass} border-r rounded-r-lg text-right`;
              const ownerMember = job.members?.find((member) => member.initials === job.owner);

              return (
                <tr key={job.id} className="text-sm text-gray-700">
                  <td className={leftCellClass}>
                    <ProfileTableCheckbox
                      checked={selectedIds.has(job.id)}
                      onChange={() => onToggleSelect(job.id)}
                      aria-label={`Select ${job.jobName}`}
                    />
                  </td>
                  <td className={baseCellClass}>{job.campaignId}</td>
                  <td className={baseCellClass}>{job.jobNumber}</td>
                  <td className={baseCellClass}>
                    <div className="flex flex-col gap-1">
                      <ProfileJobTag tag={job.tag} />
                      <span className="text-gray-800">{job.jobName}</span>
                    </div>
                  </td>
                  <td className={baseCellClass}>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-normal ${getStatusClassName(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className={baseCellClass}>
                    <UserCell
                      // title={ownerMember?.name ?? job.owner}
                      avatarAlt={job.owner}
                      avatarUrl={ownerMember?.avatarUrl}
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
                      aria-label={`More options for ${job.jobName}`}
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
                colSpan={JOB_COLUMNS.length + 2}
                className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400"
              >
                No associated jobs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
