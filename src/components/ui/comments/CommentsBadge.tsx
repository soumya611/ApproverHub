import { Comments } from "../../../icons";

type CommentsBadgeSize = "sm" | "lg";

interface CommentsBadgeProps {
  count?: number;
  size?: CommentsBadgeSize;
  className?: string;
  iconClassName?: string;
  countClassName?: string;
  iconWrapperClassName?: string;
  showZero?: boolean;
}

const SIZE_STYLES: Record<
  CommentsBadgeSize,
  { iconWrapper: string; icon: string; count: string }
> = {
  sm: {
    iconWrapper: "h-4 w-4",
    icon: "h-4 w-4",
    count: "text-[9px]",
  },
  lg: {
    iconWrapper: "h-6 w-6",
    icon: "h-8 w-8",
    count: "text-[12px]",
  },
};

export default function CommentsBadge({
  count,
  size = "sm",
  className = "",
  iconClassName = "",
  countClassName = "",
  iconWrapperClassName = "",
  showZero = false,
}: CommentsBadgeProps) {
  if (typeof count !== "number" || (!showZero && count <= 0)) {
    return null;
  }

  const sizeStyles = SIZE_STYLES[size] ?? SIZE_STYLES.sm;

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] ${className}`}
    >
      <span
        className={`relative inline-flex items-center justify-center ${sizeStyles.iconWrapper} ${iconWrapperClassName}`}
      >
        <Comments className={`${sizeStyles.icon} ${iconClassName}`} />
        <span
          className={`absolute font-semibold leading-none text-white ${sizeStyles.count} ${countClassName}`}
        >
          {count}
        </span>
      </span>
    </span>
  );
}
