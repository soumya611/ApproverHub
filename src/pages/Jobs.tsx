import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent,
} from "react";
import { useLocation, useNavigate } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageContentContainer from "../components/layout/PageContentContainer";
import PaginationControls from "../components/common/PaginationControls";
import SearchInput from "../components/ui/search-input/SearchInput";
import AdvanceFilter, {
  type AdvanceFilterState,
  type FilterRow,
} from "../components/ui/advance-filter/AdvanceFilter";
import SelectedItem, {
  type SelectedItemAction,
} from "../components/ui/selected-item/SelectedItem";
import type { FilterDropdownOption } from "../components/ui/advance-filter/FilterDropdown";
import ColoumnsFilter, {
  type ColumnItem,
} from "../components/ui/columns-filter/ColoumnsFilter";
import Popup from "../components/ui/popup/Popup";
import JobCard, { type JobCardData, type JobCardTagTone } from "../components/ui/job-card/JobCard";
import AddAssigneePopup, {
  type AssigneeOption,
} from "../components/analytics/AddAssigneePopup";
import { JobsFAB, JobsTable, type JobTag, type JobRowType } from "../components/jobs";
import type { JobMember } from "../components/jobs/types";
import { FilterIcon, GridIcon, ListViewIcon, VerticalDots } from "../icons";
import { resolveLabel } from "../data/localization";
import { normalizeColumns } from "../data/columnsConfig";
import { useLocalizationStore } from "../stores/localizationStore";
import { useJobsStore } from "../stores/jobsStore";
import { useJobsColumnsConfig } from "../context/JobsColumnsConfigContext";
import { useColumnsConfig } from "../context/ColumnsConfigContext";
import type { WorkflowMember } from "../types/workflow.types";

type SavedView = {
  id: string;
  name: string;
  filterState: AdvanceFilterState;
};

const DEFAULT_FILTER_ROWS: FilterRow[] = [
  {
    id: "row-1",
    column: "",
    condition: "",
    value: "",
  },
];

const STATUS_ORDER = [
  "In Progress",
  "Start Pending",
  "Uploading...",
  "Upload Failed",
  "Complete",
  "Changes required",
  "On hold",
];

const QUERY_FILTER_TO_STATUS: Record<string, JobRowType["status"]> = {
  complete: "Complete",
  completed: "Complete",
  in_progress: "In Progress",
  "in-progress": "In Progress",
  start_pending: "Start Pending",
  "start-pending": "Start Pending",
  uploading: "Uploading...",
  upload_failed: "Upload Failed",
  "upload-failed": "Upload Failed",
  changes_required: "Changes required",
  "changes-required": "Changes required",
  on_hold: "On hold",
  "on-hold": "On hold",
};

const normalizeStatusToken = (value: string) =>
  value.trim().toLowerCase().replace(/[\s.-]+/g, "_");

const matchesStatusFilter = (
  jobStatus: JobRowType["status"] | string,
  filterStatus: JobRowType["status"]
) => {
  const normalizedJobStatus = normalizeStatusToken(String(jobStatus));
  const normalizedFilterStatus = normalizeStatusToken(filterStatus);

  // Accept both "complete" and "completed" as the same URL filter intent.
  if (normalizedFilterStatus === "complete") {
    return (
      normalizedJobStatus === "complete" || normalizedJobStatus === "completed"
    );
  }

  return normalizedJobStatus === normalizedFilterStatus;
};

const TAG_TONE_MAP: Record<Exclude<JobTag, null>, JobCardTagTone> = {
  Urgent: "red",
  "Expiry Due": "amber",
  Late: "orange",
  Expired: "gray",
};

const SELF_ASSIGNEE: AssigneeOption = {
  id: "self-user",
  name: "Thomas Anree",
  initials: "TA",
  className: "bg-slate-900 text-white",
};

const matchCondition = (fieldValue: string, condition: string, target: string) => {
  switch (condition) {
    case "is":
      return fieldValue === target;
    case "is_not":
      return fieldValue !== target;
    case "contains":
      return fieldValue.includes(target);
    case "starts_with":
      return fieldValue.startsWith(target);
    default:
      return true;
  }
};

