import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { JobMember, JobRow as JobRowType } from "../jobs/types";
import { useJobsStore } from "../../stores/jobsStore";
import { useUsersStore } from "../../stores/usersStore";
import {
  CameraIcon,
  CalenderIcon,
  EditDetailsIcon,
  EnvelopeIcon,
  AngleRightIcon,
  Search,
  VerticalDots,
  Ep_sort_Icon,
  Call_Icon,
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
import PopupModal from "../ui/popup-modal/PopupModal";
import Button from "../ui/button/Button";
import PageHeader from "../ui/page-header/PageHeader";

type UserDetailTab = "associated_jobs" | "associated_workflow";
type JobSortOption = "late" | "today" | "tomorrow" | "others";

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
  { id: "others", label: "Others" },
];

const USER_ASSOCIATED_JOB_OVERRIDES: Record<string, string[]> = {
  ID1002451: ["1", "3", "5", "7"],
  ID1234656: ["1", "6", "7", "5"],
  ID1008842: ["6", "7", "1", "5"],
};

const USER_DETAIL_BREADCRUMB_ITEMS = [
  { label: "Settings", to: "/settings" },
  { label: "People", to: "/settings/people/users" },
  { label: "User Detail" },
];

const USER_DETAIL_CHECKBOX_CLASS = "!border !border-[#F8C9C9] !bg-white";
const TRANSFER_OWNER_MEMBER_CLASS = "bg-[#007B8C] text-white";

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
      return "bg-[#DDEDD6] text-[#5C9A3F]";
    case "Changes required":
      return "bg-[#F8EFDC] text-[#D29019]";
    case "On hold":
      return "bg-[#FCEAEA] text-[#E76558]";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const matchesSortByDates = (dates: Date[], hasLateTag: boolean, sort: JobSortOption) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (sort === "others") return true;
  if (dates.length === 0) return false;

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  switch (sort) {
    case "late":
      return hasLateTag || dates.some((date) => date < now);
    case "today":
      return dates.some((date) => isSameDay(date, now));
    case "tomorrow":
      return dates.some((date) => isSameDay(date, tomorrow));
    default:
      return true;
  }
};

const matchesSort = (job: JobRowType, sort: JobSortOption) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = parseDate(getDeadline(job));

  if (sort === "others") return true;
  if (!deadlineDate) return false;

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  switch (sort) {
    case "late":
      return deadlineDate < now || job.tag === "Late";
    case "today":
      return isSameDay(deadlineDate, now);
    case "tomorrow":
      return isSameDay(deadlineDate, tomorrow);
    default:
      return true;
  }
};

