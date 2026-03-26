import { useState, type CSSProperties, type MouseEvent } from "react";
import PageMeta from "../components/common/PageMeta";
import PageContentContainer from "../components/layout/PageContentContainer";
import AddAssigneePopup from "../components/analytics/AddAssigneePopup";
import Button from "../components/ui/button/Button";
import { ColorPicker } from "../components/common/ColorPicker";
import AnalyticsNoteItem from "../components/analytics/AnalyticsNoteItem";
import { StageStepList, WorkflowStageCard, JOB_TRACKER_ITEMS } from "../components/workflow";
import AdvanceFilter from "../components/ui/advance-filter/AdvanceFilter";
import ColoumnsFilter from "../components/ui/columns-filter/ColoumnsFilter";
import ColumnsManager from "../components/ui/columns-filter/ColumnsManager";
import SelectedItem from "../components/ui/selected-item/SelectedItem";
import Popup from "../components/ui/popup/Popup";
import EmailReviewersPopup from "../components/ui/email-reviewers-popup/EmailReviewersPopup";
import JobCard, { type JobCardData } from "../components/ui/job-card/JobCard";
import StepDropdown from "../components/ui/step-dropdown/StepDropdown";
import InviteEmailComponent from "../components/ui/invite-email-component/InviteEmailComponent";
import SelectWorkflowDropdown from "../components/ui/select-workflow-dropdown/SelectWorkflowDropdown";
import DefineStage from "../components/ui/define-stage/DefineStage";
import DeclineRequestPopup from "../components/ui/decline-request-popup/DeclineRequestPopup";
import UserCell from "../components/ui/user-cell/UserCell";
import DocumentsComponent from "../components/ui/documents-component/DocumentsComponent";
import ReviewerList from "../components/ui/reviewerlist/ReviewerList";
import AddJobTable from "../components/ui/add-job-table/AddJobTable";
import AssociatedJobsTable from "../components/ui/associated-jobs-table/AssociatedJobsTable";
import Alert from "../components/ui/alert/Alert";
import Avatar from "../components/ui/avatar/Avatar";
import AvatarCheckbox from "../components/ui/avatar-checkbox/AvatarCheckbox";
import Badge from "../components/ui/badge/Badge";
import CloseButton from "../components/ui/close-button/CloseButton";
import CommentsBadge from "../components/ui/comments/CommentsBadge";
import CopyLink from "../components/ui/copy-link/CopyLink";
import DescriptionText from "../components/ui/description-text/DescriptionText";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import FileDropzone from "../components/ui/file-dropzone/FileDropzone";
import ResponsiveImage from "../components/ui/images/ResponsiveImage";
import TwoColumnImageGrid from "../components/ui/images/TwoColumnImageGrid";
import ThreeColumnImageGrid from "../components/ui/images/ThreeColumnImageGrid";
import JobInformationQuestionCard from "../components/ui/job-information-question/JobInformationQuestionCard";
import { Modal } from "../components/ui/modal";
import PopupModal from "../components/ui/popup-modal/PopupModal";
import PopupTitle from "../components/ui/popup-title/PopupTitle";
import RichTextEditor from "../components/ui/rich-text-editor/RichTextEditor";
import SearchInput from "../components/ui/search-input/SearchInput";
import TextInput from "../components/ui/text-input/TextInput";
import ToggleSwitch from "../components/ui/toggle/ToggleSwitch";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import AspectRatioVideo from "../components/ui/videos/AspectRatioVideo";
import FourIsToThree from "../components/ui/videos/FourIsToThree";
import OneIsToOne from "../components/ui/videos/OneIsToOne";
import SixteenIsToNine from "../components/ui/videos/SixteenIsToNine";
import TwentyOneIsToNine from "../components/ui/videos/TwentyOneIsToNine";
import WorkflowBuilder, {
  type WorkflowBuilderValue,
} from "../components/ui/workflow-builder/WorkflowBuilder";
import type { JobRow as JobRowType } from "../components/jobs/types";
import { MOCK_JOBS } from "../components/jobs/types";
import CampaignTableRow, {
  type CampaignStatus,
  type CampaignSubRow,
} from "../components/ui/campaign-table-row/CampaignTableRow";
import ChecklistStageDropdown, {
  type ChecklistItem,
} from "../components/ui/checklist-stage-dropdown/ChecklistStageDropdown";
import { ChevronDownIcon, Gallery, PageIcon, PencilIcon, WebIcon } from "../icons";
import { useColumnsConfig } from "../context/ColumnsConfigContext";
import { useCampaignsStore } from "../stores/campaignsStore";
import { useJobsStore } from "../stores/jobsStore";
import { resolveLabel } from "../data/localization";
import { useLocalizationStore } from "../stores/localizationStore";
import LocalizationSettingsCard from "../components/settings/LocalizationSettingsCard";
import { useJobInformationSteps } from "../components/ui/job-information/useJobInformationSteps";
import { useJobInformationStore } from "../stores/jobInformationStore";
import type { JobInfoQuestion } from "../types/jobInformation";

