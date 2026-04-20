import { useEffect, useMemo, useRef, useState } from "react";
import { isValid, parse } from "date-fns";
import PageMeta from "@/components/common/PageMeta";
import ItemsCountSummary from "@/components/common/ItemsCountSummary";
import PageContentContainer from "@/components/layout/PageContentContainer";
import SearchInput from "@/components/ui/search-input/SearchInput";
import { JobTrackerWorkflowPanel } from "@/components/workflow";
import type {
  JobMember,
  JobRow,
  JobStatus,
  JobTag,
} from "@/components/jobs/types";
import type {
  JobTrackerItem,
  WorkflowStage,
  WorkflowStatus,
} from "@/components/workflow/types";
import { Ep_sort_Icon, FilterIcon } from "@/icons";
import { useJobsStore } from "@/stores/jobsStore";
import { resolveLabel } from "@/data/localization";
import { useLocalizationStore } from "@/stores/localizationStore";
import { useInfiniteScrollItems } from "@/hooks/useInfiniteScrollItems";

const DEFAULT_TRACKER_IMAGE = "/images/task/task.jpg";
const TRACKER_DATE_FORMAT = "dd MMM yy";

const TRACKER_FILTER_OPTIONS = [
  { id: "in-progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "not-started", label: "Not started" },
  { id: "urgent", label: "Urgent" },
  { id: "action-required", label: "Action required" },
] as const;

type TrackerFilterId = (typeof TRACKER_FILTER_OPTIONS)[number]["id"];
type TrackerSortOption = "due-date" | "expiry-date" | null;

interface TrackerListItem extends JobTrackerItem {
  tag: JobTag;
  currentStatusLabel: string;
  requiresAction: boolean;
  searchText: string;
  dueDateSortValue: number;
  expiryDateSortValue: number;
}

const toWorkflowMembers = (members?: JobMember[]) =>
  (members ?? []).map((member) => ({
    id: member.id,
    initials: member.initials,
    className: member.className,
  }));

const mapJobStatusToWorkflowStatus = (status: JobStatus): WorkflowStatus => {
  switch (status) {
    case "Complete":
      return "Approved";
    case "In Progress":
    case "Uploading...":
    case "Changes required":
      return "In Progress";
    default:
      return "Not Started";
  }
};

const getTrackerStatusLabel = (status: JobStatus) => {
  switch (status) {
    case "Complete":
      return "Completed";
    case "In Progress":
    case "Uploading...":
      return "In Progress";
    case "Changes required":
    case "Upload Failed":
      return "Action required";
    default:
      return "Not Started";
  }
};

const VERSION_LABEL_PATTERN = /^V\d+$/i;
const FORMAT_TOKEN_PATTERN = /^[A-Z0-9]{2,5}$/;

const normalizeFormatToken = (value?: string | null) => {
  if (!value) return null;
  const token = value.trim().replace(/^\./, "").toUpperCase();
  if (!token || token === "JOB") return null;
  if (VERSION_LABEL_PATTERN.test(token)) return null;
  return FORMAT_TOKEN_PATTERN.test(token) ? token : null;
};

const extractFormatFromText = (value?: string | null) => {
  if (!value?.trim()) return null;
  const trimmed = value.trim();

  const mimeToken = trimmed.match(/\/([a-z0-9.+-]+)$/i)?.[1];
  const normalizedMimeToken = normalizeFormatToken(
    mimeToken?.replace(/^x-/i, "")
  );
  if (normalizedMimeToken) {
    return normalizedMimeToken;
  }

  const extensionMatches = [
    ...trimmed.matchAll(/\.([a-z0-9]{2,5})(?=$|[^a-z0-9])/gi),
  ];
  if (extensionMatches.length) {
    const normalizedExtension = normalizeFormatToken(
      extensionMatches[extensionMatches.length - 1]?.[1]
    );
    if (normalizedExtension) {
      return normalizedExtension;
    }
  }

  const hasVersionHint = /(^|[^a-z0-9])v\d+($|[^a-z0-9])/i.test(trimmed);
  const trailingToken = trimmed.match(/([a-z0-9]{2,5})\s*$/i)?.[1];
  const isUppercaseToken = trailingToken
    ? trailingToken === trailingToken.toUpperCase()
    : false;

  if (trailingToken && (hasVersionHint || isUppercaseToken)) {
    return normalizeFormatToken(trailingToken);
  }

  return null;
};

const parseTrackerDate = (value: string) => {
  const parsedDate = parse(value, TRACKER_DATE_FORMAT, new Date());
  return isValid(parsedDate) ? parsedDate.getTime() : Number.POSITIVE_INFINITY;
};

const resolveFormat = (job: JobRow) => {
  const sources = [
    job.assetFormat,
    job.versions?.[job.versions.length - 1]?.fileName,
    ...(job.files?.map((file) => file.name) ?? []),
    job.assetTitle,
  ];

  for (const source of sources) {
    const format = extractFormatFromText(source);
    if (format) {
      return format;
    }
  }

  return "JOB";
};

const resolveVersion = (job: JobRow) => {
  const latestVersion = job.versions?.[job.versions.length - 1]?.label;
  if (latestVersion) {
    return latestVersion;
  }
  const versionMatch = `${job.jobName} ${job.assetTitle ?? ""}`.match(/V\d+/i);
  return versionMatch ? versionMatch[0].toUpperCase() : "V1";
};

const createFallbackStages = (job: JobRow): WorkflowStage[] => {
  const members = toWorkflowMembers(job.members);
  const firstStageStatus = mapJobStatusToWorkflowStatus(job.status);
  const secondStageStatus: WorkflowStatus =
    firstStageStatus === "Approved" ? "Approved" : "Not Started";

  return [
    {
      id: `${job.id}-s1`,
      stepLabel: "S1",
      name: "Review",
      status: firstStageStatus,
      dueDate: job.created,
      commentsCount: 0,
      members,
    },
    {
      id: `${job.id}-s2`,
      stepLabel: "S2",
      name: "Content Edit",
      status: secondStageStatus,
      dueDate: job.created,
      commentsCount: 0,
      members,
    },
    {
      id: `${job.id}-s3`,
      stepLabel: "S3",
      name: "Final",
      status: "Not Started",
      dueDate: job.created,
      commentsCount: 0,
      members,
    },
  ];
};

const toTrackerItem = (job: JobRow): TrackerListItem => {
  const stages = job.workflowStages?.length
    ? job.workflowStages
    : createFallbackStages(job);
  const inProgressStage =
    stages.find((stage) => stage.status === "In Progress") ?? stages[0];
  const dueDate = inProgressStage?.dueDate ?? job.created;
  const expiryDate = stages[stages.length - 1]?.dueDate ?? dueDate;
  const statusLabel = getTrackerStatusLabel(job.status);

  return {
    id: job.id,
    summary: {
      imageUrl: DEFAULT_TRACKER_IMAGE,
      format: resolveFormat(job),
      title: job.assetTitle ?? job.jobName,
      version: resolveVersion(job),
      statusText: statusLabel,
      dueDate,
      ageText: `Created ${job.created}`,
    },
    stages,
    tag: job.tag,
    currentStatusLabel: statusLabel,
    requiresAction:
      job.status === "Changes required" || job.status === "Upload Failed",
    searchText: [
      job.jobName,
      job.assetTitle,
      statusLabel,
      job.tag,
      ...stages.map((stage) => `${stage.stepLabel} ${stage.name}`),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
    dueDateSortValue: parseTrackerDate(dueDate),
    expiryDateSortValue: parseTrackerDate(expiryDate),
  };
};

const matchesTrackerFilter = (
  item: TrackerListItem,
  filters: Set<TrackerFilterId>
) => {
  if (filters.size === 0) {
    return true;
  }

  return Array.from(filters).some((filterId) => {
    switch (filterId) {
      case "in-progress":
        return item.currentStatusLabel === "In Progress";
      case "completed":
        return item.currentStatusLabel === "Completed";
      case "not-started":
        return item.currentStatusLabel === "Not Started";
      case "urgent":
        return item.tag === "Urgent";
      case "action-required":
        return item.requiresAction;
      default:
        return true;
    }
  });
};

const sortTrackerItems = (
  items: TrackerListItem[],
  sortOption: TrackerSortOption
) => {
  if (!sortOption) {
    return items;
  }

  const sortedItems = [...items];
  const getSortValue =
    sortOption === "expiry-date"
      ? (item: TrackerListItem) => item.expiryDateSortValue
      : (item: TrackerListItem) => item.dueDateSortValue;

  sortedItems.sort((left, right) => {
    const difference = getSortValue(left) - getSortValue(right);
    if (difference !== 0) {
      return difference;
    }

    return left.summary.title.localeCompare(right.summary.title);
  });

  return sortedItems;
};

export default function JobTracker() {
  const jobs = useJobsStore((state) => state.jobs);
  const trackerItems = useMemo(() => jobs.map(toTrackerItem), [jobs]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Set<TrackerFilterId>>(
    new Set()
  );
  const [sortOption, setSortOption] = useState<TrackerSortOption>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [allExpandedDefault, setAllExpandedDefault] = useState(false);
  const [batchKey, setBatchKey] = useState(0);
  const filterPanelRef = useRef<HTMLDivElement | null>(null);
  const sortPanelRef = useRef<HTMLDivElement | null>(null);
  const localizationOverrides = useLocalizationStore((s) => s.overrides);
  const jobTrackerTitle = resolveLabel(
    "page.jobTracker.title",
    localizationOverrides
  );

  const filteredTrackerItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const searchedItems = normalizedSearch
      ? trackerItems.filter((item) => item.searchText.includes(normalizedSearch))
      : trackerItems;
    const matchingItems = searchedItems.filter((item) =>
      matchesTrackerFilter(item, selectedFilters)
    );

    return sortTrackerItems(matchingItems, sortOption);
  }, [trackerItems, searchTerm, selectedFilters, sortOption]);

  const trackerInfiniteResetKey = useMemo(
    () =>
      JSON.stringify({
        searchTerm,
        sortOption,
        selectedFilters: Array.from(selectedFilters).sort(),
      }),
    [searchTerm, sortOption, selectedFilters]
  );

  const {
    visibleItems: visibleTrackerItems,
    hasMore: hasMoreTrackerItems,
    loaderRef: trackerLoadMoreRef,
  } = useInfiniteScrollItems(filteredTrackerItems, {
    initialCount: 10,
    step: 10,
    resetKey: trackerInfiniteResetKey,
  });

  const itemsFrom = filteredTrackerItems.length ? 1 : 0;
  const itemsTo = visibleTrackerItems.length;

  const handleExpandAll = () => {
    setAllExpandedDefault(true);
    setBatchKey((prev) => prev + 1);
  };

  const handleCollapseAll = () => {
    setAllExpandedDefault(false);
    setBatchKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isFilterOpen) {
      return;
    }

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
    if (!isSortOpen) {
      return;
    }

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        sortPanelRef.current &&
        !sortPanelRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSortOpen]);

  return (
    <>
      <PageMeta
        title={jobTrackerTitle}
        description="Track workflow progress by stage"
      />

      <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
        <div className="mb-4 flex shrink-0 flex-col gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#007B8C]">
              {jobTrackerTitle}
            </h1>
            <ItemsCountSummary
              total={filteredTrackerItems.length}
              from={itemsFrom}
              to={itemsTo}
              className="text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-[260px] flex-1 items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 sm:max-w-[360px]">
                <SearchInput
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                  }}
                  placeholder="Search templates by action or subject"
                  containerClassName="w-full gap-2"
                  inputClassName="text-sm text-gray-700"
                  className="text-sm text-gray-700"
                  iconClassName="text-gray-300"
                  iconSize="!h-4 !w-4"
                />
              </div>

              <div ref={filterPanelRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsFilterOpen((previous) => !previous);
                    setIsSortOpen(false);
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border bg-white transition ${
                    isFilterOpen || selectedFilters.size > 0
                      ? "border-[#F97316]/40 text-[#F97316]"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                  aria-label="Open filters"
                >
                  <FilterIcon className="h-3.5 w-3.5" />
                </button>

                <div
                  className={`absolute left-0 top-full z-30 mt-3 w-[172px] rounded-md border border-gray-200 bg-white p-3 shadow-[0_18px_30px_-18px_rgba(15,23,42,0.5)] transition ${
                    isFilterOpen
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none -translate-y-2 opacity-0"
                  }`}
                >
                  <div className="space-y-1">
                    {TRACKER_FILTER_OPTIONS.map((option) => {
                      const isSelected = selectedFilters.has(option.id);

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSelectedFilters((previous) => {
                              const next = new Set(previous);
                              if (next.has(option.id)) {
                                next.delete(option.id);
                              } else {
                                next.add(option.id);
                              }
                              return next;
                            });
                          }}
                          className="flex w-full items-center justify-between gap-3 rounded-md px-1 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                          <span>{option.label}</span>
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                              isSelected
                                ? "border-[#F97316] bg-[#FFF1EC]"
                                : "border-[#F97316]/70 bg-white"
                            }`}
                          >
                            {isSelected ? (
                              <span className="h-1.5 w-1.5 rounded-sm bg-[#F97316]" />
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedFilters(new Set())}
                    className="mt-3 w-full rounded-md bg-[#FFF1EC] px-3 py-2 text-sm font-medium text-[#F97316] transition hover:bg-[#FFE4D6]"
                  >
                    Clear filters
                  </button>
                </div>
              </div>

              <div ref={sortPanelRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsSortOpen((previous) => !previous);
                    setIsFilterOpen(false);
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border bg-white transition ${
                    isSortOpen || sortOption
                      ? "border-[#CBD5E1] text-slate-600"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                  aria-label="Open sort options"
                >
                  <Ep_sort_Icon className="h-3.5 w-3.5" />
                </button>

                <div
                  className={`absolute left-0 top-full z-30 mt-3 w-[168px] rounded-md border border-gray-200 bg-white p-3 shadow-[0_18px_30px_-18px_rgba(15,23,42,0.5)] transition ${
                    isSortOpen
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none -translate-y-2 opacity-0"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800">Sort by</p>
                  <div className="mt-2 space-y-1">
                    {[
                      { id: "due-date" as const, label: "Due date" },
                      { id: "expiry-date" as const, label: "Expiry date" },
                    ].map((option) => {
                      const isSelected = sortOption === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSortOption(option.id);
                            setIsSortOpen(false);
                          }}
                          className="flex w-full items-center justify-between gap-3 rounded-md px-1 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                          <span>{option.label}</span>
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                              isSelected
                                ? "border-gray-500"
                                : "border-gray-400"
                            }`}
                          >
                            {isSelected ? (
                              <span className="h-2 w-2 rounded-full bg-gray-500" />
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExpandAll}
                className="rounded-md border border-[#007B8C] bg-[#007B8C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#046a79]"
                disabled={filteredTrackerItems.length === 0}
              >
                Expand all
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                disabled={filteredTrackerItems.length === 0}
              >
                Collapse all
              </button>
            </div>
          </div>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-1">
          <div className="space-y-4">
            {visibleTrackerItems.map((item) => (
              <JobTrackerWorkflowPanel
                key={`${item.id}-${batchKey}`}
                summary={item.summary}
                stages={item.stages}
                defaultExpanded={allExpandedDefault}
              />
            ))}

            {filteredTrackerItems.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
                {trackerItems.length === 0
                  ? "No jobs are available in Job Tracker."
                  : "No jobs match the current search or filters."}
              </div>
            ) : null}
          </div>

          {hasMoreTrackerItems ? (
            <div
              ref={trackerLoadMoreRef}
              className="flex justify-center py-5 text-xs text-gray-400"
            >
              Scroll to load more jobs
            </div>
          ) : null}
        </div>
      </PageContentContainer>
    </>
  );
}
