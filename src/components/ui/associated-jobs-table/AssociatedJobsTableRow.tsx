import { useEffect, useState } from "react";
import type { JobRow as JobRowType } from "../../jobs/types";
import { getStatusClass } from "../../jobs/types";
import Popup from "../popup/Popup";
import { VerticalDots } from "../../../icons";

interface AssociatedJobsTableRowProps {
  job: JobRowType;
  created: string;
  deadline?: string;
  isSelected: boolean;
  onToggleSelect: () => void;
  onRemove?: () => void;
}

const TAG_CLASS =
  "inline-flex items-center rounded-sm border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-500";

export default function AssociatedJobsTableRow({
  job,
  created,
  deadline,
  isSelected,
  onToggleSelect,
  onRemove,
}: AssociatedJobsTableRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const baseCellClass =
    "border-y border-gray-200 bg-white px-4 py-3 align-middle";
  const leftCellClass = `${baseCellClass} border-l rounded-l-lg`;
  const rightCellClass = `${baseCellClass} border-r rounded-r-lg text-right`;
  const menuItems = [
    {
      id: "remove",
      label: "Remove from campaign",
      onClick: () => {
        onRemove?.();
        setIsMenuOpen(false);
      },
    },
  ];

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".associated-job-menu")) return;
      setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <tr className="text-sm text-gray-700">
      <td className={leftCellClass}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="columns-checkbox h-4 w-4"
        />
      </td>
      <td className={baseCellClass}>{job.campaignId}</td>
      <td className={baseCellClass}>{job.jobNumber}</td>
      <td className={baseCellClass}>
        <div className="flex flex-col gap-1">
          {job.tag ? <span className={TAG_CLASS}>{job.tag}</span> : null}
          <span className="text-gray-800">{job.jobName}</span>
        </div>
      </td>
      <td className={baseCellClass + " text-gray-600"}>{created}</td>
      <td className={baseCellClass + " text-gray-600"}>{deadline ?? "--"}</td>
      <td className={baseCellClass}>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
            job.status
          )}`}
        >
          {job.status}
        </span>
      </td>
      <td className={baseCellClass}>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#007B8C] text-xs font-semibold text-white">
          {job.owner}
        </span>
      </td>
      <td className={rightCellClass}>
        <div className="associated-job-menu relative inline-flex justify-end">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600"
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            <VerticalDots className="h-4 w-4" />
          </button>
          {isMenuOpen ? (
            <div className="absolute right-0 top-full z-30 mt-2">
              <Popup items={menuItems} className="!min-w-[180px] rounded-lg" />
            </div>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
