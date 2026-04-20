import type {
  JobInfoAnswers,
  JobInfoBranchRule,
  JobInfoQuestion,
  JobInfoQuestionType,
} from "@/types/jobInformation";

const GRAPH_COLUMN_WIDTH = 360;
const GRAPH_ROW_HEIGHT = 220;

export const FALLBACK_BRANCH_HANDLE_ID = "__fallback__";

export const createJobInfoQuestionId = () =>
  `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const createJobInfoOptionId = () =>
  `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const createJobInfoRuleId = () =>
  `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const createJobInfoConditionId = () =>
  `cond-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const isCheckboxQuestion = (type: JobInfoQuestionType) => type === "checkbox";

export const getBranchRuleHandleId = (ruleId: string) => `rule:${ruleId}`;

export const getOptionHandleId = (optionId: string) => `option:${optionId}`;

export const getDefaultGraphPosition = (index: number) => ({
  x: 80 + (index % 2) * GRAPH_COLUMN_WIDTH,
  y: 60 + Math.floor(index / 2) * GRAPH_ROW_HEIGHT,
});

export const getOptionLetter = (
  question: JobInfoQuestion | undefined,
  optionId: string
) => {
  if (!question) return "A";
  const optionIndex = question.options.findIndex((option) => option.id === optionId);
  if (optionIndex < 0) return "A";
  return String.fromCharCode(65 + (optionIndex % 26));
};

const createLegacyBranchRules = (
  question: JobInfoQuestion,
  validQuestionIds: Set<string>
) =>
  question.options
    .filter(
      (option) => option.nextQuestionId && validQuestionIds.has(option.nextQuestionId)
    )
    .map<JobInfoBranchRule>((option) => ({
      id: createJobInfoRuleId(),
      conditions: [{ id: createJobInfoConditionId(), optionId: option.id }],
      targetQuestionId: option.nextQuestionId,
    }));

export const normalizeJobInfoQuestion = (
  question: JobInfoQuestion,
  index: number,
  validQuestionIds: Set<string>
) => {
  const validOptionIds = new Set(question.options.map((option) => option.id));
  const branchRules =
    question.branchRules && question.branchRules.length > 0
      ? question.branchRules
      : createLegacyBranchRules(question, validQuestionIds);

  const normalizedRules = branchRules
    .map<JobInfoBranchRule>((rule) => ({
      id: rule.id || createJobInfoRuleId(),
      conditions: rule.conditions
        .filter((condition) => validOptionIds.has(condition.optionId))
        .map((condition, conditionIndex) => ({
          id:
            condition.id ||
            `${rule.id || "rule"}-cond-${conditionIndex}-${Math.random()
              .toString(36)
              .slice(2, 5)}`,
          optionId: condition.optionId,
        })),
      targetQuestionId:
        rule.targetQuestionId && validQuestionIds.has(rule.targetQuestionId)
          ? rule.targetQuestionId
          : undefined,
    }))
    .filter((rule) => rule.conditions.length > 0)
    .map((rule) =>
      question.type === "choice"
        ? { ...rule, conditions: rule.conditions.slice(0, 1) }
        : {
            ...rule,
            conditions: rule.conditions.filter(
              (condition, conditionIndex, list) =>
                list.findIndex((item) => item.optionId === condition.optionId) ===
                conditionIndex
            ),
          }
    );

  return {
    ...question,
    branchRules: normalizedRules,
    fallbackNextQuestionId:
      question.fallbackNextQuestionId &&
      validQuestionIds.has(question.fallbackNextQuestionId)
        ? question.fallbackNextQuestionId
        : undefined,
    graphPosition: question.graphPosition ?? getDefaultGraphPosition(index),
  };
};

export const normalizeJobInfoQuestions = (questions: JobInfoQuestion[]) => {
  const validQuestionIds = new Set(questions.map((question) => question.id));
  return questions.map((question, index) =>
    normalizeJobInfoQuestion(question, index, validQuestionIds)
  );
};

export const createEmptyBranchRule = (
  question: JobInfoQuestion,
  targetQuestionId?: string
): JobInfoBranchRule => ({
  id: createJobInfoRuleId(),
  conditions: question.options[0]
    ? [{ id: createJobInfoConditionId(), optionId: question.options[0].id }]
    : [],
  targetQuestionId,
});

export const getBranchRuleLabel = (
  question: JobInfoQuestion,
  rule: JobInfoBranchRule
) => {
  const labels = rule.conditions
    .map((condition) => {
      const option = question.options.find((item) => item.id === condition.optionId);
      if (!option) return null;
      return `${getOptionLetter(question, option.id)}. ${option.label || "Option"}`;
    })
    .filter(Boolean);

  if (!labels.length) return "No conditions";
  return labels.join(question.type === "checkbox" ? " + " : " ");
};

