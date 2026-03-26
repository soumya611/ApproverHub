import type { ReactNode } from "react";
import WorkflowDateMeta from "./WorkflowDateMeta";
import SummaryTitle from "./SummaryTitle";
import SummaryStatusMeta from "./SummaryStatusMeta";

interface SummaryInfoBlockProps {
  title: string;
  version: string;
  statusText: string;
  statusIcon?: ReactNode;
  dueDate: string;
  ageText: string;
}

export default function SummaryInfoBlock({
  title,
  version,
  statusText,
  statusIcon,
  dueDate,
  ageText,
}: SummaryInfoBlockProps) {
  return (
    <div className="min-w-0">
      <SummaryTitle title={title} />
      <SummaryStatusMeta version={version} statusText={statusText} statusIcon={statusIcon} />

      <WorkflowDateMeta date={dueDate} ageText={ageText} className="mt-3" />
    </div>
  );
}