const parseQuickSelections = (quickSelections: Record<string, boolean>) => {
  const selectedByColumn: Record<string, string[]> = {};

  Object.entries(quickSelections).forEach(([key, checked]) => {
    if (!checked || key.endsWith("-__header__")) {
      return;
    }
    const splitIndex = key.indexOf("-");
    if (splitIndex === -1) return;
    const column = key.slice(0, splitIndex);
    const item = key.slice(splitIndex + 1);
    if (!selectedByColumn[column]) {
      selectedByColumn[column] = [];
    }
    selectedByColumn[column].push(item);
  });

  return selectedByColumn;
};

const applyQuickFilters = (
  data: JobRowType[],
  quickSelections: Record<string, boolean>
) => {
  const selections = parseQuickSelections(quickSelections);

  const hasSelections = Object.values(selections).some(
    (items) => items.length > 0
  );
  if (!hasSelections) {
    return data;
  }

  return data.filter((job) => {
    const statusSelections = selections["Status"];
    if (statusSelections?.length && !statusSelections.includes("All")) {
      if (!statusSelections.includes(job.status)) {
        return false;
      }
    }

    const ownerSelections = selections["Owner"];
    if (ownerSelections?.length && !ownerSelections.includes(job.owner)) {
      return false;
    }

    const assigneeSelections = selections["Assignee"];
    if (assigneeSelections?.length) {
      const assigneeValue = job.assignee ?? "Unassigned";
      if (!assigneeSelections.includes(assigneeValue)) {
        return false;
      }
    }

    const campaignSelections = selections["Campaign ID"];
    if (
      campaignSelections?.length &&
      !campaignSelections.includes(job.campaignId)
    ) {
      return false;
    }

    return true;
  });
};

const applyAdvancedFilters = (data: JobRowType[], rows: FilterRow[]) => {
  const validRows = rows.filter(
    (row) => row.column && row.condition && row.value
  );
  if (validRows.length === 0) {
    return data;
  }

  return data.filter((job) =>
    validRows.every((filterRow) => {
      const fieldValue = (() => {
        switch (filterRow.column) {
          case "owner":
            return job.owner;
          case "status":
            return job.status;
          case "campaign_id":
            return job.campaignId;
          case "job_name":
            return job.jobName;
          case "assignee":
            return job.assignee ?? "Unassigned";
          case "job_number":
            return job.jobNumber;
          default:
            return "";
        }
      })();

      const targetValue = filterRow.value;

      if (!fieldValue || !targetValue) {
        return true;
      }

      const normalizedField = String(fieldValue).toLowerCase();
      const normalizedTarget = String(targetValue).toLowerCase();

      return matchCondition(
        normalizedField,
        filterRow.condition,
        normalizedTarget
      );
    })
  );
};

