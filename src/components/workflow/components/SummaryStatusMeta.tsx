import type { ReactNode } from "react";
import { WORKFLOW_COLOR_CLASSES } from "../styles";

interface SummaryStatusMetaProps {
  version: string;
  statusText: string;
  statusIcon?: ReactNode;
  className?: string;
}

export default function SummaryStatusMeta({
  version,
  statusText,
  statusIcon,
  className = "",
}: SummaryStatusMetaProps) {
  return (
    <div className={`mt-1 flex items-center gap-2 ${className}`}>
      <span className="rounded-full bg-workflow-version-bg text-workflow-version-text px-2 py-0.5 text-xs font-medium ">{version}</span>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${WORKFLOW_COLOR_CLASSES.summaryStatusBadge}`}
      >
        {statusIcon ? <span className="inline-flex items-center">{statusIcon}</span> : null}
        {statusText}
      </span>
    </div>
  );
}
