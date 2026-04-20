import { useCallback, useEffect, useMemo, useState } from "react";
import Radio from "../../form/input/Radio";
import type { StepDropdownStep } from "../step-dropdown/StepDropdown";
import type {
  JobInfoAnswers,
  JobInfoQuestion,
} from "../../../types/jobInformation";
import {
  getNextQuestionIdForAnswer,
  isCheckboxQuestion,
  normalizeJobInfoQuestions,
  resolveQuestionIndex,
} from "@/utils/jobInformationBranching";

const DEFAULT_QUESTIONS: JobInfoQuestion[] = [
  {
    id: "q1",
    text: "Is this for external use ?",
    type: "choice",
    required: true,
    options: [
      { id: "q1-yes", label: "Yes", nextQuestionId: "q2" },
      { id: "q1-no", label: "No", nextQuestionId: "q2" },
    ],
    branchRules: [],
  },
  {
    id: "q2",
    text: "Is this for UK use ?",
    type: "choice",
    required: true,
    options: [
      { id: "q2-yes", label: "Yes" },
      { id: "q2-no", label: "No" },
    ],
    branchRules: [],
  },
];

const getDefaultAnswers = (questions: JobInfoQuestion[], initial?: JobInfoAnswers) => {
  if (initial) return initial;
  return questions.reduce<JobInfoAnswers>((acc, question) => {
    acc[question.id] = isCheckboxQuestion(question.type) ? [] : "";
    return acc;
  }, {});
};

export function useJobInformationSteps(
  questions: JobInfoQuestion[] = DEFAULT_QUESTIONS,
  initialAnswers?: JobInfoAnswers
) {
  const resolvedQuestions = useMemo(
    () =>
      normalizeJobInfoQuestions(questions.length ? questions : DEFAULT_QUESTIONS),
    [questions]
  );
  const [answers, setAnswers] = useState<JobInfoAnswers>(
    getDefaultAnswers(resolvedQuestions, initialAnswers)
  );
  const [stepIndex, setStepIndexState] = useState(0);
  const [stepHistory, setStepHistory] = useState<number[]>([]);

  useEffect(() => {
    setAnswers(getDefaultAnswers(resolvedQuestions, initialAnswers));
    setStepIndexState(0);
    setStepHistory([]);
  }, [resolvedQuestions, initialAnswers]);

  const goToStep = useCallback((nextIndex: number) => {
    if (nextIndex === stepIndex) return;
    setStepHistory((prev) => [...prev, stepIndex]);
    setStepIndexState(nextIndex);
  }, [stepIndex]);

  const goBack = useCallback(() => {
    if (!stepHistory.length) {
      setStepIndexState((current) => Math.max(current - 1, 0));
      return;
    }
    const previousIndex = stepHistory[stepHistory.length - 1];
    setStepHistory((prev) => prev.slice(0, -1));
    setStepIndexState(previousIndex);
  }, [stepHistory]);

  const setStepIndex = useCallback((nextIndex: number) => {
    if (nextIndex === stepIndex) return;
    if (nextIndex === 0) {
      setStepHistory([]);
      setStepIndexState(0);
      return;
    }
    if (nextIndex < stepIndex) {
      goBack();
      return;
    }
    goToStep(nextIndex);
  }, [goBack, goToStep, stepIndex]);

  const handleChoiceSelect = useCallback((questionIndex: number, value: string) => {
    const question = resolvedQuestions[questionIndex];
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    const nextIndex = resolveQuestionIndex(
      resolvedQuestions,
      questionIndex,
      getNextQuestionIdForAnswer(question, value)
    );
    goToStep(nextIndex);
  }, [goToStep, resolvedQuestions]);

  const handleCheckboxToggle = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const current = prev[questionId];
      const currentArray = Array.isArray(current) ? current : [];
      const next = currentArray.includes(optionId)
        ? currentArray.filter((item) => item !== optionId)
        : [...currentArray, optionId];
      return { ...prev, [questionId]: next };
    });
  }, []);

  const handleCheckboxContinue = useCallback((questionIndex: number) => {
    const question = resolvedQuestions[questionIndex];
    if (!question) return;

    const selectedValue = answers[question.id];
    const selectedArray = Array.isArray(selectedValue) ? selectedValue : [];
    if (question.required && selectedArray.length === 0) {
      return;
    }

    const nextIndex = resolveQuestionIndex(
      resolvedQuestions,
      questionIndex,
      getNextQuestionIdForAnswer(question, selectedArray)
    );
    goToStep(nextIndex);
  }, [answers, goToStep, resolvedQuestions]);

  const steps = useMemo<StepDropdownStep[]>(
    () =>
      resolvedQuestions.map((question, index) => {
        const isCheckbox = isCheckboxQuestion(question.type);
        const selectedValue = answers[question.id];
        const selectedArray = Array.isArray(selectedValue) ? selectedValue : [];

        return {
          id: question.id,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                {question.text}{" "}
                {question.required ? <span className="text-red-500">*</span> : null}
              </p>
              <div className="flex flex-col gap-2">
                {question.options.map((option) =>
                  isCheckbox ? (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedArray.includes(option.id)}
                        onChange={() =>
                          handleCheckboxToggle(question.id, option.id)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-[#007B8C] focus:ring-[#007B8C]"
                      />
                      <span>{option.label}</span>
                    </label>
                  ) : (
                    <Radio
                      key={option.id}
                      id={`job-info-${question.id}-${option.id}`}
                      name={`job-info-${question.id}`}
                      value={option.id}
                      checked={selectedValue === option.id}
                      onChange={(value) => handleChoiceSelect(index, value)}
                      label={option.label}
                    />
                  )
                )}
                {isCheckbox ? (
                  <button
                    type="button"
                    onClick={() => handleCheckboxContinue(index)}
                    disabled={question.required && selectedArray.length === 0}
                    className={`mt-2 w-fit rounded px-3 py-1.5 text-xs font-semibold ${
                      question.required && selectedArray.length === 0
                        ? "cursor-not-allowed bg-gray-200 text-gray-400"
                        : "bg-[#F25C54] text-white hover:bg-[#E34A41]"
                    }`}
                  >
                    Continue
                  </button>
                ) : null}
              </div>
            </div>
          ),
        };
      }),
    [answers, handleCheckboxContinue, handleCheckboxToggle, handleChoiceSelect, resolvedQuestions]
  );

  return { steps, stepIndex, setStepIndex, answers, setAnswers };
}
