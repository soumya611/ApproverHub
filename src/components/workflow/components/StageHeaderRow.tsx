import type { WorkflowStatus } from "../types";
import { getWorkflowStatusStyles } from "../styles";
import Badge from "../../ui/badge/Badge";

interface StageHeaderRowProps {
  stepLabel: string;
  status: WorkflowStatus;
}

export default function StageHeaderRow({ stepLabel, status }: StageHeaderRowProps) {
  const statusStyles = getWorkflowStatusStyles(status);

  return (
    <div className="mb-2 flex items-center justify-between gap-3">
       <Badge variant="light" color="light" size="sm">
{stepLabel}
       </Badge>
      {/* <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">{stepLabel}</span> */}
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles.badge}`}>{status}</span>
    </div>
  );
}
