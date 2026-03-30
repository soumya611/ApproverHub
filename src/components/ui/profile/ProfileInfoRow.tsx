import type { ReactNode } from "react";
import { AngleRightIcon } from "../../../icons";

interface ProfileInfoRowProps {
  icon: ReactNode;
  label: string;
  description?: ReactNode;
  value: ReactNode;
  showArrow?: boolean;
  onClick?: () => void;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  valueClassName?: string;
}

export default function ProfileInfoRow({
  icon,
  label,
  description,
  value,
  showArrow = false,
  onClick,
  className = "",
  labelClassName = "text-base text-gray-800",
  descriptionClassName = "text-xs text-gray-500",
  valueClassName = "text-sm font-medium text-gray-500",
}: ProfileInfoRowProps) {
  const ComponentTag = onClick ? "button" : "div";

  return (
    <ComponentTag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 text-left last:border-b-0 ${
        onClick ? "hover:bg-gray-50" : ""
      } ${className}`}
    >
      <span className="flex items-center gap-3">
        <span className="inline-flex h-5 w-5 items-center justify-center text-gray-500">{icon}</span>
        <span className="flex flex-col">
          <span className={labelClassName}>{label}</span>
          {description ? <span className={descriptionClassName}>{description}</span> : null}
        </span>
      </span>

      <span className="flex items-center gap-3">
        <span className={valueClassName}>{value}</span>
        {showArrow ? <AngleRightIcon className="h-4 w-4 text-gray-400" /> : null}
      </span>
    </ComponentTag>
  );
}
