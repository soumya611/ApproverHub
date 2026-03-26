import type { JobRow as JobRowType } from "../../jobs/types";
import Button from "../button/Button";
import UserCell from "../user-cell/UserCell";

interface AddJobTableRowProps {
  job: JobRowType;
  isAdded?: boolean;
  onAdd: () => void;
}

export default function AddJobTableRow({
  job,
  isAdded = false,
  onAdd,
}: AddJobTableRowProps) {
  const baseCellClass =
    "border-y border-gray-200 bg-white px-4 py-3 align-middle";
  const leftCellClass = `${baseCellClass} border-l rounded-l-lg`;
  const rightCellClass = `${baseCellClass} border-r rounded-r-lg text-right`;

  return (
    <tr className="text-sm text-gray-700">
      <td className={leftCellClass}>{job.jobNumber}</td>
      <td className={baseCellClass}>{job.jobName}</td>
      <td className={baseCellClass}>{job.created}</td>
      <td className={baseCellClass}>
        <span className="text-sm text-gray-600">{job.status}</span>
      </td>
      <td className={baseCellClass}>
        <UserCell
          title={job.owner}
          avatarUrl=""
          avatarSize="xsmall"
          className="gap-2"
          contentClassName="leading-tight"
          titleClassName="text-sm font-medium text-gray-700"
        />
      </td>
      <td className={rightCellClass}>
        <Button
          type="button"
          size="tiny"
          variant="secondary"
          onClick={onAdd}
          disabled={isAdded}
          className={`!min-w-[72px] !rounded-md !px-3 !py-1 !text-xs !font-semibold ${
            isAdded
              ? "cursor-not-allowed !bg-gray-100 !text-gray-400 !border-gray-200"
              : "!bg-[#FFECE6] !text-[#F25C54] !border-[#FFECE6] hover:!bg-[#FFD9CF]"
          }`}
        >
          {isAdded ? "Added" : "Add"}
        </Button>
      </td>
    </tr>
  );
}
