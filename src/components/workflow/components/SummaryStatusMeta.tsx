import type { ReactNode } from "react";

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
  const normalizedStatus = statusText.trim().toLowerCase();
  const statusClasses = (() => {
    if (
      normalizedStatus.includes("complete") ||
      normalizedStatus.includes("approved")
    ) {
      return "bg-[#ECFDF3] text-[#4BA100]";
    }

    if (normalizedStatus.includes("progress")) {
      return "bg-[var(--color-primary-50)] text-[var(--color-primary-500)]";
    }

    if (normalizedStatus.includes("not started")) {
      return "bg-[#F1F1F1] text-[#7A7A7A]";
    }

    return "bg-[#FEF2F2] text-[#DC2626]";
  })();

  return (
    <div className={`mt-1 flex items-center gap-2 ${className}`}>
      <span className="rounded-full bg-workflow-version-bg text-workflow-version-text px-2 py-0.5 text-xs font-medium ">{version}</span>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses}`}
      >
        {statusIcon ? <span className="inline-flex items-center">{statusIcon}</span> : null}
        {statusText}
      </span>
    </div>
  );
}
