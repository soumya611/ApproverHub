import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import Button from "@/components/ui/button/Button";
import DescriptionText from "@/components/ui/description-text/DescriptionText";
import JobInformationBranchingModal from "@/components/ui/job-information/JobInformationBranchingModal";
import JobInformationQuestionCard from "@/components/ui/job-information-question/JobInformationQuestionCard";
import PopupTitle from "@/components/ui/popup-title/PopupTitle";
import { ChevronLeftIcon, EditPenIcon, Material_Symbols_Icon } from "@/icons";
import { useJobInformationStore } from "@/stores/jobInformationStore";
import type { JobInfoQuestion, JobInfoTemplate } from "@/types/jobInformation";
import {
  createJobInfoConditionId,
  createJobInfoOptionId,
  createJobInfoQuestionId,
  createJobInfoRuleId,
  getBranchRuleLabel,
  normalizeJobInfoQuestions,
} from "@/utils/jobInformationBranching";

const getVersionNumber = (value: string) => {
  const match = value.match(/V(\d+)/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

const getNextVersion = (templates: JobInfoTemplate[]) => {
  const highestVersion = templates.reduce((maxVersion, template) => {
    const versionNumber = getVersionNumber(template.version);
    if (versionNumber === null) return maxVersion;
    return Math.max(maxVersion, versionNumber);
  }, 0);
  return `V${highestVersion + 1}`;
};

const createQuestion = (): JobInfoQuestion => ({
  id: createJobInfoQuestionId(),
  text: "",
  type: "choice",
  required: false,
  options: [],
  branchRules: [],
});

const hasQuestionName = (question: JobInfoQuestion) => question.text.trim().length > 0;

const hasSelectableOptions = (question: JobInfoQuestion) =>
  question.options.some((option) => option.label.trim().length > 0);

const isQuestionReadyForNext = (question: JobInfoQuestion) =>
  hasQuestionName(question) && hasSelectableOptions(question);

const hasMeaningfulInput = (
  templateName: string,
  templateQuestions: JobInfoQuestion[]
) => {
  if (templateName.trim()) return true;
  if (templateQuestions.length > 1) return true;

  return templateQuestions.some((question) => {
    if (question.text.trim()) return true;
    if (question.required) return true;
    if (question.type !== "choice") return true;
    if (question.options.some((option) => option.label.trim())) return true;
    if (question.branchRules.length) return true;
    if (question.fallbackNextQuestionId) return true;
    return false;
  });
};

const getBranchingSummary = (
  question: JobInfoQuestion,
  questions: JobInfoQuestion[],
  indexMap: Map<string, number>
) => {
  const parts: string[] = [];

  if (question.branchRules.length > 0) {
    parts.push(
      `${question.branchRules.length} rule${question.branchRules.length > 1 ? "s" : ""}`
    );
  }

  if (question.fallbackNextQuestionId) {
    const fallbackQuestion = questions.find(
      (item) => item.id === question.fallbackNextQuestionId
    );
    parts.push(
      `fallback to Q${indexMap.get(fallbackQuestion?.id ?? "") ?? "?"}`
    );
  }

  if (!parts.length) {
    return "No branching configured";
  }

  const firstRule = question.branchRules[0];
  if (firstRule) {
    parts.unshift(getBranchRuleLabel(question, firstRule));
  }

  return parts.join(" | ");
};

export default function JobInformationEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId } = useParams();
  const templates = useJobInformationStore((state) => state.templates);
  const addTemplate = useJobInformationStore((state) => state.addTemplate);
  const updateTemplate = useJobInformationStore((state) => state.updateTemplate);
  const isNew =
    templateId === "new" || location.pathname.endsWith("/job-information/new");

  const template = useMemo<JobInfoTemplate | undefined>(
    () => templates.find((item) => item.id === templateId),
    [templateId, templates]
  );

  const nextVersion = useMemo(() => getNextVersion(templates), [templates]);
  const [name, setName] = useState(template?.name ?? "");
  const [questions, setQuestions] = useState<JobInfoQuestion[]>(
    template?.questions ?? [createQuestion()]
  );
  const [version, setVersion] = useState(template?.version ?? nextVersion);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [branchingQuestionId, setBranchingQuestionId] = useState<string | null>(null);

  const questionIndexMap = useMemo(
    () => new Map(questions.map((question, index) => [question.id, index + 1])),
    [questions]
  );
  const canAddQuestion = useMemo(() => {
    const lastQuestion = questions[questions.length - 1];
    if (!lastQuestion) return true;
    return isQuestionReadyForNext(lastQuestion);
  }, [questions]);
  const hasDraftInput = useMemo(() => hasMeaningfulInput(name, questions), [name, questions]);

  const selectedBranchingQuestion = useMemo(
    () => questions.find((question) => question.id === branchingQuestionId) ?? null,
    [branchingQuestionId, questions]
  );

  useEffect(() => {
    if (!template || isNew) return;
    setName(template.name);
    setQuestions(normalizeJobInfoQuestions(template.questions));
    setVersion(template.version);
  }, [template, isNew]);

  const persistTemplate = (
    nextQuestions: JobInfoQuestion[],
    nextName: string = name
  ) => {
    const normalizedQuestions = normalizeJobInfoQuestions(nextQuestions);
    if (!hasMeaningfulInput(nextName, normalizedQuestions)) return null;
    const resolvedName = nextName.trim() || "Job Information";

    if (!isNew) {
      if (!template?.id) return null;
      updateTemplate(template.id, {
        name: resolvedName,
        version,
        questions: normalizedQuestions,
      });
      return template.id;
    }

    if (draftId) {
      updateTemplate(draftId, {
        name: resolvedName,
        version,
        questions: normalizedQuestions,
      });
      return draftId;
    }

    const nextTemplate: JobInfoTemplate = {
      id: `job-info-${Date.now()}`,
      name: resolvedName,
      version,
      isActive: false,
      questions: normalizedQuestions,
    };

    addTemplate(nextTemplate);
    setDraftId(nextTemplate.id);
    return nextTemplate.id;
  };

  const applyQuestions = (nextQuestions: JobInfoQuestion[]) => {
    const normalizedQuestions = normalizeJobInfoQuestions(nextQuestions);
    setQuestions(normalizedQuestions);
    persistTemplate(normalizedQuestions);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    persistTemplate(questions, value);
  };

  const handleQuestionChange = (index: number, updated: JobInfoQuestion) => {
    applyQuestions(
      questions.map((item, itemIndex) => (itemIndex === index ? updated : item))
    );
  };

  const handleQuestionDelete = (index: number) => {
    const questionToDelete = questions[index];
    if (!questionToDelete) return;

    const remainingQuestions = questions.filter((_, itemIndex) => itemIndex !== index);
    applyQuestions(
      remainingQuestions.map((question) => ({
        ...question,
        branchRules: question.branchRules.filter(
          (rule) => rule.targetQuestionId !== questionToDelete.id
        ),
        fallbackNextQuestionId:
          question.fallbackNextQuestionId === questionToDelete.id
            ? undefined
            : question.fallbackNextQuestionId,
      }))
    );
    if (branchingQuestionId === questionToDelete.id) {
      setBranchingQuestionId(null);
    }
  };

  const handleQuestionDuplicate = (index: number) => {
    const question = questions[index];
    if (!question) return;

    const optionIdMap = new Map<string, string>();
    const duplicatedOptions = question.options.map((option) => {
      const nextOptionId = createJobInfoOptionId();
      optionIdMap.set(option.id, nextOptionId);
      return {
        ...option,
        id: nextOptionId,
      };
    });

    const duplicatedQuestion: JobInfoQuestion = {
      ...question,
      id: createJobInfoQuestionId(),
      graphPosition: question.graphPosition
        ? {
            x: question.graphPosition.x + 48,
            y: question.graphPosition.y + 48,
          }
        : undefined,
      options: duplicatedOptions,
      branchRules: question.branchRules.map((rule) => ({
        ...rule,
        id: createJobInfoRuleId(),
        conditions: rule.conditions.map((condition) => ({
          ...condition,
          id: createJobInfoConditionId(),
          optionId: optionIdMap.get(condition.optionId) ?? condition.optionId,
        })),
      })),
    };

    const nextQuestions = [...questions];
    nextQuestions.splice(index + 1, 0, duplicatedQuestion);
    applyQuestions(nextQuestions);
  };

  const handleAddQuestion = () => {
    if (!canAddQuestion) return;
    applyQuestions([...questions, createQuestion()]);
  };

  const handleBackToSettings = () => {
    if (isNew && !draftId && !hasDraftInput) {
      navigate("/settings/jobs/job-information");
      return;
    }

    persistTemplate(questions);
    navigate("/settings/jobs/job-information");
  };

  const handleShowConditions = () => {
    const templateToOpen = persistTemplate(questions);
    const resolvedTemplateId = templateToOpen ?? draftId ?? templateId ?? "new";
    navigate(`/settings/jobs/job-information/${resolvedTemplateId}/branching`, {
      state: {
        templateName: name.trim() || "Job Information",
        questions,
      },
    });
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;

    const nextQuestions = [...questions];
    const [draggedQuestion] = nextQuestions.splice(dragIndex, 1);
    nextQuestions.splice(index, 0, draggedQuestion);
    applyQuestions(nextQuestions);
    setDragIndex(null);
  };

  return (
    <>
      <PageMeta title="Job information" description="Job information" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb />
        <PageContentContainer className="flex flex-1 flex-col overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex flex-1 items-start gap-3">
              <button
                type="button"
                onClick={handleBackToSettings}
                className="rounded-full p-1 text-gray-400 hover:text-[#007B8C]"
                aria-label="Back to job information"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <div>
                <PopupTitle
                  colorClassName="text-[#007B8C]"
                  sizeClassName="text-base"
                  weightClassName="font-semibold"
                >
                  {isNew ? "Create New" : "Job Information"}
                </PopupTitle>
                {!isNew ? (
                  <DescriptionText
                    label=""
                    text="Define metadata questions that can later be linked to job creation"
                    className="text-xs"
                    labelClassName="text-gray-400"
                    textClassName="text-gray-500"
                  />
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="rounded-xl bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex w-full max-w-[360px] items-center gap-3 border-b border-gray-200">
                  <input
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder="Enter Name"
                    className="w-full px-1 pb-1 text-sm text-gray-700 focus:border-[#007B8C] focus:outline-none"
                  />
                  <EditPenIcon className="h-4 w-4 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={handleShowConditions}
                  className="flex items-center gap-2 text-xs font-semibold text-[#F25C54]"
                >
                  <Material_Symbols_Icon className="h-4 w-4" />
                  Show Conditions
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="cursor-grab"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={() => setDragIndex(null)}
                  >
                    <JobInformationQuestionCard
                      index={index}
                      question={question}
                      onChange={(updatedQuestion) =>
                        handleQuestionChange(index, updatedQuestion)
                      }
                      onDelete={() => handleQuestionDelete(index)}
                      onDuplicate={() => handleQuestionDuplicate(index)}
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-3">
                      <button
                        type="button"
                        onClick={() => setBranchingQuestionId(question.id)}
                        className="text-xs font-semibold text-[#F25C54] hover:text-[#E34A41]"
                      >
                        Configure branching
                      </button>
                      <p className="text-xs text-gray-500">
                        {getBranchingSummary(question, questions, questionIndexMap)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  className="!rounded-sm !px-4 !py-2 text-xs"
                  onClick={handleAddQuestion}
                  disabled={!canAddQuestion}
                >
                  Add Questions
                </Button>
                {!canAddQuestion ? (
                  <p className="mt-2 text-xs text-[#F25C54]">
                    Enter question name and at least one option before adding a new question.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </PageContentContainer>
      </div>

      <JobInformationBranchingModal
        isOpen={Boolean(selectedBranchingQuestion)}
        question={selectedBranchingQuestion}
        questions={questions}
        onClose={() => setBranchingQuestionId(null)}
        onSave={(updatedQuestion) =>
          applyQuestions(
            questions.map((question) =>
              question.id === updatedQuestion.id ? updatedQuestion : question
            )
          )
        }
      />
    </>
  );
}
