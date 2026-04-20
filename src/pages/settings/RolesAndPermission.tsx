import { useMemo, useState } from "react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { DropDownArrowIcon } from "@/icons";

type RoleOption = "manager" | "team_manager";

interface PermissionGroup {
  id: string;
  title: string;
  items: Array<{ id: string; label: string }>;
}

const ROLE_OPTIONS: Array<{ id: RoleOption; label: string }> = [
  { id: "manager", label: "Manager" },
  { id: "team_manager", label: "Team Manager" },
];

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "administration",
    title: "Administration",
    items: [
      { id: "edit_profile", label: "Edit personal profile information" },
      { id: "manage_team", label: "Manage team profiles (edit profiles, notifications)" },
      { id: "manage_users", label: "Manage all users (change user roles, edit profiles, notifications)" },
      { id: "inactive_users", label: "Make users inactive" },
      { id: "workflow_templates", label: "Create workflow templates" },
    ],
  },
  {
    id: "general_access",
    title: "General Access",
    items: [
      { id: "create_jobs", label: "Create own jobs/campaigns" },
      { id: "edit_own_jobs", label: "Edit/manage own jobs/campaigns" },
      { id: "edit_team_jobs", label: "Edit/manage team jobs/campaigns" },
      { id: "edit_all_jobs", label: "Edit/manage all jobs/campaigns" },
      { id: "view_workflow", label: "View workflow for own jobs" },
    ],
  },
];

const buildInitialState = () =>
  PERMISSION_GROUPS.reduce<Record<string, boolean>>((acc, group) => {
    group.items.forEach((item) => {
      acc[item.id] = true;
    });
    return acc;
  }, {});

const buildRolePermissions = (): Record<RoleOption, Record<string, boolean>> => {
  const managerDefaults = buildInitialState();
  const teamManagerDefaults = {
    ...buildInitialState(),
    manage_users: false,
    inactive_users: false,
    workflow_templates: false,
    edit_all_jobs: false,
  };

  return {
    manager: managerDefaults,
    team_manager: teamManagerDefaults,
  };
};

export default function RolesAndPermission() {
  const { goBack } = useAppNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleOption>("manager");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [permissionsByRole, setPermissionsByRole] =
    useState<Record<RoleOption, Record<string, boolean>>>(buildRolePermissions);

  const selectedRoleLabel = useMemo(
    () => ROLE_OPTIONS.find((role) => role.id === selectedRole)?.label ?? "Manager",
    [selectedRole]
  );

  const togglePermission = (id: string, checked: boolean) => {
    setPermissionsByRole((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [id]: checked,
      },
    }));
  };

  return (
    <>
      <PageMeta title="Roles and Permission | Approver Hub" description="Manage role permissions." />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb
          items={[
            { label: "Settings", to: "/settings" },
            { label: "People", to: "/settings" },
            { label: "Roles and Permission" },
          ]}
        />
        <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0">
          <PageHeader
            title="Roles And Permission"
            description="Manage permissions for user & roles"
            onBackClick={() => goBack({ fallbackTo: "/settings?tab=people" })}
            className="!px-4 py-3"
          />

          <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium text-gray-600">Permission for</label>
              <div className="relative inline-block min-w-[180px]">
                <button
                  type="button"
                  onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
                  className="dropdown-toggle flex h-8 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700"
                >
                  <span>{selectedRoleLabel}</span>
                  <DropDownArrowIcon
                    className={`h-3 w-3 text-gray-400 transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <Dropdown
                  isOpen={isRoleDropdownOpen}
                  onClose={() => setIsRoleDropdownOpen(false)}
                  className="left-0 right-auto mt-1 min-w-full rounded-md border border-gray-200 py-1 shadow-lg"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <DropdownItem
                      key={role.id}
                      onClick={() => {
                        setSelectedRole(role.id);
                        setIsRoleDropdownOpen(false);
                      }}
                      baseClassName={`block w-full px-3 py-2 text-left text-sm transition hover:bg-gray-50 ${
                        role.id === selectedRole ? "font-semibold text-[#007B8C]" : "text-gray-700"
                      }`}
                    >
                      {role.label}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">Permission for {selectedRoleLabel}</p>
            </div>

            <div className="space-y-3">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.id} className="overflow-hidden rounded-md border border-gray-200 bg-white">
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                    {group.title}
                  </div>
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-gray-100 px-4 py-2 last:border-b-0"
                    >
                      <p className="text-[13px] text-gray-600">{item.label}</p>
                      <input
                        type="checkbox"
                        checked={Boolean(permissionsByRole[selectedRole]?.[item.id])}
                        onChange={(event) => togglePermission(item.id, event.target.checked)}
                        className="h-3.5 w-3.5 accent-[#F26A4E]"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </PageContentContainer>
      </div>
    </>
  );
}

