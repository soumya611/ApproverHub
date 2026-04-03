import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { JobRow as JobRowType } from "../jobs/types";
import { useJobsStore } from "../../stores/jobsStore";
import { useUsersStore } from "../../stores/usersStore";
import {
  CalenderIcon,
  ChevronLeftIcon,
  EditDetailsIcon,
  EnvelopeIcon,
  ExportIcon,
  Search,
  UserIcon,
  VerticalDots,
} from "../../icons";
import UserAvatar from "../common/UserAvatar";
import AppBreadcrumb from "../common/AppBreadcrumb";
import PageContentContainer from "../layout/PageContentContainer";
import SearchInput from "../ui/search-input/SearchInput";
import UnderlineTabs from "../ui/tabs/UnderlineTabs";
import ProfileAssociatedWorkflowTable, {
  type ProfileWorkflowRow,
} from "../ui/profile/ProfileAssociatedWorkflowTable";
import ProfileJobTag from "../ui/profile/ProfileJobTag";
import ProfileStatusIndicator from "../ui/profile/ProfileStatusIndicator";
import ProfileTableCheckbox from "../ui/profile/ProfileTableCheckbox";
import UserCell from "../ui/user-cell/UserCell";
import { TableHeaderRow } from "../ui/table";
import Popup, { type PopupItem } from "../ui/popup/Popup";

type UserDetailTab = "associated_jobs" | "associated_workflow";
type JobSortOption = "late" | "today" | "tomorrow" | "this_week" | "next_week" | "no_date";

type WorkflowMeta = {
  workflow: ProfileWorkflowRow;
  deadlines: Date[];
  hasLateTag: boolean;
};

const TABS: Array<{ id: UserDetailTab; label: string }> = [
  { id: "associated_jobs", label: "Associated Jobs" },
  { id: "associated_workflow", label: "Associated Workflow" },
];

const JOB_COLUMNS = [
  { id: "campaign_id", label: "Campaign ID" },
  { id: "job_id", label: "Job ID" },
  { id: "job_name", label: "Job Name" },
  { id: "created", label: "Created" },
  { id: "deadline", label: "Deadline" },
  { id: "status", label: "Status" },
  { id: "owner", label: "Owner" },
];

const SORT_ITEMS: Array<{ id: JobSortOption; label: string }> = [
  { id: "late", label: "Late" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "this_week", label: "This week" },
  { id: "next_week", label: "Next week" },
  { id: "no_date", label: "No Date" },
];

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0]?.charAt(0)?.toUpperCase() ?? "U";
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const parseDate = (raw?: string) => {
  if (!raw?.trim()) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDeadline = (job: JobRowType) => job.workflowStages?.at(-1)?.dueDate ?? "";
const getWorkflowKey = (job: JobRowType) => job.workflowId ?? `WF-${job.id}`;

const getStatusClassName = (status: JobRowType["status"]) => {
  switch (status) {
    case "In Progress":
      return "bg-[#D6EEF1] text-[#007B8C]";
    case "Complete":
      return "bg-green-100 text-green-700";
    case "Changes required":
      return "bg-[#FFF4E0] text-[#D98B00]";
    case "On hold":
      return "bg-[#FDEDED] text-[#E74C3C]";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const isDateInRange = (value: Date, start: Date, end: Date) => value >= start && value <= end;

const matchesSortByDates = (dates: Date[], hasLateTag: boolean, sort: JobSortOption) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (sort === "no_date") return dates.length === 0;
  if (dates.length === 0) return false;

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const weekday = (now.getDay() + 6) % 7;
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - weekday);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

  const nextWeekStart = new Date(thisWeekEnd);
  nextWeekStart.setDate(thisWeekEnd.getDate() + 1);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

  switch (sort) {
    case "late":
      return hasLateTag || dates.some((date) => date < now);
    case "today":
      return dates.some((date) => isSameDay(date, now));
    case "tomorrow":
      return dates.some((date) => isSameDay(date, tomorrow));
    case "this_week":
      return dates.some((date) => isDateInRange(date, thisWeekStart, thisWeekEnd));
    case "next_week":
      return dates.some((date) => isDateInRange(date, nextWeekStart, nextWeekEnd));
    default:
      return true;
  }
};

const matchesSort = (job: JobRowType, sort: JobSortOption) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = parseDate(getDeadline(job));

  if (sort === "no_date") return !deadlineDate;
  if (!deadlineDate) return false;

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const weekday = (now.getDay() + 6) % 7;
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - weekday);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

  const nextWeekStart = new Date(thisWeekEnd);
  nextWeekStart.setDate(thisWeekEnd.getDate() + 1);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

  switch (sort) {
    case "late":
      return deadlineDate < now || job.tag === "Late";
    case "today":
      return isSameDay(deadlineDate, now);
    case "tomorrow":
      return isSameDay(deadlineDate, tomorrow);
    case "this_week":
      return isDateInRange(deadlineDate, thisWeekStart, thisWeekEnd);
    case "next_week":
      return isDateInRange(deadlineDate, nextWeekStart, nextWeekEnd);
    default:
      return true;
  }
};

