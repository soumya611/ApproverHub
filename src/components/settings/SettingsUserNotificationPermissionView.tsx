import { useEffect, useMemo } from "react";
import { useUsersStore } from "../../stores/usersStore";
import {
  type UserNotificationSettings,
  useUserProfileSettingsStore,
} from "../../stores/userProfileSettingsStore";
import { getStoredUserIdentity } from "../../utils/userIdentity";
import AppBreadcrumb from "../common/AppBreadcrumb";
import ProfileSettingsPageContainer from "../ui/profile/ProfileSettingsPageContainer";
import ToggleSwitch from "../ui/toggle/ToggleSwitch";

type NotificationPermissionGroup = "core_event" | "job_owner";

interface NotificationPermissionItem {
  id: string;
  title: string;
  description: string;
  group: NotificationPermissionGroup;
  defaultEnabled: boolean;
  mandatory?: boolean;
}

interface SettingsUserNotificationPermissionViewProps {
  userId?: string;
  backTo?: string;
}

const NOTIFICATION_PERMISSION_ITEMS: NotificationPermissionItem[] = [
  {
    id: "core_new_job_to_review",
    title: "New job to review",
    description: "When a job is submitted for review",
    group: "core_event",
    defaultEnabled: true,
  },
  {
    id: "core_multiple_jobs_pending",
    title: "Multiple jobs pending",
    description: "When multiple jobs have been uploaded at the same time to avoid multiple emails.",
    group: "core_event",
    defaultEnabled: true,
  },
  {
    id: "core_new_version_uploaded_by_owner",
    title: "New version uploaded by Owner",
    description: "When a new version of an existing job is uploaded",
    group: "core_event",
    defaultEnabled: true,
  },
  {
    id: "core_stage_started",
    title: "Stage started",
    description: "When a new stage of the workflow begins",
    group: "core_event",
    defaultEnabled: true,
  },
  {
    id: "core_new_version_uploaded_by_reviewer",
    title: "New version uploaded by reviewer or approver",
    description: "When a new version of an existing job is uploaded",
    group: "core_event",
    defaultEnabled: true,
    mandatory: true,
  },
  {
    id: "core_job_stage_assigned",
    title: "Job/stage assigned",
    description: "When a job is assigned and only one decision is required",
    group: "core_event",
    defaultEnabled: true,
    mandatory: true,
  },
  {
    id: "job_owner_job_started",
    title: "Job started",
    description: "Sent when a new job is created and workflow is initiated",
    group: "job_owner",
    defaultEnabled: true,
    mandatory: true,
  },
];

const GROUP_LABELS: Record<NotificationPermissionGroup, string> = {
  core_event: "Core Event Notifications",
  job_owner: "Job Owner Notifications",
};

const GROUP_ORDER: NotificationPermissionGroup[] = ["core_event", "job_owner"];

const buildDefaultPermissionState = (existing: UserNotificationSettings = {}) => {
  const next: UserNotificationSettings = { ...existing };
  let hasChange = false;

  NOTIFICATION_PERMISSION_ITEMS.forEach((item) => {
    if (!next[item.id]) {
      next[item.id] = {
        inApp: item.defaultEnabled,
        email: item.defaultEnabled,
      };
      hasChange = true;
      return;
    }

    if (!item.mandatory) return;

    const current = next[item.id];
    if (current.inApp && current.email) return;

    next[item.id] = {
      ...current,
      inApp: true,
      email: true,
    };
    hasChange = true;
  });

  return { next, hasChange };
};

