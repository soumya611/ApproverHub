
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import PageMeta from "../components/common/PageMeta";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import PageContentContainer from "../components/layout/PageContentContainer";
import SearchInput from "../components/ui/search-input/SearchInput";
import UnderlineTabs from "../components/ui/tabs/UnderlineTabs";
import PopupModal from "../components/ui/popup-modal/PopupModal";
import FileDropzone from "../components/ui/file-dropzone/FileDropzone";
import Button from "../components/ui/button/Button";
import UserCell from "../components/ui/user-cell/UserCell";
import Popup, { type PopupItem } from "../components/ui/popup/Popup";
import AddAssigneePopup, {
  type AssigneeOption,
} from "../components/analytics/AddAssigneePopup";
import WorkflowBuilder, {
  type WorkflowBuilderValue,
} from "../components/ui/workflow-builder/WorkflowBuilder";
import ChecklistStageDropdown, {
  type ChecklistItem,
} from "../components/ui/checklist-stage-dropdown/ChecklistStageDropdown";
import ToggleSwitch from "../components/ui/toggle/ToggleSwitch";
import EmailReviewersPopup from "../components/ui/email-reviewers-popup/EmailReviewersPopup";
import { useJobsStore } from "../stores/jobsStore";
import { useJobInformationStore } from "../stores/jobInformationStore";
import type {
  JobMember,
  JobVersion,
  JobWorkflowPermissions,
  JobWorkflowStageConfig,
} from "../components/jobs/types";
import { DEFAULT_JOB_MEMBERS } from "../components/jobs/types";
import type { WorkflowMember, WorkflowStage } from "../types/workflow.types";
import {
  Attachment,
  AngleDownIcon,
  DownloadIcon,
  EditPenIcon,
  PlusIcon,
  PPTIcon,
  VerticalDots,
  NotificationIcon,
} from "../icons";
import Badge from "../components/ui/badge/Badge";

type TabId =
  | "job-details"
  | "workflow"
  | "information"
  | "activity"
  | "emails"
  | "checklist";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "job-details", label: "Job details" },
  { id: "workflow", label: "Workflow" },
  { id: "information", label: "Information" },
  { id: "activity", label: "Activity" },
  { id: "emails", label: "Emails & Alerts" },
  { id: "checklist", label: "Checklist" },
];

const STAGE_PERMISSION_IDS = [
  "add_stage",
  "remove_stage",
  "change_stage_name",
  "change_skip",
  "change_trigger",
  "change_deadline",
  "change_lock",
  "change_status",
  "change_private_comment",
  "change_invite_message",
  "add_checklist",
];

const REVIEWER_PERMISSION_IDS = [
  "add_reviewers",
  "remove_reviewers",
  "change_roles",
  "change_notification",
];

const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "checklist-1",
    question: "Is the layout visually appealing and easy to follow?",
    description: "Review overall visual flow and ease of navigation",
    commentCount: 1,
    response: "pass",
    reviewer: { name: "Pranali Gosavi" },
  },
  {
    id: "checklist-2",
    question: "Is the layout visually appealing and easy to follow?",
    description: "Review overall visual flow and ease of navigation",
    response: "pass",
    reviewer: { name: "Pranali Gosavi" },
  },
  {
    id: "checklist-3",
    question: "Is the layout visually appealing and easy to follow?",
    description: "Review overall visual flow and ease of navigation",
    response: "fail",
    reviewer: { name: "Pranali Gosavi" },
  },
  {
    id: "checklist-4",
    question: "Is the layout visually appealing and easy to follow?",
    description: "Review overall visual flow and ease of navigation",
    response: "pass",
    reviewer: { name: "Pranali Gosavi" },
  },
];

const formatShortDate = (date: Date) =>
  date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
    .replace(",", "");

const extractVersionLabel = (value: string) => {
  const match = value.match(/V\d+/i);
  return match ? match[0].toUpperCase() : null;
};

const createDefaultPermissions = (): JobWorkflowPermissions => {
  const stages: Record<string, boolean> = {};
  const reviewers: Record<string, boolean> = {};
  STAGE_PERMISSION_IDS.forEach((id) => {
    stages[id] = true;
  });
  REVIEWER_PERMISSION_IDS.forEach((id) => {
    reviewers[id] = true;
  });
  return { stages, reviewers };
};

const toWorkflowMember = (member: JobMember): WorkflowMember => ({
  id: member.id,
  initials: member.initials,
  className: member.className,
});