export default function SettingsUserDetailView() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const users = useUsersStore((state) => state.users);
  const updateUserStatusInStore = useUsersStore((state) => state.updateUserStatus);
  const jobs = useJobsStore((state) => state.jobs);
  const updateJob = useJobsStore((state) => state.updateJob);

  const [activeTab, setActiveTab] = useState<UserDetailTab>("associated_jobs");
  const [jobsSearchValue, setJobsSearchValue] = useState("");
  const [workflowsSearchValue, setWorkflowsSearchValue] = useState("");
  const [selectedJobsSort, setSelectedJobsSort] = useState<JobSortOption>("others");
  const [selectedWorkflowSort, setSelectedWorkflowSort] = useState<JobSortOption>("others");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isWorkflowSortOpen, setIsWorkflowSortOpen] = useState(false);
  const [openJobActionId, setOpenJobActionId] = useState<string | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<string>>(new Set());
  const [transferJobId, setTransferJobId] = useState<string | null>(null);
  const [transferSearchValue, setTransferSearchValue] = useState("");
  const [transferTargetUserId, setTransferTargetUserId] = useState("");
  const [workflowDetails, setWorkflowDetails] = useState<ProfileWorkflowRow | null>(null);
  const [deletedWorkflowIds, setDeletedWorkflowIds] = useState<Set<string>>(new Set());
  const [workflowActivityById, setWorkflowActivityById] = useState<Record<string, boolean>>(
    {}
  );

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

  useEffect(() => {
    setIsSortOpen(false);
    setIsWorkflowSortOpen(false);
    setOpenJobActionId(null);
  }, [activeTab]);

  const closeTransferModal = () => {
    setTransferJobId(null);
    setTransferSearchValue("");
    setTransferTargetUserId("");
  };

  const openTransferModalForJob = (jobId: string) => {
    setTransferJobId(jobId);
    setTransferSearchValue("");
    setTransferTargetUserId("");
  };

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

  const associatedJobs = useMemo(() => {
    if (!user) return [];
    if (autoMatchedJobs.length > 0) return autoMatchedJobs;

    const overrideJobIds = USER_ASSOCIATED_JOB_OVERRIDES[user.id] ?? [];
    if (overrideJobIds.length === 0) return [];

    return overrideJobIds
      .map((jobId) => jobs.find((job) => job.id === jobId))
      .filter((job): job is JobRowType => Boolean(job));
  }, [autoMatchedJobs, jobs, user]);

  const selectedTransferJob = useMemo(
    () => jobs.find((job) => job.id === transferJobId) ?? null,
    [jobs, transferJobId]
  );

  const transferOwnerMember = useMemo(
    () =>
      selectedTransferJob?.members?.find(
        (member) => member.initials === selectedTransferJob.owner
      ),
    [selectedTransferJob]
  );

  const transferCandidates = useMemo(() => {
    if (!selectedTransferJob) return [];
    const normalizedSearch = transferSearchValue.trim().toLowerCase();

    return users
      .filter((candidate) => candidate.isActive)
      .filter((candidate) => getInitials(candidate.name) !== selectedTransferJob.owner)
      .filter((candidate) =>
        normalizedSearch
          ? [candidate.name, candidate.email, candidate.role]
              .join(" ")
              .toLowerCase()
              .includes(normalizedSearch)
          : true
      )
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [selectedTransferJob, transferSearchValue, users]);

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

  useEffect(() => {
    const validWorkflowIds = new Set(associatedWorkflows.map((workflow) => workflow.id));
    setDeletedWorkflowIds((previous) => {
      const next = new Set(Array.from(previous).filter((id) => validWorkflowIds.has(id)));
      return next.size === previous.size ? previous : next;
    });
  }, [associatedWorkflows]);

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
      .filter(({ workflow }) => !deletedWorkflowIds.has(workflow.id))
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
  }, [associatedWorkflowMeta, deletedWorkflowIds, workflowsSearchValue, selectedWorkflowSort]);

  useEffect(() => {
    setWorkflowActivityById((previous) => {
      let didChange = false;
      const next: Record<string, boolean> = {};

      filteredWorkflows.forEach((workflow) => {
        if (previous[workflow.id] === undefined) {
          next[workflow.id] = true;
          didChange = true;
          return;
        }
        next[workflow.id] = previous[workflow.id];
      });

      if (Object.keys(previous).length !== Object.keys(next).length) {
        didChange = true;
      }

      if (!didChange) return previous;
      return next;
    });
  }, [filteredWorkflows]);

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

  const handleTransferOwnership = () => {
    if (!selectedTransferJob || !transferTargetUserId) return;

    const selectedTargetUser = users.find((candidate) => candidate.id === transferTargetUserId);
    if (!selectedTargetUser) return;

    const targetInitials = getInitials(selectedTargetUser.name);
    const normalizedTargetEmail = selectedTargetUser.email.trim().toLowerCase();
    const existingMembers = selectedTransferJob.members ?? [];
    const existingTargetMember = existingMembers.find((member) => {
      const normalizedMemberEmail = member.email?.trim().toLowerCase() ?? "";
      return (
        member.initials === targetInitials ||
        member.name.trim().toLowerCase() === selectedTargetUser.name.trim().toLowerCase() ||
        (normalizedTargetEmail && normalizedMemberEmail === normalizedTargetEmail)
      );
    });

    const nextMembers: JobMember[] = existingTargetMember
      ? existingMembers
      : [
          ...existingMembers,
          {
            id: `user-${selectedTargetUser.id}`,
            name: selectedTargetUser.name,
            initials: targetInitials,
            className: TRANSFER_OWNER_MEMBER_CLASS,
            avatarUrl: selectedTargetUser.avatarUrl,
            email: selectedTargetUser.email || undefined,
            role: "Approver",
          },
        ];

    updateJob(selectedTransferJob.id, {
      owner: targetInitials,
      members: nextMembers,
    });

    closeTransferModal();
    setOpenJobActionId(null);
  };

  const getWorkflowIsActive = (workflow: ProfileWorkflowRow) =>
    workflowActivityById[workflow.id] ?? true;

  const handleToggleWorkflowActive = (workflowId: string, isActive: boolean) => {
    setWorkflowActivityById((previous) => ({
      ...previous,
      [workflowId]: isActive,
    }));
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    setDeletedWorkflowIds((previous) => {
      const next = new Set(previous);
      next.add(workflowId);
      return next;
    });
    setSelectedWorkflowIds((previous) => {
      if (!previous.has(workflowId)) return previous;
      const next = new Set(previous);
      next.delete(workflowId);
      return next;
    });
    setWorkflowDetails((previous) => (previous?.id === workflowId ? null : previous));
  };

  const getWorkflowRowActionItems = (workflow: ProfileWorkflowRow): PopupItem[] => [
    {
      id: `workflow-details-${workflow.id}`,
      label: "Details",
      onClick: () => setWorkflowDetails(workflow),
    },
    {
      id: `workflow-delete-${workflow.id}`,
      label: "Delete",
      onClick: () => handleDeleteWorkflow(workflow.id),
    },
  ];

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

  const activeSearchValue =
    activeTab === "associated_jobs" ? jobsSearchValue : workflowsSearchValue;
  const activeSearchPlaceholder =
    activeTab === "associated_jobs" ? "Search jobs" : "Search workflow";
  const activeSortOpen =
    activeTab === "associated_jobs" ? isSortOpen : isWorkflowSortOpen;
  const activeSortMenuClass =
    activeTab === "associated_jobs"
      ? "user-details-sort-menu"
      : "user-details-workflow-sort-menu";
  const activeSortPopupItems =
    activeTab === "associated_jobs" ? jobsSortPopupItems : workflowsSortPopupItems;

  if (!user) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb items={USER_DETAIL_BREADCRUMB_ITEMS} />
        <PageContentContainer className="p-8">
          <p className="text-sm text-gray-500">User not found.</p>
        </PageContentContainer>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AppBreadcrumb items={USER_DETAIL_BREADCRUMB_ITEMS} />

      <PageContentContainer className="relative min-h-0 flex-1 overflow-y-auto p-0">
        <PageHeader
          title="Users Details"
          titleClassName="!text-[18px]"
          onBackClick={() => navigate("/settings/people/users")}
        />

        <div className="min-h-full space-y-6 p-6">
          <div className="w-full">
            <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
              <div className="rounded-md border border-gray-200 bg-white">
                <div className="flex min-h-[144px] items-start justify-between gap-3 px-4 py-2">
                  <div className="flex flex-1 items-center gap-10">
                    <div className="relative">
                      <UserAvatar
                        size="large"
                        name={user.name}
                        avatarUrl={user.avatarUrl}
                        className="!h-[102px] !w-[102px] text-2xl"
                      />
                      <span className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-gray-100 text-gray-500">
                        <CameraIcon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <div className="py-1">
                      <h3 className="text-[22px] font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">Employee ID:{user.id}</p>
                      <div className="mt-2 flex items-center text-[15px] font-normal text-gray-600">
                        {user.role} <span className="mx-1">|</span>{" "}
                        <ProfileStatusIndicator status={user.accountStatus ?? "active"} />
                      </div>
                      <p className="mt-3 text-sm text-gray-600">
                        {user.title ? `${user.title}` : ""}
                      </p>
                      <p className="text-sm text-gray-600">
                        {user.team ? `${user.team}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/settings/people/users/${user.id}/edit`)}
                    className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Edit user details"
                  >
                    <EditDetailsIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                  <span className="flex items-center gap-3 text-base text-gray-800">
                    <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                    Email
                  </span>
                  <span className="text-sm text-gray-500">{user.email || "--"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                  <span className="flex items-center gap-3 text-base text-gray-800">
                    <Call_Icon className="h-5 w-5 text-gray-500" />
                    Contact info
                  </span>
                  <span className="text-sm text-gray-500">{user.phone || "--"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/settings/people/users/${user.id}/work-schedule`)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-gray-50"
                >
                  <span className="flex items-center gap-3 text-base text-gray-800">
                    <CalenderIcon className="h-5 w-5 text-gray-500" />
                    Work schedule
                  </span>
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    {user.workSchedule || "Mon Fri"}
                    <AngleRightIcon className="h-4 w-4 text-gray-400" />
                  </span>
                </button>
              </div>

              <div>
                <Button
                  type="button"
                  onClick={() => updateUserStatusInStore(user.id, !user.isActive)}
                  className={`inline-flex w-full items-center justify-center border px-5 py-3 text-sm font-medium transition rounded-md`}
                  variant= 'orangebutton'
                >
                  {user.isActive ? "Inactive User" : "Active User"}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white">
            <div className="border-b border-gray-200 px-5 pt-2">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <UnderlineTabs
                  tabs={TABS}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                  className="flex flex-wrap items-end gap-8"
                  tabClassName="-mb-px border-b-2 px-1 pb-3 pt-3 text-base transition"
                  activeClassName="border-[#007B8C] font-semibold text-[#007B8C]"
                  inactiveClassName="border-transparent font-medium text-gray-400 hover:text-gray-700"
                />

                <div className="mb-2 flex items-center gap-2">
                  <div className="w-[240px] rounded-full border border-gray-200 bg-white px-3 py-1">
                    <SearchInput
                      value={activeSearchValue}
                      onChange={(event) => {
                        if (activeTab === "associated_jobs") {
                          setJobsSearchValue(event.target.value);
                        } else {
                          setWorkflowsSearchValue(event.target.value);
                        }
                      }}
                      placeholder={activeSearchPlaceholder}
                      containerClassName="gap-2"
                      icon={<Search className="h-5 w-5 text-gray-400" />}
                      className="text-sm text-gray-700"
                      inputClassName="text-sm text-gray-700"
                    />
                  </div>

                  <div className={`${activeSortMenuClass} relative`}>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "associated_jobs") {
                          setIsSortOpen((previous) => !previous);
                        } else {
                          setIsWorkflowSortOpen((previous) => !previous);
                        }
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-gray-200 bg-white text-sm text-gray-600 transition hover:bg-gray-50"
                      aria-label={`Filter ${activeTab === "associated_jobs" ? "jobs" : "workflows"}`}
                    >
                      <Ep_sort_Icon className="h-4 w-4 text-gray-400" />
                    </button>
                    {activeSortOpen ? (
                      <div className="absolute right-0 top-full z-40 mt-2">
                        <Popup items={activeSortPopupItems} className="!min-w-[120px] rounded-lg" />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {activeTab === "associated_jobs" ? (
              <div className="p-4 pt-2 border border-gray-200 ">
                {associatedJobs.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1090px] border-separate border-spacing-y-3 text-sm">
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
                                    inputClassName={USER_DETAIL_CHECKBOX_CLASS}
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
                                  onClick: () => {
                                    openTransferModalForJob(job.id);
                                    setOpenJobActionId(null);
                                  },
                                },
                              ];

                              return (
                                <tr key={job.id} className="text-sm text-gray-700">
                                  <td className={leftCellClass}>
                                    <ProfileTableCheckbox
                                      checked={selectedJobIds.has(job.id)}
                                      onChange={() => toggleSelectJob(job.id)}
                                      aria-label={`Select ${job.jobName}`}
                                      inputClassName={USER_DETAIL_CHECKBOX_CLASS}
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
                                      className={`inline-flex items-center rounded-full px-4 py-1 text-xs font-normal ${getStatusClassName(
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
              <div className="p-4 pt-2 border border-gray-200 ">
                {associatedWorkflows.length > 0 ? (
                  <>
                    {filteredWorkflows.length > 0 ? (
                      <ProfileAssociatedWorkflowTable
                        workflows={filteredWorkflows}
                        selectedIds={selectedWorkflowIds}
                        onToggleSelectAll={toggleSelectAllWorkflows}
                        onToggleSelect={toggleSelectWorkflow}
                        checkboxClassName={USER_DETAIL_CHECKBOX_CLASS}
                        getIsActive={getWorkflowIsActive}
                        onToggleActive={handleToggleWorkflowActive}
                        getRowActionItems={getWorkflowRowActionItems}
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

      <PopupModal
        isOpen={Boolean(selectedTransferJob)}
        onClose={closeTransferModal}
        title="Selected Job"
        className="max-w-[860px] rounded-md"
        contentClassName="!px-5 !py-4"
        titleClassName="!text-[20px] !font-semibold !text-[#171717]"
      >
        {selectedTransferJob ? (
          <div className="space-y-5">
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table className="w-full min-w-[680px] text-left text-sm text-gray-700">
                <thead className="border-b border-gray-200 bg-[#FAFAFA] text-xs font-semibold text-gray-500">
                  <tr>
                    <th className="px-4 py-2.5">Job ID</th>
                    <th className="px-4 py-2.5">Job Name</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3">{selectedTransferJob.jobNumber}</td>
                    <td className="px-4 py-3">{selectedTransferJob.jobName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-4 py-1 text-xs font-normal ${getStatusClassName(
                          selectedTransferJob.status
                        )}`}
                      >
                        {selectedTransferJob.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <UserCell
                        avatarAlt={selectedTransferJob.owner}
                        avatarUrl={transferOwnerMember?.avatarUrl}
                        avatarSize="xsmall"
                        avatarFallback="initials"
                        className="min-w-[120px] items-center"
                        titleClassName="text-xs font-medium text-gray-700"
                        contentClassName="max-w-[130px]"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="text-[18px] font-semibold text-gray-900">
                Transfer job ownership to
              </h4>
              <div className="mt-3 border-b border-gray-300 pb-2">
                <SearchInput
                  value={transferSearchValue}
                  onChange={(event) => setTransferSearchValue(event.target.value)}
                  placeholder="Search"
                  containerClassName="gap-2"
                  icon={<Search className="h-5 w-5 text-gray-400" />}
                  className="text-sm text-gray-700"
                  inputClassName="text-sm text-gray-700"
                />
              </div>
            </div>

            <div className="max-h-[200px] space-y-1 overflow-y-auto">
              {transferCandidates.length > 0 ? (
                transferCandidates.map((candidate) => {
                  const candidateInitials = getInitials(candidate.name);
                  const isSelected = transferTargetUserId === candidate.id;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => setTransferTargetUserId(candidate.id)}
                      className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left ${
                        isSelected
                          ? "border-[#007B8C] bg-[#007B8C]/10"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#007B8C] text-xs font-semibold text-white">
                          {candidateInitials}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{candidate.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{candidate.role}</span>
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">No users found.</p>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                size="sm"
                variant="primary"
                className="!w-[150px] !rounded-md !py-2 text-white"
                onClick={handleTransferOwnership}
                disabled={!transferTargetUserId}
              >
                Transfer
              </Button>
            </div>
          </div>
        ) : null}
      </PopupModal>

      <PopupModal
        isOpen={Boolean(workflowDetails)}
        onClose={() => setWorkflowDetails(null)}
        title="Workflow Details"
        className="max-w-[560px] rounded-md"
        contentClassName="!px-5 !py-4"
      >
        {workflowDetails ? (
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Workflow ID:</span> {workflowDetails.workflowId}
            </p>
            <p>
              <span className="font-semibold">Workflow Name:</span>{" "}
              {workflowDetails.workflowName}
            </p>
            <p>
              <span className="font-semibold">Stages:</span> {workflowDetails.stages}
            </p>
            <p>
              <span className="font-semibold">Linked Jobs:</span> {workflowDetails.linkedJobs}
            </p>
            <p>
              <span className="font-semibold">Owner:</span> {workflowDetails.ownerInitials}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              {getWorkflowIsActive(workflowDetails) ? "Active" : "Inactive"}
            </p>
          </div>
        ) : null}
      </PopupModal>
    </div>
  );
}
