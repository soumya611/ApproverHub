import type React from "react";
import Avatar from "../avatar/Avatar";

interface AvatarCheckboxProps {
  id?: string;
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  badgeText?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  avatarSize?: "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge";
  nameClassName?: string;
  subtitleClassName?: string;
  showName?: boolean;
}

const AvatarCheckbox: React.FC<AvatarCheckboxProps> = ({
  id,
  name,
  subtitle,
  avatarUrl,
  badgeText,
  checked,
  onChange,
  disabled = false,
  className = "",
  avatarSize = "small",
  nameClassName = "",
  subtitleClassName = "",
  showName = true,
}) => {
  return (
    <label
      className={`flex items-center gap-3 cursor-pointer ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      } ${className}`}
    >
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          className={`h-4 w-4 appearance-none cursor-pointer rounded-sm border disabled:opacity-60 ${
            checked
              ? disabled
                ? "border-[#E4E7EC] bg-[#E4E7EC]"
                : "border-transparent bg-[var(--color-secondary-500)]"
              : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
          }`}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        {checked && !disabled && (
          <svg
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="white"
              strokeWidth="1.94437"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {checked && disabled && (
          <svg
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="#E4E7EC"
              strokeWidth="2.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {badgeText ? (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary-500)] text-[11px] font-semibold text-white">
          {badgeText}
        </span>
      ) : avatarUrl ? (
        <Avatar src={avatarUrl} size={avatarSize} alt={name || "Reviewer"} />
      ) : null}
      {showName ? (
        <span className="flex flex-col">
          <span className={`text-sm font-medium text-gray-800 ${nameClassName}`}>{name}</span>
          {subtitle ? (
            <span className={`text-xs text-gray-500 ${subtitleClassName}`}>{subtitle}</span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
};

export default AvatarCheckbox;
