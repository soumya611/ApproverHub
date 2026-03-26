import type { ReactNode } from "react";
import Avatar from "../avatar/Avatar";

export interface UserCellProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  avatarUrl?: string;
  avatarAlt?: string;
  showAvatar?: boolean;
  avatarSize?: "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge";
  avatarFallback?: "initials" | "name";
  rightSlot?: ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  titleWrap?: boolean;
  subtitleClassName?: string;
  metaClassName?: string;
  align?: "center" | "start";
}

export default function UserCell({
  title,
  subtitle,
  meta,
  avatarUrl,
  avatarAlt,
  showAvatar = true,
  avatarSize = "small",
  avatarFallback = "initials",
  rightSlot,
  className = "",
  contentClassName = "",
  titleClassName = "",
  titleWrap = false,
  subtitleClassName = "",
  metaClassName = "",
  align = "center",
}: UserCellProps) {
  const resolvedAvatarAlt =
    avatarAlt ??
    (typeof title === "string" || typeof title === "number" ? String(title) : "User");

  return (
    <div className={`flex items-${align} gap-2 ${className}`}>
      {showAvatar ? (
        <Avatar
          src={avatarUrl ?? ""}
          alt={resolvedAvatarAlt}
          size={avatarSize}
          fallbackType={avatarFallback}
        />
      ) : null}
      <div className={`min-w-0 flex-1 ${contentClassName}`}>
        {(title ?? meta) ? (
          <div
            className={`flex min-w-0 gap-2 ${titleWrap ? "items-start" : "items-center"}`}
          >
            {title ? (
              <span
                className={`min-w-0 ${
                  titleWrap ? "break-words whitespace-normal" : "truncate"
                } text-sm font-medium text-gray-800 ${titleClassName}`}
              >
                {title}
              </span>
            ) : null}
            {meta ? (
              <span
                className={`shrink-0 text-xs text-gray-400 ${metaClassName}`}
              >
                {meta}
              </span>
            ) : null}
          </div>
        ) : null}
        {subtitle ? (
          <div className={`text-xs text-gray-500 ${subtitleClassName}`}>
            {subtitle}
          </div>
        ) : null}
      </div>
      {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
    </div>
  );
}
