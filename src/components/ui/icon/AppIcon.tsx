import type { CSSProperties, HTMLAttributes } from "react";
import type { AppSvgIcon } from "../../../icons";

interface AppIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  icon: AppSvgIcon;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  forceColor?: boolean;
}

export default function AppIcon({
  icon: Icon,
  size = 16,
  color = "currentColor",
  strokeWidth,
  forceColor = false,
  className = "",
  style,
  ...rest
}: AppIconProps) {
  const computedSize = typeof size === "number" ? `${size}px` : size;
  const mergedStyle: CSSProperties = {
    color,
    fontSize: computedSize,
    ...style,
  };
  if (strokeWidth !== undefined) {
    (
      mergedStyle as CSSProperties & Record<"--app-icon-stroke-width", string>
    )["--app-icon-stroke-width"] = String(strokeWidth);
  }

  return (
    <span
      className={`app-icon ${forceColor ? "app-icon--force" : ""} ${
        strokeWidth !== undefined ? "app-icon--stroke-width" : ""
      } ${className}`}
      style={mergedStyle}
      {...rest}
    >
      <Icon strokeWidth={strokeWidth} />
    </span>
  );
}

