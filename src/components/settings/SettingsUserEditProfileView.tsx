import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AngleRightIcon, CameraIcon, ChevronDownIcon, LockIcon } from "../../icons";
import { useUsersStore } from "../../stores/usersStore";
import { useUserProfileSettingsStore } from "../../stores/userProfileSettingsStore";
import AppBreadcrumb from "../common/AppBreadcrumb";
import UserAvatar from "../common/UserAvatar";
import PageContentContainer from "../layout/PageContentContainer";
import Button from "../ui/button/Button";
import PageHeader from "../ui/page-header/PageHeader";
import TextInput from "../ui/text-input/TextInput";
import UserCell from "../ui/user-cell/UserCell";

const USER_EDIT_BREADCRUMB_ITEMS = [
  { label: "Settings", to: "/settings" },
  { label: "People", to: "/settings/people/users" },
  { label: "User Detail", to: "/settings/people/users" },
  { label: "Edit" },
];

type EditFormState = {
  name: string;
  role: string;
  department: string;
  team: string;
  email: string;
  phone: string;
};

const createFormState = (input: {
  name: string;
  role: string;
  department?: string;
  team?: string;
  email: string;
  phone?: string;
}): EditFormState => ({
  name: input.name,
  role: input.role,
  department: input.department ?? "",
  team: input.team ?? "",
  email: input.email,
  phone: input.phone ?? "",
});

const EDIT_INPUT_BASE_CLASS =
  "!h-11 !rounded-lg !border-gray-300 !px-4 !text-sm !font-normal !text-gray-800 !shadow-none placeholder:!font-normal placeholder:!text-gray-400 focus:!border-[#007B8C] focus:!ring-0";
const EDIT_LABEL_CLASS = "!text-sm !font-normal !text-gray-700 !pl-4";
const EDIT_SELECT_BASE_CLASS =
  "h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 pr-10 text-sm font-normal text-gray-800 shadow-none focus:border-[#007B8C] focus:outline-none focus:ring-0";

const buildSelectOptions = (values: string[], currentValue: string) => {
  const uniqueValues = Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort(
    (left, right) => left.localeCompare(right)
  );

  const normalizedCurrent = currentValue.trim();
  if (normalizedCurrent && !uniqueValues.includes(normalizedCurrent)) {
    uniqueValues.push(normalizedCurrent);
  }

  return uniqueValues;
};

