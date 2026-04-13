import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import FileDropzone from "@/components/ui/file-dropzone/FileDropzone";
import RichTextEditor from "@/components/ui/rich-text-editor/RichTextEditor";
import StepDropdown from "@/components/ui/step-dropdown/StepDropdown";
import SelectWorkflowDropdown, {
  type WorkflowOption,
} from "@/components/ui/select-workflow-dropdown/SelectWorkflowDropdown";
import WorkflowBuilder, {
  type WorkflowBuilderValue,
} from "@/components/ui/workflow-builder/WorkflowBuilder";
import ToggleSwitch from "@/components/ui/toggle/ToggleSwitch";
import { CameraIcon, ChevronDownIcon } from "@/icons";
import { useJobsStore } from "@/stores/jobsStore";
import type {
  JobMember,
  JobRow as JobRowType,
  JobWorkflowStageConfig,
} from "@/components/jobs/types";
import { DEFAULT_JOB_MEMBERS } from "@/components/jobs/types";
import { useJobInformationSteps } from "@/components/ui/job-information/useJobInformationSteps";
import { useJobInformationStore } from "@/stores/jobInformationStore";
import type { JobInfoQuestion } from "@/types/jobInformation";
import type { WorkflowMember, WorkflowStage } from "@/types/workflow.types";

const getFirstMissingRequiredQuestionIndex = (
  questions: JobInfoQuestion[],
  answers: Record<string, string | string[]>
) =>
  questions.findIndex((question) => {
    if (!question.required) return false;
    const answer = answers[question.id];
    if (question.type === "checkbox") {
      return !Array.isArray(answer) || answer.length === 0;
    }
    return typeof answer !== "string" || answer.trim().length === 0;
  });

