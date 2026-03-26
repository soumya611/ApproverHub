import type { ReactNode } from "react";
import type { JobTrackerSummary } from "./types";
import SummaryAssetPreview from "./components/SummaryAssetPreview";
import SummaryInfoBlock from "./components/SummaryInfoBlock";

interface JobTrackerSummaryCardProps {
  summary: JobTrackerSummary;
  statusIcon?: ReactNode;
  className?: string;
}

export default function JobTrackerSummaryCard({
  summary,
  statusIcon,
  className = "",
}: JobTrackerSummaryCardProps) {
  return (
    <div className={`workflow-summary-card border-t border-b border-r border-gray-200 bg-gray-50/60 p-3 sm:p-4 ${className}`}>
      <div className="flex gap-3">
        <SummaryAssetPreview imageUrl={summary.imageUrl} title={summary.title} format={summary.format} />
        <SummaryInfoBlock
          title={summary.title}
          version={summary.version}
          statusText={summary.statusText}
          statusIcon={statusIcon}
          dueDate={summary.dueDate}
          ageText={summary.ageText}
        />
      </div>
    </div>
  );
}
