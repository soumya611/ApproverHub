import { useMemo, useState } from "react";
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

type NotificationTab = "in_app" | "email";

const NOTIFICATION_TABS: Array<{ id: NotificationTab; label: string }> = [
  { id: "in_app", label: "In-App Notifications" },
  { id: "email", label: "Email Notifications" },
];

export default function TeamManagerNotificationsView() {
  const defaultUser = useUsersStore((state) => state.getDefaultUser());
  const storedUser = getStoredUserIdentity();
  const name = storedUser?.name ?? defaultUser.name;
  const profileId = storedUser?.id ?? defaultUser.id;
  const avatarUrl = storedUser?.avatarUrl ?? defaultUser.avatarUrl;
  const accountStatus = storedUser?.accountStatus ?? defaultUser.accountStatus ?? "active";
  const role = storedUser?.role ?? defaultUser.appRole ?? "user";
  const showRole = storedUser?.showRole ?? true;
  const roleLabel = getRoleLabel(role) || defaultUser.role;

  const [activeTab, setActiveTab] = useState<NotificationTab>("in_app");
  const [preferences, setPreferences] = useState<ProfileNotificationPreference[]>(() =>
    getNotificationPreferencesByRole(role)
  );

  const enabledCount = useMemo(() => {
    const count = preferences.filter((preference) =>
      activeTab === "in_app" ? preference.inApp : preference.email
    ).length;
    return count;
  }, [activeTab, preferences]);

  const allEnabled = preferences.length > 0 && enabledCount === preferences.length;

  const togglePreference = (id: string, checked: boolean) => {
    setPreferences((previous) =>
      previous.map((preference) => {
        if (preference.id !== id) return preference;
        if (activeTab === "in_app") {
          return { ...preference, inApp: checked };
        }
        return { ...preference, email: checked };
      })
    );
  };

  const toggleAll = (checked: boolean) => {
    setPreferences((previous) =>
      previous.map((preference) =>
        activeTab === "in_app"
          ? { ...preference, inApp: checked }
          : { ...preference, email: checked }
      )
    );
  };

  return (
    <ProfileSettingsPageContainer
      title="Notifications"
      breadcrumbCurrent="Notifications"
      subtitle="Control alerts for jobs, workflows, mentions, and deadlines."
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
