import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import PageMeta from "../components/common/PageMeta";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageContentContainer from "../components/layout/PageContentContainer";
import Button from "../components/ui/button/Button";
import DescriptionText from "../components/ui/description-text/DescriptionText";
import {
  BranchingOperatorSelect,
  BranchingTaggedSelect,
} from "../components/ui/job-information/BranchingSelect";
import JobInformationQuestionCard from "../components/ui/job-information-question/JobInformationQuestionCard";
import PopupModal from "../components/ui/popup-modal/PopupModal";
import PopupTitle from "../components/ui/popup-title/PopupTitle";
import { ChevronLeftIcon, EditPenIcon, JobInfor_trash_Icon, Material_Symbols_Icon } from "../icons";
import { useJobInformationStore } from "../stores/jobInformationStore";
import type { JobInfoQuestion, JobInfoTemplate } from "../types/jobInformation";

type BranchConditionDraft = {
  id: string;
  optionId: string;
  targetQuestionId: string;
};

type BranchRuleDraft = {
  id: string;
  sourceQuestionId: string;
  conditions: BranchConditionDraft[];
  fallbackTargetQuestionId: string;
};

const createQuestionId = () =>
  `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const createOptionId = () =>
  `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const createRuleId = () =>
  `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const createConditionId = () =>
  `cond-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

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
  id: createQuestionId(),
  text: "",
  type: "choice",
  required: false,
  options: [],
});

const getQuestionLabel = (question: JobInfoQuestion, indexMap: Map<string, number>) =>
  `Q.${indexMap.get(question.id) ?? "?"} ${question.text || "Untitled question"}`;

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
    return false;
  });
};