const getMatchingBranchRule = (
  question: JobInfoQuestion,
  selectedOptionIds: string[]
) => {
  const optionSet = new Set(selectedOptionIds);

  return [...question.branchRules]
    .sort((left, right) => right.conditions.length - left.conditions.length)
    .find(
      (rule) =>
        rule.conditions.length > 0 &&
        rule.conditions.every((condition) => optionSet.has(condition.optionId))
    );
};

export const resolveQuestionIndex = (
  questions: JobInfoQuestion[],
  questionIndex: number,
  nextQuestionId?: string
) => {
  if (nextQuestionId) {
    const linkedIndex = questions.findIndex((item) => item.id === nextQuestionId);
    if (linkedIndex >= 0) return linkedIndex;
  }

  if (questionIndex < questions.length - 1) {
    return questionIndex + 1;
  }

  return questionIndex;
};

export const getNextQuestionIdForAnswer = (
  question: JobInfoQuestion,
  answer: JobInfoAnswers[string]
) => {
  const selectedOptionIds = Array.isArray(answer)
    ? answer
    : typeof answer === "string" && answer.trim()
      ? [answer]
      : [];

  const matchingRule = getMatchingBranchRule(question, selectedOptionIds);
  return matchingRule?.targetQuestionId ?? question.fallbackNextQuestionId;
};

export const getQuestionPathUntilStep = (
  questions: JobInfoQuestion[],
  answers: JobInfoAnswers,
  targetStepIndex: number
) => {
  if (!questions.length) return [];

  const path: number[] = [];
  const visited = new Set<string>();
  const clampedTargetIndex = Math.min(
    Math.max(targetStepIndex, 0),
    Math.max(questions.length - 1, 0)
  );
  let currentIndex = 0;

  while (currentIndex >= 0 && currentIndex < questions.length) {
    const question = questions[currentIndex];
    if (!question || visited.has(question.id)) break;

    visited.add(question.id);
    path.push(currentIndex);

    if (currentIndex === clampedTargetIndex) {
      break;
    }

    const nextQuestionId = getNextQuestionIdForAnswer(question, answers[question.id]);
    const nextIndex = resolveQuestionIndex(questions, currentIndex, nextQuestionId);

    if (nextIndex === currentIndex) {
      break;
    }

    currentIndex = nextIndex;
  }

  return path;
};

export const getFirstMissingRequiredQuestionIndex = (
  questions: JobInfoQuestion[],
  answers: JobInfoAnswers,
  currentStepIndex: number
) => {
  const traversedIndexes = getQuestionPathUntilStep(questions, answers, currentStepIndex);

  return traversedIndexes.find((questionIndex) => {
    const question = questions[questionIndex];
    if (!question?.required) return false;

    const answer = answers[question.id];
    if (question.type === "checkbox") {
      return !Array.isArray(answer) || answer.length === 0;
    }

    return typeof answer !== "string" || answer.trim().length === 0;
  }) ?? -1;
};

export const connectBranchHandle = (
  questions: JobInfoQuestion[],
  sourceQuestionId: string,
  sourceHandleId: string,
  targetQuestionId?: string
) =>
  normalizeJobInfoQuestions(
    questions.map((question) => {
      if (question.id !== sourceQuestionId) return question;

      if (sourceHandleId === FALLBACK_BRANCH_HANDLE_ID) {
        return {
          ...question,
          fallbackNextQuestionId: targetQuestionId,
        };
      }

      if (sourceHandleId.startsWith("rule:")) {
        const ruleId = sourceHandleId.replace("rule:", "");
        return {
          ...question,
          branchRules: question.branchRules.map((rule) =>
            rule.id === ruleId ? { ...rule, targetQuestionId } : rule
          ),
        };
      }

      if (sourceHandleId.startsWith("option:")) {
        const optionId = sourceHandleId.replace("option:", "");
        const existingRuleIndex = question.branchRules.findIndex(
          (rule) =>
            rule.conditions.length === 1 && rule.conditions[0]?.optionId === optionId
        );

        if (existingRuleIndex >= 0) {
          return {
            ...question,
            branchRules: question.branchRules.map((rule, ruleIndex) =>
              ruleIndex === existingRuleIndex ? { ...rule, targetQuestionId } : rule
            ),
          };
        }

        return {
          ...question,
          branchRules: [
            ...question.branchRules,
            {
              id: createJobInfoRuleId(),
              conditions: [{ id: createJobInfoConditionId(), optionId }],
              targetQuestionId,
            },
          ],
        };
      }

      return question;
    })
  );

export const clearBranchHandleConnection = (
  questions: JobInfoQuestion[],
  sourceQuestionId: string,
  sourceHandleId: string
) => connectBranchHandle(questions, sourceQuestionId, sourceHandleId, undefined);
