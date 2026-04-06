import type { ButtonHTMLAttributes, CSSProperties, SVGProps } from "react";
import AppIcon from "../ui/icon/AppIcon";

interface JobsFABProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  side?: "left" | "right";
  offsetX?: number;
  offsetY?: number;
  buttonSize?: number;
  iconSize?: number | string;
  iconClassName?: string | number;
  iconStrokeWidth?: number;
  fabStrokwidth?: number; // Backward-compatible alias for iconStrokeWidth
}

const FabPlusIcon = ({ strokeWidth = 2, ...props }: SVGProps<SVGSVGElement>) => {
  const resolvedStrokeWidth =
    typeof strokeWidth === "string" ? Number(strokeWidth) || 2 : strokeWidth;

  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth={resolvedStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function JobsFAB({
  onClick,
  ariaLabel = "Add new",
  className = "",
  side = "right",
  offsetX = 32,
  offsetY = 32,
  buttonSize = 56,
  iconSize = 20,
  iconClassName = "",
  iconStrokeWidth,
  fabStrokwidth,
  style,
  ...rest
}: JobsFABProps) {
  const resolvedIconSize =
    typeof iconClassName === "number" ? iconClassName : iconSize;
  const resolvedIconClassName =
    typeof iconClassName === "string" ? iconClassName : "";
  const resolvedIconStrokeWidth = iconStrokeWidth ?? fabStrokwidth ?? 2;

  const positionStyle: CSSProperties = {
    width: `${buttonSize}px`,
    height: `${buttonSize}px`,
    bottom: `${offsetY}px`,
    ...(side === "left"
      ? { left: `${offsetX}px` }
      : { right: `${offsetX}px` }),
    ...style,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed z-40 flex items-center justify-center rounded-xl bg-[var(--color-secondary-500)] text-white shadow-lg transition-colors hover:bg-[var(--color-secondary-600)] ${className}`}
      style={positionStyle}
      aria-label={ariaLabel}
      {...rest}
    >
      <AppIcon
        icon={FabPlusIcon}
        size={resolvedIconSize}
        className={resolvedIconClassName}
        strokeWidth={resolvedIconStrokeWidth}
      />
    </button>
  );
}
