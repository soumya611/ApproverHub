import { useEffect, useMemo, useState } from "react";
import { getRoleLabel } from "../../data/appUsers";
import { EnvelopeIcon, NotificationIcon } from "../../icons";
import { useUsersStore } from "../../stores/usersStore";
import { getStoredUserIdentity } from "../../utils/userIdentity";
import UserAvatar from "../common/UserAvatar";
import Button from "../ui/button/Button";
import AppIcon from "../ui/icon/AppIcon";
import ProfileInfoRow from "../ui/profile/ProfileInfoRow";
import ProfileNotificationPreferenceRow from "../ui/profile/ProfileNotificationPreferenceRow";
import ProfileSettingsPageContainer from "../ui/profile/ProfileSettingsPageContainer";
import ProfileStatusIndicator from "../ui/profile/ProfileStatusIndicator";
import UnderlineTabs from "../ui/tabs/UnderlineTabs";
import {
  getNotificationPreferencesByRole,
  type ProfileNotificationPreference,
} from "./profileSettingsData";
import AppBreadcrumb from "../common/AppBreadcrumb";
import {
  buildDefaultNotificationSettings,
  useUserProfileSettingsStore,
} from "../../stores/userProfileSettingsStore";

type NotificationTab = "in_app" | "email";

interface TeamManagerNotificationsViewProps {
  userId?: string;
  backTo?: string;
}

const NOTIFICATION_TABS: Array<{ id: NotificationTab; label: string }> = [
  { id: "in_app", label: "In-App Notifications" },
  { id: "email", label: "Email Notifications" },
];