export default function Analytics() {
  const { columns, setColumns } = useColumnsConfig();
  const archivedCampaigns = useCampaignsStore((s) => s.archived);
  const archivedJobs = useJobsStore((s) => s.archived);
  const localizationOverrides = useLocalizationStore((s) => s.overrides);
  const analyticsTitle = resolveLabel("page.analytics.title", localizationOverrides);
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [isAssigneePopupOpen, setIsAssigneePopupOpen] = useState(false);
  const [isInvitePopupOpen, setIsInvitePopupOpen] = useState(false);
  const [isDefineStageOpen, setIsDefineStageOpen] = useState(false);
  const [isDeclineRequestOpen, setIsDeclineRequestOpen] = useState(false);
  const [isReviewerListOpen, setIsReviewerListOpen] = useState(false);
  const [reviewerListAnchor, setReviewerListAnchor] = useState<DOMRect | null>(
    null
  );
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [activeOutlineStageIndex, setActiveOutlineStageIndex] = useState(1);
  const [activeBorderedStageIndex, setActiveBorderedStageIndex] = useState(0);
  const [inviteEmails, setInviteEmails] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [popupModalOpen, setPopupModalOpen] = useState(false);
  const [avatarCheckboxChecked, setAvatarCheckboxChecked] = useState(true);
  const [secondaryAvatarChecked, setSecondaryAvatarChecked] = useState(false);
  const [toggleChecked, setToggleChecked] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [textInputValue, setTextInputValue] = useState("");
  const [richTextValue, setRichTextValue] = useState("");
  const [dropzoneFiles, setDropzoneFiles] = useState<File[]>([]);
  const [addedJobIds, setAddedJobIds] = useState<Set<string>>(new Set());
  const [associatedJobs, setAssociatedJobs] = useState<JobRowType[]>(() =>
    MOCK_JOBS.slice(0, 4)
  );
  const [associatedSelectedIds, setAssociatedSelectedIds] = useState<Set<string>>(
    new Set()
  );
  const [jobInfoQuestions, setJobInfoQuestions] = useState<JobInfoQuestion[]>([
    {
      id: "job-info-1",
      text: "Which formats do you need?",
      type: "choice",
      required: true,
      options: [
        { id: "job-info-1-opt-1", label: "PDF" },
        { id: "job-info-1-opt-2", label: "PPT" },
      ],
    },
    {
      id: "job-info-2",
      text: "Is this urgent?",
      type: "checkbox",
      required: false,
      options: [{ id: "job-info-2-opt-1", label: "Yes, mark as urgent" }],
    },
    {
      id: "job-info-3",
      text: "",
      type: "choice",
      required: false,
      options: [],
    },
  ]);
  const [workflowSavedName, setWorkflowSavedName] = useState<string | null>(null);
  const jobInfoTemplates = useJobInformationStore((state) => state.templates);
  const activeJobInfoTemplate =
    jobInfoTemplates.find((template) => template.isActive) ??
    jobInfoTemplates[0];
  const {
    steps: jobInfoSteps,
    stepIndex: jobInfoStepIndex,
    setStepIndex: setJobInfoStepIndex,
  } = useJobInformationSteps(activeJobInfoTemplate?.questions ?? []);
  const stagePreview = JOB_TRACKER_ITEMS[0]?.stages ?? [];
  const stageSteps = [
    { label: "S1", title: "Compliance", isActive: true },
    { label: "S2", title: "Content" },
    { label: "S3", title: "Recheck" },
  ];
  const outlineStageSteps = [
    { label: "S1", title: "Compliance" },
    { label: "S2", title: "Sales" },
  ];
  const borderedStageSteps = [
    { label: "S1", title: "Compliance" },
    { label: "S2", title: "Sales" },
  ];
  const stageStepsWithState = stageSteps.map((step, index) => ({
    ...step,
    isActive: index === activeStageIndex,
  }));
  const outlineStageStepsWithState = outlineStageSteps.map((step, index) => ({
    ...step,
    isActive: index === activeOutlineStageIndex,
  }));
  const borderedStageStepsWithState = borderedStageSteps.map((step, index) => ({
    ...step,
    isActive: index === activeBorderedStageIndex,
  }));
  const colorScaleSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const colorScaleGroups = [
    { id: "primary", label: "Primary" },
    { id: "secondary", label: "Secondary" },
  ];
  const notes = [
    {
      id: "n1",
      title: "Summer allergies campaign",
      description: "Rework needed after phase 1 is completed",
      date: "Jul 31",
    },
    {
      id: "n2",
      title: "Brochure task",
      description: "Please update the layout and typography",
      date: "Aug 01",
    },
  ];

  const mentions = [
    {
      id: "m1",
      userName: "James",
      message: "answered to your comment on the Summer allergies campaign job",
      description: "Summer allergies campaign job",
      date: "Jul 31",
      avatarUrl: "/uploads/avatar-1.jpg",
    },
    {
      id: "m2",
      userName: "Priya",
      message: "left a note on the brochure task",
      description: "Please update the layout and typography",
      date: "Aug 02",
      avatarUrl: "/uploads/avatar-2.jpg",
    },
  ];

  const reviewerList = [
    { id: "rev-1", name: "Krutika" },
    { id: "rev-2", name: "Ukas" },
    { id: "rev-3", name: "Mamta" },
  ];

  const handleReviewerListOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setReviewerListAnchor(event.currentTarget.getBoundingClientRect());
    setIsReviewerListOpen(true);
  };

  const jobCards: JobCardData[] = [
    {
      title: "Summer allergies Poster .V1",
      description: "Poster rework",
      meta: "SP11402048",
      date: "27 Oct 25",
      status: "In Progress",
      currentStage: 4,
      totalStages: 5,
      chatCount: 3,
      tag: "Urgent",
      tagTone: "red",
      thumbnailSrc:"https://images.pexels.com/photos/6287933/pexels-photo-6287933.jpeg"
    },
    {
      title: "Brochure .V1",
      description: "Layout updates pending",
      meta: "SP11402049",
      date: "16 Oct 25",
      status: "Changes required",
      progressPercent: 65,
      chatCount: 1,
      tag: "Expiry Due",
      tagTone: "amber",
    },
    {
      title: "Campaign Ad .V2",
      description: "Waiting on inputs",
      meta: "SP11402050",
      date: "27 Oct 25",
      status: "On hold",
      progressPercent: 40,
      chatCount: 0,
      tag: "On hold",
      tagTone: "gray",
    },
    {
      title: "Employee booklet .V2",
      description: "Final QA pending",
      meta: "SP11402051",
      date: "02 Oct 25",
      status: "Completed",
      progressPercent: 100,
      chatCount: 2,
      tag: "Late",
      tagTone: "orange",
    },
    {
      title: "Launch Video .V3",
      description: "Render in progress",
      meta: "SP11402052",
      date: "27 Oct 25",
      status: "In Progress",
      currentStage: 2,
      totalStages: 5,
      chatCount: 4,
      tag: "Urgent",
      tagTone: "red",
    },
  ];

  const campaignRows: Array<{
    id: string;
    campaignId: string;
    title: string;
    endDate: string;
    jobProgress: string;
    campaignStatus: CampaignStatus;
    jobStatusTag?: "Late";
    ownerName: string;
    ownerAvatarUrl?: string;
    subRows?: CampaignSubRow[];
  }> = [
    {
      id: "cam-1",
      campaignId: "CAM114025",
      title: "Summer allergies",
      endDate: "27 Oct 25",
      jobProgress: "1 of 3 completed",
      campaignStatus: "Started",
      ownerName: "Krutika",
      ownerAvatarUrl: "/uploads/avatar-1.jpg",
    },
    {
      id: "cam-2",
      campaignId: "CAM254953",
      title: "Employee roster",
      endDate: "02 Oct 25",
      jobProgress: "0 of 2 completed",
      campaignStatus: "Start Pending",
      ownerName: "Mihir",
    },
    {
      id: "cam-3",
      campaignId: "CAM124040",
      title: "Winter campaign",
      endDate: "16 Oct 25",
      jobProgress: "4 of 4 completed",
      campaignStatus: "Completed",
      ownerName: "Gaurav",
    },
    {
      id: "cam-4",
      campaignId: "CAM124041",
      title: "Fall Vacay",
      endDate: "05 Oct 25",
      jobProgress: "2 of 4 completed",
      campaignStatus: "Started",
      jobStatusTag: "Late",
      ownerName: "Pooja",
    },
    {
      id: "cam-5",
      campaignId: "CAM254954",
      title: "Summer campaign 2",
      endDate: "12 Nov 25",
      jobProgress: "0 of 3 completed",
      campaignStatus: "Start Pending",
      ownerName: "Kiran",
      subRows: [
        {
          id: "cam-5-sub-1",
          jobNumber: "JB61601",
          title: "Employee booklet DOC",
          endDate: "DD/MM/YY",
          jobProgress: "0 of 3 completed",
          campaignStatus: "Start Pending",
          ownerName: "Kiran",
        },
        {
          id: "cam-5-sub-2",
          jobNumber: "JB61602",
          title: "Employee booklet Dft",
          endDate: "DD/MM/YY",
          jobProgress: "0 of 3 completed",
          campaignStatus: "Start Pending",
          ownerName: "Kiran",
        },
        {
          id: "cam-5-sub-3",
          jobNumber: "JB61603",
          title: "Employee booklet PPT",
          endDate: "DD/MM/YY",
          jobProgress: "0 of 3 completed",
          campaignStatus: "Start Pending",
          ownerName: "Kiran",
        },
      ],
    },
  ];

  const addJobRows = MOCK_JOBS.slice(0, 5);
  const workflowReviewers = Array.from(
    new Map(
      MOCK_JOBS.flatMap((job) => job.members ?? []).map((member) => [
        member.id,
        member,
      ])
    ).values()
  );

  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(
    null
  );

  const allCampaignsSelected =
    selectedCampaignIds.length === campaignRows.length &&
    campaignRows.length > 0;

  const toggleCampaignSelection = (id: string) => {
    setSelectedCampaignIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllCampaigns = (checked: boolean) => {
    setSelectedCampaignIds(checked ? campaignRows.map((row) => row.id) : []);
  };

  const createJobInfoId = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const handleAddJob = (job: JobRowType) => {
    setAddedJobIds((prev) => {
      const next = new Set(prev);
      next.add(job.id);
      return next;
    });
  };

  const handleToggleAssociatedSelectAll = () => {
    setAssociatedSelectedIds((prev) => {
      if (associatedJobs.length === 0) return new Set();
      if (prev.size === associatedJobs.length) {
        return new Set();
      }
      return new Set(associatedJobs.map((job) => job.id));
    });
  };

  const handleToggleAssociatedSelect = (id: string) => {
    setAssociatedSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRemoveAssociated = (id: string) => {
    setAssociatedJobs((prev) => prev.filter((job) => job.id !== id));
    setAssociatedSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleJobInfoChange = (index: number, updated: JobInfoQuestion) => {
    setJobInfoQuestions((prev) =>
      prev.map((question, idx) => (idx === index ? updated : question))
    );
  };

  const handleJobInfoDelete = (index: number) => {
    setJobInfoQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleJobInfoDuplicate = (index: number) => {
    setJobInfoQuestions((prev) => {
      const question = prev[index];
      if (!question) return prev;
      const duplicated: JobInfoQuestion = {
        ...question,
        id: createJobInfoId("job-info"),
        options: question.options.map((option) => ({
          ...option,
          id: createJobInfoId("option"),
        })),
      };
      const next = [...prev];
      next.splice(index + 1, 0, duplicated);
      return next;
    });
  };

  const handleAddJobInfoQuestion = () => {
    setJobInfoQuestions((prev) => [
      ...prev,
      {
        id: createJobInfoId("job-info"),
        text: "",
        type: "choice",
        required: false,
        options: [],
      },
    ]);
  };

  const handleWorkflowSave = (value: WorkflowBuilderValue) => {
    setWorkflowSavedName(value.name);
  };

  const checklistItems: ChecklistItem[] = [
    {
      id: "checklist-1",
      question: "Is the layout visually appealing and easy to follow?",
      description: "Review overall visual flow and ease of navigation",
      commentCount: 0,
      response: "pass",
      reviewer: { name: "Pranali Gosavi", avatarUrl: "/uploads/avatar-1.jpg" },
    },
    {
      id: "checklist-2",
      question: "Is the hierarchy clear and consistent across sections?",
      description: "Check typography scale and visual spacing rhythm",
      commentCount: 0,
      reviewer: { name: "Pranali Gosavi" },
    },
    {
      id: "checklist-3",
      question: "Are visual elements aligned and balanced?",
      description: "Confirm grid alignment and layout consistency",
      commentCount: 1,
      response: "fail",
      reviewer: { name: "Pranali Gosavi", avatarUrl: "/uploads/avatar-2.jpg" },
    },
    {
      id: "checklist-4",
      question: "Is the layout visually appealing and easy to follow?",
      description: "Review overall visual flow and ease of navigation",
      commentCount: 0,
      response: "pass",
      reviewer: { name: "Pranali Gosavi" },
    },
    {
      id: "checklist-5",
      question: "Is the layout visually appealing and easy to follow?",
      description: "Review overall visual flow and ease of navigation",
      commentCount: 0,
      reviewer: { name: "Pranali Gosavi" },
    },
    {
      id: "checklist-6",
      question: "Is the layout visually appealing and easy to follow?",
      description: "Review overall visual flow and ease of navigation",
      commentCount: 0,
      response: "pending",
      reviewer: { name: "Pranali Gosavi" },
    },
  ];

  return (
    <>
      <PageMeta title={analyticsTitle} description="Analytics dashboard" />

      <PageContentContainer className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-800">{analyticsTitle}</h1>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-full border border-gray-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-gray-300"
              aria-label="Open user menu"
            >
              <UserCell
                title="Thomas Anree"
                subtitle="Admin"
                avatarUrl="/uploads/avatar-2.jpg"
                avatarSize="xsmall"
                className="gap-2"
                contentClassName="leading-tight"
                titleClassName="text-[12px] font-semibold text-gray-800"
                subtitleClassName="text-[10px] text-gray-500"
                rightSlot={<ChevronDownIcon className="h-4 w-4 text-gray-400" />}
              />
            </button>
            <div className="group relative">
  <button
    type="button"
    className="flex items-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-500 shadow-sm transition hover:border-gray-300 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
    aria-label="View workflow stages"
    title="View workflow stages"
  >
    <span className="relative rounded-md bg-gray-100 px-2 py-0.5 pr-3 text-[11px] text-gray-600 after:absolute after:right-[-6px] after:top-1/2 after:-translate-y-1/2 after:border-y-[6px] after:border-y-transparent after:border-l-[6px] after:border-l-gray-100">
      S1
    </span>
  </button>

  <div
    style={{ "--stage-arrow-offset": "14px" } as CSSProperties}
    className="pointer-events-none absolute left-full top-0 z-30 ml-3 w-[334px] translate-x-2 rounded-xl border border-gray-200 bg-white p-0 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.45)] opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-x-0 group-focus-within:opacity-100 max-h-[70vh] overflow-visible"
  >
    {/* Arrow pointing LEFT toward S1 — sits outside the left border */}
    <span
      style={{ top: "var(--stage-arrow-offset)" } as CSSProperties}
      className="pointer-events-none absolute -left-[7px] z-10 h-[13px] w-[13px] rotate-45 border-b border-l border-gray-200 bg-white"
    />

    <div className="relative z-20 divide-y divide-gray-100  overflow-hidden">
      {stagePreview.map((stage) => (
                    <WorkflowStageCard
                      key={stage.id}
                      stage={stage}
                      variant="fluid"
                      showRightChevron={false}
                      fallbackTopBarClass="bg-gray-300"
                      className="rounded-none border-0 p-3 pt-2 sm:p-3 sm:pt-2 sm:pb-2"
                    />
      ))}
    </div>
  </div>
</div>
            <Button size="sm" variant="secondary" onClick={() => setIsPopupOpen(true)}>
              Open email reviewers
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setIsAssigneePopupOpen(true)}>
              Open add assignee
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setIsInvitePopupOpen(true)}>
              Open invite email
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setIsDefineStageOpen(true)}>
              Open define stage
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setIsDeclineRequestOpen(true)}>
              Open decline request
            </Button>
            <Button size="sm" variant="secondary" onClick={handleReviewerListOpen}>
              Open reviewer list
            </Button>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Brand Colors</h2>
              <p className="text-xs text-gray-500">
                Update the primary and secondary colors used across the app.
              </p>
            </div>
            <span className="text-xs text-gray-400">Live preview</span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ColorPicker colorName="primary" label="Primary Color" />
            <ColorPicker colorName="secondary" label="Secondary Color" />
          </div>
          <div className="mt-5 space-y-3">
            {colorScaleGroups.map((group) => (
              <div key={group.id}>
                <p className="text-xs font-semibold text-gray-600">
                  {group.label} scale
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {colorScaleSteps.map((step) => (
                    <div key={`${group.id}-${step}`} className="flex flex-col items-center gap-1">
                      <span
                        className="h-6 w-10 rounded-md border border-gray-200"
                        style={{ backgroundColor: `var(--color-${group.id}-${step})` }}
                      />
                      <span className="text-[10px] text-gray-500">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <LocalizationSettingsCard />
        </div>
        <div className="mt-4">
          <StageStepList
            steps={stageStepsWithState}
            className="w-[220px]"
            onStepClick={setActiveStageIndex}
          />
        </div>
        <div className="mt-4">
          <StageStepList
            steps={outlineStageStepsWithState}
            className="w-[220px]"
            onStepClick={setActiveOutlineStageIndex}
            variant="outline"
          />
        </div>
        <div className="mt-4">
          <StageStepList
            steps={borderedStageStepsWithState}
            className="w-[220px]"
            onStepClick={setActiveBorderedStageIndex}
            variant="bordered"
            showConnector={false}
          />
        </div>
        <div className="mt-6">
          <SelectedItem selectedCount={1} />
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">
              Popup (icon + title + description)
            </h2>
            <Popup
              className="max-w-sm"
              items={[
                {
                  id: "live-review",
                  title: "Live",
                  description:
                    "Review a live website. The reviewer will take a snapshot of the markup.",
                  icon: <WebIcon className="h-4 w-4" />,
                },
                {
                  id: "snapshot-review",
                  title: "Snapshot",
                  description: "Review a snapshot website.",
                  icon: <PageIcon className="h-4 w-4" />,
                },
              ]}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">
              Popup (text only)
            </h2>
            <Popup
              className="max-w-[200px]"
              items={[
                { id: "rename", label: "Rename" },
                { id: "remove", label: "Remove" },
              ]}
            />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">
            Popup (with submenu)
          </h2>
          <Popup
            className="max-w-[220px]"
            items={[
              { id: "share-job", label: "Share job details" },
              {
                id: "export-job",
                label: "Export job details",
                subItems: [
                  { id: "export-pdf", label: "PDF file", onClick: () => {} },
                  { id: "export-csv", label: "CSV file", onClick: () => {} },
                ],
              },
            ]}
          />
        </div>
        <div className="mt-6">
          <AdvanceFilter />
        </div>
        <div className="mt-6">
          <ColoumnsFilter
            items={columns}
            onItemsChange={setColumns}
            onSaveView={setColumns}
          />
        </div>
        <div className="mt-6">
          <ColumnsManager />
        </div>
        <div className="mt-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Archive</h2>
                <p className="text-xs text-gray-500">
                  Campaigns archived from the Campaigns page.
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-400">
                {archivedCampaigns.length} items
              </span>
            </div>
            {archivedCampaigns.length > 0 ? (
              <div className="mt-4 space-y-2">
                {archivedCampaigns.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400">{item.campaignId}</p>
                    </div>
                    <span className="text-xs text-gray-400">{item.endDate}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center text-xs text-gray-400">
                No archived campaigns yet.
              </div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Archived Jobs
                </h2>
                <p className="text-xs text-gray-500">
                  Jobs archived from the Jobs page.
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-400">
                {archivedJobs.length} items
              </span>
            </div>
            {archivedJobs.length > 0 ? (
              <div className="mt-4 space-y-2">
                {archivedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {job.jobName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {job.jobNumber} • {job.campaignId}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {job.created}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center text-xs text-gray-400">
                No archived jobs yet.
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">
            Step dropdown
          </h2>
          <div className="max-w-2xl">
            <StepDropdown
              title="Job Information"
              steps={jobInfoSteps}
              stepIndex={jobInfoStepIndex}
              onStepChange={setJobInfoStepIndex}
              defaultOpen
              resetStepOnClose
            />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">
            Select workflow dropdown
          </h2>
          <div className="max-w-4xl">
            <SelectWorkflowDropdown defaultOpen />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">
            Checklist stage dropdown
          </h2>
          <div className="max-w-5xl">
            <ChecklistStageDropdown
              stageCode="S1"
              title="Design & Layout"
              description="Korem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum."
              items={checklistItems}
              defaultOpen
            />
          </div>
        </div>
        <div className="mt-6 space-y-3 w-xl">
          <h2 className="text-sm font-semibold text-gray-700">User cell examples</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-1xl border border-gray-200 bg-white p-4 shadow-sm">
              <UserCell
                title="Krutika Gawankar"
                subtitle="Owner"
                avatarUrl="/uploads/avatar-1.jpg"
                avatarSize="small"
                titleClassName="text-sm font-semibold text-gray-800"
                subtitleClassName="text-xs text-gray-500"
              />
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500">Assignee</p>
                <div className="mt-2 rounded-full bg-gray-50 px-3 py-2">
                  <UserCell
                    title="Pranali Gosavi"
                    subtitle="pranali@gmail.com"
                    avatarUrl="/uploads/avatar-2.jpg"
                    avatarSize="small"
                    titleClassName="text-sm font-semibold text-gray-800"
                    subtitleClassName="text-xs text-gray-500"
                    rightSlot={
                      <button
                        type="button"
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600"
                        aria-label="Edit assignee"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    }
                  />
                </div>
              </div>
            </div>
            <div className="rounded-1xl w-sm border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500">Header dropdown</p>
              <div className="mt-3">
                <button
                  type="button"
                  className="rounded-full border border-gray-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-gray-300"
                  aria-label="Open user menu"
                >
                  <UserCell
                    title="Thomas Anree"
                    subtitle="Admin"
                    avatarUrl="/uploads/avatar-2.jpg"
                    avatarSize="xsmall"
                    className="gap-2"
                    contentClassName="flex-none leading-tight"
                    titleClassName="text-[12px] font-semibold text-gray-800"
                    subtitleClassName="text-[10px] text-gray-500"
                    rightSlot={<ChevronDownIcon className="h-4 w-4 text-gray-400" />}
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="rounded-1xl w-sm border border-gray-200 bg-white p-4 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                <UserCell
                  title={
                    <>
                      <span className="font-semibold text-gray-900">John</span>{" "}
                      <span className="font-normal text-gray-600">
                        has mention you in job no -
                      </span>{" "}
                      <span className="font-semibold text-gray-900">E001234</span>
                    </>
                  }
                  subtitle="5m ago"
                  avatarUrl="/uploads/avatar-2.jpg"
                  avatarAlt="John"
                  avatarSize="small"
                  align="start"
                  titleWrap
                  titleClassName="text-[12px] text-gray-800 leading-snug"
                  subtitleClassName="text-[11px] text-gray-400"
                  className="w-full"
                />
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-[13px] font-semibold text-gray-400">
                  @
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <UserCell
                    title={
                      <>
                        <span className="font-semibold text-gray-900">Krutika</span>{" "}
                        <span className="font-normal text-gray-600">
                          has uploaded new version job no -
                        </span>{" "}
                        <span className="font-semibold text-gray-900">E001234</span>
                      </>
                    }
                    subtitle="5m"
                    avatarUrl="/uploads/avatar-1.jpg"
                    avatarAlt="Krutika"
                    avatarSize="small"
                    align="start"
                    titleWrap
                    titleClassName="text-[12px] text-gray-800 leading-snug"
                    subtitleClassName="text-[11px] text-gray-400"
                    className="w-full"
                  />
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-gray-400">
                    <Gallery className="h-4 w-4" />
                  </span>
                </div>
                <div className="pl-10">
                  <Button size="sm" className="!p-1 !px-2 text-[13px] !rounded-[3px]">
                    View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Documents component
          </h2>
          <div className="max-w-2xl">
            <DocumentsComponent title="Design brief.pdf" fileType="PDF" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Job cards</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {jobCards.map((card) => (
              <JobCard key={`${card.title}-${card.date}`} card={card} />
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Campaign table row
          </h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-[12px] font-bold text-gray-600">
                  <th className="px-3 py-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={allCampaignsSelected}
                        onChange={(event) =>
                          toggleAllCampaigns(event.target.checked)
                        }
                        className="h-4 w-4 rounded columns-checkbox"
                      />
                      Select All
                    </label>
                  </th>
                  <th className="px-3 py-2" />
                  <th className="px-3 py-2">Campaign ID</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">End Date</th>
                  <th className="px-3 py-2">Job status</th>
                  <th className="px-3 py-2">
                    <span className="inline-flex items-center gap-1">
                      Campaign Status
                      <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
                    </span>
                  </th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {campaignRows.map((row) => (
                  <CampaignTableRow
                    key={row.id}
                    campaignId={row.campaignId}
                    title={row.title}
                    endDate={row.endDate}
                    jobProgress={row.jobProgress}
                    campaignStatus={row.campaignStatus}
                    jobStatusTag={row.jobStatusTag}
                    ownerName={row.ownerName}
                    ownerAvatarUrl={row.ownerAvatarUrl}
                    subRows={row.subRows}
                    isSelected={selectedCampaignIds.includes(row.id)}
                    onToggleSelect={() => toggleCampaignSelection(row.id)}
                    isExpanded={expandedCampaignId === row.id}
                    onToggleExpand={() =>
                      setExpandedCampaignId((prev) =>
                        prev === row.id ? null : row.id
                      )
                    }
                    onEdit={() => {}}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Alerts and badges
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Alert
              variant="success"
              title="Success"
              message="Your changes were saved successfully."
            />
            <Alert
              variant="error"
              title="Error"
              message="We couldn't save your changes. Try again."
            />
            <Alert
              variant="warning"
              title="Warning"
              message="This action affects all reviewers."
            />
            <Alert
              variant="info"
              title="Info"
              message="Weekly report is ready to review."
              showLink
              linkText="View report"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="light" color="primary">
              Primary
            </Badge>
            <Badge variant="solid" color="success">
              Success
            </Badge>
            <Badge variant="light" color="warning">
              Warning
            </Badge>
            <Badge variant="solid" color="dark">
              Dark
            </Badge>
            <CommentsBadge count={12} size="lg" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Avatars and selection
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar
              src="/uploads/avatar-1.jpg"
              alt="Krutika Gawankar"
              size="xsmall"
              status="online"
            />
            <Avatar
              src="/uploads/avatar-2.jpg"
              alt="Thomas Anree"
              size="small"
              status="busy"
            />
            <Avatar
              src=""
              alt="Priya Kapoor"
              size="medium"
              status="offline"
            />
            <Avatar
              src=""
              alt="Design Review Team"
              size="large"
              fallbackType="name"
              status="none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <AvatarCheckbox
              name="Rohan Verma"
              subtitle="rohan@perivan.com"
              avatarUrl="/uploads/avatar-1.jpg"
              checked={avatarCheckboxChecked}
              onChange={setAvatarCheckboxChecked}
            />
            <AvatarCheckbox
              name="Design team"
              badgeText="3"
              checked={secondaryAvatarChecked}
              onChange={setSecondaryAvatarChecked}
              disabled
            />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Text helpers</h2>
          <div className="space-y-2">
            <DescriptionText
              label="Note:"
              text="Use previews to validate layout and spacing."
            />
            <DescriptionText
              label={null}
              text="Reviewers can copy the link below to share feedback."
            />
          </div>
          <CopyLink label="Copy share link" />
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Inputs and controls
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Job title"
              placeholder="Enter job title"
              value={textInputValue}
              onChange={(event) => setTextInputValue(event.target.value)}
              hint="Visible to reviewers"
            />
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <SearchInput
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search jobs"
                containerClassName="gap-3"
                className="text-sm text-gray-600"
                inputClassName="text-sm text-gray-600"
                iconClassName="text-gray-400"
                iconSize="!h-5"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <ToggleSwitch
              checked={toggleChecked}
              onChange={setToggleChecked}
              label="Notify reviewers"
            />
            <div className="relative">
              <button
                type="button"
                className="dropdown-toggle inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                Toggle dropdown
                <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
              </button>
              <Dropdown
                isOpen={dropdownOpen}
                onClose={() => setDropdownOpen(false)}
                className="top-full mt-2 w-44"
              >
                <DropdownItem onClick={() => setDropdownOpen(false)}>
                  Edit details
                </DropdownItem>
                <DropdownItem onClick={() => setDropdownOpen(false)}>
                  Archive
                </DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">File dropzone</h2>
          <div className="max-w-xl">
            <FileDropzone
              files={dropzoneFiles}
              onFilesChange={setDropzoneFiles}
            />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Rich text editor
          </h2>
          <div className="max-w-3xl">
            <RichTextEditor
              value={richTextValue}
              onChange={setRichTextValue}
              showAttachment
              onAttachmentChange={setDropzoneFiles}
            />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Table primitives
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="text-left text-xs font-semibold text-gray-500">
                  <TableCell isHeader className="px-4 py-3">
                    Name
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3">
                    Role
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3">
                    Status
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-t border-gray-100">
                  <TableCell className="px-4 py-3 text-gray-700">
                    Krutika Gawankar
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500">
                    Owner
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="light" color="success">
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="border-t border-gray-100">
                  <TableCell className="px-4 py-3 text-gray-700">
                    Thomas Anree
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500">
                    Reviewer
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="light" color="warning">
                      Pending
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Add job table</h2>
          <AddJobTable
            jobs={addJobRows}
            addedIds={addedJobIds}
            onAddJob={handleAddJob}
          />
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Associated jobs table
          </h2>
          <AssociatedJobsTable
            jobs={associatedJobs}
            selectedIds={associatedSelectedIds}
            onToggleSelectAll={handleToggleAssociatedSelectAll}
            onToggleSelect={handleToggleAssociatedSelect}
            onRemoveJob={handleRemoveAssociated}
            getDeadline={() => "02 Apr 26"}
          />
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Job information questions
          </h2>
          <div className="space-y-3">
            {jobInfoQuestions.map((question, index) => (
              <JobInformationQuestionCard
                key={question.id}
                index={index}
                question={question}
                onChange={(updated) => handleJobInfoChange(index, updated)}
                onDelete={() => handleJobInfoDelete(index)}
                onDuplicate={() => handleJobInfoDuplicate(index)}
              />
            ))}
            <Button size="sm" variant="secondary" onClick={handleAddJobInfoQuestion}>
              Add question
            </Button>
          </div>
        </div>
        {/* <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Images</h2>
          <div className="max-w-5xl space-y-4">
            <ResponsiveImage />
            <TwoColumnImageGrid />
            <ThreeColumnImageGrid />
          </div>
        </div> */}
        {/* <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Videos</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <AspectRatioVideo
              videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
              aspectRatio="video"
            />
            <TwentyOneIsToNine />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <OneIsToOne />
            <FourIsToThree />
            <SixteenIsToNine />
          </div>
        </div> */}
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Modals and popup elements
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <PopupTitle colorClassName="text-gray-800" sizeClassName="text-lg">
              Popup title
            </PopupTitle>
            <CloseButton onClick={() => setModalOpen(true)} />
            <Button size="sm" variant="secondary" onClick={() => setModalOpen(true)}>
              Open modal
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPopupModalOpen(true)}
            >
              Open popup modal
            </Button>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Workflow builder
          </h2>
          <p className="text-xs text-gray-500">
            {workflowSavedName
              ? `Last saved: ${workflowSavedName}`
              : "No workflow saved yet."}
          </p>
          <WorkflowBuilder
            reviewerOptions={workflowReviewers}
            onSave={handleWorkflowSave}
            onCancel={() => setWorkflowSavedName(null)}
          />
        </div>
        <div className="mt-6 space-y-3">
          {notes.map((note) => (
            <AnalyticsNoteItem
              key={note.id}
              variant="note"
              title={note.title}
              description={note.description}
              date={note.date}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {mentions.map((mention) => (
            <AnalyticsNoteItem
              key={mention.id}
              variant="mention"
              userName={mention.userName}
              message={mention.message}
              description={mention.description}
              date={mention.date}
              avatarUrl={mention.avatarUrl}
              onDelete={() => {}}
            />
          ))}
        </div>
      </PageContentContainer>

      <EmailReviewersPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
      <AddAssigneePopup
        isOpen={isAssigneePopupOpen}
        onClose={() => setIsAssigneePopupOpen(false)}
        addButtonClassName="rounded-md"
      />
      <InviteEmailComponent
        isOpen={isInvitePopupOpen}
        onClose={() => setIsInvitePopupOpen(false)}
        value={inviteEmails}
        onChange={setInviteEmails}
      />
      <DefineStage
        isOpen={isDefineStageOpen}
        onClose={() => setIsDefineStageOpen(false)}
      />
      <DeclineRequestPopup
        isOpen={isDeclineRequestOpen}
        onClose={() => setIsDeclineRequestOpen(false)}
      />
      <ReviewerList
        isOpen={isReviewerListOpen}
        onClose={() => setIsReviewerListOpen(false)}
        anchorRect={reviewerListAnchor}
        reviewers={reviewerList}
        placement="top-start"
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        className="max-w-lg w-full mx-4"
      >
        <div className="p-6 space-y-3">
          <PopupTitle colorClassName="text-gray-800" sizeClassName="text-xl">
            Example modal
          </PopupTitle>
          <p className="text-sm text-gray-600">
            This is a preview of the modal component.
          </p>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
      <PopupModal
        isOpen={popupModalOpen}
        onClose={() => setPopupModalOpen(false)}
        title="Popup modal"
        contentClassName="!p-5"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Use this layout for confirmations or quick edits.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPopupModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setPopupModalOpen(false)}
            >
              Confirm
            </Button>
          </div>
        </div>
      </PopupModal>
    </>
  );
}
