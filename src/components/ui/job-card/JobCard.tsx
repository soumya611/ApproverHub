import type { ReactNode } from "react";
import CommentsBadge from "../comments/CommentsBadge";

export type JobCardStatus =
  | "In Progress"
  | "Complete"
  | "Completed"
  | "Start Pending"
  | "Uploading..."
  | "Upload Failed"
  | "Changes required"
  | "On hold";

export type JobCardTagTone =
  | "red"
  | "amber"
  | "orange"
  | "green"
  | "blue"
  | "teal"
  | "gray";

export interface JobCardData {
  title: string;
  description?: string;
  meta?: string;
  date?: string;
  status: JobCardStatus;
  statusLabel?: string;
  currentStage?: number;
  totalStages?: number;
  progressPercent?: number;
  chatCount?: number;
  tag?: string;
  tagTone?: JobCardTagTone;
  thumbnail?: ReactNode;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  thumbnailClassName?: string;
}

interface JobCardProps {
  card: JobCardData;
  className?: string;
  onClick?: () => void;
}

const TAG_TONE_CLASSES: Record<JobCardTagTone, string> = {
  red: "bg-red-500 text-white",
  amber: "bg-amber-500 text-white",
  orange: "bg-orange-500 text-white",
  green: "bg-green-500 text-white",
  blue: "bg-blue-500 text-white",
  teal: "bg-[#007B8C] text-white",
  gray: "bg-gray-500 text-white",
};

const STATUS_STYLES: Record<string, { text: string; bar: string }> = {
  "in progress": { text: "text-[#007B8C]", bar: "bg-[#007B8C]" },
  complete: { text: "text-green-700", bar: "bg-green-500" },
  completed: { text: "text-green-700", bar: "bg-green-500" },
  "start pending": { text: "text-gray-500", bar: "bg-gray-300" },
  "uploading...": { text: "text-[#007B8C]", bar: "bg-[#007B8C]" },
  "upload failed": { text: "text-red-700", bar: "bg-red-500" },
  "changes required": { text: "text-red-700", bar: "bg-red-500" },
  "on hold": { text: "text-amber-700", bar: "bg-amber-500" },
  default: { text: "text-gray-600", bar: "bg-gray-400" },
};

export default function JobCard({ card, className = "", onClick }: JobCardProps) {
  const {
    title,
    description,
    meta,
    date,
    status,
    statusLabel,
    currentStage,
    totalStages,
    chatCount,
    tag,
    tagTone,
    thumbnail,
    thumbnailSrc,
    thumbnailAlt,
    thumbnailClassName = "",
  } = card;

  const normalizedStatus = status.toLowerCase();
  const isComplete =
    normalizedStatus === "complete" || normalizedStatus === "completed";
  const statusKey = isComplete ? "complete" : normalizedStatus;
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.default;

  const hasStage =
    typeof currentStage === "number" &&
    typeof totalStages === "number" &&
    totalStages > 0;

  const computedStatusLabel =
    statusLabel ??
    (hasStage
      ? `${status} (stage ${currentStage} of ${totalStages})`
      : isComplete
        ? "Completed"
        : status);

  const resolvedTagTone: JobCardTagTone =
    tagTone ?? (tag?.toLowerCase() === "urgent" ? "red" : "gray");

  const renderThumbnail = () => {
    if (thumbnail) {
      return (
        <div className={`h-full w-full ${thumbnailClassName}`}>{thumbnail}</div>
      );
    }

    if (thumbnailSrc) {
      return (
        <img
          src={thumbnailSrc}
          alt={thumbnailAlt ?? title}
          className={`h-full w-full object-cover ${thumbnailClassName}`}
        />
      );
    }

    return (
      <div
        className={`h-full w-full bg-gradient-to-br from-[#FFD3C1] via-[#F8D7E1] to-[#D9E7FF] ${thumbnailClassName}`}
      />
    );
  };

  const componentProps = onClick
    ? { type: "button" as const, onClick }
    : {};
  const Component = onClick ? "button" : "div";

  return (
    <Component
      {...componentProps}
      className={`relative w-1/0.5 overflow-hidden rounded-sm border border-gray-200 bg-white text-left shadow-sm transition ${onClick ? "hover:shadow-md" : ""} ${className}`}
    >
      <div className="relative h-28 w-full overflow-hidden">
        {renderThumbnail()}
        {tag ? (
          <span
            className={`absolute right-0 top-2  px-2 py-0.5 text-[10px] rounded-tl-xs rounded-bl-xs font-semibold ${TAG_TONE_CLASSES[resolvedTagTone]}`}
          >
            {tag}
          </span>
        ) : null}
      </div>

      <div className="space-y-1 px-3 pb-2 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div
            className="text-sm font-semibold text-gray-900 leading-snug min-h-[36px] overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {title}
          </div>
          {date ? (
            <span className="text-[11px] text-gray-400 whitespace-nowrap">
              {date}
            </span>
          ) : null}
        </div>
        {description ? (
          <div className="text-xs text-gray-500">{description}</div>
        ) : null}
        {meta ? <div className="text-xs text-gray-400">{meta}</div> : null}
      </div>

      <div className="flex items-center justify-between px-3 pb-3">
        <span className={`text-xs font-medium ${statusStyle.text}`}>
          {computedStatusLabel}
        </span>
        <CommentsBadge
          count={chatCount}
          size="sm"
          className="text-gray-500"
        />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0">
        <div className={`h-[5px] w-full ${statusStyle.bar} rounded-b-xl`} />
      </div>
    </Component>
  );
}

