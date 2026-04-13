import { useEffect, useMemo, useState } from "react";
import { AngleUpIcon, Search } from "../../icons";
import { useJobsStore } from "../../stores/jobsStore";
import { useUsersStore } from "../../stores/usersStore";
import {
  type UserLeaveHistoryItem,
  type UserWorkScheduleSettings,
  useUserProfileSettingsStore,
} from "../../stores/userProfileSettingsStore";
import { getStoredUserIdentity } from "../../utils/userIdentity";
import AppBreadcrumb from "../common/AppBreadcrumb";
import Button from "../ui/button/Button";
import PopupModal from "../ui/popup-modal/PopupModal";
import ProfileSettingsPageContainer from "../ui/profile/ProfileSettingsPageContainer";
import SearchInput from "../ui/search-input/SearchInput";
import ToggleSwitch from "../ui/toggle/ToggleSwitch";
import UserCell from "../ui/user-cell/UserCell";

type TransferMap = Record<string, string>;

interface TeamManagerWorkScheduleViewProps {
  userId?: string;
  backTo?: string;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const USER_MEMBER_CLASS = "bg-[#007B8C] text-white";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0]?.charAt(0)?.toUpperCase() ?? "U";
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const normalizeDate = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const parseDateValue = (raw?: string) => {
  if (!raw?.trim()) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    const parsed = new Date(`${raw.trim()}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) return normalizeDate(parsed);
  }

  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return normalizeDate(direct);

  const compactMatch = raw
    .trim()
    .match(/^(\d{1,2})\s*[-\s]\s*([A-Za-z]{3})\s*[-\s]\s*(\d{2,4})$/);
  if (!compactMatch) return null;

  const day = Number(compactMatch[1]);
  const monthIndex = MONTH_NAMES.findIndex(
    (month) => month.toLowerCase() === compactMatch[2].slice(0, 3).toLowerCase()
  );
  const yearToken = compactMatch[3];
  const year = yearToken.length === 2 ? 2000 + Number(yearToken) : Number(yearToken);

  if (monthIndex < 0 || Number.isNaN(day) || Number.isNaN(year)) return null;

  return new Date(year, monthIndex, day);
};

const formatDateForLeaveInput = (value: string) => {
  const parsed = parseDateValue(value);
  if (!parsed) return "--";
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = MONTH_NAMES[parsed.getMonth()];
  const shortYear = String(parsed.getFullYear()).slice(-2);
  return `${day} - ${month} - ${shortYear}`;
};

const formatDateForInput = (value: Date) => {
  const normalized = normalizeDate(value);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, "0");
  const day = String(normalized.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatHistoryDate = (value: Date) => {
  const normalized = normalizeDate(value);
  const day = String(normalized.getDate()).padStart(2, "0");
  const month = MONTH_NAMES[normalized.getMonth()];
  const shortYear = String(normalized.getFullYear()).slice(-2);
  return `${day} ${month} ${shortYear}`;
};

const formatHistoryDateRange = (from: Date, to: Date) => {
  const normalizedFrom = normalizeDate(from);
  const normalizedTo = normalizeDate(to);
  if (normalizedFrom.getTime() === normalizedTo.getTime()) {
    return formatHistoryDate(normalizedFrom);
  }
  return `${formatHistoryDate(normalizedFrom)} - ${formatHistoryDate(normalizedTo)}`;
};

const formatDurationLabel = (from: Date, to: Date) => {
  const normalizedFrom = normalizeDate(from);
  const normalizedTo = normalizeDate(to);
  const rangeInDays = Math.max(
    1,
    Math.floor((normalizedTo.getTime() - normalizedFrom.getTime()) / DAY_IN_MS) + 1
  );
  return `${rangeInDays} Day`;
};

const addDays = (value: Date, days: number) => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return normalizeDate(next);
};

const getDeadlineDate = (job: { workflowStages?: Array<{ dueDate?: string }> }) => {
  const dueDate = job.workflowStages?.at(-1)?.dueDate;
  return parseDateValue(dueDate);
};

const isWithinRange = (date: Date, start: Date | null, end: Date | null) => {
  const normalized = normalizeDate(date);
  if (start && normalized < normalizeDate(start)) return false;
  if (end && normalized > normalizeDate(end)) return false;
  return true;
};

const cloneDraftSchedule = (value: UserWorkScheduleSettings): UserWorkScheduleSettings => ({
  ...value,
  substituteUserIds: [...value.substituteUserIds],
  transferredJobOwnerByJobId: { ...value.transferredJobOwnerByJobId },
  history: value.history.map((item) => ({
    ...item,
    transferredJobIds: [...item.transferredJobIds],
  })),
});

const areTransferMapsEqual = (left: TransferMap, right: TransferMap) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every((key) => left[key] === right[key]);
};

const createHistoryItem = (params: {
  id: string;
  from: Date;
  to: Date;
  reason: string;
  transferredJobIds?: string[];
  transferredToUserId?: string;
}): UserLeaveHistoryItem => ({
  id: params.id,
  dateRange: formatHistoryDateRange(params.from, params.to),
  duration: formatDurationLabel(params.from, params.to),
  reason: params.reason.trim() || "Doctor's appointment",
  transferredJobIds: params.transferredJobIds ?? [],
  transferredToUserId: params.transferredToUserId,
});

const buildDefaultScheduleForUser = (
  resolvedUserId: string,
  jobs: Array<{ id: string; created: string; workflowStages?: Array<{ dueDate?: string }> }>
): UserWorkScheduleSettings => {
  const relevantDates = jobs
    .flatMap((job) => {
      const createdDate = parseDateValue(job.created);
      const deadlineDate = getDeadlineDate(job);
      return [createdDate, deadlineDate].filter((value): value is Date => Boolean(value));
    })
    .sort((left, right) => left.getTime() - right.getTime());

  const primaryFrom = relevantDates[0] ?? normalizeDate(new Date());
  const primaryTo = relevantDates[1] ?? addDays(primaryFrom, 6);
  const secondaryFrom = relevantDates[2] ?? addDays(primaryTo, 15);
  const secondaryTo = relevantDates[3] ?? addDays(secondaryFrom, 7);

  return {
    outOfOffice: true,
    assignSubstitute: false,
    leaveFrom: formatDateForInput(primaryFrom),
    leaveTo: formatDateForInput(primaryTo),
    leaveReason: "Doctor's appointment",
    substituteUserIds: [],
    transferredJobOwnerByJobId: {},
    history: [
      createHistoryItem({
        id: `${resolvedUserId}-leave-1`,
        from: primaryFrom,
        to: primaryTo,
        reason: "Doctor's appointment",
      }),
      createHistoryItem({
        id: `${resolvedUserId}-leave-2`,
        from: secondaryFrom,
        to: secondaryTo,
        reason: "Doctor's appointment",
      }),
    ],
  };
};

export default function TeamManagerWorkScheduleView({
  userId,
  backTo = "/profile",
}: TeamManagerWorkScheduleViewProps) {
  const users = useUsersStore((state) => state.users);
  const defaultUser = useUsersStore((state) => state.getDefaultUser());
  const jobs = useJobsStore((state) => state.jobs);
  const updateJob = useJobsStore((state) => state.updateJob);

  const workScheduleByUser = useUserProfileSettingsStore((state) => state.workScheduleByUser);
  const setWorkSchedule = useUserProfileSettingsStore((state) => state.setWorkSchedule);

  const storedUser = getStoredUserIdentity();

  const selectedUser = useMemo(() => {
    if (userId) {
      return users.find((user) => user.id === userId) ?? null;
    }

    if (storedUser?.id) {
      const matchedById = users.find((user) => user.id === storedUser.id);
      if (matchedById) return matchedById;
    }

    if (storedUser?.email) {
      const normalizedEmail = storedUser.email.trim().toLowerCase();
      const matchedByEmail = users.find(
        (user) => user.email.trim().toLowerCase() === normalizedEmail
      );
      if (matchedByEmail) return matchedByEmail;
    }

    return null;
  }, [storedUser?.email, storedUser?.id, userId, users]);

  const resolvedUser = selectedUser ?? defaultUser;

  const displayName = selectedUser?.name ?? storedUser?.name ?? resolvedUser.name;
  const displayEmail = selectedUser?.email ?? storedUser?.email ?? resolvedUser.email;
  const resolvedUserId = selectedUser?.id ?? storedUser?.id ?? resolvedUser.id;

  const associatedJobs = useMemo(() => {
    const normalizedEmail = displayEmail.trim().toLowerCase();
    const normalizedName = displayName.trim().toLowerCase();
    const userInitials = getInitials(displayName);

    const ownedJobs = jobs.filter((job) => job.owner === userInitials);
    const memberMatchedJobs = jobs.filter((job) =>
      (job.members ?? []).some((member) => {
        const memberEmail = member.email?.trim().toLowerCase() ?? "";
        const memberName = member.name.trim().toLowerCase();
        return (
          (normalizedEmail && memberEmail === normalizedEmail) ||
          memberName === normalizedName ||
          member.initials === userInitials
        );
      })
    );

    const source = ownedJobs.length > 0 ? ownedJobs : memberMatchedJobs;

    return [...source].sort((left, right) => {
      const leftDate = parseDateValue(left.created)?.getTime() ?? 0;
      const rightDate = parseDateValue(right.created)?.getTime() ?? 0;
      return leftDate - rightDate;
    });
  }, [displayEmail, displayName, jobs]);

  const defaultSchedule = useMemo(
    () => buildDefaultScheduleForUser(resolvedUserId, associatedJobs),
    [associatedJobs, resolvedUserId]
  );

  const resolvedSchedule = workScheduleByUser[resolvedUserId] ?? defaultSchedule;

  const [draftSchedule, setDraftSchedule] = useState<UserWorkScheduleSettings>(() =>
    cloneDraftSchedule(workScheduleByUser[resolvedUserId] ?? defaultSchedule)
  );
  const [substituteSearchValue, setSubstituteSearchValue] = useState("");
  const [jobsSearchValue, setJobsSearchValue] = useState("");
  const [expandedLeaveId, setExpandedLeaveId] = useState<string | null>(null);
  const [transferJobId, setTransferJobId] = useState<string | null>(null);
  const [transferSearchValue, setTransferSearchValue] = useState("");
  const [transferTargetUserId, setTransferTargetUserId] = useState("");

  useEffect(() => {
    if (!workScheduleByUser[resolvedUserId]) {
      setWorkSchedule(resolvedUserId, defaultSchedule);
    }
  }, [defaultSchedule, resolvedUserId, setWorkSchedule, workScheduleByUser]);

  useEffect(() => {
    setDraftSchedule(cloneDraftSchedule(resolvedSchedule));
  }, [resolvedSchedule, resolvedUserId]);

  useEffect(() => {
    const firstExpanded = draftSchedule.history.find((item) => item.transferredJobIds.length > 0);
    if (!firstExpanded) {
      setExpandedLeaveId(null);
      return;
    }

    setExpandedLeaveId((previous) => {
      if (previous && draftSchedule.history.some((item) => item.id === previous)) {
        return previous;
      }
      return firstExpanded.id;
    });
  }, [draftSchedule.history]);

  const breadcrumbOverride = userId ? (
    <AppBreadcrumb
      items={[
        { label: "Settings", to: "/settings" },
        { label: "People", to: "/settings/people/users" },
        { label: "User Detail", to: `/settings/people/users/${userId}` },
        { label: "Work Schedule" },
      ]}
    />
  ) : undefined;

  const jobsById = useMemo(() => {
    return new Map(associatedJobs.map((job) => [job.id, job]));
  }, [associatedJobs]);

  const leaveStart = parseDateValue(draftSchedule.leaveFrom);
  const leaveEnd = parseDateValue(draftSchedule.leaveTo);

  const jobsDuringLeave = useMemo(() => {
    const normalizedSearch = jobsSearchValue.trim().toLowerCase();

    const byDate = associatedJobs.filter((job) => {
      const deadline = getDeadlineDate(job);
      if (!deadline) return false;
      return isWithinRange(deadline, leaveStart, leaveEnd);
    });

    const sourceJobs = byDate.length > 0 ? byDate : associatedJobs;

    return sourceJobs.filter((job) => {
      if (!normalizedSearch) return true;
      return [job.jobName, job.jobNumber, job.campaignId]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [associatedJobs, jobsSearchValue, leaveEnd, leaveStart]);

  const selectedSubstituteUsers = useMemo(
    () => users.filter((user) => draftSchedule.substituteUserIds.includes(user.id)),
    [draftSchedule.substituteUserIds, users]
  );

  const substituteCandidates = useMemo(() => {
    const normalizedSearch = substituteSearchValue.trim().toLowerCase();
    const selectedIdSet = new Set(draftSchedule.substituteUserIds);

    return users
      .filter((candidate) => candidate.id !== resolvedUserId)
      .filter((candidate) => candidate.isActive)
      .filter((candidate) => !selectedIdSet.has(candidate.id))
      .filter((candidate) => {
        if (!normalizedSearch) return true;
        return [candidate.name, candidate.email]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [draftSchedule.substituteUserIds, resolvedUserId, substituteSearchValue, users]);

  const transferJob = useMemo(
    () => jobsDuringLeave.find((job) => job.id === transferJobId) ?? null,
    [jobsDuringLeave, transferJobId]
  );

  const transferCandidatePool = useMemo(() => {
    if (selectedSubstituteUsers.length > 0) return selectedSubstituteUsers;
    return users.filter((user) => user.isActive && user.id !== resolvedUserId);
  }, [resolvedUserId, selectedSubstituteUsers, users]);

  const transferCandidates = useMemo(() => {
    const normalizedSearch = transferSearchValue.trim().toLowerCase();

    return transferCandidatePool
      .filter((candidate) =>
        normalizedSearch
          ? [candidate.name, candidate.email].join(" ").toLowerCase().includes(normalizedSearch)
          : true
      )
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [transferCandidatePool, transferSearchValue]);

  const openTransferModal = (jobId: string) => {
    setTransferJobId(jobId);
    setTransferSearchValue("");
    setTransferTargetUserId(draftSchedule.transferredJobOwnerByJobId[jobId] ?? "");
  };

  const closeTransferModal = () => {
    setTransferJobId(null);
    setTransferSearchValue("");
    setTransferTargetUserId("");
  };

  const addSubstitute = (candidateId: string) => {
    setDraftSchedule((current) => ({
      ...current,
      substituteUserIds: current.substituteUserIds.includes(candidateId)
        ? current.substituteUserIds
        : [...current.substituteUserIds, candidateId],
    }));
    setSubstituteSearchValue("");
  };

  const removeSubstitute = (candidateId: string) => {
    setDraftSchedule((current) => ({
      ...current,
      substituteUserIds: current.substituteUserIds.filter((id) => id !== candidateId),
    }));
  };

  const saveTransferForJob = () => {
    if (!transferJobId || !transferTargetUserId) return;

    setDraftSchedule((current) => ({
      ...current,
      transferredJobOwnerByJobId: {
        ...current.transferredJobOwnerByJobId,
        [transferJobId]: transferTargetUserId,
      },
    }));

    closeTransferModal();
  };

  const handleCancel = () => {
    setDraftSchedule(cloneDraftSchedule(resolvedSchedule));
    setSubstituteSearchValue("");
    setJobsSearchValue("");
  };

  const applyTransferredOwners = (transferMap: TransferMap) => {
    Object.entries(transferMap).forEach(([jobId, targetUserId]) => {
      const job = jobsById.get(jobId);
      const targetUser = users.find((user) => user.id === targetUserId);

      if (!job || !targetUser) return;

      const targetInitials = getInitials(targetUser.name);
      const normalizedTargetEmail = targetUser.email.trim().toLowerCase();
      const existingMembers = job.members ?? [];

      const existingTarget = existingMembers.find((member) => {
        const normalizedMemberEmail = member.email?.trim().toLowerCase() ?? "";
        return (
          member.initials === targetInitials ||
          member.name.trim().toLowerCase() === targetUser.name.trim().toLowerCase() ||
          (normalizedTargetEmail && normalizedMemberEmail === normalizedTargetEmail)
        );
      });

      const nextMembers =
        existingTarget !== undefined
          ? existingMembers
          : [
              ...existingMembers,
              {
                id: `user-${targetUser.id}`,
                name: targetUser.name,
                initials: targetInitials,
                className: USER_MEMBER_CLASS,
                avatarUrl: targetUser.avatarUrl,
                email: targetUser.email || undefined,
                role: "Approver" as const,
              },
            ];

      updateJob(job.id, {
        owner: targetInitials,
        members: nextMembers,
      });
    });
  };

  const handleSave = () => {
    const transferredEntries = Object.entries(draftSchedule.transferredJobOwnerByJobId).filter(
      ([, targetUserId]) => Boolean(targetUserId)
    );

    const transferredJobIds = transferredEntries.map(([jobId]) => jobId);
    const uniqueTargets = Array.from(
      new Set(transferredEntries.map(([, targetUserId]) => targetUserId))
    );

    const leaveFromDate = parseDateValue(draftSchedule.leaveFrom) ?? normalizeDate(new Date());
    const parsedLeaveToDate = parseDateValue(draftSchedule.leaveTo) ?? leaveFromDate;
    const leaveToDate =
      parsedLeaveToDate.getTime() < leaveFromDate.getTime() ? leaveFromDate : parsedLeaveToDate;
    const leaveReason = draftSchedule.leaveReason.trim() || "Doctor's appointment";

    const currentLeaveId = draftSchedule.history[0]?.id ?? `${resolvedUserId}-leave-current`;

    const currentLeave = createHistoryItem({
      id: currentLeaveId,
      from: leaveFromDate,
      to: leaveToDate,
      reason: leaveReason,
      transferredJobIds,
      transferredToUserId: uniqueTargets.length === 1 ? uniqueTargets[0] : undefined,
    });

    const remainingHistory = draftSchedule.history.slice(1);
    const nextHistory = [currentLeave, ...remainingHistory];

    const nextSchedule: UserWorkScheduleSettings = {
      ...draftSchedule,
      leaveFrom: formatDateForInput(leaveFromDate),
      leaveTo: formatDateForInput(leaveToDate),
      leaveReason,
      history: nextHistory,
    };

    if (
      !areTransferMapsEqual(
        resolvedSchedule.transferredJobOwnerByJobId,
        nextSchedule.transferredJobOwnerByJobId
      )
    ) {
      applyTransferredOwners(nextSchedule.transferredJobOwnerByJobId);
    }

    setWorkSchedule(resolvedUserId, nextSchedule);
    setDraftSchedule(cloneDraftSchedule(nextSchedule));
  };

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
    <>
      <ProfileSettingsPageContainer
        title="Work Schedule"
        breadcrumbCurrent="Work Schedule"
        backTo={backTo}
        breadcrumbOverride={breadcrumbOverride}
        headerRight={
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-gray-800">Out Of Office</span>
            <ToggleSwitch
              checked={draftSchedule.outOfOffice}
              onChange={(checked) =>
                setDraftSchedule((current) => ({
                  ...current,
                  outOfOffice: checked,
                }))
              }
              showLabel={false}
              size="sm"
              trackClassName="!h-5 !w-9"
              thumbClassName="!h-4 !w-4 peer-checked:!translate-x-4"
            />
          </div>
        }
        contentClassName="min-h-[620px] bg-[#FAFAFA] p-6"
      >
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-2xl font-semibold text-gray-800">Add Leave</h3>

            <div className="mt-4 rounded-md border border-gray-200 bg-white px-4 py-3">
              <div className="grid grid-cols-2 gap-4">
                <label className="border-r border-gray-200 pr-4">
                  <p className="text-sm text-gray-500">From</p>
                  <input
                    type="date"
                    value={draftSchedule.leaveFrom}
                    onChange={(event) =>
                      setDraftSchedule((current) => ({
                        ...current,
                        leaveFrom: event.target.value,
                      }))
                    }
                    className="mt-1 w-full bg-transparent text-xl font-medium text-gray-700 outline-none"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDateForLeaveInput(draftSchedule.leaveFrom)}
                  </p>
                </label>

                <label>
                  <p className="text-sm text-gray-500">To</p>
                  <input
                    type="date"
                    value={draftSchedule.leaveTo}
                    onChange={(event) =>
                      setDraftSchedule((current) => ({
                        ...current,
                        leaveTo: event.target.value,
                      }))
                    }
                    className="mt-1 w-full bg-transparent text-xl font-medium text-gray-700 outline-none"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDateForLeaveInput(draftSchedule.leaveTo)}
                  </p>
                </label>
              </div>
            </div>

            <div className="mt-8 border-b border-gray-200 pb-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[19px] font-medium text-gray-800">
                  Assign Substitute For Leave
                </span>
                <ToggleSwitch
                  checked={draftSchedule.assignSubstitute}
                  onChange={(checked) =>
                    setDraftSchedule((current) => ({
                      ...current,
                      assignSubstitute: checked,
                    }))
                  }
                  showLabel={false}
                  size="sm"
                  trackClassName="!h-5 !w-9"
                  thumbClassName="!h-4 !w-4 peer-checked:!translate-x-4"
                />
              </div>
            </div>

            {draftSchedule.assignSubstitute ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-full border border-gray-200 px-3 py-1">
                  <SearchInput
                    value={substituteSearchValue}
                    onChange={(event) => setSubstituteSearchValue(event.target.value)}
                    onSearchTrigger={setSubstituteSearchValue}
                    minSearchLength={0}
                    debounceMs={200}
                    triggerSearchOnBlur
                    placeholder="Search reviewer by name & email address"
                    containerClassName="gap-2"
                    icon={<Search className="h-5 w-5 text-gray-400" />}
                    className="text-sm text-gray-700"
                    inputClassName="text-sm text-gray-700"
                  />
                </div>

                {substituteCandidates.length > 0 ? (
                  <div className="max-h-[128px] space-y-1 overflow-y-auto rounded-md border border-gray-100 bg-[#FCFCFC] p-2">
                    {substituteCandidates.slice(0, 8).map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => addSubstitute(candidate.id)}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-white"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-700">{candidate.name}</p>
                          <p className="text-xs text-gray-400">{candidate.email || "--"}</p>
                        </div>
                        <span className="text-xs font-semibold text-[#007B8C]">Add</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {selectedSubstituteUsers.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSubstituteUsers.map((candidate) => (
                      <div key={candidate.id} className="flex items-center justify-between rounded-md px-2 py-1">
                        <UserCell
                          title={candidate.name}
                          subtitle={candidate.email || "--"}
                          avatarUrl={candidate.avatarUrl}
                          avatarSize="xsmall"
                          className="items-center"
                          titleClassName="text-sm font-medium text-gray-800"
                          subtitleClassName="text-xs text-gray-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeSubstitute(candidate.id)}
                          className="text-xs font-medium text-[#F16651] transition hover:text-[#D94F3A]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="border-b border-gray-200 pb-2">
                  <p className="text-[26px] font-normal text-gray-800">
                    Jobs having deadlines While You Are on Leave
                  </p>
                </div>

                <div className="w-full max-w-[360px] rounded-full border border-gray-200 px-3 py-1">
                  <SearchInput
                    value={jobsSearchValue}
                    onChange={(event) => setJobsSearchValue(event.target.value)}
                    onSearchTrigger={setJobsSearchValue}
                    minSearchLength={0}
                    debounceMs={200}
                    triggerSearchOnBlur
                    placeholder="Search by job name or ID"
                    containerClassName="gap-2"
                    icon={<Search className="h-5 w-5 text-gray-400" />}
                    className="text-sm text-gray-700"
                    inputClassName="text-sm text-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  {jobsDuringLeave.length > 0 ? (
                    jobsDuringLeave.map((job) => {
                      const transferredUserId = draftSchedule.transferredJobOwnerByJobId[job.id];
                      const transferredUser = users.find((user) => user.id === transferredUserId);
                      const deadline = job.workflowStages?.at(-1)?.dueDate ?? "No Date";

                      return (
                        <div
                          key={job.id}
                          className="grid grid-cols-[120px_1fr_1fr_auto] items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-2"
                        >
                          <span className="text-sm text-gray-700">{deadline}</span>
                          <span className="text-sm text-gray-700">{job.jobNumber}</span>
                          <span className="truncate text-sm text-gray-800">{job.jobName}</span>
                          <button
                            type="button"
                            onClick={() => openTransferModal(job.id)}
                            className="text-sm font-medium text-[#F16651] transition hover:text-[#D94F3A]"
                          >
                            {transferredUser ? "Change" : "Transfer"}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-md border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
                      No jobs found for this leave period.
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="!rounded-md !border-[#F8DFDA] !bg-[#FFF4F2] !px-6 !py-2 text-[var(--color-secondary-500)]"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="primary"
                className="!rounded-md !bg-[var(--color-secondary-500)] !px-7 !py-2 text-white hover:!bg-[var(--color-secondary-600)]"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-[32px] font-normal text-gray-800">My leave scheduled</h3>

            <div className="mt-4 space-y-4">
              {draftSchedule.history.map((leave) => {
                const transferredUser = leave.transferredToUserId
                  ? users.find((user) => user.id === leave.transferredToUserId)
                  : null;
                const hasTransferredJobs = leave.transferredJobIds.length > 0;
                const isExpanded = hasTransferredJobs && expandedLeaveId === leave.id;

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
                      <span className="text-xl text-gray-700">
                        Job transferred to {hasTransferredJobs ? `(${leave.transferredJobIds.length} jobs)` : ""}
                      </span>

                      {hasTransferredJobs ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedLeaveId((current) => (current === leave.id ? null : leave.id))
                          }
                          className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                          aria-label={isExpanded ? "Collapse leave details" : "Expand leave details"}
                        >
                          <AngleUpIcon
                            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-0" : "rotate-180"}`}
                          />
                        </button>
                      ) : (
                        <span className="text-lg text-gray-400">-</span>
                      )}
                    </div>

                    {isExpanded ? (
                      <div className="border-t border-gray-200 bg-[#FAFAFA] px-3 py-3">
                        {transferredUser ? (
                          <UserCell
                            title={transferredUser.name}
                            subtitle={transferredUser.email || "--"}
                            avatarUrl={transferredUser.avatarUrl}
                            avatarSize="xsmall"
                            className="mb-3 items-center"
                            titleClassName="text-sm font-medium text-gray-700"
                            subtitleClassName="text-xs text-gray-500"
                          />
                        ) : null}

                        <div className="space-y-2">
                          {leave.transferredJobIds.map((jobId) => {
                            const job = jobsById.get(jobId);
                            if (!job) return null;

                            return (
                              <div
                                key={job.id}
                                className="grid grid-cols-[110px_1fr] gap-3 rounded-md border border-gray-200 bg-white px-3 py-2"
                              >
                                <span className="text-xs text-gray-600">{job.jobNumber}</span>
                                <span className="text-xs text-gray-700">{job.jobName}</span>
                              </div>
                            );
                          })}
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

      <PopupModal
        isOpen={Boolean(transferJob)}
        onClose={closeTransferModal}
        title="Transfer job"
        className="max-w-[640px]"
        contentClassName="!p-6"
      >
        {transferJob ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {transferJob.jobNumber} - {transferJob.jobName}
            </p>

            <div className="rounded-full border border-gray-200 px-3 py-1">
              <SearchInput
                value={transferSearchValue}
                onChange={(event) => setTransferSearchValue(event.target.value)}
                onSearchTrigger={setTransferSearchValue}
                minSearchLength={0}
                debounceMs={200}
                triggerSearchOnBlur
                placeholder="Search reviewer by name & email address"
                containerClassName="gap-2"
                icon={<Search className="h-5 w-5 text-gray-400" />}
                className="text-sm text-gray-700"
                inputClassName="text-sm text-gray-700"
              />
            </div>

            <div className="max-h-[220px] space-y-2 overflow-y-auto">
              {transferCandidates.length > 0 ? (
                transferCandidates.map((candidate) => {
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
                      <UserCell
                        title={candidate.name}
                        subtitle={candidate.email || "--"}
                        avatarUrl={candidate.avatarUrl}
                        avatarSize="xsmall"
                        className="items-center"
                        titleClassName="text-sm font-medium text-gray-800"
                        subtitleClassName="text-xs text-gray-500"
                      />
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
                className="!w-[130px] !rounded-md !py-2 text-white"
                onClick={saveTransferForJob}
                disabled={!transferTargetUserId}
              >
                Transfer
              </Button>
            </div>
          </div>
        ) : null}
      </PopupModal>
    </>
  );
}
