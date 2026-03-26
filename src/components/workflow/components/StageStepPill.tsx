import type { ReactNode } from "react";
import Badge from "../../ui/badge/Badge";
import CommentsBadge from "../../ui/comments/CommentsBadge";
import StageStepConnector from "./StageStepConnector";

interface StageStepPillProps {
  stageLabel: string;
  title: string;
  isActive?: boolean;
  commentsCount?: number;
  showConnector?: boolean;
  className?: string;
  onClick?: () => void;
  variant?: "filled" | "outline" | "bordered";
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export default function StageStepPill({
  stageLabel,
  title,
  isActive = false,
  commentsCount,
  showConnector = false,
  className = "",
  onClick,
  variant = "filled",
  leftSlot,
  rightSlot,
}: StageStepPillProps) {
  const isFilled = variant === "filled";
  const isOutline = variant === "outline";

  const containerClasses = isFilled
    ? isActive
      ? "bg-[var(--color-primary-500)]"
      : "bg-[#EFF0F0] hover:bg-[var(--color-primary-500)]"
    : isOutline
      ? isActive
        ? "border border-[var(--color-primary-500)] bg-white"
        : "border border-transparent bg-[#EFF0F0]"
      : isActive
        ? "border border-[var(--color-primary-500)] bg-[#EFF0F0]"
        : "border border-transparent bg-[#EFF0F0]";

  const titleClasses = isFilled
    ? isActive
      ? "text-white"
      : "text-[#B0B0B0] group-hover:text-white"
    : "text-[var(--color-primary-500)]";

  const iconClasses = isFilled
    ? isActive
      ? "text-white"
      : "text-gray-400 group-hover:text-white"
    : "text-[var(--color-primary-500)]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`group relative inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors ${containerClasses} ${className}`}
    >
      {leftSlot ? <span className="flex items-center text-gray-300">{leftSlot}</span> : null}

      <span className="relative inline-flex items-center justify-center">
        <Badge
          variant="solid"
          color="light"
          size="sm"
          className="h-6 w-6 rounded-full !bg-[var(--color-primary-500)] p-0 text-[11px] text-white"
        >
          {stageLabel}
        </Badge>
        {showConnector ? <StageStepConnector /> : null}
      </span>

      <span className={`text-[14px] font-gilroy-semibold leading-none ${titleClasses}`}>
        {title}
      </span>

      {typeof commentsCount === "number" && commentsCount > 0 ? (
        <CommentsBadge
          count={commentsCount}
          size="sm"
          className="bg-transparent p-0"
          iconClassName={iconClasses}
          iconWrapperClassName="h-4 w-4"
        />
      ) : null}

      {rightSlot ? <span className="ml-auto flex items-center">{rightSlot}</span> : null}

    </button>
  );
}