export default function SettingsUserNotificationPermissionView({
  userId,
  backTo = "/profile",
}: SettingsUserNotificationPermissionViewProps) {
  const users = useUsersStore((state) => state.users);
  const defaultUser = useUsersStore((state) => state.getDefaultUser());
  const notificationsByUser = useUserProfileSettingsStore((state) => state.notificationsByUser);
  const setNotificationSettings = useUserProfileSettingsStore(
    (state) => state.setNotificationSettings
  );
  const setNotificationPreference = useUserProfileSettingsStore(
    (state) => state.setNotificationPreference
  );
  const storedUser = getStoredUserIdentity();

  const selectedUser = useMemo(() => {
    if (!userId) return null;
    return users.find((user) => user.id === userId) ?? null;
  }, [userId, users]);

  const resolvedUser = selectedUser ?? defaultUser;
  const resolvedUserId = selectedUser?.id ?? storedUser?.id ?? resolvedUser.id;
  const userNotificationSettings = useMemo(
    () => notificationsByUser[resolvedUserId] ?? {},
    [notificationsByUser, resolvedUserId]
  );

  useEffect(() => {
    if (!resolvedUserId) return;
    const { next, hasChange } = buildDefaultPermissionState(userNotificationSettings);
    if (!hasChange) return;
    setNotificationSettings(resolvedUserId, next);
  }, [resolvedUserId, setNotificationSettings, userNotificationSettings]);

  const groupedPermissions = useMemo(() => {
    const grouped: Record<NotificationPermissionGroup, NotificationPermissionItem[]> = {
      core_event: [],
      job_owner: [],
    };

    NOTIFICATION_PERMISSION_ITEMS.forEach((item) => {
      grouped[item.group].push(item);
    });

    return grouped;
  }, []);

  const breadcrumbOverride = userId ? (
    <AppBreadcrumb
      items={[
        { label: "Settings", to: "/settings" },
        { label: "People", to: "/settings/people/users" },
        { label: "User Detail", to: `/settings/people/users/${userId}` },
        { label: "Notification Permission" },
      ]}
    />
  ) : undefined;

  if (userId && !selectedUser) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb
          items={[
            { label: "Settings", to: "/settings" },
            { label: "People", to: "/settings/people/users" },
            { label: "User Detail" },
          ]}
        />
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
          User not found.
        </div>
      </div>
    );
  }

  return (
    <ProfileSettingsPageContainer
      title="Notification Permission"
      breadcrumbCurrent="Notification Permission"
      subtitle="Control your notification alerts"
      backTo={backTo}
      breadcrumbOverride={breadcrumbOverride}
      contentClassName="min-h-[620px] bg-[#FAFAFA] p-6"
    >
      <div className="space-y-8">
        {GROUP_ORDER.map((group) => (
          <section key={group} className="space-y-3">
            <h3 className="text-md font-semibold">{GROUP_LABELS[group]}</h3>

            <div className="overflow-hidden rounded-sm border border-gray-200 bg-white">
              <div className="grid grid-cols-[minmax(0,1fr)_180px] border-b border-gray-200 bg-gray-100">
                <p className="px-6 py-3 text-sm font-medium text-gray-800">Events</p>
              </div>

              {groupedPermissions[group].map((item) => {
                const isEnabled = userNotificationSettings[item.id]?.inApp ?? item.defaultEnabled;
                const statusLabel = item.mandatory
                  ? "Mandatory"
                  : isEnabled
                    ? "Active"
                    : "Inactive";
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[minmax(0,1fr)_180px] border-b border-gray-200 last:border-b-0"
                  >
                    <div className="px-6 py-3">
                      <p className="text-sm font-medium text-gray-800">{item.title}</p>
                      <p className="mt-1 text-sm text-gray-400">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-start gap-2 px-6 py-3 whitespace-nowrap">
                      <ToggleSwitch
                        checked={isEnabled}
                        onChange={(checked) =>
                          setNotificationPreference(resolvedUserId, item.id, "inApp", checked)
                        }
                        disabled={item.mandatory}
                        showLabel={false}
                        size="sm"
                        trackClassName={
                          item.mandatory
                            ? "!h-4 !w-8 !bg-gray-300 peer-checked:!bg-gray-300"
                            : "!h-4 !w-8"
                        }
                        thumbClassName="!h-3 !w-3 peer-checked:!translate-x-4"
                      />
                      <span className="text-base text-gray-700">{statusLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </ProfileSettingsPageContainer>
  );
}
