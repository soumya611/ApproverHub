import { useEffect, useMemo, useState } from "react";
import PageMeta from "@/components/common/PageMeta";
import ItemsCountSummary from "@/components/common/ItemsCountSummary";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PaginationControls from "@/components/common/PaginationControls";
import { JobTrackerWorkflowPanel } from "@/components/workflow";
import type { JobRow, JobStatus, JobMember } from "@/components/jobs/types";
import type { JobTrackerItem, WorkflowStage, WorkflowStatus } from "@/components/workflow/types";
import { useJobTrackerStore } from "@/stores/jobTrackerStore";
import { useJobsStore } from "@/stores/jobsStore";
import { resolveLabel } from "@/data/localization";
import { useLocalizationStore } from "@/stores/localizationStore";

const DEFAULT_TRACKER_IMAGE = "/images/task/task.jpg";

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
  const normalizedMimeToken = normalizeFormatToken(mimeToken?.replace(/^x-/i, ""));
  if (normalizedMimeToken) {
    return normalizedMimeToken;
  }

  const extensionMatches = [...trimmed.matchAll(/\.([a-z0-9]{2,5})(?=$|[^a-z0-9])/gi)];
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

const toTrackerItem = (job: JobRow): JobTrackerItem => {
  const stages = job.workflowStages?.length
    ? job.workflowStages
    : createFallbackStages(job);
  const inProgressStage =
    stages.find((stage) => stage.status === "In Progress") ?? stages[0];

  return {
    id: job.id,
    summary: {
      imageUrl: DEFAULT_TRACKER_IMAGE,
      format: resolveFormat(job),
      title: job.assetTitle ?? job.jobName,
      version: resolveVersion(job),
      statusText: job.status,
      dueDate: inProgressStage?.dueDate ?? job.created,
      ageText: `Created ${job.created}`,
    },
    stages,
  };
};

export default function JobTracker() {
  const jobs = useJobsStore((state) => state.jobs);
  const trackerItems = useMemo(() => jobs.map(toTrackerItem), [jobs]);
  const currentPage = useJobTrackerStore((state) => state.pagination.currentPage);
  const pageSize = useJobTrackerStore((state) => state.pagination.pageSize);
  const goToNextPage = useJobTrackerStore((state) => state.goToNextPage);
  const goToPreviousPage = useJobTrackerStore((state) => state.goToPreviousPage);
  const setCurrentPage = useJobTrackerStore((state) => state.setCurrentPage);
  const setPageSize = useJobTrackerStore((state) => state.setPageSize);
  const [allExpandedDefault, setAllExpandedDefault] = useState(false);
  const [batchKey, setBatchKey] = useState(0);
  const localizationOverrides = useLocalizationStore((s) => s.overrides);
  const jobTrackerTitle = resolveLabel(
    "page.jobTracker.title",
    localizationOverrides
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(trackerItems.length / pageSize)),
    [trackerItems.length, pageSize]
  );
  const resolvedCurrentPage = Math.min(currentPage, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (resolvedCurrentPage - 1) * pageSize;
    return trackerItems.slice(start, start + pageSize);
  }, [trackerItems, resolvedCurrentPage, pageSize]);
  const itemsFrom = trackerItems.length
    ? (resolvedCurrentPage - 1) * pageSize + 1
    : 0;
  const itemsTo = trackerItems.length
    ? Math.min(trackerItems.length, resolvedCurrentPage * pageSize)
    : 0;
  const canGoPrevious = resolvedCurrentPage > 1;
  const canGoNext = resolvedCurrentPage < totalPages;

  const handleExpandAll = () => {
    setAllExpandedDefault(true);
    setBatchKey((prev) => prev + 1);
  };

  const handleCollapseAll = () => {
    setAllExpandedDefault(false);
    setBatchKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  return (
    <>
      <PageMeta
        title={jobTrackerTitle}
        description="Track workflow progress by stage"
      />

      <PageContentContainer className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#007B8C]">
              {jobTrackerTitle}
            </h1>
            <ItemsCountSummary
              total={trackerItems.length}
              from={itemsFrom}
              to={itemsTo}
              className="text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExpandAll}
              className="rounded-md border border-[#007B8C] bg-[#007B8C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#046a79]"
              disabled={trackerItems.length === 0}
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              disabled={trackerItems.length === 0}
            >
              Collapse all
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {paginatedItems.map((item) => (
            <JobTrackerWorkflowPanel
              key={`${item.id}-${batchKey}`}
              summary={item.summary}
              stages={item.stages}
              defaultExpanded={allExpandedDefault}
            />
          ))}

          {trackerItems.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              No jobs are available in Job Tracker.
            </div>
          ) : null}
        </div>

        {trackerItems.length > 0 ? (
          <PaginationControls
            total={trackerItems.length}
            from={itemsFrom}
            to={itemsTo}
            label="results"
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 20]}
            onPageSizeChange={setPageSize}
          />
        ) : null}
      </PageContentContainer>
    </>
  );
}