const applySearchFilter = (data: JobRowType[], term: string) => {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return data;

  return data.filter((job) => {
    const haystack = [
      job.campaignId,
      job.jobNumber,
      job.jobName,
      job.created,
      job.status,
      job.owner,
      job.assignee ?? "",
      job.tag ?? "",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
};

const applyFilters = (
  data: JobRowType[],
  filterState: AdvanceFilterState | null
) => {
  if (!filterState) return data;
  let filtered = data;
  filtered = applyQuickFilters(filtered, filterState.quickSelections);
  filtered = applyAdvancedFilters(filtered, filterState.rows);
  return filtered;
};

const applyStatusParamFilter = (
  data: JobRowType[],
  statusFilter: JobRowType["status"] | null
) => {
  if (!statusFilter) return data;
  return data.filter((job) => matchesStatusFilter(job.status, statusFilter));
};

const getUniqueValues = (items: Array<string | null | undefined>) =>
  Array.from(new Set(items.filter(Boolean) as string[]));

const formatShortDate = (value: Date) =>
  value
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
    .replace(",", "");

const sortByPinned = (items: JobRowType[], pinnedIds: Set<string>) => {
  if (pinnedIds.size === 0) return items;
  const pinned: JobRowType[] = [];
  const rest: JobRowType[] = [];
  items.forEach((item) => {
    if (pinnedIds.has(item.id)) {
      pinned.push(item);
    } else {
      rest.push(item);
    }
  });
  return [...pinned, ...rest];
};

const getStatusFilterFromSearch = (
  search: string
): JobRowType["status"] | null => {
  const params = new URLSearchParams(search);
  const rawFilter = params.get("filter") ?? params.get("status");
  if (!rawFilter) return null;

  const normalized = normalizeStatusToken(rawFilter);
  return QUERY_FILTER_TO_STATUS[normalized] ?? null;
};

const CORE_JOB_COLUMN_IDS = new Set([
  "campaign_id",
  "job_number",
  "job_name",
  "created",
  "status",
  "action",
  "owner",
  "assignee",
]);

const mergeJobsColumnsWithCampaignFields = (
  jobColumns: ColumnItem[],
  campaignColumns: ColumnItem[]
) => {
  const mergedColumns = normalizeColumns(jobColumns);
  const columnIndexById = new Map(
    mergedColumns.map((column, index) => [column.id, index])
  );

  campaignColumns.forEach((campaignColumn) => {
    if (CORE_JOB_COLUMN_IDS.has(campaignColumn.id)) {
      return;
    }

    const existingIndex = columnIndexById.get(campaignColumn.id);
    if (existingIndex !== undefined) {
      const existing = mergedColumns[existingIndex];
      if (existing.label !== campaignColumn.label) {
        mergedColumns[existingIndex] = { ...existing, label: campaignColumn.label };
      }
      return;
    }

    mergedColumns.push({
      id: campaignColumn.id,
      label: campaignColumn.label,
      checked: false,
      required: false,
    });
    columnIndexById.set(campaignColumn.id, mergedColumns.length - 1);
  });

  return normalizeColumns(mergedColumns);
};

export default function Jobs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeViewId, setActiveViewId] = useState<string>("all");
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [openViewMenuId, setOpenViewMenuId] = useState<string | null>(null);
  const [currentFilterState, setCurrentFilterState] =
    useState<AdvanceFilterState | null>(null);
  const [filterResetKey, setFilterResetKey] = useState(0);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [columnsDraft, setColumnsDraft] = useState<ColumnItem[]>([]);
  const [isAssigneePopupOpen, setIsAssigneePopupOpen] = useState(false);
  const [assigneeTargetId, setAssigneeTargetId] = useState<string | null>(null);
  const jobs = useJobsStore((state) => state.jobs);
  const archivedJobs = useJobsStore((state) => state.archived);
  const pinnedJobs = useJobsStore((state) => state.pinned);
  const addJob = useJobsStore((state) => state.addJob);
  const updateJob = useJobsStore((state) => state.updateJob);
  const pinJobs = useJobsStore((state) => state.pinJobs);
  const archiveJobs = useJobsStore((state) => state.archiveJobs);
  const jobsCurrentPage = useJobsStore((state) => state.pagination.currentPage);
  const jobsPageSize = useJobsStore((state) => state.pagination.pageSize);
  const goToNextJobsPage = useJobsStore((state) => state.goToNextPage);
  const goToPreviousJobsPage = useJobsStore((state) => state.goToPreviousPage);
  const setJobsCurrentPage = useJobsStore((state) => state.setCurrentPage);
  const setJobsPageSize = useJobsStore((state) => state.setPageSize);
  const resetJobsPagination = useJobsStore((state) => state.resetPagination);
  const localizationOverrides = useLocalizationStore((s) => s.overrides);
  const jobsTitle = resolveLabel("page.jobs.title", localizationOverrides);
  const { columns: jobsColumns, setColumns: setJobsColumns } = useJobsColumnsConfig();
  const { columns: campaignColumns } = useColumnsConfig();

  const assigneeUsers = useMemo<AssigneeOption[]>(() => {
    const map = new Map<string, AssigneeOption>();
    jobs.forEach((job) => {
      job.members?.forEach((member) => {
        map.set(member.id, {
          id: member.id,
          name: member.name,
          initials: member.initials,
          className: member.className,
          avatarUrl: member.avatarUrl,
        });
      });
    });
    map.set(SELF_ASSIGNEE.id, SELF_ASSIGNEE);
    return Array.from(map.values());
  }, [jobs]);

  const filterPanelRef = useRef<HTMLDivElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const columnsPanelRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const isTableDraggingRef = useRef(false);
  const tableStartXRef = useRef(0);
  const tableScrollLeftRef = useRef(0);

  const statusOptions = useMemo<FilterDropdownOption[]>(() => {
    const available = STATUS_ORDER.filter((status) =>
      jobs.some((job) => job.status === status)
    );
    const options = available.length ? available : STATUS_ORDER;
    return options.map((status) => ({ label: status, value: status }));
  }, [jobs]);

  const ownerOptions = useMemo<FilterDropdownOption[]>(
    () => getUniqueValues(jobs.map((job) => job.owner)).map((value) => ({
        label: value,
        value,
      })),
    [jobs]
  );

  const assigneeOptions = useMemo<FilterDropdownOption[]>(
    () =>
      getUniqueValues(jobs.map((job) => job.assignee ?? "Unassigned")).map(
        (value) => ({
          label: value,
          value,
        })
      ),
    [jobs]
  );

  const campaignOptions = useMemo<FilterDropdownOption[]>(
    () => getUniqueValues(jobs.map((job) => job.campaignId)).map((value) => ({
        label: value,
        value,
      })),
    [jobs]
  );

  const jobNameOptions = useMemo<FilterDropdownOption[]>(
    () => getUniqueValues(jobs.map((job) => job.jobName)).map((value) => ({
        label: value,
        value,
      })),
    [jobs]
  );

  const jobNumberOptions = useMemo<FilterDropdownOption[]>(
    () => getUniqueValues(jobs.map((job) => job.jobNumber)).map((value) => ({
        label: value,
        value,
      })),
    [jobs]
  );

  const quickFilterColumns = useMemo(
    () => [
      {
        title: "Status",
        items: ["All", ...statusOptions.map((option) => option.label)],
      },
      {
        title: "Owner",
        items: ownerOptions.map((option) => option.label),
      },
      {
        title: "Assignee",
        items: assigneeOptions.map((option) => option.label),
      },
      {
        title: "Campaign ID",
        items: campaignOptions.map((option) => option.label),
      },
    ],
    [statusOptions, ownerOptions, assigneeOptions, campaignOptions]
  );

  const columnOptions: FilterDropdownOption[] = [
    { label: "Owner", value: "owner" },
    { label: "Status", value: "status" },
    { label: "Campaign ID", value: "campaign_id" },
    { label: "Job Name", value: "job_name" },
    { label: "Assignee", value: "assignee" },
    { label: "Job Number", value: "job_number" },
  ];

  const valueOptionsByColumn = useMemo(
    () => ({
      status: statusOptions,
      owner: ownerOptions,
      assignee: assigneeOptions,
      campaign_id: campaignOptions,
      job_name: jobNameOptions,
      job_number: jobNumberOptions,
    }),
    [
      statusOptions,
      ownerOptions,
      assigneeOptions,
      campaignOptions,
      jobNameOptions,
      jobNumberOptions,
    ]
  );

  const mergedColumns = useMemo(
    () => mergeJobsColumnsWithCampaignFields(jobsColumns, campaignColumns),
    [jobsColumns, campaignColumns]
  );

  const visibleColumns = useMemo(
    () => mergedColumns.filter((item) => item.checked),
    [mergedColumns]
  );

  const tableMinWidth = useMemo(() => {
    const baseWidth = 320;
    const columnWidth = 150;
    return Math.max(900, baseWidth + visibleColumns.length * columnWidth);
  }, [visibleColumns.length]);

  const activeFilterState = useMemo(() => {
    if (activeViewId === "all") {
      return currentFilterState;
    }
    const view = savedViews.find((item) => item.id === activeViewId);
    return view?.filterState ?? currentFilterState;
  }, [activeViewId, savedViews, currentFilterState]);

  const statusFilterFromParams = useMemo(
    () => getStatusFilterFromSearch(location.search),
    [location.search]
  );

  const filteredJobs = useMemo(
    () => applyStatusParamFilter(applyFilters(jobs, activeFilterState), statusFilterFromParams),
    [activeFilterState, jobs, statusFilterFromParams]
  );

  const searchedJobs = useMemo(
    () => applySearchFilter(filteredJobs, search),
    [filteredJobs, search]
  );

  const pinnedIds = useMemo(
    () => new Set(pinnedJobs.map((job) => job.id)),
    [pinnedJobs]
  );

  const visibleJobs = useMemo(
    () => sortByPinned(searchedJobs, pinnedIds),
    [searchedJobs, pinnedIds]
  );

  const totalJobPages = useMemo(
    () => Math.max(1, Math.ceil(visibleJobs.length / jobsPageSize)),
    [visibleJobs.length, jobsPageSize]
  );

  const currentJobPage = Math.min(jobsCurrentPage, totalJobPages);

  const paginatedJobs = useMemo(() => {
    const start = (currentJobPage - 1) * jobsPageSize;
    return visibleJobs.slice(start, start + jobsPageSize);
  }, [visibleJobs, currentJobPage, jobsPageSize]);

  const jobsFrom = visibleJobs.length
    ? (currentJobPage - 1) * jobsPageSize + 1
    : 0;
  const jobsTo = visibleJobs.length
    ? Math.min(visibleJobs.length, currentJobPage * jobsPageSize)
    : 0;

  const canGoToPreviousJobsPage = currentJobPage > 1;
  const canGoToNextJobsPage = currentJobPage < totalJobPages;

  const visibleIds = useMemo(
    () => new Set(visibleJobs.map((row) => row.id)),
    [visibleJobs]
  );

  const selectedJobs = useMemo(
    () => jobs.filter((job) => selectedIds.has(job.id)),
    [jobs, selectedIds]
  );

  const allSelected =
    paginatedJobs.length > 0 &&
    paginatedJobs.every((job) => selectedIds.has(job.id));

  const toggleSelectAll = () => {
    if (paginatedJobs.length === 0) return;
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedJobs.forEach((job) => {
          next.delete(job.id);
        });
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedJobs.forEach((job) => {
          next.add(job.id);
        });
        return next;
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const closeAssigneePopup = () => {
    setIsAssigneePopupOpen(false);
    setAssigneeTargetId(null);
  };

  const handleAssigneeClick = (jobId: string) => {
    setAssigneeTargetId(jobId);
    setIsAssigneePopupOpen(true);
  };

  const toWorkflowMember = (member: JobMember): WorkflowMember => ({
    id: member.id,
    initials: member.initials,
    className: member.className,
  });

  const handleAssignUser = (user: AssigneeOption) => {
    if (!assigneeTargetId) return;
    const job = jobs.find((item) => item.id === assigneeTargetId);
    if (!job) return;
    const nextMember: JobMember = {
      id: user.id,
      name: user.name,
      initials: user.initials,
      className: user.className ?? "bg-slate-600 text-white",
      avatarUrl: user.avatarUrl,
    };
    const nextMembers = job.members
      ? job.members.some((member) => member.id === nextMember.id)
        ? job.members
        : [...job.members, nextMember]
      : [nextMember];
    const nextStages = job.workflowStages?.map((stage) => {
      const exists = stage.members.some((member) => member.id === nextMember.id);
      if (exists) return stage;
      return {
        ...stage,
        members: [...stage.members, toWorkflowMember(nextMember)],
      };
    });

    updateJob(assigneeTargetId, {
      assignee: nextMember.initials,
      members: nextMembers,
      workflowStages: nextStages,
    });
    closeAssigneePopup();
  };

  const handleAction = (jobId: string, actionId: string) => {
    switch (actionId) {
      case "start-job":
        updateJob(jobId, { status: "In Progress" });
        break;
      case "start-on-date":
        updateJob(jobId, { status: "Start Pending" });
        break;
      case "hold-job":
        updateJob(jobId, { status: "On hold" });
        break;
      case "archive":
        archiveJobs([jobId]);
        break;
      default:
        break;
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/jobs/${id}/edit`);
  };

  const handleSaveView = (state: AdvanceFilterState) => {
    const existing = savedViews.find(
      (view) => view.name.toLowerCase() === "my jobs"
    );
    if (existing) {
      setSavedViews((prev) =>
        prev.map((view) =>
          view.id === existing.id ? { ...view, filterState: state } : view
        )
      );
      setActiveViewId(existing.id);
    } else {
      const newView = {
        id: `view-${Date.now()}`,
        name: "My Jobs",
        filterState: state,
      };
      setSavedViews((prev) => [...prev, newView]);
      setActiveViewId(newView.id);
    }
    setIsFilterOpen(false);
  };

  const handleAllClick = () => {
    setActiveViewId("all");
    setOpenViewMenuId(null);
    setCurrentFilterState(null);
    setFilterResetKey((prev) => prev + 1);
    resetJobsPagination();
  };

  const handleViewSelect = (view: SavedView) => {
    setActiveViewId(view.id);
    setOpenViewMenuId(null);
    setCurrentFilterState(view.filterState);
  };

  const handleRenameView = (viewId: string) => {
    const view = savedViews.find((item) => item.id === viewId);
    if (!view) return;
    const nextName = window.prompt("Rename view", view.name);
    if (!nextName?.trim()) return;
    setSavedViews((prev) =>
      prev.map((item) =>
        item.id === viewId ? { ...item, name: nextName.trim() } : item
      )
    );
  };

  const handleRemoveView = (viewId: string) => {
    setSavedViews((prev) => prev.filter((item) => item.id !== viewId));
    setOpenViewMenuId(null);
    if (activeViewId === viewId) {
      handleAllClick();
    }
  };

  const handleColumnsOpen = () => {
    setIsColumnsOpen(true);
    setColumnsDraft(mergedColumns);
  };

  const handleColumnsSave = (nextItems: ColumnItem[]) => {
    const normalized = normalizeColumns(nextItems);
    setJobsColumns(normalized);
    setColumnsDraft(normalized);
    setIsColumnsOpen(false);
  };

  const handleTableWheel = (event: WheelEvent<HTMLDivElement>) => {
    const container = tableScrollRef.current;
    if (!container) return;

    // Keep vertical wheel scrolling for the page; only custom-handle horizontal gestures.
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    container.scrollLeft += event.deltaX;
    event.preventDefault();
  };

  const handleTableMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    const container = tableScrollRef.current;
    if (!container || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("input, button, a, select, textarea, label")) {
      return;
    }
    isTableDraggingRef.current = true;
    tableStartXRef.current = event.clientX;
    tableScrollLeftRef.current = container.scrollLeft;
  };

  const handleTableMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const container = tableScrollRef.current;
    if (!container || !isTableDraggingRef.current) return;
    const delta = event.clientX - tableStartXRef.current;
    container.scrollLeft = tableScrollLeftRef.current - delta;
    event.preventDefault();
  };

  const stopTableDragging = () => {
    isTableDraggingRef.current = false;
  };

  const getViewCount = (view: SavedView) =>
    applyFilters(jobs, view.filterState).length;

  const columnsMenu = (
    <div ref={columnsPanelRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => {
          if (isColumnsOpen) {
            setIsColumnsOpen(false);
            setColumnsDraft(mergedColumns);
          } else {
            handleColumnsOpen();
          }
        }}
        className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        aria-label="Open column settings"
      >
        <VerticalDots className="h-4 w-4" />
      </button>
      {isColumnsOpen ? (
        <div className="absolute right-0 top-full z-30 mt-2">
          <ColoumnsFilter
            items={columnsDraft}
            onItemsChange={setColumnsDraft}
            onSaveView={handleColumnsSave}
          />
        </div>
      ) : null}
    </div>
  );

  const clearSelection = () => setSelectedIds(new Set());

  const selectionActions: SelectedItemAction[] = [
    {
      id: "duplicate",
      label: "Duplicate",
      onClick: () => {
        if (!selectedJobs.length) return;
        const timestamp = Date.now();
        selectedJobs.forEach((job, index) => {
          addJob({
            ...job,
            id: `job-${timestamp}-${index}`,
            jobNumber: `${job.jobNumber}-D${index + 1}`,
            jobName: `${job.jobName} Copy`,
            created: formatShortDate(new Date()),
          });
        });
        clearSelection();
      },
    },
    {
      id: "hold",
      label: "Hold",
      onClick: () => {
        selectedJobs.forEach((job) =>
          updateJob(job.id, { status: "On hold" })
        );
        clearSelection();
      },
    },
    {
      id: "archive",
      label: "Archive",
      onClick: () => {
        const ids = selectedJobs.map((job) => job.id);
        archiveJobs(ids);
        clearSelection();
      },
    },
    {
      id: "export",
      label: "Export",
      onClick: () => {
        if (!selectedJobs.length) return;
        const headers = [
          "Campaign ID",
          "Job Number",
          "Job Name",
          "Created",
          "Status",
          "Owner",
          "Assignee",
        ];
        const lines = selectedJobs.map((job) =>
          [
            job.campaignId,
            job.jobNumber,
            job.jobName,
            job.created,
            job.status,
            job.owner,
            job.assignee ?? "Unassigned",
          ]
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        );
        const csv = [headers.join(","), ...lines].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `jobs-export-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      },
    },
    {
      id: "pin",
      label: "Pin",
      onClick: () => {
        if (!selectedJobs.length) return;
        pinJobs(selectedJobs.map((job) => job.id));
        clearSelection();
      },
    },
  ];

  const jobCards = useMemo<JobCardData[]>(
    () =>
      paginatedJobs.map((job) => ({
        title: job.jobName,
        description: job.campaignId,
        meta: job.jobNumber,
        date: job.created,
        status: job.status,
        tag: job.tag ?? undefined,
        tagTone: job.tag ? TAG_TONE_MAP[job.tag] : undefined,
      })),
    [paginatedJobs]
  );

  useEffect(() => {
    const statusFilter = getStatusFilterFromSearch(location.search);
    if (!statusFilter) return;

    setActiveViewId("all");
    setOpenViewMenuId(null);
    setCurrentFilterState({
      activeTab: "quick",
      rows: DEFAULT_FILTER_ROWS,
      quickSelections: {
        [`Status-${statusFilter}`]: true,
      },
    });
    resetJobsPagination();
  }, [location.search, resetJobsPagination]);

  useEffect(() => {
    if (!isFilterOpen) return;
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  useEffect(() => {
    if (!openViewMenuId) return;
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        viewMenuRef.current &&
        !viewMenuRef.current.contains(event.target as Node)
      ) {
        setOpenViewMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openViewMenuId]);

  useEffect(() => {
    if (!isColumnsOpen) return;
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        columnsPanelRef.current &&
        !columnsPanelRef.current.contains(event.target as Node)
      ) {
        setIsColumnsOpen(false);
        setColumnsDraft(mergedColumns);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isColumnsOpen, mergedColumns]);

  useEffect(() => {
    if (!isColumnsOpen) {
      setColumnsDraft(mergedColumns);
    }
  }, [mergedColumns, isColumnsOpen]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set(
        Array.from(prev).filter((id) => visibleIds.has(id))
      );
      return next.size === prev.size ? prev : next;
    });
  }, [visibleIds]);

  useEffect(() => {
    if (columnsDraft.length === 0) {
      setColumnsDraft(mergedColumns);
    }
  }, [mergedColumns, columnsDraft.length]);

  useEffect(() => {
    if (jobsCurrentPage > totalJobPages) {
      setJobsCurrentPage(totalJobPages);
    }
  }, [jobsCurrentPage, totalJobPages, setJobsCurrentPage]);

  return (
    <>
      <PageMeta title={jobsTitle} description="Manage jobs and campaigns" />

      <PageContentContainer className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-primary">{jobsTitle}</h1>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="flex min-w-[220px] max-w-[320px] flex-1 items-center rounded-full border border-gray-200 bg-white px-2 py-1">
              <SearchInput
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder="Search job"
                containerClassName="gap-2"
                inputClassName="text-sm text-gray-700"
                className="text-1xl text-gray-700"
                iconClassName="text-gray-300"
                iconSize="!h-4"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAllClick}
                className={`rounded-sm border px-2 py-0.5 text-[13px] font-regular transition ${
                  activeViewId === "all"
                    ? "border-transparent bg-[var(--color-primary-50)] text-[var(--color-primary-500)]"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                All ({jobs.length})
              </button>
              {savedViews.map((view) => {
                const isActive = activeViewId === view.id;
                return (
                  <div
                    key={view.id}
                    className={`group relative inline-flex items-center rounded-sm border ${
                      isActive
                        ? "border-transparent bg-[var(--color-primary-50)] text-[var(--color-primary-500)]"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleViewSelect(view)}
                      className="px-2 py-0.5 text-[13px] font-regular"
                    >
                      {view.name} ({getViewCount(view)})
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenViewMenuId((prev) =>
                          prev === view.id ? null : view.id
                        );
                        setActiveViewId(view.id);
                      }}
                      className="pr-1 text-gray-400 opacity-0 pointer-events-none transition hover:text-gray-600 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                      aria-label={`${view.name} options`}
                    >
                      <VerticalDots className="h-4 w-4" />
                    </button>
                    {openViewMenuId === view.id ? (
                      <div
                        ref={viewMenuRef}
                        className="absolute right-0 top-full z-30 mt-2"
                      >
                        <Popup
                          items={[
                            {
                              id: "rename",
                              label: "Rename",
                              onClick: () => handleRenameView(view.id),
                            },
                            {
                              id: "remove",
                              label: "Remove",
                              onClick: () => handleRemoveView(view.id),
                            },
                          ]}
                          className="!min-w-[160px] rounded-lg"
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div ref={filterPanelRef} className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="rounded-sm border border-gray-200 bg-white p-1 text-gray-500 transition hover:bg-gray-50"
                aria-label="Open filters"
              >
                <FilterIcon className="h-3.5 w-3.5" />
              </button>
              <div
                className={`absolute right-0 top-full z-30 mt-3 transition ${
                  isFilterOpen
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                }`}
              >
                <AdvanceFilter
                  key={filterResetKey}
                  defaultTab="quick"
                  defaultRows={DEFAULT_FILTER_ROWS}
                  onFilterChange={(state) => {
                    setCurrentFilterState(state);
                    setActiveViewId("all");
                  }}
                  onSaveView={handleSaveView}
                  className="w-[860px] max-w-[90vw] rounded-xl bg-white"
                  columnOptions={columnOptions}
                  valueOptions={statusOptions}
                  valueOptionsByColumn={valueOptionsByColumn}
                  quickFilterColumns={quickFilterColumns}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-sm border p-1 transition ${
                viewMode === "grid"
                  ? "border-transparent bg-[#007B8C]/10 text-[#007B8C]"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
              aria-label="Grid view"
            >
              <GridIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-sm border p-1 transition ${
                viewMode === "list"
                  ? "border-transparent bg-[#007B8C]/10 text-[#007B8C]"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
              aria-label="List view"
            >
              <ListViewIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {viewMode === "list" && selectedIds.size > 0 ? (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
            <SelectedItem
              selectedCount={selectedIds.size}
              actions={selectionActions}
              onClose={clearSelection}
              className="rounded-xl border border-gray-200 bg-white shadow-[0_12px_24px_-12px_rgba(15,23,42,0.45)]"
            />
          </div>
        ) : null}

        <div className="mt-6 bg-white">
          {viewMode === "grid" ? (
            visibleJobs.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                {jobCards.map((card) => (
                  <JobCard key={`${card.title}-${card.date}`} card={card} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                No jobs match the current filters.
              </div>
            )
          ) : visibleJobs.length > 0 ? (
            <div
              ref={tableScrollRef}
              onWheel={handleTableWheel}
              onMouseDown={handleTableMouseDown}
              onMouseMove={handleTableMouseMove}
              onMouseUp={stopTableDragging}
              onMouseLeave={stopTableDragging}
              className="overflow-x-auto custom-scrollbar cursor-grab active:cursor-grabbing"
            >
              <JobsTable
                jobs={paginatedJobs}
                selectedIds={selectedIds}
                onToggleSelectAll={toggleSelectAll}
                onToggleSelect={toggleSelect}
                onEdit={handleEdit}
                onAssigneeClick={handleAssigneeClick}
                onAction={handleAction}
                columns={visibleColumns}
                columnsMenu={columnsMenu}
                minWidth={tableMinWidth}
              />
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              No jobs match the current filters.
            </div>
          )}

          {visibleJobs.length > 0 ? (
            <PaginationControls
              total={visibleJobs.length}
              from={jobsFrom}
              to={jobsTo}
              label="results"
              canGoPrevious={canGoToPreviousJobsPage}
              canGoNext={canGoToNextJobsPage}
              onPrevious={goToPreviousJobsPage}
              onNext={goToNextJobsPage}
              pageSize={jobsPageSize}
              pageSizeOptions={[5, 10, 20]}
              onPageSizeChange={setJobsPageSize}
            />
          ) : null}
        </div>

        {viewMode === "list" && archivedJobs.length > 0 ? (
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                Archived Jobs
              </h2>
              <span className="text-xs text-gray-400">
                {archivedJobs.length} archived
              </span>
            </div>
            <div className="mt-4 overflow-x-auto custom-scrollbar">
              <JobsTable
                jobs={archivedJobs}
                selectedIds={new Set()}
                onToggleSelectAll={() => {}}
                onToggleSelect={() => {}}
                onEdit={handleEdit}
                onAssigneeClick={undefined}
                columns={visibleColumns}
                columnsMenu={null}
                minWidth={tableMinWidth}
                showSelection={false}
                showEdit={false}
              />
            </div>
          </div>
        ) : null}
      </PageContentContainer>

      <JobsFAB onClick={() => navigate("/jobs/new")} ariaLabel="Create new job" />

      <AddAssigneePopup
        isOpen={isAssigneePopupOpen}
        onClose={closeAssigneePopup}
        users={assigneeUsers}
        selfUser={SELF_ASSIGNEE}
        onAdd={handleAssignUser}
        addButtonClassName="rounded-md"
      />
    </>
  );
}