export default function CreateJob() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEditMode = Boolean(jobId);
  const addJob = useJobsStore((state) => state.addJob);
  const updateJob = useJobsStore((state) => state.updateJob);
  const jobs = useJobsStore((state) => state.jobs);
  const jobToEdit = useMemo(
    () => jobs.find((job) => job.id === jobId),
    [jobId, jobs]
  );
  const jobInfoTemplates = useJobInformationStore((state) => state.templates);
  const jobInfoEnabled = useJobInformationStore((state) => state.enabled);
  const activeJobInfoTemplate =
    jobInfoTemplates.find((template) => template.isActive) ??
    jobInfoTemplates[0];
  const [jobName, setJobName] = useState("");
  const [jobBrief, setJobBrief] = useState("");
  const [urgentJob, setUrgentJob] = useState(false);
  const [jobFiles, setJobFiles] = useState<File[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowOption | null>(
    null
  );
  const [customWorkflow, setCustomWorkflow] =
    useState<WorkflowBuilderValue | null>(null);
  const [isWorkflowBuilderOpen, setIsWorkflowBuilderOpen] = useState(false);
  const [isJobInfoOpen, setIsJobInfoOpen] = useState(false);
  const [jobInfoValidationError, setJobInfoValidationError] = useState<string | null>(
    null
  );
  const {
    steps: jobInfoSteps,
    stepIndex: jobInfoStepIndex,
    setStepIndex: setJobInfoStepIndex,
    answers: jobInfoAnswers,
  } = useJobInformationSteps(
    activeJobInfoTemplate?.questions ?? [],
    jobToEdit?.jobInformation
  );

  const reviewerOptions = useMemo<JobMember[]>(() => {
    const map = new Map<string, JobMember>();
    DEFAULT_JOB_MEMBERS.forEach((member) => {
      map.set(member.id, member);
    });
    jobs.forEach((job) => {
      job.members?.forEach((member) => {
        map.set(member.id, member);
      });
    });
    return Array.from(map.values());
  }, [jobs]);

  const formatCreatedDate = (date: Date) =>
    date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
      .replace(",", "");

  const createShortId = () => Math.floor(100000 + Math.random() * 900000);

  const toWorkflowMembers = (members: JobMember[]): WorkflowMember[] =>
    members.map((member) => ({
      id: member.id,
      initials: member.initials,
      className: member.className,
    }));

  const resolveStageMembers = (
    stageConfig: JobWorkflowStageConfig,
    members: JobMember[]
  ): WorkflowMember[] => {
    const decisionMembers = stageConfig.decisionMakerIds.length
      ? members.filter((member) =>
          stageConfig.decisionMakerIds.includes(member.id)
        )
      : members;
    return toWorkflowMembers(decisionMembers);
  };

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

  const buildWorkflowStages = (
    workflowId: string,
    stages: JobWorkflowStageConfig[],
    members: JobMember[]
  ): WorkflowStage[] =>
    stages.map((stage, index) => ({
      id: `${workflowId}-${stage.stepLabel.toLowerCase()}`,
      stepLabel: stage.stepLabel,
      name: stage.name || `Stage ${index + 1}`,
      status: "Not Started",
      dueDate: formatWorkflowDeadline(stage.deadline),
      commentsCount: 0,
      members: resolveStageMembers(stage, members),
    }));

  const handleSubmit = () => {
    const jobInfoQuestions = activeJobInfoTemplate?.questions ?? [];
    if (jobInfoEnabled && jobInfoQuestions.length > 0) {
      const missingRequiredQuestionIndex = getFirstMissingRequiredQuestionIndex(
        jobInfoQuestions,
        jobInfoAnswers
      );
      if (missingRequiredQuestionIndex >= 0) {
        const missingQuestion = jobInfoQuestions[missingRequiredQuestionIndex];
        const fallbackLabel = `Q.${missingRequiredQuestionIndex + 1}`;
        setJobInfoValidationError(
          `Please answer required question: ${missingQuestion?.text || fallbackLabel}`
        );
        setJobInfoStepIndex(missingRequiredQuestionIndex);
        setIsJobInfoOpen(true);
        return;
      }
    }

    setJobInfoValidationError(null);
    const now = new Date();
    const randomId = createShortId();
    const workflowId = customWorkflow?.id ?? selectedWorkflow?.id;
    const workflowLabel = customWorkflow?.name ?? selectedWorkflow?.label;
    const payload: Partial<JobRowType> = {
      jobName: jobName.trim() || "Untitled job",
      tag: urgentJob ? "Urgent" : null,
      brief: jobBrief,
      urgent: urgentJob,
      files: jobFiles.map((file) => ({ name: file.name, size: file.size })),
      jobInformation: jobInfoAnswers,
      workflowId,
      workflowLabel,
    };

    if (customWorkflow) {
      const members = customWorkflow.reviewers;
      payload.members = members;
      payload.workflowStages = buildWorkflowStages(
        customWorkflow.id,
        customWorkflow.stages,
        members
      );
      payload.workflowConfig = customWorkflow;
    }

    if (isEditMode && jobToEdit) {
      updateJob(jobToEdit.id, payload);
      navigate("/jobs");
      return;
    }

    const newJob: JobRowType = {
      id: `job-${Date.now()}`,
      campaignId: `CAM${randomId}`,
      jobNumber: `SP${Math.floor(10000000 + Math.random() * 90000000)}`,
      jobName: payload.jobName ?? "Untitled job",
      tag: payload.tag ?? null,
      created: formatCreatedDate(now),
      status: "In Progress",
      owner: "KG",
      assignee: null,
      brief: payload.brief,
      urgent: payload.urgent,
      files: payload.files ?? [],
      jobInformation: payload.jobInformation,
      workflowId: payload.workflowId,
      workflowLabel: payload.workflowLabel,
      members: payload.members,
      workflowStages: payload.workflowStages,
      workflowConfig: payload.workflowConfig,
    };

    addJob(newJob);
    navigate("/jobs");
  };

  const handleWorkflowSelect = (workflow: WorkflowOption) => {
    setSelectedWorkflow(workflow);
    setCustomWorkflow(null);
    setIsWorkflowBuilderOpen(false);
  };

  const handleCreateBuildWorkflow = () => {
    setIsWorkflowBuilderOpen(true);
  };

  const handleSaveWorkflowBuilder = (workflow: WorkflowBuilderValue) => {
    setCustomWorkflow(workflow);
    setSelectedWorkflow({ id: workflow.id, label: workflow.name });
    setIsWorkflowBuilderOpen(false);
  };

  useEffect(() => {
    if (!isEditMode) {
      setJobName("");
      setJobBrief("");
      setUrgentJob(false);
      setJobFiles([]);
      setSelectedWorkflow(null);
      setCustomWorkflow(null);
      setIsWorkflowBuilderOpen(false);
      return;
    }

    if (!jobToEdit) return;

    setJobName(jobToEdit.jobName ?? "");
    setJobBrief(jobToEdit.brief ?? "");
    setUrgentJob(Boolean(jobToEdit.urgent));
    setJobFiles([]);
    setSelectedWorkflow(
      jobToEdit.workflowId
        ? {
            id: jobToEdit.workflowId,
            label: jobToEdit.workflowLabel ?? "Selected workflow",
          }
        : null
    );
    setCustomWorkflow(jobToEdit.workflowConfig ?? null);
  }, [isEditMode, jobToEdit]);

  useEffect(() => {
    if (!jobInfoValidationError) return;
    const jobInfoQuestions = activeJobInfoTemplate?.questions ?? [];
    const missingRequiredQuestionIndex = getFirstMissingRequiredQuestionIndex(
      jobInfoQuestions,
      jobInfoAnswers
    );
    if (missingRequiredQuestionIndex < 0) {
      setJobInfoValidationError(null);
    }
  }, [
    activeJobInfoTemplate,
    jobInfoAnswers,
    jobInfoValidationError,
  ]);

  return (
    <>
      <PageMeta
        title={isEditMode ? "Edit job" : "Create new job"}
        description="Create job"
      />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <p className="text-sm text-gray-500">
          <Link to="/jobs" className="text-gray-600 hover:text-[#007B8C]">
            Jobs
          </Link>{" "}
          /{" "}
          <span className="text-[#007B8C]">
            {isEditMode ? "Edit job" : "Create new job"}
          </span>
        </p>
        <PageContentContainer className="min-h-0 flex-1 p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                value={jobName}
                onChange={(event) => setJobName(event.target.value)}
                placeholder="Enter job name"
                className="w-full max-w-[360px] border-b border-gray-200 px-1 pb-2 text-sm text-gray-700 focus:border-[#007B8C] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-gray-500">Urgent</span>
                <ToggleSwitch
                  checked={urgentJob}
                  onChange={setUrgentJob}
                  showLabel={false}
                  size="sm"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-md bg-[#F25C54] px-4 py-2 text-sm text-white"
              >
                {isEditMode ? "Edit" : "Submit"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <button
              type="button"
              onClick={() => setDetailsOpen((prev) => !prev)}
              className="flex w-full items-center justify-between text-left"
              aria-expanded={detailsOpen}
            >
              <h3 className="text-sm font-semibold text-gray-700">Details</h3>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${
                  detailsOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {detailsOpen ? (
              <div className="mt-4 grid items-stretch gap-6 lg:grid-cols-[360px_1fr]">
                <div className="flex h-full flex-col gap-3">
                  <FileDropzone
                    files={jobFiles}
                    onFilesChange={setJobFiles}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                    <input
                      type="text"
                      placeholder="Or insert web URL https://"
                      className="w-full bg-transparent text-sm text-gray-600 outline-none"
                    />
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Attach image"
                    >
                      <CameraIcon className="h-5 w-5 " />
                    </button>
                    <ChevronDownIcon className="h-5 w-5 " />
                  </div>
                </div>
                <div className="h-full">
                  <RichTextEditor
                    value={jobBrief}
                    onChange={setJobBrief}
                    placeholder="Start typing your brief here..."
                    showAttachment
                    className="h-full flex flex-col"
                    bodyClassName="flex-1"
                    editorClassName="min-h-[220px] h-full"
                    onAttachmentChange={(files) =>
                      setJobFiles((prev) => [...prev, ...files])
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>

          {jobInfoEnabled ? (
            <div className="mt-5">
              <StepDropdown
                title="Job Information"
                steps={jobInfoSteps}
                open={isJobInfoOpen}
                onOpenChange={setIsJobInfoOpen}
                stepIndex={jobInfoStepIndex}
                onStepChange={setJobInfoStepIndex}
                resetStepOnClose
                className="w-full"
              />
              {jobInfoValidationError ? (
                <p className="mt-2 text-xs font-medium text-[#F25C54]">
                  {jobInfoValidationError}
                </p>
              ) : null}
            </div>
          ) : null}

          {!isWorkflowBuilderOpen ? (
            <div className="mt-4">
              <SelectWorkflowDropdown
                inline
                className="w-full"
                selectedWorkflowId={selectedWorkflow?.id}
                onSelectWorkflow={handleWorkflowSelect}
                onCreateBuildWorkflow={handleCreateBuildWorkflow}
              />
            </div>
          ) : null}

          {isWorkflowBuilderOpen ? (
            <div className="mt-4">
              <WorkflowBuilder
                key={customWorkflow?.id ?? "new-workflow"}
                value={customWorkflow}
                mode="create"
                reviewerOptions={reviewerOptions}
                onSave={handleSaveWorkflowBuilder}
                onCancel={() => setIsWorkflowBuilderOpen(false)}
              />
            </div>
          ) : null}
        </PageContentContainer>
      </div>
    </>
  );
}
