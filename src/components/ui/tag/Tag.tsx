import type { HTMLAttributes, ReactNode } from "react";

export type TagTone =
  | "urgent"
  | "warning"
  | "success"
  | "info"
  | "neutral"
  | "gray";

export type TagSize = "xs" | "sm" | "md";
export type TagRounded = "none" | "sm" | "full";
export type TagTooltipPlacement = "top" | "bottom";

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children: ReactNode;
  tone?: TagTone;
  size?: TagSize;
  rounded?: TagRounded;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  tooltip?: ReactNode;
  tooltipPlacement?: TagTooltipPlacement;
  tooltipClassName?: string;
}

const TONE_CLASS_MAP: Record<TagTone, string> = {
  urgent: "border-red-300 bg-red-50 text-red-500",
  warning: "border-amber-300 bg-amber-50 text-amber-600",
  success: "border-emerald-300 bg-emerald-50 text-emerald-700",
  info: "border-cyan-300 bg-cyan-50 text-cyan-700",
  neutral: "border-gray-300 bg-gray-100 text-gray-600",
  gray: "border-gray-200 bg-gray-50 text-gray-500",
};

const SIZE_CLASS_MAP: Record<TagSize, string> = {
  xs: "px-2 py-0.5 text-[10px]",
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

const ROUNDED_CLASS_MAP: Record<TagRounded, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  full: "rounded-full",
};

const TOOLTIP_POSITION_CLASS_MAP: Record<TagTooltipPlacement, string> = {
  top: "bottom-full mb-2 -translate-y-0",
  bottom: "top-full mt-2 translate-y-0",
};

export default function Tag({
  children,
  tone = "neutral",
  size = "xs",
  rounded = "sm",
  startIcon,
  endIcon,
  tooltip,
  tooltipPlacement = "top",
  tooltipClassName = "",
  className = "",
  ...rest
}: TagProps) {
  const tagNode = (
    <span
      className={`inline-flex w-fit items-center gap-1 border font-medium leading-none whitespace-nowrap ${TONE_CLASS_MAP[tone]} ${SIZE_CLASS_MAP[size]} ${ROUNDED_CLASS_MAP[rounded]} ${className}`}
      {...rest}
    >
      {startIcon ? (
        <span className="inline-flex shrink-0 items-center justify-center leading-none">
          {startIcon}
        </span>
      ) : null}
      <span className="inline-flex items-center leading-none">{children}</span>
      {endIcon ? (
        <span className="inline-flex shrink-0 items-center justify-center leading-none">
          {endIcon}
        </span>
      ) : null}
    </span>
  );

  if (!tooltip) return tagNode;

  return (
    <span className="group relative inline-flex">
      {tagNode}
      <span
        role="tooltip"
        className={`pointer-events-none invisible absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-600 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 ${TOOLTIP_POSITION_CLASS_MAP[tooltipPlacement]} ${tooltipClassName}`}
      >
        {tooltip}
      </span>
    </span>
  );
}