const formatWorkflowDeadline = (deadline: string) => {
  if (!deadline || deadline === "no_deadline") {
    return "No Deadline";
  }
  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) {
    return deadline;
  }
  return parsed
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
    .replace(",", "");
};

const buildStagesFromConfig = (
  config: WorkflowBuilderValue,
  previousStages: WorkflowStage[] = []
) => {
  const fallbackMembers = config.reviewers.map(toWorkflowMember);
  return config.stages.map((stage, index) => {
    const previous = previousStages[index];
    return {
      id: previous?.id ?? `${config.id}-${stage.stepLabel.toLowerCase()}`,
      stepLabel: stage.stepLabel,
      name: stage.name || `Stage ${index + 1}`,
      status: previous?.status ?? (index === 0 ? "In Progress" : "Not Started"),
      dueDate: previous?.dueDate ?? formatWorkflowDeadline(stage.deadline),
      commentsCount: previous?.commentsCount ?? 0,
      members: previous?.members?.length ? previous.members : fallbackMembers,
    };
  });
};

const getNextVersionNumber = (items: JobVersion[]) => {
  const numbers = items
    .map((version) => {
      const match = version.label.match(/V(\d+)/i);
      return match ? Number(match[1]) : 0;
    })
    .filter((value) => Number.isFinite(value));
  if (!numbers.length) return items.length + 1;
  return Math.max(...numbers) + 1;
};

const chunkQuestions = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

