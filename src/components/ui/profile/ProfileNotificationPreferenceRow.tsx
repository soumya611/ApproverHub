import type { ReactNode } from "react";
import ToggleSwitch from "../toggle/ToggleSwitch";
import ProfileInfoRow from "./ProfileInfoRow";

interface ProfileNotificationPreferenceRowProps {
  icon: ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function ProfileNotificationPreferenceRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: ProfileNotificationPreferenceRowProps) {
  return (
    <ProfileInfoRow
      icon={icon}
      label={label}
      description={description}
      value={
        <ToggleSwitch
          checked={checked}
          onChange={onChange}
          showLabel={false}
          size="sm"
        />
      }
      valueClassName=""
      className="py-3"
      labelClassName="text-sm font-medium text-gray-800"
      descriptionClassName="mt-0.5 text-xs text-gray-500"
    />
  );
}
