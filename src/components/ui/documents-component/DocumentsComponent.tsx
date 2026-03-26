import type { ReactNode } from "react";
import { Attachment } from "../../../icons";

export interface DocumentsComponentProps {
  title: ReactNode;
  fileType?: string;
  className?: string;
  badgeClassName?: string;
  titleClassName?: string;
  actionIcon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export default function DocumentsComponent({
  title,
  fileType = "PDF",
  className = "",
  badgeClassName = "",
  titleClassName = "",
  actionIcon,
  actionLabel = "Open document link",
  onAction,
  showAction = true,
}: DocumentsComponentProps) {
  const resolvedActionIcon =
    actionIcon ?? <Attachment className="h-5 w-5" />;

  return (
    <div
      className={`flex items-center gap-4 rounded-1xl border border-gray-100 bg-gray-100 px-4 py-3 shadow-sm font-gilroy-medium ${className}`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500 text-sm font-gilroy-medium text-white ${badgeClassName}`}
      >
        {fileType}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-gilroy-medium text-gray-800 ${titleClassName}`}
        >
          {title}
        </p>
      </div>
      {showAction ? (
        <button
          type="button"
          onClick={onAction}
          aria-label={actionLabel}
          className="rounded-full p-2 text-brand-500 transition hover:text-brand-600"
        >
          {resolvedActionIcon}
        </button>
      ) : null}
    </div>
  );
}
