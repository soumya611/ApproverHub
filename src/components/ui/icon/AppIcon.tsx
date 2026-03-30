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

  return (
    <span
      className={`app-icon ${forceColor ? "app-icon--force" : ""} ${className}`}
      style={mergedStyle}
      {...rest}
    >
      <Icon strokeWidth={strokeWidth} />
    </span>
  );
}

