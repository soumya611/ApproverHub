import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  getRoleLabel,
  type AppUserRole,
} from "../../data/appUsers";
import {
  CalenderIcon,
  EditDetailsIcon,
  EnvelopeIcon,
  LockIcon,
  LogoutIcon,
  NotificationIcon,
  UserIcon,
} from "../../icons";
import { useJobsStore } from "../../stores/jobsStore";
import { useUsersStore } from "../../stores/usersStore";
import { clearStoredUserIdentity, getStoredUserIdentity } from "../../utils/userIdentity";
import AppBreadcrumb from "../common/AppBreadcrumb";
import UserAvatar from "../common/UserAvatar";
import PageContentContainer from "../layout/PageContentContainer";
import Button from "../ui/button/Button";
import AppIcon from "../ui/icon/AppIcon";
import ProfileAssociatedJobsTable from "../ui/profile/ProfileAssociatedJobsTable";
import ProfileAssociatedWorkflowTable, {
  type ProfileWorkflowRow,
} from "../ui/profile/ProfileAssociatedWorkflowTable";
import ProfileInfoRow from "../ui/profile/ProfileInfoRow";
import ProfileRolesTable, { type ProfileRoleRow } from "../ui/profile/ProfileRolesTable";
import ProfileStatusIndicator from "../ui/profile/ProfileStatusIndicator";
import UnderlineTabs from "../ui/tabs/UnderlineTabs";

type AdminProfileTab = "associated_jobs" | "associated_workflow" | "roles";

const PROFILE_TABS: Array<{ id: AdminProfileTab; label: string }> = [
  { id: "associated_jobs", label: "Associated Jobs" },
  { id: "associated_workflow", label: "Associated Workflow" },
  { id: "roles", label: "Roles" },
];

const ROLE_ORDER: AppUserRole[] = [
  "team_manager",
  "manager",
  "user",
  "admin",
  "org_admin",
];

const ROLE_DESCRIPTION_MAP: Record<AppUserRole, string> = {
  team_manager: "Manages team workload, ownership, and escalation handling.",
  manager: "Oversees workflows, assignments, and delivery approvals.",
  user: "Can create, view, and update assigned jobs.",
  admin: "Controls platform settings, users, and system-level operations.",
  org_admin: "Manages organization-wide governance and policy settings.",
};

const ROLE_ACCESS_MAP: Record<AppUserRole, ProfileRoleRow["access"]> = {
  team_manager: "Custom",
  manager: "Custom",
  user: "Limited",
  admin: "Full",
  org_admin: "Full",
};

const getNameInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export default function AdminProfileView() {
  const navigate = useNavigate();
  const jobs = useJobsStore((state) => state.jobs);
  const users = useUsersStore((state) => state.users);
  const defaultUser = useUsersStore((state) => state.getDefaultUser());
  const [activeTab, setActiveTab] = useState<AdminProfileTab>("associated_jobs");
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<string>>(new Set());
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());

  const storedUser = getStoredUserIdentity();
  const name = storedUser?.name ?? defaultUser.name;
  const email = storedUser?.email ?? defaultUser.email;
  const profileId = storedUser?.id ?? defaultUser.id;
  const avatarUrl = storedUser?.avatarUrl ?? defaultUser.avatarUrl;
  const roleLabel =
    storedUser?.roleLabel ||
    getRoleLabel(storedUser?.role ?? defaultUser.appRole) ||
    defaultUser.role;
  const accountStatus = storedUser?.accountStatus ?? defaultUser.accountStatus ?? "active";
  const title = storedUser?.title ?? defaultUser.title ?? "Administration";
  const team = storedUser?.team ?? defaultUser.team ?? "System";
  const phone = storedUser?.phone || "--";
  const workSchedule =
    storedUser?.workSchedule ?? defaultUser.workSchedule ?? "Monday to Friday";
  const userInitials = useMemo(() => getNameInitials(name), [name]);

  const associatedJobs = useMemo(() => {
    const matched = jobs.filter(
      (job) => job.owner === userInitials || (job.assignee && job.assignee === userInitials)
    );
    const source = matched.length ? matched : jobs;
    return source.slice(0, 6);
  }, [jobs, userInitials]);

  const associatedWorkflows = useMemo<ProfileWorkflowRow[]>(() => {
    const workflowMap = new Map<string, ProfileWorkflowRow>();

    associatedJobs.forEach((job, index) => {
      const workflowKey = job.workflowId ?? `WF-${job.id}`;
      const existing = workflowMap.get(workflowKey);
      const workflowName = job.workflowLabel ?? `Workflow ${index + 1}`;
      const stageCount = job.workflowStages?.length ?? 0;
      const ownerMember = job.members?.find((member) => member.initials === job.owner);
      const status =
        job.status === "Complete"
          ? "Complete"
          : job.status === "In Progress"
            ? "In Progress"
            : "Not Started";

      if (existing) {
        workflowMap.set(workflowKey, {
          ...existing,
          linkedJobs: existing.linkedJobs + 1,
          stages: Math.max(existing.stages, stageCount),
          status: existing.status === "In Progress" ? "In Progress" : status,
        });
        return;
      }

      workflowMap.set(workflowKey, {
        id: workflowKey,
        workflowId: workflowKey,
        workflowName,
        stages: stageCount,
        linkedJobs: 1,
        status,
        ownerInitials: job.owner,
        ownerName: ownerMember?.name,
        ownerAvatarUrl: ownerMember?.avatarUrl,
      });
    });

    return Array.from(workflowMap.values());
  }, [associatedJobs]);

  const roleRows = useMemo<ProfileRoleRow[]>(() => {
    const roleCounts = users.reduce<Record<AppUserRole, number>>(
      (acc, user) => {
        if (user.appRole) {
          acc[user.appRole] = (acc[user.appRole] ?? 0) + 1;
        }
        return acc;
      },
      {
        team_manager: 0,
        manager: 0,
        user: 0,
        admin: 0,
        org_admin: 0,
      }
    );

    return ROLE_ORDER.map((role) => ({
      id: role,
      roleName: getRoleLabel(role),
      description: ROLE_DESCRIPTION_MAP[role],
      members: roleCounts[role] ?? 0,
      access: ROLE_ACCESS_MAP[role],
    }));
  }, [users]);

  const toggleSelectAllJobs = () => {
    setSelectedJobIds((previous) =>
      previous.size === associatedJobs.length
        ? new Set()
        : new Set(associatedJobs.map((job) => job.id))
    );
  };

  const toggleSelectJob = (jobId: string) => {
    setSelectedJobIds((previous) => {
      const next = new Set(previous);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const toggleSelectAllWorkflows = () => {
    setSelectedWorkflowIds((previous) =>
      previous.size === associatedWorkflows.length
        ? new Set()
        : new Set(associatedWorkflows.map((workflow) => workflow.id))
    );
  };

  const toggleSelectWorkflow = (workflowId: string) => {
    setSelectedWorkflowIds((previous) => {
      const next = new Set(previous);
      if (next.has(workflowId)) {
        next.delete(workflowId);
      } else {
        next.add(workflowId);
      }
      return next;
    });
  };

  const toggleSelectAllRoles = () => {
    setSelectedRoleIds((previous) =>
      previous.size === roleRows.length ? new Set() : new Set(roleRows.map((role) => role.id))
    );
  };

  const toggleSelectRole = (roleId: string) => {
    setSelectedRoleIds((previous) => {
      const next = new Set(previous);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  };

  const handleSignOut = () => {
    clearStoredUserIdentity();
    navigate("/login");
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AppBreadcrumb />

      <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-semibold text-primary">Profile</h2>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-[1.15fr_1.2fr_1.2fr]">
            <div className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <UserAvatar
                      size="large"
                      name={name}
                      avatarUrl={avatarUrl}
                      className="h-24 w-24 text-xl"
                    />
                    <span className="absolute bottom-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-gray-100 text-gray-500">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 3L7.17 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5H16.83L15 3H9ZM12 8C14.76 8 17 10.24 17 13C17 15.76 14.76 18 12 18C9.24 18 7 15.76 7 13C7 10.24 9.24 8 12 8ZM12 10C10.35 10 9 11.35 9 13C9 14.65 10.35 16 12 16C13.65 16 15 14.65 15 13C15 11.35 13.65 10 12 10Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-gray-900">{name}</h3>
                    <p className="text-sm text-gray-500">Employee ID:{profileId}</p>
                    <div className="mt-2 flex items-center font-normal text-gray-600">
                      {roleLabel} <span className="mx-0.5">|</span>{" "}
                      <ProfileStatusIndicator status={accountStatus} />
                    </div>
                    <p className="mt-3 text-base text-gray-600">{title}</p>
                    <p className="text-base text-gray-600">{team}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Edit profile"
                >
                  <EditDetailsIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-sm border border-gray-200 bg-white">
              <ProfileInfoRow
                icon={<AppIcon icon={EnvelopeIcon} size={16} />}
                label="Email"
                value={email}
                valueClassName="text-sm text-gray-500"
              />
              <ProfileInfoRow
                icon={<AppIcon icon={UserIcon} size={16} />}
                label="Phone Number"
                value={phone}
                valueClassName="text-sm text-gray-500"
              />
              <ProfileInfoRow
                icon={<AppIcon icon={CalenderIcon} size={16} />}
                label="Work Schedule"
                value={workSchedule}
                showArrow
                onClick={() => navigate("/profile/work-schedule")}
                valueClassName="text-sm text-gray-500"
              />
            </div>

            <div className="space-y-3">
              <div className="overflow-hidden rounded-sm border border-gray-200 bg-white">
                <ProfileInfoRow
                  icon={<AppIcon icon={NotificationIcon} size={16} />}
                  label="Notifications"
                  value="Manage"
                  showArrow
                  onClick={() => navigate("/profile/notifications")}
                  valueClassName="text-sm text-gray-500"
                />
                <ProfileInfoRow
                  icon={<AppIcon icon={LockIcon} size={16} />}
                  label="Password"
                  value="Change Password"
                  valueClassName="text-sm text-gray-500"
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="orangebutton"
                onClick={handleSignOut}
                startIcon={
                  <AppIcon
                    icon={LogoutIcon}
                    size={16}
                    color="var(--color-secondary-500)"
                    forceColor
                  />
                }
                className="w-full rounded-md border-[var(--color-secondary-500)] !font-semibold text-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-50)]"
              >
                Logout
              </Button>
            </div>
          </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 pt-2">
              <UnderlineTabs
                tabs={PROFILE_TABS}
                activeTab={activeTab}
                onChange={setActiveTab}
                className="flex flex-wrap items-end gap-8"
                tabClassName="-mb-px border-b-2 px-1 pb-3 pt-3 text-base transition"
                activeClassName="border-[#007B8C] font-semibold text-[#007B8C]"
                inactiveClassName="border-transparent font-medium text-gray-400 hover:text-gray-700"
              />
            </div>

            {activeTab === "associated_jobs" ? (
              <ProfileAssociatedJobsTable
                jobs={associatedJobs}
                selectedIds={selectedJobIds}
                onToggleSelectAll={toggleSelectAllJobs}
                onToggleSelect={toggleSelectJob}
              />
            ) : null}

            {activeTab === "associated_workflow" ? (
              <ProfileAssociatedWorkflowTable
                workflows={associatedWorkflows}
                selectedIds={selectedWorkflowIds}
                onToggleSelectAll={toggleSelectAllWorkflows}
                onToggleSelect={toggleSelectWorkflow}
              />
            ) : null}

            {activeTab === "roles" ? (
              <ProfileRolesTable
                roles={roleRows}
                selectedIds={selectedRoleIds}
                onToggleSelectAll={toggleSelectAllRoles}
                onToggleSelect={toggleSelectRole}
              />
            ) : null}
            </div>
          </div>
        </div>
      </PageContentContainer>
    </div>
  );
}