export default function JobInformationEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { templateId } = useParams();
  const templates = useJobInformationStore((state) => state.templates);
  const addTemplate = useJobInformationStore((state) => state.addTemplate);
  const updateTemplate = useJobInformationStore((state) => state.updateTemplate);
  const isNew =
    templateId === "new" ||
    location.pathname.endsWith("/job-information/new");

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

  const [isBranchingModalOpen, setIsBranchingModalOpen] = useState(false);
  const [branchingTargetQuestionId, setBranchingTargetQuestionId] =
    useState<string | null>(null);
  const [branchingRules, setBranchingRules] = useState<BranchRuleDraft[]>([]);

  const questionIndexMap = useMemo(
    () => new Map(questions.map((question, index) => [question.id, index + 1])),
    [questions]
  );
  const hasDraftInput = useMemo(() => {
    return hasMeaningfulInput(name, questions);
  }, [name, questions]);

  useEffect(() => {
    if (!template || isNew) return;
    setName(template.name);
    setQuestions(template.questions);
    setVersion(template.version);
  }, [template, isNew]);

  const getPreviousQuestions = (
    targetQuestionId: string,
    list: JobInfoQuestion[]
  ) => {
    const targetIndex = list.findIndex((question) => question.id === targetQuestionId);
    if (targetIndex <= 0) return [];
    return list.slice(0, targetIndex);
  };

  const buildDefaultRule = (
    sourceQuestionId: string,
    targetQuestionId: string,
    list: JobInfoQuestion[]
  ): BranchRuleDraft => {
    const sourceQuestion = list.find((question) => question.id === sourceQuestionId);
    const firstOptionId = sourceQuestion?.options[0]?.id ?? "";

    return {
      id: createRuleId(),
      sourceQuestionId,
      conditions: sourceQuestion?.options.length
        ? [
            {
              id: createConditionId(),
              optionId: firstOptionId,
              targetQuestionId,
            },
          ]
        : [],
      fallbackTargetQuestionId: "",
    };
  };

  const openBranchingModal = (
    targetQuestionId: string,
    list: JobInfoQuestion[]
  ) => {
    const previousQuestions = getPreviousQuestions(targetQuestionId, list);
    if (!previousQuestions.length) return;

    const defaultSourceQuestion = previousQuestions[0];
    setBranchingTargetQuestionId(targetQuestionId);
    setBranchingRules([
      buildDefaultRule(defaultSourceQuestion.id, targetQuestionId, list),
    ]);
    setIsBranchingModalOpen(true);
  };

  const closeBranchingModal = () => {
    setIsBranchingModalOpen(false);
    setBranchingTargetQuestionId(null);
    setBranchingRules([]);
  };

  const persistTemplate = (
    nextQuestions: JobInfoQuestion[],
    nextName: string = name
  ) => {
    if (!hasMeaningfulInput(nextName, nextQuestions)) return null;
    const resolvedName = nextName.trim() || "Job Information";

    if (!isNew) {
      if (!template?.id) return null;
      updateTemplate(template.id, {
        name: resolvedName,
        version,
        questions: nextQuestions,
      });
      return template.id;
    }

    if (draftId) {
      updateTemplate(draftId, {
        name: resolvedName,
        version,
        questions: nextQuestions,
      });
      return draftId;
    }

    const nextTemplate: JobInfoTemplate = {
      id: `job-info-${Date.now()}`,
      name: resolvedName,
      version,
      isActive: false,
      questions: nextQuestions,
    };

    addTemplate(nextTemplate);
    setDraftId(nextTemplate.id);
    return nextTemplate.id;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    persistTemplate(questions, value);
  };

  const handleQuestionChange = (index: number, updated: JobInfoQuestion) => {
    const nextQuestions = questions.map((item, itemIndex) =>
        itemIndex === index ? updated : item
    );
    setQuestions(nextQuestions);
    persistTemplate(nextQuestions);
  };

  const handleQuestionDelete = (index: number) => {
    const questionToDelete = questions[index];
    if (!questionToDelete) return;

    const remainingQuestions = questions.filter(
      (_, itemIndex) => itemIndex !== index
    );

    const nextQuestions = remainingQuestions.map((question) => ({
      ...question,
      options: question.options.map((option) =>
        option.nextQuestionId === questionToDelete.id
          ? { ...option, nextQuestionId: undefined }
          : option
      ),
      fallbackNextQuestionId:
        question.fallbackNextQuestionId === questionToDelete.id
          ? undefined
          : question.fallbackNextQuestionId,
    }));

    setQuestions(nextQuestions);
    persistTemplate(nextQuestions);
  };

  const handleQuestionDuplicate = (index: number) => {
    const question = questions[index];
    if (!question) return;

    const duplicatedQuestion: JobInfoQuestion = {
      ...question,
      id: createQuestionId(),
      options: question.options.map((option) => ({
        ...option,
        id: createOptionId(),
      })),
    };

    const nextQuestions = [...questions];
    nextQuestions.splice(index + 1, 0, duplicatedQuestion);
    setQuestions(nextQuestions);
    persistTemplate(nextQuestions);
  };

  const handleAddQuestion = () => {
    const nextQuestion: JobInfoQuestion = createQuestion();
    const nextQuestions = [...questions, nextQuestion];

    setQuestions(nextQuestions);
    persistTemplate(nextQuestions);

    if (nextQuestions.length > 1) {
      openBranchingModal(nextQuestion.id, nextQuestions);
    }
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
    const resolvedTemplateId =
      templateToOpen ?? draftId ?? templateId ?? "new";
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
    setQuestions(nextQuestions);
    persistTemplate(nextQuestions);
    setDragIndex(null);
  };

  const availableSourceQuestions = useMemo(() => {
    if (!branchingTargetQuestionId) return [];
    return getPreviousQuestions(branchingTargetQuestionId, questions);
  }, [branchingTargetQuestionId, questions]);

  const allDestinationQuestions = useMemo(
    () =>
      questions.map((question) => ({
        id: question.id,
        numberLabel: `Q${questionIndexMap.get(question.id) ?? "?"}`,
        textLabel: question.text || "Untitled question",
        label: getQuestionLabel(question, questionIndexMap),
      })),
    [questions, questionIndexMap]
  );

  const getQuestionById = (questionId: string) =>
    questions.find((question) => question.id === questionId);

  const getOptionLetter = (
    sourceQuestion: JobInfoQuestion | undefined,
    optionId: string
  ) => {
    if (!sourceQuestion) return "A";
    const optionIndex = sourceQuestion.options.findIndex(
      (option) => option.id === optionId
    );
    if (optionIndex < 0) return "A";
    return String.fromCharCode(65 + (optionIndex % 26));
  };

  const handleRuleSourceQuestionChange = (ruleId: string, sourceQuestionId: string) => {
    setBranchingRules((previousRules) =>
      previousRules.map((rule) => {
        if (rule.id !== ruleId) return rule;

        const sourceQuestion = getQuestionById(sourceQuestionId);
        const firstOptionId = sourceQuestion?.options[0]?.id ?? "";
        const defaultTargetQuestionId =
          branchingTargetQuestionId ?? rule.conditions[0]?.targetQuestionId ?? "";

        if (!sourceQuestion?.options.length) {
          return {
            ...rule,
            sourceQuestionId,
            conditions: [],
          };
        }

        const remappedConditions = rule.conditions.length
          ? rule.conditions.map((condition, conditionIndex) => {
              const optionExists = sourceQuestion.options.some(
                (option) => option.id === condition.optionId
              );

              return {
                ...condition,
                optionId: optionExists
                  ? condition.optionId
                  : conditionIndex === 0
                    ? firstOptionId
                    : firstOptionId,
              };
            })
          : [
              {
                id: createConditionId(),
                optionId: firstOptionId,
                targetQuestionId: defaultTargetQuestionId,
              },
            ];

        return {
          ...rule,
          sourceQuestionId,
          conditions:
            sourceQuestion.type === "choice"
              ? [remappedConditions[0]]
              : remappedConditions,
        };
      })
    );
  };

  const handleConditionChange = (
    ruleId: string,
    conditionId: string,
    field: "optionId" | "targetQuestionId",
    value: string
  ) => {
    setBranchingRules((previousRules) =>
      previousRules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              conditions: rule.conditions.map((condition) =>
                condition.id === conditionId
                  ? { ...condition, [field]: value }
                  : condition
              ),
            }
          : rule
      )
    );
  };

  const handleRuleTargetChange = (ruleId: string, targetQuestionId: string) => {
    setBranchingRules((previousRules) =>
      previousRules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              conditions: rule.conditions.map((condition) => ({
                ...condition,
                targetQuestionId,
              })),
            }
          : rule
      )
    );
  };

  const handleAddCondition = (ruleId: string) => {
    setBranchingRules((previousRules) =>
      previousRules.map((rule) => {
        if (rule.id !== ruleId) return rule;

        const sourceQuestion = getQuestionById(rule.sourceQuestionId);
        if (!sourceQuestion || sourceQuestion.type !== "checkbox") return rule;

        const usedOptions = new Set(rule.conditions.map((condition) => condition.optionId));
        const nextOptionId =
          sourceQuestion.options.find((option) => !usedOptions.has(option.id))?.id ??
          sourceQuestion.options[0]?.id ??
          "";

        return {
          ...rule,
          conditions: [
            ...rule.conditions,
            {
              id: createConditionId(),
              optionId: nextOptionId,
              targetQuestionId: branchingTargetQuestionId ?? "",
            },
          ],
        };
      })
    );
  };

  const handleRemoveCondition = (ruleId: string, conditionId: string) => {
    setBranchingRules((previousRules) =>
      previousRules.map((rule) => {
        if (rule.id !== ruleId) return rule;
        if (rule.conditions.length <= 1) return rule;
        return {
          ...rule,
          conditions: rule.conditions.filter((condition) => condition.id !== conditionId),
        };
      })
    );
  };

  const handleRuleFallbackChange = (ruleId: string, targetQuestionId: string) => {
    setBranchingRules((previousRules) =>
      previousRules.map((rule) =>
        rule.id === ruleId
          ? { ...rule, fallbackTargetQuestionId: targetQuestionId }
          : rule
      )
    );
  };

  const handleAddRule = () => {
    if (!branchingTargetQuestionId || !availableSourceQuestions.length) return;

    const usedSourceIds = new Set(branchingRules.map((rule) => rule.sourceQuestionId));
    const nextSourceQuestion =
      availableSourceQuestions.find((question) => !usedSourceIds.has(question.id)) ??
      availableSourceQuestions[0];

    setBranchingRules((previousRules) => [
      ...previousRules,
      buildDefaultRule(nextSourceQuestion.id, branchingTargetQuestionId, questions),
    ]);
  };

  const handleRemoveRule = (ruleId: string) => {
    setBranchingRules((previousRules) => {
      if (previousRules.length <= 1) return previousRules;
      return previousRules.filter((rule) => rule.id !== ruleId);
    });
  };

  const applyBranchingRules = (baseQuestions: JobInfoQuestion[]) => {
    const rulesBySourceQuestion = new Map<string, BranchRuleDraft[]>();

    branchingRules.forEach((rule) => {
      const existingRules = rulesBySourceQuestion.get(rule.sourceQuestionId) ?? [];
      rulesBySourceQuestion.set(rule.sourceQuestionId, [...existingRules, rule]);
    });

    return baseQuestions.map((question) => {
      const sourceRules = rulesBySourceQuestion.get(question.id);
      if (!sourceRules) return question;

      const optionTargetMap = new Map<string, string>();
      let fallbackTarget = question.fallbackNextQuestionId;

      sourceRules.forEach((rule) => {
        rule.conditions.forEach((condition) => {
          if (!condition.optionId || !condition.targetQuestionId) return;
          optionTargetMap.set(condition.optionId, condition.targetQuestionId);
        });

        fallbackTarget = rule.fallbackTargetQuestionId || undefined;
      });

      return {
        ...question,
        options: question.options.map((option) => ({
          ...option,
          nextQuestionId: optionTargetMap.get(option.id) ?? option.nextQuestionId,
        })),
        fallbackNextQuestionId: fallbackTarget,
      };
    });
  };

  const handleSaveBranching = () => {
    const nextQuestions = applyBranchingRules(questions);
    setQuestions(nextQuestions);
    persistTemplate(nextQuestions);

    closeBranchingModal();
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
                <div className="flex w-full max-w-[360px] items-center gap-3  border-b border-gray-200">
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
                >
                  Add Questions
                </Button>
              </div>
            </div>
          </div>
        </PageContentContainer>
      </div>

      <PopupModal
        isOpen={isBranchingModalOpen}
        onClose={closeBranchingModal}
        title="Branching"
        className="!max-w-[980px] rounded-sm"
        contentClassName="!p-5"
        titleClassName="!text-black !text-lg !font-semibold"
      >
        <div className="rounded-md bg-[#F5F5F5] p-3">
          {branchingRules.map((rule, ruleIndex) => {
            const sourceQuestion = getQuestionById(rule.sourceQuestionId);
            const sourceType = sourceQuestion?.type ?? "choice";
            const optionList = sourceQuestion?.options ?? [];
            const destinationList = allDestinationQuestions.filter(
              (question) => question.id !== rule.sourceQuestionId
            );
            const selectedTargetQuestionId = rule.conditions[0]?.targetQuestionId ?? "";
            const sourceQuestionBadge = `Q${questionIndexMap.get(rule.sourceQuestionId) ?? "?"}`;
            const sourceQuestionOptions = availableSourceQuestions.map((question) => ({
              value: question.id,
              label: question.text || "Untitled question",
            }));
            const sourceOptionOptions = optionList.map((option) => ({
              value: option.id,
              label: option.label || "Option",
            }));
            const destinationOptions = destinationList.map((question) => ({
              value: question.id,
              label: question.textLabel,
            }));
            const selectedTargetBadge =
              destinationList.find((question) => question.id === selectedTargetQuestionId)
                ?.numberLabel ?? "Q?";
            const fallbackBadge =
              destinationList.find(
                (question) => question.id === rule.fallbackTargetQuestionId
              )?.numberLabel ?? "Q?";

            return (
              <div
                key={rule.id}
                className={`${ruleIndex > 0 ? "mt-3 border-t border-[#F2B4AA] pt-3" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <BranchingOperatorSelect
                    value="if"
                    options={[{ value: "if", label: "if" }]}
                  />
                  <BranchingTaggedSelect
                    value={rule.sourceQuestionId}
                    onChange={(value) => handleRuleSourceQuestionChange(rule.id, value)}
                    options={sourceQuestionOptions}
                    badgeText={sourceQuestionBadge}
                    badgeVariant="filled"
                  />
                </div>

                <div className="mt-2 space-y-2">
                  {rule.conditions.map((condition) => (
                    <div
                      key={condition.id}
                      className="flex flex-wrap items-center justify-end gap-2"
                    >
                      <BranchingOperatorSelect
                        value="is"
                        options={[{ value: "is", label: "is" }]}
                      />
                      <BranchingTaggedSelect
                        value={condition.optionId}
                        onChange={(value) =>
                          handleConditionChange(rule.id, condition.id, "optionId", value)
                        }
                        options={sourceOptionOptions}
                        badgeText={getOptionLetter(sourceQuestion, condition.optionId)}
                        badgeVariant="outline"
                        emptyOptionLabel={optionList.length ? undefined : "No options"}
                        className="w-[84%]"
                        fullWidth={false}
                      />
                      {sourceType === "checkbox" && rule.conditions.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(rule.id, condition.id)}
                          className="rounded-full p-1 text-gray-400 hover:text-[#F25C54]"
                          aria-label="Remove condition"
                        >
                          <JobInfor_trash_Icon className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-end">
                  {sourceType === "checkbox" ? (
                    <button
                      type="button"
                      onClick={() => handleAddCondition(rule.id)}
                      className="text-xs font-semibold text-[#F25C54] hover:text-[#E34A41]"
                    >
                      + Add Condition
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-[#F25C54]/50">
                      + Add Condition
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(rule.id)}
                    disabled={branchingRules.length <= 1}
                    className={`rounded-full p-1 bg-gray-200 ${
                      branchingRules.length <= 1
                        ? "cursor-not-allowed text-gray-300"
                        : "text-gray-400 hover:text-[#F25C54]"
                    }`}
                    aria-label={`Remove rule ${ruleIndex + 1}`}
                  >
                    <JobInfor_trash_Icon className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-semibold">Then</span>
                  <span className="inline-flex h-8 items-center rounded border border-gray-200 bg-white px-3 text-xs font-semibold">
                    Go to
                  </span>
                  <BranchingTaggedSelect
                    value={selectedTargetQuestionId}
                    onChange={(value) => handleRuleTargetChange(rule.id, value)}
                    options={destinationOptions}
                    badgeText={selectedTargetQuestionId ? selectedTargetBadge : undefined}
                    badgeVariant="filled"
                    className="min-w-[280px]"
                  />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-2">
                  <span className="w-[120px] text-[11px] font-semibold">
                    All other cases go to
                  </span>
                  <BranchingTaggedSelect
                    value={rule.fallbackTargetQuestionId}
                    onChange={(value) => handleRuleFallbackChange(rule.id, value)}
                    options={destinationOptions}
                    badgeText={
                      rule.fallbackTargetQuestionId ? fallbackBadge : undefined
                    }
                    badgeVariant="filled"
                    emptyOptionLabel="None"
                    className="min-w-[280px]"
                  />
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAddRule}
            className="mt-2 text-xs font-semibold text-[#F25C54] hover:text-[#E34A41]"
          >
            + Add Rule
          </button>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="orangebutton"
            className="!rounded-sm !px-4 !py-1 font-medium"
            onClick={closeBranchingModal}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            variant="primary"
            className="!rounded-sm !px-7 !py-1 font-medium"
            onClick={handleSaveBranching}
          >
            Save
          </Button>
        </div>
      </PopupModal>
    </>
  );
}
