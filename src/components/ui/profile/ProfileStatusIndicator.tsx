import { getAccountStatusLabel, type AppUserAccountStatus } from "../../../data/appUsers";

interface ProfileStatusIndicatorProps {
  status?: AppUserAccountStatus;
  className?: string;
}

const STATUS_STYLE_MAP: Record<AppUserAccountStatus, string> = {
  active: "bg-green-500",
  issue: "bg-amber-500",
  inactive: "bg-gray-400",
};

export default function ProfileStatusIndicator({
  status = "active",
  className = "",
}: ProfileStatusIndicatorProps) {
  return (
    <span className={`inline-flex items-center gap-2 text-base font-normal text-gray-600 ${className}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLE_MAP[status]}`} />
      {getAccountStatusLabel(status)}
    </span>
  );
}