export default function SettingsUserDetailView() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const users = useUsersStore((state) => state.users);
  const jobs = useJobsStore((state) => state.jobs);

  const [activeTab, setActiveTab] = useState<UserDetailTab>("associated_jobs");
  const [jobsSearchValue, setJobsSearchValue] = useState("");
  const [workflowsSearchValue, setWorkflowsSearchValue] = useState("");
  const [selectedJobsSort, setSelectedJobsSort] = useState<JobSortOption>("late");
  const [selectedWorkflowSort, setSelectedWorkflowSort] = useState<JobSortOption>("late");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isWorkflowSortOpen, setIsWorkflowSortOpen] = useState(false);
  const [openJobActionId, setOpenJobActionId] = useState<string | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<string>>(new Set());

  const user = useMemo(() => users.find((item) => item.id === userId) ?? null, [userId, users]);
  const userInitials = useMemo(() => getInitials(user?.name ?? ""), [user?.name]);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest(".user-details-sort-menu")) {
        setIsSortOpen(false);
      }
      if (!target.closest(".user-details-workflow-sort-menu")) {
        setIsWorkflowSortOpen(false);
      }
      if (!target.closest(".user-details-job-actions")) {
        setOpenJobActionId(null);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const autoMatchedJobs = useMemo(() => {
    if (!user) return [];
    const normalizedEmail = user.email.trim().toLowerCase();
    const normalizedName = user.name.trim().toLowerCase();

    const matchedJobs = jobs.filter((job) => {
      if (job.owner === userInitials) return true;

      const hasMatchingMember = (job.members ?? []).some((member) => {
        const memberEmail = member.email?.trim().toLowerCase() ?? "";
        const memberName = member.name.trim().toLowerCase();
        return (
          (normalizedEmail && memberEmail === normalizedEmail) ||
          memberName === normalizedName ||
          member.initials === userInitials
        );
      });

      return hasMatchingMember;
    });

    return matchedJobs;
  }, [jobs, user, userInitials]);

  const associatedJobs = useMemo(() => autoMatchedJobs, [autoMatchedJobs]);

  const associatedWorkflowMeta = useMemo<WorkflowMeta[]>(() => {
    const workflowMap = new Map<string, WorkflowMeta>();

    associatedJobs.forEach((job, index) => {
      const workflowKey = getWorkflowKey(job);
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
      const deadline = parseDate(getDeadline(job));

      if (existing) {
        const mergedStatus =
          existing.workflow.status === "In Progress" || status === "In Progress"
            ? "In Progress"
            : existing.workflow.status === "Not Started" || status === "Not Started"
              ? "Not Started"
              : "Complete";

        workflowMap.set(workflowKey, {
          ...existing,
          workflow: {
            ...existing.workflow,
            linkedJobs: existing.workflow.linkedJobs + 1,
            stages: Math.max(existing.workflow.stages, stageCount),
            status: mergedStatus,
          },
          deadlines: deadline ? [...existing.deadlines, deadline] : existing.deadlines,
          hasLateTag: existing.hasLateTag || job.tag === "Late",
        });
        return;
      }

      workflowMap.set(workflowKey, {
        workflow: {
          id: workflowKey,
          workflowId: workflowKey,
          workflowName,
          stages: stageCount,
          linkedJobs: 1,
          status,
          ownerInitials: job.owner,
          ownerName: ownerMember?.name,
          ownerAvatarUrl: ownerMember?.avatarUrl,
        },
        deadlines: deadline ? [deadline] : [],
        hasLateTag: job.tag === "Late",
      });
    });

    return Array.from(workflowMap.values());
  }, [associatedJobs]);

  const associatedWorkflows = useMemo(
    () => associatedWorkflowMeta.map((meta) => meta.workflow),
    [associatedWorkflowMeta]
  );

  const filteredJobs = useMemo(() => {
    const normalizedSearch = jobsSearchValue.trim().toLowerCase();

    return associatedJobs
      .filter((job) =>
        normalizedSearch
          ? [job.campaignId, job.jobNumber, job.jobName, job.owner]
              .join(" ")
              .toLowerCase()
              .includes(normalizedSearch)
          : true
      )
      .filter((job) => matchesSort(job, selectedJobsSort));
  }, [associatedJobs, jobsSearchValue, selectedJobsSort]);

  const filteredWorkflows = useMemo(() => {
    const normalizedSearch = workflowsSearchValue.trim().toLowerCase();

    return associatedWorkflowMeta
      .filter(({ workflow }) =>
        normalizedSearch
          ? [
              workflow.workflowId,
              workflow.workflowName,
              workflow.ownerName ?? "",
              workflow.ownerInitials,
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedSearch)
          : true
      )
      .filter((meta) => matchesSortByDates(meta.deadlines, meta.hasLateTag, selectedWorkflowSort))
      .map((meta) => meta.workflow);
  }, [associatedWorkflowMeta, workflowsSearchValue, selectedWorkflowSort]);

  const allJobsSelected = filteredJobs.length > 0 && selectedJobIds.size === filteredJobs.length;

  const toggleSelectAllJobs = () => {
    setSelectedJobIds((previous) =>
      previous.size === filteredJobs.length ? new Set() : new Set(filteredJobs.map((job) => job.id))
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
      previous.size === filteredWorkflows.length
        ? new Set()
        : new Set(filteredWorkflows.map((workflow) => workflow.id))
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

  useEffect(() => {
    setSelectedJobIds((previous) => {
      const validIds = new Set(filteredJobs.map((job) => job.id));
      const next = new Set(Array.from(previous).filter((id) => validIds.has(id)));
      return next.size === previous.size ? previous : next;
    });
  }, [filteredJobs]);

  useEffect(() => {
    setSelectedWorkflowIds((previous) => {
      const validIds = new Set(filteredWorkflows.map((workflow) => workflow.id));
      const next = new Set(Array.from(previous).filter((id) => validIds.has(id)));
      return next.size === previous.size ? previous : next;
    });
  }, [filteredWorkflows]);

  const jobsSortPopupItems: PopupItem[] = SORT_ITEMS.map((item) => ({
    id: item.id,
    label: item.label,
    onClick: () => {
      setSelectedJobsSort(item.id);
      setIsSortOpen(false);
    },
  }));

  const workflowsSortPopupItems: PopupItem[] = SORT_ITEMS.map((item) => ({
    id: item.id,
    label: item.label,
    onClick: () => {
      setSelectedWorkflowSort(item.id);
      setIsWorkflowSortOpen(false);
    },
  }));

  if (!user) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb />
        <PageContentContainer className="p-8">
          <p className="text-sm text-gray-500">User not found.</p>
        </PageContentContainer>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AppBreadcrumb />

      <PageContentContainer className="p-0">
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/settings/people/users")}
              className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-[#007B8C]"
              aria-label="Back to users"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <h2 className="text-[30px] font-semibold text-[#007B8C]">Users Details</h2>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <UserAvatar
                    size="large"
                    name={user.name}
                    avatarUrl={user.avatarUrl}
                    className="!h-[104px] !w-[104px] text-2xl"
                  />
                  <div>
                    <h3 className="text-[28px] font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">Employee ID:{user.id}</p>
                    <div className="mt-2 flex items-center text-base font-normal text-gray-600">
                      {user.role} <span className="mx-1">|</span>{" "}
                      <ProfileStatusIndicator status={user.accountStatus ?? "active"} />
                    </div>
                    <p className="mt-3 text-base text-gray-600">
                      Department: {user.title || "Department"}
                    </p>
                    <p className="text-base text-gray-600">Teams: {user.team || "Teams"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Edit user details"
                >
                  <EditDetailsIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-sm border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-5">
                <span className="flex items-center gap-3 text-base text-gray-800">
                  <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                  Email
                </span>
                <span className="text-sm text-gray-500">{user.email || "--"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-5">
                <span className="flex items-center gap-3 text-base text-gray-800">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  Contact info
                </span>
                <span className="text-sm text-gray-500">{user.phone || "--"}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-5">
                <span className="flex items-center gap-3 text-base text-gray-800">
                  <CalenderIcon className="h-4 w-4 text-gray-500" />
                  Work schedule
                </span>
                <span className="text-sm text-gray-500">{user.workSchedule || "Mon Fri"}</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 pt-2">
              <UnderlineTabs
                tabs={TABS}
                activeTab={activeTab}
                onChange={setActiveTab}
                className="flex flex-wrap items-end gap-8"
                tabClassName="-mb-px border-b-2 px-1 pb-3 pt-3 text-base transition"
                activeClassName="border-[#007B8C] font-semibold text-[#007B8C]"
                inactiveClassName="border-transparent font-medium text-gray-400 hover:text-gray-700"
              />
            </div>

            {activeTab === "associated_jobs" ? (
              <div className="space-y-3 p-3">
                {associatedJobs.length > 0 ? (
                  <>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <div className="w-full max-w-[280px] rounded-lg border border-gray-200 bg-white px-3 py-2">
                        <SearchInput
                          value={jobsSearchValue}
                          onChange={(event) => setJobsSearchValue(event.target.value)}
                          placeholder="Search jobs"
                          containerClassName="gap-2"
                          icon={<Search className="h-5 w-5 text-gray-400" />}
                          className="text-sm text-gray-700"
                          inputClassName="text-sm text-gray-700"
                        />
                      </div>

                      <div className="user-details-sort-menu relative">
                        <button
                          type="button"
                          onClick={() => setIsSortOpen((previous) => !previous)}
                          className="rounded-md border border-gray-200 bg-white p-2 text-gray-500 transition hover:bg-gray-50"
                          aria-label="Sort jobs"
                        >
                          <ExportIcon className="h-4 w-4" />
                        </button>
                        {isSortOpen ? (
                          <div className="absolute right-0 top-full z-40 mt-2">
                            <Popup items={jobsSortPopupItems} className="!min-w-[130px] rounded-lg" />
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1120px] border-separate border-spacing-y-3 text-sm">
                        <thead>
                          <TableHeaderRow
                            className="text-left text-sm text-gray-700"
                            columns={JOB_COLUMNS}
                            getColumnKey={(column) => column.id}
                            renderColumn={(column) => column.label}
                            columnClassName="px-4 py-2 !font-medium"
                            prefixCells={[
                              {
                                className: "px-4 py-2",
                                content: (
                                  <ProfileTableCheckbox
                                    checked={allJobsSelected}
                                    onChange={toggleSelectAllJobs}
                                    label="Select all"
                                  />
                                ),
                              },
                            ]}
                            suffixCells={[{ className: "px-4 py-2 text-right", content: "" }]}
                          />
                        </thead>
                        <tbody>
                          {filteredJobs.length > 0 ? (
                            filteredJobs.map((job) => {
                              const baseCellClass =
                                "border-y border-gray-200 bg-white px-4 py-3 align-middle";
                              const leftCellClass = `${baseCellClass} border-l rounded-l-lg`;
                              const rightCellClass = `${baseCellClass} border-r rounded-r-lg text-right`;
                              const ownerMember = job.members?.find((member) => member.initials === job.owner);
                              const jobMenuItems: PopupItem[] = [
                                {
                                  id: `transfer-${job.id}`,
                                  label: "Transfer this job ownership",
                                  onClick: () => setOpenJobActionId(null),
                                },
                              ];

                              return (
                                <tr key={job.id} className="text-sm text-gray-700">
                                  <td className={leftCellClass}>
                                    <ProfileTableCheckbox
                                      checked={selectedJobIds.has(job.id)}
                                      onChange={() => toggleSelectJob(job.id)}
                                      aria-label={`Select ${job.jobName}`}
                                    />
                                  </td>
                                  <td className={baseCellClass}>{job.campaignId}</td>
                                  <td className={baseCellClass}>{job.jobNumber}</td>
                                  <td className={baseCellClass}>
                                    <div className="flex flex-col gap-1">
                                      <ProfileJobTag tag={job.tag} />
                                      <span className="text-gray-800">{job.jobName}</span>
                                    </div>
                                  </td>
                                  <td className={baseCellClass}>{job.created}</td>
                                  <td className={baseCellClass}>{getDeadline(job) || "No Date"}</td>
                                  <td className={baseCellClass}>
                                    <span
                                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-normal ${getStatusClassName(
                                        job.status
                                      )}`}
                                    >
                                      {job.status}
                                    </span>
                                  </td>
                                  <td className={baseCellClass}>
                                    <UserCell
                                      avatarAlt={job.owner}
                                      avatarUrl={ownerMember?.avatarUrl}
                                      avatarSize="xsmall"
                                      avatarFallback="initials"
                                      className="min-w-[120px] items-center"
                                      titleClassName="text-xs font-medium text-gray-700"
                                      contentClassName="max-w-[130px]"
                                    />
                                  </td>
                                  <td className={rightCellClass}>
                                    <div className="user-details-job-actions relative inline-flex">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setOpenJobActionId((current) =>
                                            current === job.id ? null : job.id
                                          )
                                        }
                                        className="rounded-full p-1 text-gray-400 transition hover:text-gray-600"
                                        aria-label={`More options for ${job.jobName}`}
                                      >
                                        <VerticalDots className="h-4 w-4" />
                                      </button>
                                      {openJobActionId === job.id ? (
                                        <div className="absolute right-0 top-full z-40 mt-2">
                                          <Popup items={jobMenuItems} className="!min-w-[210px] rounded-lg" />
                                        </div>
                                      ) : null}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={JOB_COLUMNS.length + 2}
                                className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400"
                              >
                                No associated jobs found for the current search/filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
                    No associated jobs found.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 p-3">
                {associatedWorkflows.length > 0 ? (
                  <>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <div className="w-full max-w-[280px] rounded-lg border border-gray-200 bg-white px-3 py-2">
                        <SearchInput
                          value={workflowsSearchValue}
                          onChange={(event) => setWorkflowsSearchValue(event.target.value)}
                          placeholder="Search workflow"
                          containerClassName="gap-2"
                          icon={<Search className="h-5 w-5 text-gray-400" />}
                          className="text-sm text-gray-700"
                          inputClassName="text-sm text-gray-700"
                        />
                      </div>

                      <div className="user-details-workflow-sort-menu relative">
                        <button
                          type="button"
                          onClick={() => setIsWorkflowSortOpen((previous) => !previous)}
                          className="rounded-md border border-gray-200 bg-white p-2 text-gray-500 transition hover:bg-gray-50"
                          aria-label="Filter workflows"
                        >
                          <ExportIcon className="h-4 w-4" />
                        </button>
                        {isWorkflowSortOpen ? (
                          <div className="absolute right-0 top-full z-40 mt-2">
                            <Popup
                              items={workflowsSortPopupItems}
                              className="!min-w-[130px] rounded-lg"
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {filteredWorkflows.length > 0 ? (
                      <ProfileAssociatedWorkflowTable
                        workflows={filteredWorkflows}
                        selectedIds={selectedWorkflowIds}
                        onToggleSelectAll={toggleSelectAllWorkflows}
                        onToggleSelect={toggleSelectWorkflow}
                      />
                    ) : (
                      <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-5 text-center text-sm text-gray-500">
                        No associated workflow found for the current search/filter.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
                    No associated workflow found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </PageContentContainer>
    </div>
  );
}