export default function TeamManagerNotificationsView({
  userId,
  backTo = "/profile",
}: TeamManagerNotificationsViewProps) {
  const users = useUsersStore((state) => state.users);
  const defaultUser = useUsersStore((state) => state.getDefaultUser());
  const notificationsByUser = useUserProfileSettingsStore(
    (state) => state.notificationsByUser
  );
  const setNotificationSettings = useUserProfileSettingsStore(
    (state) => state.setNotificationSettings
  );
  const setNotificationPreference = useUserProfileSettingsStore(
    (state) => state.setNotificationPreference
  );

  const storedUser = getStoredUserIdentity();

  const selectedUser = useMemo(() => {
    if (userId) {
      return users.find((user) => user.id === userId) ?? null;
    }
    return null;
  }, [userId, users]);

  const resolvedUser = selectedUser ?? defaultUser;
  const name = selectedUser?.name ?? storedUser?.name ?? defaultUser.name;
  const profileId = selectedUser?.id ?? storedUser?.id ?? defaultUser.id;
  const avatarUrl = selectedUser?.avatarUrl ?? storedUser?.avatarUrl ?? defaultUser.avatarUrl;
  const accountStatus =
    selectedUser?.accountStatus ??
    storedUser?.accountStatus ??
    defaultUser.accountStatus ??
    "active";
  const role = selectedUser?.appRole ?? storedUser?.role ?? defaultUser.appRole ?? "user";
  const showRole = userId ? true : storedUser?.showRole ?? true;
  const roleLabel = getRoleLabel(role) || resolvedUser.role;
  const resolvedUserId = profileId;

  const [activeTab, setActiveTab] = useState<NotificationTab>("in_app");

  const basePreferences = useMemo(
    () => getNotificationPreferencesByRole(role),
    [role]
  );

  const userNotificationOverrides = notificationsByUser[resolvedUserId];

  useEffect(() => {
    if (!resolvedUserId || userNotificationOverrides) return;
    setNotificationSettings(resolvedUserId, buildDefaultNotificationSettings(role));
  }, [resolvedUserId, role, setNotificationSettings, userNotificationOverrides]);

  const preferences = useMemo<ProfileNotificationPreference[]>(() => {
    return basePreferences.map((preference) => {
      const override = userNotificationOverrides?.[preference.id];
      return {
        ...preference,
        inApp: override?.inApp ?? preference.inApp,
        email: override?.email ?? preference.email,
      };
    });
  }, [basePreferences, userNotificationOverrides]);

  const enabledCount = useMemo(() => {
    return preferences.filter((preference) =>
      activeTab === "in_app" ? preference.inApp : preference.email
    ).length;
  }, [activeTab, preferences]);

  const allEnabled = preferences.length > 0 && enabledCount === preferences.length;

  const togglePreference = (id: string, checked: boolean) => {
    setNotificationPreference(
      resolvedUserId,
      id,
      activeTab === "in_app" ? "inApp" : "email",
      checked
    );
  };

  const toggleAll = (checked: boolean) => {
    const nextSettings = { ...(userNotificationOverrides ?? {}) };
    preferences.forEach((preference) => {
      const existing = nextSettings[preference.id] ?? {
        inApp: preference.inApp,
        email: preference.email,
      };
      nextSettings[preference.id] = {
        ...existing,
        [activeTab === "in_app" ? "inApp" : "email"]: checked,
      };
    });
    setNotificationSettings(resolvedUserId, nextSettings);
  };

  const breadcrumbOverride = userId ? (
    <AppBreadcrumb
      items={[
        { label: "Settings", to: "/settings" },
        { label: "People", to: "/settings/people/users" },
        { label: "User Detail", to: `/settings/people/users/${userId}` },
        { label: "Notification" },
      ]}
    />
  ) : undefined;

  return (
    <ProfileSettingsPageContainer
      title="Notification Settings"
      breadcrumbCurrent="Notifications"
      subtitle="Control your notification alerts"
      backTo={backTo}
      breadcrumbOverride={breadcrumbOverride}
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1.2fr]">
        <div className="rounded-sm border border-gray-200 bg-white p-4">
          <div className="flex items-start gap-4">
            <UserAvatar
              size="large"
              name={name}
              avatarUrl={avatarUrl}
              className="h-24 w-24 text-xl"
            />
            <div>
              <h3 className="text-md font-semibold text-gray-900">{name}</h3>
              <p className="text-sm text-gray-500">Employee ID:{profileId}</p>
              <div className="mt-2 flex items-center text-gray-600">
                {showRole ? (
                  <>
                    {roleLabel}
                    <span className="mx-1">|</span>
                  </>
                ) : null}
                <ProfileStatusIndicator status={accountStatus} />
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {enabledCount} of {preferences.length}{" "}
                {activeTab === "in_app" ? "in-app" : "email"} alerts are enabled
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-sm border border-gray-200 bg-white">
          <ProfileInfoRow
            icon={<AppIcon icon={NotificationIcon} size={16} />}
            label="In-App Alerts"
            value={
              <span className="text-xs font-medium text-gray-600">
                {preferences.filter((preference) => preference.inApp).length} enabled
              </span>
            }
            valueClassName=""
          />
          <ProfileInfoRow
            icon={<AppIcon icon={EnvelopeIcon} size={16} />}
            label="Email Alerts"
            value={
              <span className="text-xs font-medium text-gray-600">
                {preferences.filter((preference) => preference.email).length} enabled
              </span>
            }
            valueClassName=""
          />
          <ProfileInfoRow
            icon={<AppIcon icon={NotificationIcon} size={16} />}
            label={activeTab === "in_app" ? "Enable All In-App" : "Enable All Email"}
            value={
              <Button
                type="button"
                size="tiny"
                variant="secondary"
                className="!h-[30px] !w-auto px-3 text-xs"
                onClick={() => toggleAll(!allEnabled)}
              >
                {allEnabled ? "Disable all" : "Enable all"}
              </Button>
            }
            valueClassName=""
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 pt-2">
          <UnderlineTabs
            tabs={NOTIFICATION_TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="flex flex-wrap items-end gap-8"
            tabClassName="-mb-px border-b-2 px-1 pb-3 pt-3 text-base transition"
            activeClassName="border-[#007B8C] font-semibold text-[#007B8C]"
            inactiveClassName="border-transparent font-medium text-gray-400 hover:text-gray-700"
          />
        </div>

        <div className="overflow-hidden rounded-sm border-gray-200 bg-white">
          {preferences.map((preference) => (
            <ProfileNotificationPreferenceRow
              key={preference.id}
              icon={<AppIcon icon={preference.icon} size={16} />}
              label={preference.title}
              description={preference.description}
              checked={activeTab === "in_app" ? preference.inApp : preference.email}
              onChange={(checked) => togglePreference(preference.id, checked)}
            />
          ))}
        </div>
      </div>
    </ProfileSettingsPageContainer>
  );
}
