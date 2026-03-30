import type { AppSvgIcon } from "../../../icons";
import { AngleRightIcon } from "../../../icons";
import AppIcon from "../icon/AppIcon";

interface SettingsOptionRowProps {
  icon: AppSvgIcon;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

export default function SettingsOptionRow({
  icon,
  title,
  description,
  onClick,
  className = "",
}: SettingsOptionRowProps) {
  const ComponentTag = onClick ? "button" : "div";

  return (
    <ComponentTag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition ${
        onClick ? "hover:bg-gray-50" : ""
      } ${className}`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[#64748B]">
          <AppIcon icon={icon} size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-xl font-semibold text-gray-800">{title}</p>
          <p className="mt-1 truncate text-lg text-gray-500">{description}</p>
        </div>
      </div>

      <span className="ml-4 inline-flex h-7 w-7 shrink-0 items-center justify-center text-gray-400">
        <AngleRightIcon className="h-4 w-4" />
      </span>
    </ComponentTag>
  );
}
