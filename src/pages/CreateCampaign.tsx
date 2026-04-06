import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageContentContainer from "../components/layout/PageContentContainer";
import AssociatedJobsTable from "../components/ui/associated-jobs-table/AssociatedJobsTable";
import AddJobTable from "../components/ui/add-job-table/AddJobTable";
import { Modal } from "../components/ui/modal";
import RichTextEditor from "../components/ui/rich-text-editor/RichTextEditor";
import SearchInput from "../components/ui/search-input/SearchInput";
import UserCell from "../components/ui/user-cell/UserCell";
import Button from "../components/ui/button/Button";
import TextInput from "../components/ui/text-input/TextInput";
import type { JobRowType } from "../components/jobs";
import { EditPenIcon } from "../icons";
import { useCampaignsStore } from "../stores/campaignsStore";
import type { CampaignStatus } from "../components/ui/campaign-table-row/CampaignTableRow";
import { useJobsStore } from "../stores/jobsStore";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { campaignId: campaignRouteId } = useParams();
  const isEditMode = Boolean(campaignRouteId);
  const campaigns = useCampaignsStore((state) => state.campaigns);
  const campaignToEdit = useMemo(
    () => campaigns.find((campaign) => campaign.id === campaignRouteId),
    [campaignRouteId, campaigns]
  );
  const [campaignName, setCampaignName] = useState("");
  const [campaignBrief, setCampaignBrief] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [branch, setBranch] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [associatedJobs, setAssociatedJobs] = useState<JobRowType[]>([]);
  const [selectedAssociatedIds, setSelectedAssociatedIds] = useState<Set<string>>(
    new Set()
  );
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const jobs = useJobsStore((state) => state.jobs);
  const addCampaign = useCampaignsStore((state) => state.addCampaign);
  const updateCampaign = useCampaignsStore((state) => state.updateCampaign);

  const filteredAddJobOptions = useMemo(() => {
    const term = jobSearch.trim().toLowerCase();
    if (!term) return jobs;
    return jobs.filter((job) => {
      return (
        job.jobNumber.toLowerCase().includes(term) ||
        job.jobName.toLowerCase().includes(term) ||
        job.created.toLowerCase().includes(term)
      );
    });
  }, [jobSearch, jobs]);

  const associatedJobIds = useMemo(
    () => new Set(associatedJobs.map((job) => job.id)),
    [associatedJobs]
  );

  const handleAddAssociatedJob = (job: JobRowType) => {
    setAssociatedJobs((prev) => {
      if (prev.some((item) => item.id === job.id)) return prev;
      return [...prev, job];
    });
  };

  const toggleSelectAllAssociated = () => {
    if (associatedJobs.length === 0) return;
    setSelectedAssociatedIds((prev) => {
      if (prev.size === associatedJobs.length) {
        return new Set();
      }
      return new Set(associatedJobs.map((job) => job.id));
    });
  };

  const toggleSelectAssociated = (id: string) => {
    setSelectedAssociatedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRemoveAssociatedJob = (id: string) => {
    setAssociatedJobs((prev) => prev.filter((job) => job.id !== id));
    setSelectedAssociatedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const formatShortDate = (value: Date) =>
    value
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
      .replace(",", "");

  const mapJobStatusToCampaignStatus = (
    status: JobRowType["status"]
  ): CampaignStatus => {
    if (status === "Complete") return "Completed";
    if (status === "Start Pending") return "Start Pending";
    return "Started";
  };

  const mapCampaignStatusToJobStatus = (
    status: CampaignStatus
  ): JobRowType["status"] => {
    if (status === "Completed") return "Complete";
    if (status === "Start Pending") return "Start Pending";
    return "In Progress";
  };

  const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "U";
    if (!trimmed.includes(" ") && trimmed.length <= 2) {
      return trimmed.toUpperCase();
    }
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  const handleSaveCampaign = () => {
    const resolvedCampaignName = campaignName.trim() || "Untitled campaign";
    const resolvedCampaignId =
      campaignId.trim() ||
      `CAM${Math.floor(100000 + Math.random() * 900000)}`;
    const totalJobs = associatedJobs.length;
    const completedJobs = associatedJobs.filter(
      (job) => job.status === "Complete"
    ).length;
    const campaignStatus: CampaignStatus =
      totalJobs === 0
        ? "Start Pending"
        : completedJobs === totalJobs
          ? "Completed"
          : "Started";
    const statusCategory =
      campaignStatus === "Completed"
        ? "complete"
        : campaignStatus === "Start Pending"
          ? "not_started"
          : "in_progress";
    const jobStatusTag = associatedJobs.some((job) => job.tag === "Late")
      ? "Late"
      : null;
    const createdDate = formatShortDate(new Date());
    const resolvedEndDate = endDate.trim() || "--";
    const resolvedStartDate = startDate.trim() || "--";

    const payload = {
      campaignId: resolvedCampaignId,
      title: resolvedCampaignName,
      campaignName: resolvedCampaignName,
      endDate: resolvedEndDate,
      startDate: resolvedStartDate,
      createdDate,
      brief: campaignBrief,
      jobProgress: `${completedJobs} of ${totalJobs} completed`,
      campaignStatus,
      jobStatusTag,
      ownerName: "Krutika",
      ownerAvatarUrl: "/images/user/user-01.jpg",
      statusCategory,
      dueDateCategory: statusCategory,
      businessArea: branch.trim() || "--",
      subRows: associatedJobs.map((job) => ({
        id: `${resolvedCampaignId}-${job.id}`,
        jobNumber: job.jobNumber,
        title: job.jobName,
        endDate: resolvedEndDate,
        jobProgress: job.status,
        campaignStatus: mapJobStatusToCampaignStatus(job.status),
        ownerName: job.owner,
      })),
    };

    if (campaignRouteId && campaignToEdit) {
      updateCampaign(campaignRouteId, payload);
    } else {
      addCampaign({
        id: `cam-${Date.now()}`,
        ...payload,
      });
    }

    navigate("/campaigns");
  };

  useEffect(() => {
    if (!campaignRouteId) {
      setCampaignName("");
      setCampaignBrief("");
      setStartDate("");
      setEndDate("");
      setCampaignId("");
      setBranch("");
      setAssociatedJobs([]);
      setSelectedAssociatedIds(new Set());
      return;
    }

    if (!campaignToEdit) return;

    setCampaignName(campaignToEdit.campaignName ?? campaignToEdit.title ?? "");
    setCampaignId(campaignToEdit.campaignId ?? "");
    setStartDate(campaignToEdit.startDate ?? "");
    setEndDate(campaignToEdit.endDate ?? "");
    setBranch(campaignToEdit.businessArea ?? "");
    setCampaignBrief(campaignToEdit.brief ?? "");
    setSelectedAssociatedIds(new Set());

    const seededJobs =
      campaignToEdit.subRows?.map((subRow, index) => ({
        id: `${campaignToEdit.id}-sub-${index + 1}`,
        campaignId: campaignToEdit.campaignId,
        jobNumber: subRow.jobNumber,
        jobName: subRow.title,
        tag: campaignToEdit.jobStatusTag ?? null,
        created: campaignToEdit.createdDate ?? formatShortDate(new Date()),
        status: mapCampaignStatusToJobStatus(subRow.campaignStatus),
        owner: getInitials(subRow.ownerName ?? "User"),
        assignee: null,
      })) ?? [];

    setAssociatedJobs(seededJobs);
  }, [campaignRouteId, campaignToEdit]);

  return (
    <>
      <PageMeta title="Create new campaign" description="Create campaign" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <p className="text-sm text-gray-500">
          <Link to="/campaigns" className="text-gray-600 hover:text-[#007B8C]">
            Campaign
          </Link>{" "}
          /{" "}
          <span className="text-[#007B8C]">
            {isEditMode ? "Details" : "Create new campaign"}
          </span>
        </p>

        <PageContentContainer className="min-h-0 flex-1 p-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-[360px]">
                <TextInput
                  value={campaignName}
                  onChange={(event) => setCampaignName(event.target.value)}
                  placeholder="Enter campaign name"
                  containerClassName="!gap-0"
                  className="!h-auto !rounded-none !border-0 !border-b !border-gray-200 !pl-1 !pr-8 !pt-0 !pb-2 !text-sm !text-gray-700 !shadow-none placeholder:!font-normal placeholder:!text-gray-400 focus:!border-[#007B8C] focus:!ring-0"
                />
                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Edit campaign name"
                >
                  <EditPenIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isEditMode ? (
                <Button
                  size="sm"
                  variant="orangebutton"
                  onClick={handleSaveCampaign}
                  className=""
                >
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="orangebutton"
                    onClick={() => navigate("/campaigns")}
                    className="!rounded-sm !px-3 !py-1.5"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveCampaign}
                    className="!rounded-sm"
                  >
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] border border-gray-200 rounded-sm bg-white p-6">
            <div className="space-y-4">
              <UserCell
                title="Krutika Gawankar"
                subtitle="Owner"
                avatarUrl="/images/user/user-01.jpg"
                avatarSize="small"
                titleClassName="text-sm font-semibold text-gray-800"
                subtitleClassName="text-xs text-gray-500"
                align="center"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label={
                    <span>
                      Start Date
                    </span>
                  }
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  labelClassName="text-xs font-semibold text-gray-500"
                  className="!h-10 !rounded-none  !border-gray-200 !px-3 !py-2 !text-sm !text-gray-600 !shadow-none placeholder:!font-normal placeholder:!text-gray-400 focus:!border-[#007B8C] focus:!ring-0"
                />
                <TextInput
                  label={
                    <span>
                      Campaign ID
                    </span>
                  }
                  value={campaignId}
                  onChange={(event) => setCampaignId(event.target.value)}
                  labelClassName="text-xs font-semibold text-gray-500"
                  className="!h-10 !rounded-none  !border-gray-200 !px-3 !py-2 !text-sm !text-gray-600 !shadow-none placeholder:!font-normal placeholder:!text-gray-400 focus:!border-[#007B8C] focus:!ring-0"
                />
                <TextInput
                  label={
                    <span>
                      End Date
                    </span>
                  }
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  labelClassName="text-xs font-semibold text-gray-500"
                  className="!h-10 !rounded-none  !border-gray-200 !px-3 !py-2 !text-sm !text-gray-600 !shadow-none placeholder:!font-normal placeholder:!text-gray-400 focus:!border-[#007B8C] focus:!ring-0"
                />
                <TextInput
                  label="Branch"
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                  labelClassName="text-xs font-semibold text-gray-500"
                  className="!h-10 !rounded-none !border-gray-200 !px-3 !py-2 !text-sm !text-gray-600 !shadow-none placeholder:!font-normal placeholder:!text-gray-400 focus:!border-[#007B8C] focus:!ring-0"
                />
              </div>
            </div>
            <RichTextEditor
              value={campaignBrief}
              onChange={setCampaignBrief}
              placeholder="Enter campaign brief here..."
            />
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative pl-5">
                <h3 className="text-sm font-semibold text-[#007B8C]">
                  Associated Jobs
                </h3>
                <span className="absolute -bottom-3 left-5 h-0.5 w-28 bg-[#007B8C]" />
              </div>
              <div className="flex flex-wrap items-center gap-3 pb-2">
                <div className="rounded-full border border-gray-200 bg-white px-3 pr-20 py-1">
                  <SearchInput
                    value={jobSearch}
                    onChange={(event) => setJobSearch(event.target.value)}
                    onFocus={() => setIsAddJobOpen(true)}
                    onClick={() => setIsAddJobOpen(true)}
                    placeholder="Search jobs to add"
                    containerClassName="gap-2"
                    inputClassName="text-sm text-gray-600"
                    className="text-sm text-gray-600"
                    iconClassName="text-gray-300"
                    iconSize="!h-4"
                  />
                </div>
                {isEditMode ? null : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate("/jobs/new")}
                    className="!rounded-sm"
                  >
                    + Job
                  </Button>
                )}
              </div>
            </div>
            <div className="border border-gray-200 bg-white">
              <AssociatedJobsTable
                jobs={associatedJobs}
                selectedIds={selectedAssociatedIds}
                onToggleSelectAll={toggleSelectAllAssociated}
                onToggleSelect={toggleSelectAssociated}
                onRemoveJob={handleRemoveAssociatedJob}
                getCreated={() => "12/11/2026"}
                getDeadline={() => "24/11/2026"}
              />
            </div>
          </div>
        </PageContentContainer>
      </div>

      <Modal
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
        className="w-[92vw] max-w-5xl p-6 rounded-none"
        overlayClassName="bg-gray-400/50"
      >
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Add Job</h2>
          </div>
          <div className="rounded-xl bg-white p-4">
            <AddJobTable
              jobs={filteredAddJobOptions}
              addedIds={associatedJobIds}
              onAddJob={handleAddAssociatedJob}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
