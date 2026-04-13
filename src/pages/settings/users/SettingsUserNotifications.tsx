import { useParams } from "react-router";
import SettingsUserNotificationPermissionView from "@/components/settings/SettingsUserNotificationPermissionView";

export default function SettingsUserNotifications() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <SettingsUserNotificationPermissionView
      userId={userId}
      backTo={`/settings/people/users/${userId}`}
    />
  );
}
