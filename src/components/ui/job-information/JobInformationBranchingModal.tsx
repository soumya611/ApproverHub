import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import PopupModal from "@/components/ui/popup-modal/PopupModal";
import {
  BranchingOperatorSelect,
  BranchingTaggedSelect,
} from "@/components/ui/job-information/BranchingSelect";
import { JobInfor_trash_Icon } from "@/icons";
import type { JobInfoBranchRule, JobInfoQuestion } from "@/types/jobInformation";
import {
  createEmptyBranchRule,
  createJobInfoConditionId,
  createJobInfoRuleId,
  getBranchRuleLabel,
  getOptionLetter,
  normalizeJobInfoQuestion,
} from "@/utils/jobInformationBranching";

interface JobInformationBranchingModalProps {
  isOpen: boolean;
  question: JobInfoQuestion | null;
  questions: JobInfoQuestion[];
  onClose: () => void;
  onSave: (question: JobInfoQuestion) => void;
}

const cloneRule = (rule: JobInfoBranchRule): JobInfoBranchRule => ({
  ...rule,
  conditions: rule.conditions.map((condition) => ({ ...condition })),
});

export default function JobInformationBranchingModal({
  isOpen,
  question,
  questions,
  onClose,
  onSave,
}: JobInformationBranchingModalProps) {
  const [rules, setRules] = useState<JobInfoBranchRule[]>([]);
  const [fallbackTargetQuestionId, setFallbackTargetQuestionId] = useState("");

  const questionIndex = useMemo(
    () => questions.findIndex((item) => item.id === question?.id),
    [question?.id, questions]
  );

  const questionIndexMap = useMemo(
    () => new Map(questions.map((item, index) => [item.id, index + 1])),
    [questions]
  );

  const destinationOptions = useMemo(
    () =>
      questions
        .filter((item) => item.id !== question?.id)
        .map((item) => ({
          value: item.id,
          label: `Q${questionIndexMap.get(item.id) ?? "?"} ${item.text || "Untitled question"}`,
          selectedLabel: item.text || "Untitled question",
        })),
    [question?.id, questionIndexMap, questions]
  );

  useEffect(() => {
    if (!question || !isOpen) return;

    setRules(
      question.branchRules.length
        ? question.branchRules.map(cloneRule)
        : question.options.length
          ? [createEmptyBranchRule(question)]
          : []
    );
    setFallbackTargetQuestionId(question.fallbackNextQuestionId ?? "");
  }, [isOpen, question]);

  const sourceQuestionBadge =
    question?.id && questionIndex >= 0 ? `Q${questionIndex + 1}` : "Q?";

  const sourceQuestionOptions = useMemo(
    () =>
      question?.options.map((option, optionIndex) => ({
        value: option.id,
        label: `${String.fromCharCode(65 + (optionIndex % 26))} ${option.label || "Option"}`,
        selectedLabel: option.label || "Option",
      })) ?? [],
    [question?.options]
  );

  const getTargetBadge = (targetQuestionId?: string) =>
    destinationOptions.find((option) => option.value === targetQuestionId)?.label.split(" ")[0] ??
    "Q?";

  const handleRuleConditionChange = (
    ruleId: string,
    conditionId: string,
    optionId: string
  ) => {
    setRules((previousRules) =>
      previousRules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              conditions: rule.conditions.map((condition) =>
                condition.id === conditionId ? { ...condition, optionId } : condition
              ),
            }
          : rule
      )
    );
  };

  const handleRuleTargetChange = (ruleId: string, targetQuestionId: string) => {
    setRules((previousRules) =>
      previousRules.map((rule) =>
        rule.id === ruleId ? { ...rule, targetQuestionId } : rule
      )
    );
  };

  const handleAddRule = () => {
    if (!question || !question.options.length) return;

    const usedOptionIds = new Set(
      rules.flatMap((rule) => rule.conditions.map((condition) => condition.optionId))
    );
    const preferredOptionId =
      question.options.find((option) => !usedOptionIds.has(option.id))?.id ??
      question.options[0]?.id;

    setRules((previousRules) => [
      ...previousRules,
      {
        id: createJobInfoRuleId(),
        conditions: preferredOptionId
          ? [{ id: createJobInfoConditionId(), optionId: preferredOptionId }]
          : [],
        targetQuestionId: "",
      },
    ]);
  };

  const handleRemoveRule = (ruleId: string) => {
    setRules((previousRules) => previousRules.filter((rule) => rule.id !== ruleId));
  };

  const handleAddCondition = (ruleId: string) => {
    if (!question || question.type !== "checkbox") return;

    setRules((previousRules) =>
      previousRules.map((rule) => {
        if (rule.id !== ruleId) return rule;

        const usedOptionIds = new Set(rule.conditions.map((condition) => condition.optionId));
        const nextOptionId =
          question.options.find((option) => !usedOptionIds.has(option.id))?.id ??
          question.options[0]?.id;

        if (!nextOptionId) return rule;

        return {
          ...rule,
          conditions: [
            ...rule.conditions,
            { id: createJobInfoConditionId(), optionId: nextOptionId },
          ],
        };
      })
    );
  };

  const handleRemoveCondition = (ruleId: string, conditionId: string) => {
    setRules((previousRules) =>
      previousRules.map((rule) => {
        if (rule.id !== ruleId || rule.conditions.length <= 1) return rule;
        return {
          ...rule,
          conditions: rule.conditions.filter((condition) => condition.id !== conditionId),
        };
      })
    );
  };

  const handleSave = () => {
    if (!question) return;

    const validQuestionIds = new Set(questions.map((item) => item.id));
    const updatedQuestion = normalizeJobInfoQuestion(
      {
        ...question,
        branchRules: rules,
        fallbackNextQuestionId: fallbackTargetQuestionId || undefined,
      },
      questionIndex >= 0 ? questionIndex : 0,
      validQuestionIds
    );

    onSave(updatedQuestion);
    onClose();
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title="Branching"
      className="!max-w-[980px] rounded-sm"
      contentClassName="!p-5"
      titleClassName="!text-black !text-lg !font-semibold"
    >
      <div className="rounded-md bg-[#F5F5F5] p-3">
        {question ? (
          <>
            <div className="mb-3 rounded-md border border-[#E7E7E7] bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Source question
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className="bg-[#FFF2EE] px-2 py-1 text-xs font-semibold text-secondary-300">
                  {sourceQuestionBadge}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {question.text || "Untitled question"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {question.type === "checkbox"
                      ? "Checkbox rules can match multiple selected options."
                      : "Choice rules match a single selected option."}
                  </p>
                </div>
              </div>
            </div>

            {!question.options.length ? (
              <div className="rounded-md border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-500">
                Add options to this question before configuring branching.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {rules.map((rule, ruleIndex) => {
                    const targetBadge = getTargetBadge(rule.targetQuestionId);

                    return (
                      <div
                        key={rule.id}
                        className="rounded-md border border-[#E7E7E7] bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <BranchingOperatorSelect
                                value="if"
                                options={[{ value: "if", label: "if" }]}
                              />
                              <BranchingTaggedSelect
                                value={question.id}
                                options={[
                                  {
                                    value: question.id,
                                    label: `${sourceQuestionBadge} ${question.text || "Untitled question"}`,
                                    selectedLabel: question.text || "Untitled question",
                                  },
                                ]}
                                badgeText={sourceQuestionBadge}
                                badgeVariant="filled"
                                disabled
                              />
                            </div>

                            <div className="mt-3 space-y-2">
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
                                      handleRuleConditionChange(rule.id, condition.id, value)
                                    }
                                    options={sourceQuestionOptions}
                                    badgeText={getOptionLetter(question, condition.optionId)}
                                    badgeVariant="outline"
                                    className="w-[84%]"
                                    fullWidth={false}
                                  />
                                  {question.type === "checkbox" &&
                                  rule.conditions.length > 1 ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveCondition(rule.id, condition.id)
                                      }
                                      className="rounded-full p-1 text-gray-400 hover:text-[#F25C54]"
                                      aria-label="Remove condition"
                                    >
                                      <JobInfor_trash_Icon className="h-4 w-4" />
                                    </button>
                                  ) : null}
                                </div>
                              ))}
                            </div>

                            <div className="mt-2 flex items-center justify-between gap-3">
                              <p className="text-xs text-gray-500">
                                {getBranchRuleLabel(question, rule)}
                              </p>
                              {question.type === "checkbox" ? (
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

                            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-3">
                              <span className="text-xs font-semibold">Then</span>
                              <span className="inline-flex h-8 items-center rounded border border-gray-200 bg-white px-3 text-xs font-semibold">
                                Go to
                              </span>
                              <BranchingTaggedSelect
                                value={rule.targetQuestionId ?? ""}
                                onChange={(value) => handleRuleTargetChange(rule.id, value)}
                                options={destinationOptions}
                                badgeText={rule.targetQuestionId ? targetBadge : undefined}
                                badgeVariant="filled"
                                emptyOptionLabel="Select question"
                                className="min-w-[280px]"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveRule(rule.id)}
                            className="rounded-full bg-gray-100 p-1 text-gray-400 hover:text-[#F25C54]"
                            aria-label={`Remove branching rule ${ruleIndex + 1}`}
                          >
                            <JobInfor_trash_Icon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleAddRule}
                  className="mt-3 text-xs font-semibold text-[#F25C54] hover:text-[#E34A41]"
                >
                  + Add Rule
                </button>
              </>
            )}

            <div className="mt-4 rounded-md border border-[#E7E7E7] bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-[140px] text-[11px] font-semibold">
                  All other cases go to
                </span>
                <BranchingTaggedSelect
                  value={fallbackTargetQuestionId}
                  onChange={setFallbackTargetQuestionId}
                  options={destinationOptions}
                  badgeText={
                    fallbackTargetQuestionId
                      ? getTargetBadge(fallbackTargetQuestionId)
                      : undefined
                  }
                  badgeVariant="filled"
                  emptyOptionLabel="None"
                  className="min-w-[280px]"
                />
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="orangebutton"
          className="!rounded-sm !px-4 !py-1 font-medium"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          variant="primary"
          className="!rounded-sm !px-7 !py-1 font-medium"
          onClick={handleSave}
          disabled={!question}
        >
          Save
        </Button>
      </div>
    </PopupModal>
  );
}