export default function SettingsUserEditProfileView() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const users = useUsersStore((state) => state.users);
  const updateUser = useUsersStore((state) => state.updateUser);

  const workScheduleByUser = useUserProfileSettingsStore((state) => state.workScheduleByUser);

  const user = useMemo(
    () => users.find((item) => item.id === userId) ?? null,
    [userId, users]
  );

  const [formState, setFormState] = useState<EditFormState>(() =>
    createFormState({
      name: "",
      role: "",
      email: "",
    })
  );

  useEffect(() => {
    if (!user) return;
    setFormState(
      createFormState({
        name: user.name,
        role: user.role,
        department: user.title,
        team: user.team,
        email: user.email,
        phone: user.phone,
      })
    );
  }, [user]);

  if (!user) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb items={USER_EDIT_BREADCRUMB_ITEMS} />
        <PageContentContainer className="p-8">
          <p className="text-sm text-gray-500">User not found.</p>
        </PageContentContainer>
      </div>
    );
  }

  const schedule = workScheduleByUser[user.id];

  const roleOptions = buildSelectOptions(
    users.map((candidate) => candidate.role),
    formState.role
  );

  const departmentOptions = buildSelectOptions(
    users.map((candidate) => candidate.title ?? ""),
    formState.department
  );

  const teamOptions = buildSelectOptions(
    users.map((candidate) => candidate.team ?? ""),
    formState.team
  );

  const handleSave = () => {
    updateUser(user.id, {
      name: formState.name.trim() || user.name,
      role: formState.role.trim() || user.role,
      title: formState.department.trim(),
      team: formState.team.trim(),
      email: formState.email,
      phone: formState.phone.trim(),
    });

    navigate(`/settings/people/users/${user.id}`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AppBreadcrumb
        items={[
          { label: "Settings", to: "/settings" },
          { label: "People", to: "/settings/people/users" },
          { label: "User Detail", to: `/settings/people/users/${user.id}` },
          { label: "Edit" },
        ]}
      />

      <PageContentContainer className="relative min-h-0 flex-1 overflow-hidden p-0">
        <PageHeader
          title="Edit Profile"
          titleClassName="!text-[20px] !font-semibold"
          onBackClick={() => navigate(`/settings/people/users/${user.id}`)}
        />

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_430px]">
            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <div className="flex justify-end text-sm text-gray-500">Employee ID:{user.id}</div>

              <div className="mt-2 grid gap-x-25 gap-y-5 xl:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <UserAvatar
                        size="large"
                        name={user.name}
                        avatarUrl={user.avatarUrl}
                        className="!h-[116px] !w-[116px] text-2xl"
                      />
                      <span className="absolute bottom-1 right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-gray-100 text-gray-500">
                        <CameraIcon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>

                  <TextInput
                    label="User name"
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, name: event.target.value }))
                    }
                    containerClassName="!gap-0"
                    labelClassName={EDIT_LABEL_CLASS}
                    className={EDIT_INPUT_BASE_CLASS}
                  />

                  <label className="block space-y-2">
                    <span className="text-sm text-gray-700">Password</span>
                    <div className="flex h-11 items-center justify-between rounded-lg border border-gray-300 px-4">
                      <span className="text-lg mt-2 text-gray-500">********</span>
                      <span className="text-sm font-medium text-[#F16651]">Change Password</span>
                    </div>
                  </label>

                  <TextInput
                    label="Email ID"
                    type="email"
                    value={formState.email}
                    disabled
                    containerClassName="!gap-0"
                    labelClassName={EDIT_LABEL_CLASS}
                    className={`${EDIT_INPUT_BASE_CLASS} !border-gray-200 !bg-gray-50 !pr-10 !text-gray-500`}
                    rightAdornment={<LockIcon className="h-4 w-4 text-gray-400" />}
                  />

                  <TextInput
                    label="Phone Number"
                    type="text"
                    value={formState.phone}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, phone: event.target.value }))
                    }
                    containerClassName="!gap-0"
                    labelClassName={EDIT_LABEL_CLASS}
                    className={EDIT_INPUT_BASE_CLASS}
                  />
                </div>

                <div className="space-y-4 xl:pt-[132px]">
                  <label className="flex w-full flex-col gap-0">
                    <span className={EDIT_LABEL_CLASS}>Role</span>
                    <span className="relative block">
                      <select
                        value={formState.role}
                        onChange={(event) =>
                          setFormState((current) => ({ ...current, role: event.target.value }))
                        }
                        className={EDIT_SELECT_BASE_CLASS}
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </span>
                  </label>

                  <label className="flex w-full flex-col gap-0">
                    <span className={EDIT_LABEL_CLASS}>Department</span>
                    <span className="relative block">
                      <select
                        value={formState.department}
                        onChange={(event) =>
                          setFormState((current) => ({ ...current, department: event.target.value }))
                        }
                        className={EDIT_SELECT_BASE_CLASS}
                      >
                        {departmentOptions.map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </span>
                  </label>

                  <label className="flex w-full flex-col gap-0">
                    <span className={EDIT_LABEL_CLASS}>Team</span>
                    <span className="relative block">
                      <select
                        value={formState.team}
                        onChange={(event) =>
                          setFormState((current) => ({ ...current, team: event.target.value }))
                        }
                        className={EDIT_SELECT_BASE_CLASS}
                      >
                        {teamOptions.map((team) => (
                          <option key={team} value={team}>
                            {team}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  type="button"
                  size="sm"
                  variant="orangebutton"
                  onClick={handleSave}
                  className="!px-10 !py-3 !rounded-md"
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div
                 className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-2 text-left transition hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-800">Notification</span>
                <button  type="button"
                onClick={() => navigate(`/settings/people/users/${user.id}/notifications`)}
              >
                <AngleRightIcon className="h-4 w-4 text-gray-400" />

                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div
                   className="flex w-full items-center justify-between border-b border-gray-200 px-5 py-2 text-left transition hover:bg-gray-50"
                >
                  <span>
                    <span className="block text-sm font-medium text-gray-800">Work Schedule</span>
                    <span className="block text-sm text-gray-500">
                      {user.workSchedule || "Monday to Friday"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/settings/people/users/${user.id}/work-schedule`)}
                  >
                  <AngleRightIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                <div className="px-5 py-2">
                  <p className="text-sm font-medium text-gray-800">Upcoming Leave</p>
                </div>

                <div className="space-y-2 p-4">
                  {(schedule?.history ?? []).map((item) => {
                    const transferredUser = item.transferredToUserId
                      ? users.find((candidate) => candidate.id === item.transferredToUserId)
                      : undefined;

                    return (
                      <div key={item.id} className="rounded-sm border border-gray-200">
                        <div className="border-l-4 border-[#0A92A5] px-3 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-800">{item.dateRange}</span>
                            <span className="text-sm text-[#4C6694]">{item.duration}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{item.reason}</p>
                        </div>

                        <div className="border-t border-gray-200 px-3 py-2 text-sm text-gray-700">
                          Job transferred to{" "}
                          {item.transferredJobIds.length > 0
                            ? `(${item.transferredJobIds.length} jobs)`
                            : "--"}
                        </div>
                        {transferredUser ? (
                          <div className="border-t border-gray-200 px-3 py-2">
                            <UserCell
                              title={transferredUser.name}
                              subtitle={transferredUser.email || "--"}
                              avatarUrl={transferredUser.avatarUrl}
                              avatarSize="xsmall"
                              className="items-center"
                              titleClassName="text-sm font-medium text-gray-700"
                              subtitleClassName="text-xs text-gray-500"
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}

                  {schedule?.history?.length ? null : (
                    <div className="rounded-sm border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-400">
                      No upcoming leave.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContentContainer>
    </div>
  );
}