export default function JobDetails() {
  const { jobId } = useParams();
  const jobs = useJobsStore((state) => state.jobs);
  const updateJob = useJobsStore((state) => state.updateJob);
  const job = useMemo(
    () => jobs.find((item) => item.id === jobId),
    [jobs, jobId]
  );
  const jobInfoTemplates = useJobInformationStore((state) => state.templates);
  const activeJobInfoTemplate =
    jobInfoTemplates.find((template) => template.isActive) ??
    jobInfoTemplates[0];

  const [activeTab, setActiveTab] = useState<TabId>("job-details");
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [versionFiles, setVersionFiles] = useState<File[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [emailReviewersOpen, setEmailReviewersOpen] = useState(false);
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [checklistFilter, setChecklistFilter] = useState<
    "all" | "passed" | "failed"
  >("all");

  const versions = useMemo<JobVersion[]>(() => {
    if (!job) return [];
    if (job.versions?.length) return job.versions;
    const fallbackLabel =
      extractVersionLabel(job.jobName ?? job.assetTitle ?? "") ?? "V1";
    return [
      {
        id: `${job.id}-v1`,
        label: fallbackLabel,
        fileName: job.assetTitle ?? job.jobName ?? "Job file",
        uploadedAt: job.created,
      },
    ];
  }, [job]);

  useEffect(() => {
    if (!versions.length) {
      setSelectedVersionId("");
      return;
    }
    setSelectedVersionId((current) => {
      if (current && versions.some((version) => version.id === current)) {
        return current;
      }
      return versions[versions.length - 1].id;
    });
  }, [versions]);

  const allMembers = useMemo<JobMember[]>(() => {
    const map = new Map<string, JobMember>();
    DEFAULT_JOB_MEMBERS.forEach((member) => {
      map.set(member.id, member);
    });
    jobs.forEach((item) => {
      item.members?.forEach((member) => {
        map.set(member.id, member);
      });
    });
    return Array.from(map.values());
  }, [jobs]);

  const assigneeOptions = useMemo<AssigneeOption[]>(
    () =>
      allMembers.map((member) => ({
        id: member.id,
        name: member.name,
        initials: member.initials,
        className: member.className,
        subtitle: member.email,
      })),
    [allMembers]
  );

  const workflowValue = useMemo<WorkflowBuilderValue | null>(() => {
    if (!job) return null;
    if (job.workflowConfig) return job.workflowConfig;
    if (!job.workflowStages?.length) return null;
    const stages: JobWorkflowStageConfig[] = job.workflowStages.map(
      (stage, index) => ({
        id: stage.id,
        stepLabel: stage.stepLabel ?? `S${index + 1}`,
        name: stage.name,
        startRule: index === 0 ? "immediately" : "when",
        startOnDeadline: false,
        lockRule: "never",
        skipRule: "never",
        deadline: "",
        checklistIds: [],
        finalStatus: "",
        decisionMakerIds: [],
      })
    );
    return {
      id: job.workflowId ?? `workflow-${job.id}`,
      name: job.workflowLabel ?? "Workflow",
      stages,
      reviewers: job.members ?? [],
      permissions: createDefaultPermissions(),
    };
  }, [job]);

  const checklistItems = useMemo(() => DEFAULT_CHECKLIST_ITEMS, []);
  const filteredChecklistItems = useMemo(() => {
    if (checklistFilter === "passed") {
      return checklistItems.filter((item) => item.response === "pass");
    }
    if (checklistFilter === "failed") {
      return checklistItems.filter((item) => item.response === "fail");
    }
    return checklistItems;
  }, [checklistFilter, checklistItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!job) {
    return (
      <>
        <PageMeta title="Job details" description="Job details" />
        <div className="flex h-full min-h-0 flex-col gap-4">
          <p className="text-sm text-gray-500">
            <Link to="/jobs" className="text-gray-600 hover:text-[#007B8C]">
              Jobs
            </Link>{" "}
            / <span className="text-[#007B8C]">Job details</span>
          </p>
          <PageContentContainer className="min-h-0 flex-1 p-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
              We could not find this job.
            </div>
          </PageContentContainer>
        </div>
      </>
    );
  }

  const currentVersion =
    versions.find((version) => version.id === selectedVersionId) ??
    versions[versions.length - 1];
  const hasMultipleVersions = versions.length > 1;
  const activeStage =
    job.workflowStages?.find((stage) => stage.status === "In Progress") ??
    job.workflowStages?.[0];
  const stageLabel = activeStage?.stepLabel ?? "S1";
  const stageStatus = activeStage?.status ?? "In Progress";

  const assigneeMember =
    job.members?.find((member) => member.initials === job.assignee) ?? null;
  const ownerMember =
    job.members?.find((member) => member.initials === job.owner) ?? null;

  const supportingDocs = job.files?.length
    ? job.files.map((file) => ({ name: file.name }))
    : job.assetTitle
      ? [{ name: job.assetTitle }]
      : [];

  const activityItems = [
    {
      id: "activity-1",
      user: assigneeMember?.name ?? "Pranali Gosavi",
      message: "You opened the document for the first time.",
      date: "Thu Dec 12, 03:27 pm",
    },
    {
      id: "activity-2",
      user: ownerMember?.name ?? "Holly Westgarth",
      message: "Holly Westgarth made a decision : Approved on marketing stage",
      date: "Thu Dec 12, 03:27 pm",
    },
  ];

  const emailItems = [
    {
      id: "email-1",
      title: "New Decision",
      subject: "New decision on proof Appian fund 1. PDF",
      recipient: "Holly@gmail.com",
      date: "Thu Dec 12, 03:27 pm",
    },
    {
      id: "email-2",
      title: "New Decision",
      subject: "New decision on proof Appian fund 1. PDF",
      recipient: "Holly@gmail.com",
      date: "Thu Dec 12, 03:27 pm",
    },
  ];

  const infoCards = chunkQuestions(
    activeJobInfoTemplate?.questions ?? [],
    2
  );

 const menuItems = useMemo<PopupItem[]>(
    () => [
      { id: "share", label: "Share job details" },
      {
        id: "export",
        label: "Export job details",
        subItems: [
          { id: "export-pdf", label: "PDF file" },
          { id: "export-csv", label: "CSV file" },
        ],
      },
    ],
    []
  );

  const handleAddVersion = () => {
    if (!versionFiles.length) {
      setVersionModalOpen(false);
      return;
    }
    const nextNumber = getNextVersionNumber(versions);
    const nextVersion: JobVersion = {
      id: `job-${job.id}-v${Date.now()}`,
      label: `V${nextNumber}`,
      fileName: versionFiles[0]?.name ?? `Version ${nextNumber}`,
      uploadedAt: formatShortDate(new Date()),
    };
    const nextVersions = [...versions, nextVersion];
    updateJob(job.id, { versions: nextVersions });
    setSelectedVersionId(nextVersion.id);
    setVersionFiles([]);
    setVersionModalOpen(false);
  };

  const handleWorkflowSave = (value: WorkflowBuilderValue) => {
    const nextStages = buildStagesFromConfig(value, job.workflowStages ?? []);
    updateJob(job.id, {
      workflowConfig: value,
      workflowId: value.id,
      workflowLabel: value.name,
      members: value.reviewers,
      workflowStages: nextStages,
    });
  };

  const handleAssigneeAdd = (user: AssigneeOption) => {
    const nextMember: JobMember = {
      id: user.id,
      name: user.name,
      initials: user.initials,
      className: user.className ?? "bg-slate-900 text-white",
      email: user.subtitle,
    };
    const nextMembers = job.members?.some(
      (member) => member.id === nextMember.id
    )
      ? job.members
      : [...(job.members ?? []), nextMember];
    const nextStages = job.workflowStages?.map((stage) => {
      const exists = stage.members.some(
        (member) => member.id === nextMember.id
      );
      if (exists) return stage;
      return {
        ...stage,
        members: [...stage.members, toWorkflowMember(nextMember)],
      };
    });
    updateJob(job.id, {
      assignee: nextMember.initials,
      members: nextMembers,
      workflowStages: nextStages,
    });
    setAssigneeOpen(false);
  };

  return (
    <>
      <PageMeta title="Job details" description="Job details" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <p className="text-sm text-gray-500">
          <Link to="/jobs" className="text-gray-600 hover:text-[#007B8C]">
            Jobs
          </Link>{" "}
          / <span className="text-[#007B8C]">Job details</span>
        </p>
        <PageContentContainer className="min-h-0 flex-1 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="lg:text-xl font-semibold text-gray-900">
                {job.jobName}
              </h2>
              {hasMultipleVersions ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsVersionDropdownOpen((v) => !v)}
                    className="dropdown-toggle flex items-center gap-1 h-7 rounded-md bg-[#9F9F9F26] px-2 text-[15px] font-semibold text-gray-500"
                  >
                    {versions.find((v) => v.id === (selectedVersionId || versions[0]?.id))?.label}
                    <AngleDownIcon className={`h-1 w-2 text-gray-400 transition-transform ${isVersionDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  <Dropdown
                    isOpen={isVersionDropdownOpen}
                    onClose={() => setIsVersionDropdownOpen(false)}
                    className="mt-1 min-w-[40px] py-1 rounded-xs"
                  >
                    {versions.map((version) => (
                      <DropdownItem
                        key={version.id}
                        onClick={() => {
                          setSelectedVersionId(version.id);
                          setIsVersionDropdownOpen(false);
                        }}
                        baseClassName={`block w-full text-left px-4 py-1 text-[15px] hover:bg-gray-50 ${(selectedVersionId || versions[0]?.id) === version.id
                            ? "font-semibold text-[#007B8C]"
                            : "text-gray-500"
                          }`}
                      >
                        {version.label}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                </div>
              ) : (
                <span className="inline-flex h-7 items-center rounded-md border border-gray-200 bg-gray-100 px-2.5 text-[11px] font-semibold text-gray-600">
                  {currentVersion?.label ?? versions[0]?.label ?? "V1"}
                </span>
              )}
              <span className="rounded-full bg-[#0983991F] px-6 py-1 text- font-medium text-primary-500">
                {stageLabel} | {stageStatus}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="orangebutton"
                onClick={() => setVersionModalOpen(true)}
                startIcon={<PlusIcon className="h-4 w-4" />}
                className="!rounded-sm !px-4 !py-2.5 text-base font-medium bg-secondary-50"
              >
                New version
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="!rounded-sm !px-7 !py-3 text-base font-medium"
              >
                Review Job
              </Button>
              <button
                type="button"
                className="rounded-full p-2 text-gray-500"
                aria-label="Notifications"
                onClick={() => setEmailReviewersOpen(true)}
              >
                <NotificationIcon className="h-5 w-5" />
              </button>
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  className="rounded-full py-2 text-gray-500"
                  aria-label="More options"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <VerticalDots className="h-4 w-4" />
                </button>
                {menuOpen ? (
                  <div className="absolute right-0 top-full z-30 mt-2">
                    <Popup
                      items={menuItems}
                      className="!min-w-[180px] rounded-none"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-5 pt-2">
              <UnderlineTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
              <div className="mb-2 w-full max-w-[240px] rounded-full border border-gray-200 px-3 py-1.5">
                <SearchInput
                  placeholder="Search job details"
                  className="text-xs"
                  inputClassName="text-xs"
                  iconClassName="text-gray-300"
                  iconSize="!h-5"
                />
              </div>
            </div>

            <div className="p-5">
              {activeTab === "job-details" ? (
                <div className="space-y-6">
                  <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
                    <div className="space-y-3">
                      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white">
                        {job.tag ? (
                          <Badge
                            variant="solid"
                            color="urgent"
                            size="sm"
                            className="absolute left-0 top-0 rounded-none !rounded-br-xl  z-10 group-hover:opacity-0"
                          >
                            {job.tag}
                          </Badge>
                        ) : null}
                        <div className="relative flex h-40 items-center justify-center bg-gray-50">
                          <PPTIcon className="h-10 w-10 text-[#007B8C]" />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/40 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                            View Job
                          </div>
                        </div>
                        <div className="bg-gray-700 px-3 py-2 text-left text-xs text-white transition-opacity ">
                          {currentVersion?.fileName ??
                            job.assetTitle ??
                            job.jobName}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="grid gap-20 lg:grid-cols-[2.35fr_0.9fr]">
                        <div className="grid gap-4 gap-x-20 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold text-gray-800">Job ID</p>
                            <input
                              value={job.jobNumber}
                              readOnly
                              className="mt-1 w-full rounded-xs border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">
                              Associated Campaign
                            </p>
                            <input
                              value={job.campaignId}
                              readOnly
                              className="mt-1 w-full rounded-xs border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">Created Date</p>
                            <input
                              value={job.created}
                              readOnly
                              className="mt-1 w-full rounded-xs border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">Deadline</p>
                            <input
                              value={activeStage?.dueDate ?? "08 Jan 26"}
                              readOnly
                              className="mt-1 w-full rounded-xs border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600"
                            />
                          </div>
                        </div>

                        <div className="space-y-5 p-5">
                          <UserCell
                            title={ownerMember?.name ?? job.owner}
                            meta="Owner"
                            avatarAlt={ownerMember?.name ?? job.owner}
                            avatarUrl={ownerMember?.avatarUrl}
                            avatarSize="small"
                            className="items-start"
                            titleWrap={true}
                            align="start"
                            titleClassName="text-xs font-medium text-gray-700"
                            metaClassName="text-[11px] text-gray-400"
                          />

                          <div>
                            <p className="text-xs font-semibold text-gray-800">Assignee</p>
                            <button
                              type="button"
                              onClick={() => setAssigneeOpen(true)}
                              className="mt-2 rounded-full bg-gray-100 px-2 py-1.5 text-left"
                              aria-label="Edit assignee"
                            >
                              <UserCell
                                title={assigneeMember?.name ?? "Unassigned"}
                                subtitle={assigneeMember?.email ?? ""}
                                avatarAlt={assigneeMember?.name ?? "Unassigned"}
                                avatarUrl={assigneeMember?.avatarUrl}
                                avatarSize="small"
                                className="w-full justify-between"
                                titleClassName="text-xs font-medium text-gray-700"
                                subtitleClassName="text-[10px] text-gray-400"
                                rightSlot={
                                  <EditPenIcon className="h-2 w-2 text-gray-400" />
                                }
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white">
                    <div className="grid gap-10 lg:grid-cols-[2fr_1fr] items-center  border-b border-gray-200 px-4 py-3 text-sm font-bold text-gray-700">
                      <span>Job Brief</span>
                      <span>Supporting documents</span>
                    </div>
                    <div className="grid gap-0 lg:grid-cols-[2fr_1fr]">
                      <div className="p-4">
                        <p className="text-sm leading-relaxed font-medium text-gray-600">
                          {job.brief ??
                            "In any project, it’s crucial to maintain a consistent flow of information. This ensures that all team members are aligned and can focus on their tasks without unnecessary distractions."}
                        </p>
                      </div>
                      <div className="border-t border-gray-200 p-4 lg:border-l lg:border-t-0">
                        <div className="space-y-2">
                          {supportingDocs.length ? (
                            supportingDocs.map((doc) => (
                              <div
                                key={doc.name}
                                className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-md">
                                    <PPTIcon className="h-10 w-10" />
                                  </span>
                                  <span className="text-sm font-medium text-gray-800">
                                    {doc.name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="rounded-full p-1 text-gray-400"
                                >
                                  <Attachment className="h-4 w-4" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400">
                              No supporting documents.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "workflow" ? (
                <div>
                  {workflowValue ? (
                    <WorkflowBuilder
                      value={workflowValue}
                      mode="edit"
                      reviewerOptions={allMembers}
                      onSave={handleWorkflowSave}
                      onCancel={() => setActiveTab("job-details")}
                    />
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
                      No workflow configured for this job.
                    </div>
                  )}
                </div>
              ) : null}

              {activeTab === "information" ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {infoCards.length ? (
                    infoCards.map((questions, index) => (
                      <div
                        key={`info-card-${index}`}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                      >
                        <p className="text-sm font-semibold text-gray-700">
                          {index === 0 ? "Purpose And Audience" : "Brand And Tone"}
                        </p>
                        <div className="mt-4 space-y-4">
                          {questions.map((question) => {
                            const answer = job.jobInformation?.[question.id];
                            const yesOption = question.options.find((option) =>
                              option.label.toLowerCase().includes("yes")
                            );
                            const isChecked = Array.isArray(answer)
                              ? Boolean(
                                yesOption && answer.includes(yesOption.id)
                              )
                              : yesOption
                                ? answer === yesOption.id
                                : Boolean(answer);
                            return (
                              <div
                                key={question.id}
                                className="flex items-center justify-between gap-4"
                              >
                                <p className="text-xs text-gray-600">
                                  {question.text}
                                </p>
                                <ToggleSwitch
                                  checked={isChecked}
                                  onChange={() => { }}
                                  showLabel={false}
                                  size="sm"
                                  disabled
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
                      No job information has been added yet.
                    </div>
                  )}
                </div>
              ) : null}

              {activeTab === "activity" ? (
                <div className="space-y-2">
                  {activityItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-gray-200 py-3 text-sm text-gray-600"
                    >
                      <div>
                        <p className="font-medium text-gray-700">
                          {item.user}
                        </p>
                        <p className="text-sm text-gray-500">{item.message}</p>
                      </div>
                      <p className="text-xs text-gray-400">{item.date}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeTab === "emails" ? (
                <div className="space-y-2">
                  {emailItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-gray-200 py-3 text-sm text-gray-600"
                    >
                      <div>
                        <p className="font-medium text-gray-700">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Subject : {item.subject}
                        </p>
                        <p className="text-sm text-gray-500">
                          To : {item.recipient}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">{item.date}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeTab === "checklist" ? (
                <div>
                  <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
                    {[
                      { id: "all", label: "All" },
                      { id: "passed", label: "Passed" },
                      { id: "failed", label: "Failed" },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() =>
                          setChecklistFilter(
                            filter.id as "all" | "passed" | "failed"
                          )
                        }
                        className={`rounded-md border px-3 py-1 text-xs font-medium ${checklistFilter === filter.id
                            ? "border-[#007B8C] bg-[#E3F3F6] text-[#007B8C]"
                            : "border-gray-200 text-gray-500"
                          }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="rounded-md border border-gray-200 p-2 text-gray-400"
                      aria-label="Download checklist"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(job.workflowStages?.length
                      ? job.workflowStages
                      : [
                        {
                          id: "stage-1",
                          stepLabel: "S1",
                          name: "Design & Layout",
                          status: "In Progress",
                          dueDate: "",
                          members: [],
                        },
                        {
                          id: "stage-2",
                          stepLabel: "S2",
                          name: "Design & Layout",
                          status: "Not Started",
                          dueDate: "",
                          members: [],
                        },
                      ]
                    ).map((stage, index) => (
                      <ChecklistStageDropdown
                        key={stage.id}
                        stageCode={stage.stepLabel}
                        title={stage.name}
                        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                        items={filteredChecklistItems}
                        defaultOpen={index === 0}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </PageContentContainer>
      </div>

      <PopupModal
        isOpen={versionModalOpen}
        onClose={() => {
          setVersionModalOpen(false);
          setVersionFiles([]);
        }}
        title="Upload new version"
        className="max-w-[720px]"
        contentClassName="p-6"
        headerClassName="justify-center"
        showCloseButton={false}
      >
        <div className="mt-4">
          <FileDropzone
            files={versionFiles}
            onFilesChange={setVersionFiles}
            className="min-h-[200px] rounded-xl bg-gray-50"
            helperText="Drag & drop files or upload"
          />
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="primary"
            onClick={handleAddVersion}
            className="!rounded-md !px-5 !py-2 text-sm"
          >
            Send update request
          </Button>
          <Button
            size="sm"
            variant="orangebutton"
            onClick={() => {
              setVersionModalOpen(false);
              setVersionFiles([]);
            }}
            className="!rounded-md !px-5 !py-2 text-sm"
          >
            Cancel
          </Button>
        </div>
      </PopupModal>

      <AddAssigneePopup
        isOpen={assigneeOpen}
        onClose={() => setAssigneeOpen(false)}
        users={assigneeOptions}
        selfUser={{
          id: "self-user",
          name: "Thomas Anree",
          initials: "TA",
          className: "bg-slate-900 text-white",
        }}
        onAdd={handleAssigneeAdd}
      />

      <EmailReviewersPopup
        isOpen={emailReviewersOpen}
        onClose={() => setEmailReviewersOpen(false)}
      />
    </>
  );
}
