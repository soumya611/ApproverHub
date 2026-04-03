import { useState } from "react";
import { AngleUpIcon } from "../../icons";
import AppBreadcrumb from "../common/AppBreadcrumb";
import Button from "../ui/button/Button";
import ProfileSettingsPageContainer from "../ui/profile/ProfileSettingsPageContainer";
import ToggleSwitch from "../ui/toggle/ToggleSwitch";
import UserCell from "../ui/user-cell/UserCell";

interface LeaveJob {
  id: string;
  jobId: string;
  jobName: string;
}

interface LeaveScheduleItem {
  id: string;
  dateRange: string;
  duration: string;
  reason: string;
  transferLabel: string;
  transferredUser?: {
    name: string;
    avatarUrl?: string;
  };
  jobs?: LeaveJob[];
}

const LEAVE_SCHEDULE: LeaveScheduleItem[] = [
  {
    id: "leave-1",
    dateRange: "15 Oct 25",
    duration: "1 Day",
    reason: "Doctor's appointment",
    transferLabel: "--",
  },
  {
    id: "leave-2",
    dateRange: "25 Oct 25 - 2 Nov 25",
    duration: "8 Day",
    reason: "Doctor's appointment",
    transferLabel: "to (4 jobs)",
    transferredUser: {
      name: "Pranali Gosavi",
      avatarUrl: "https://avatars.githubusercontent.com/u/11765938?v=4",
    },
    jobs: [
      { id: "job-1", jobId: "SP11402048", jobName: "Summer allergies Poster" },
      { id: "job-2", jobId: "SP11402048", jobName: "Summer allergies Poster" },
      { id: "job-3", jobId: "SP11402048", jobName: "Summer allergies Poster" },
      { id: "job-4", jobId: "SP11402048", jobName: "Summer allergies Poster" },
    ],
  },
];

export default function TeamManagerWorkScheduleView() {
  const [outOfOffice, setOutOfOffice] = useState(true);
  const [assignSubstitute, setAssignSubstitute] = useState(false);
  const [expandedLeaveId, setExpandedLeaveId] = useState<string | null>("leave-2");

  return (
    <ProfileSettingsPageContainer
      title="Work Schedule"
      breadcrumbCurrent="Work Schedule"
      breadcrumbOverride={
        <AppBreadcrumb
          items={[
            { label: "Settings", to: "/settings" },
            { label: "People", to: "/settings/people/users" },
            { label: "User Profile", to: "/profile" },
            { label: "Work Schedule" },
          ]}
        />
      }
      headerRight={
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium text-gray-800">Out Of Office</span>
          <ToggleSwitch
            checked={outOfOffice}
            onChange={setOutOfOffice}
            showLabel={false}
            size="sm"
            trackClassName="!h-5 !w-9"
            thumbClassName="!h-4 !w-4 peer-checked:!translate-x-4"
          />
        </div>
      }
      contentClassName="min-h-[620px] bg-[#FAFAFA] p-6"
    >
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-2xl font-semibold text-gray-800">Add Leave</h3>

          <div className="mt-4 rounded-md border border-gray-200 bg-white px-4 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-r border-gray-200 pr-4">
                <p className="text-sm text-gray-500">From</p>
                <p className="mt-1 text-xl font-medium text-gray-700">04 - Oct - 25</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">To</p>
                <p className="mt-1 text-xl font-medium text-gray-700">10 - Oct - 25</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-b border-gray-200 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[19px] font-medium text-gray-800">Assign Substitute For Leave</span>
              <ToggleSwitch
                checked={assignSubstitute}
                onChange={setAssignSubstitute}
                showLabel={false}
                size="sm"
                trackClassName="!h-5 !w-9"
                thumbClassName="!h-4 !w-4 peer-checked:!translate-x-4"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="!rounded-md !border-[#F8DFDA] !bg-[#FFF4F2] !px-6 !py-2 text-[var(--color-secondary-500)]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              variant="primary"
              className="!rounded-md !bg-[var(--color-secondary-500)] !px-7 !py-2 text-white hover:!bg-[var(--color-secondary-600)]"
            >
              Save
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-[32px] font-normal text-gray-800">My leave scheduled</h3>

          <div className="mt-4 space-y-4">
            {LEAVE_SCHEDULE.map((leave) => {
              const isExpanded = leave.id === expandedLeaveId && (leave.jobs?.length ?? 0) > 0;

              return (
                <div key={leave.id} className="overflow-hidden rounded-sm border border-gray-200 bg-white">
                  <div className="border-l-4 border-[#0A92A5] px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xl font-medium text-gray-800">{leave.dateRange}</p>
                      <span className="text-sm text-[#4C6694]">{leave.duration}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{leave.reason}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                    <span className="text-xl text-gray-700">Job transferred {leave.transferLabel}</span>
                    {leave.jobs?.length ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedLeaveId((current) => (current === leave.id ? null : leave.id))
                        }
                        className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        aria-label={isExpanded ? "Collapse leave jobs" : "Expand leave jobs"}
                      >
                        <AngleUpIcon
                          className={`h-4 w-4 transition-transform ${
                            isExpanded ? "rotate-0" : "rotate-180"
                          }`}
                        />
                      </button>
                    ) : (
                      <span className="text-lg text-gray-400">-</span>
                    )}
                  </div>

                  {isExpanded && leave.transferredUser ? (
                    <div className="border-t border-gray-200 bg-[#FAFAFA] px-3 py-3">
                      <UserCell
                        title={leave.transferredUser.name}
                        avatarUrl={leave.transferredUser.avatarUrl}
                        avatarSize="xsmall"
                        className="mb-3 items-center"
                        titleClassName="text-sm font-medium text-gray-700"
                      />

                      <div className="space-y-2">
                        {leave.jobs?.map((job) => (
                          <div
                            key={job.id}
                            className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2"
                          >
                            <div className="grid flex-1 grid-cols-[120px_1fr] gap-2">
                              <span className="text-xs text-gray-600">{job.jobId}</span>
                              <span className="text-xs text-gray-700">{job.jobName}</span>
                            </div>
                            <Button
                              type="button"
                              size="tiny"
                              variant="secondary"
                              className="!h-[28px] !w-auto rounded-md border-[#F8DFDA] bg-[#FFF4F2] px-3 text-[11px] text-[var(--color-secondary-500)]"
                            >
                              Revert job ownership
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ProfileSettingsPageContainer>
  );
}
