import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import PageMeta from "../components/common/PageMeta";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageContentContainer from "../components/layout/PageContentContainer";
import type { JobInfoQuestion, JobInfoTemplate } from "../types/jobInformation";
import { useJobInformationStore } from "../stores/jobInformationStore";
import { ChevronLeftIcon } from "../icons";

type LocationState = {
  templateName?: string;
  questions?: JobInfoQuestion[];
};

type DirectBranchLink = {
  id: string;
  fromQuestionNumber: number;
  fromQuestionText: string;
  choiceTag: string;
  choiceOrder: number;
  toQuestionNumber: number;
  toQuestionText: string;
  toQuestionAnswerTag: string;
};

const NODE_WIDTH = 230;
const NODE_HEIGHT = 116;
const COLUMN_GAP = 170;
const ROW_GAP = 44;
const CANVAS_PADDING_X = 20;
const CANVAS_PADDING_Y = 16;
const MIN_CANVAS_HEIGHT = 360;

const getChoiceTag = (choiceIndex: number) =>
  `A.${String.fromCharCode(65 + (choiceIndex % 26))}`;

const getQuestionSelectedAnswerTag = (question: JobInfoQuestion) => {
  const selectedOptionIndex = question.options.findIndex(
    (option) => Boolean(option.nextQuestionId)
  );
  if (selectedOptionIndex >= 0) {
    return getChoiceTag(selectedOptionIndex);
  }
  if (question.fallbackNextQuestionId) {
    return "Else";
  }
  if (question.options.length) {
    return getChoiceTag(0);
  }
  return "No options";
};

export default function JobInformationBranching() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { questions: stateQuestions } = (location.state as LocationState | null) ?? {};
  const templates = useJobInformationStore((state) => state.templates);

  const template = useMemo<JobInfoTemplate | undefined>(
    () => templates.find((item) => item.id === templateId),
    [templateId, templates]
  );

  const questions = useMemo(
    () => stateQuestions ?? template?.questions ?? [],
    [stateQuestions, template?.questions]
  );
  const indexMap = useMemo(
    () => new Map(questions.map((question, idx) => [question.id, idx + 1])),
    [questions]
  );

  const questionById = useMemo(
    () => new Map(questions.map((question) => [question.id, question])),
    [questions]
  );

  const directLinks = useMemo(() => {
    const validQuestionIds = new Set(questions.map((question) => question.id));
    const links: DirectBranchLink[] = [];

    questions.forEach((question) => {
      const fromQuestionNumber = indexMap.get(question.id);
      if (!fromQuestionNumber) return;

      question.options.forEach((option, optionIndex) => {
        if (!option.nextQuestionId || !validQuestionIds.has(option.nextQuestionId)) {
          return;
        }

        const targetQuestion = questionById.get(option.nextQuestionId);
        const toQuestionNumber = targetQuestion
          ? indexMap.get(targetQuestion.id)
          : undefined;

        if (!targetQuestion || !toQuestionNumber) return;

        links.push({
          id: `${question.id}::${option.id}`,
          fromQuestionNumber,
          fromQuestionText: question.text || "Untitled question",
          choiceTag: getChoiceTag(optionIndex),
          choiceOrder: optionIndex,
          toQuestionNumber,
          toQuestionText: targetQuestion.text || "Untitled question",
          toQuestionAnswerTag: getQuestionSelectedAnswerTag(targetQuestion),
        });
      });

      if (
        question.fallbackNextQuestionId &&
        validQuestionIds.has(question.fallbackNextQuestionId)
      ) {
        const targetQuestion = questionById.get(question.fallbackNextQuestionId);
        const toQuestionNumber = targetQuestion
          ? indexMap.get(targetQuestion.id)
          : undefined;

        if (!targetQuestion || !toQuestionNumber) return;

        links.push({
          id: `${question.id}::__fallback__`,
          fromQuestionNumber,
          fromQuestionText: question.text || "Untitled question",
          choiceTag: "Else",
          choiceOrder: question.options.length,
          toQuestionNumber,
          toQuestionText: targetQuestion.text || "Untitled question",
          toQuestionAnswerTag: getQuestionSelectedAnswerTag(targetQuestion),
        });
      }
    });

    return links.sort((left, right) => {
      if (left.fromQuestionNumber !== right.fromQuestionNumber) {
        return left.fromQuestionNumber - right.fromQuestionNumber;
      }
      if (left.choiceOrder !== right.choiceOrder) {
        return left.choiceOrder - right.choiceOrder;
      }
      return left.toQuestionNumber - right.toQuestionNumber;
    });
  }, [indexMap, questionById, questions]);

  const canvas = useMemo(() => {
    if (!directLinks.length) return null;

    const rows = directLinks.length;
    const width = CANVAS_PADDING_X * 2 + NODE_WIDTH * 2 + COLUMN_GAP;
    const height = Math.max(
      MIN_CANVAS_HEIGHT,
      CANVAS_PADDING_Y * 2 + rows * NODE_HEIGHT + (rows - 1) * ROW_GAP
    );

    return { width, height };
  }, [directLinks.length]);

  return (
    <>
      <PageMeta title="Branching" description="Job information branching" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb />
        <PageContentContainer className="flex min-h-0 flex-1 flex-col overflow-hidden py-6">
          <div className="flex items-center gap-2 text-sm  px-6 font-semibold text-gray-800">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full p-1 text-gray-400 hover:text-[#007B8C]"
              aria-label="Back"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="text-[#007B8C]">Branching</span>
          </div>

          <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-gray-200 bg-white p-5">
            <h2 className="text-sm font-bold text-gray-800 pl-10">Conditional flow</h2>

            {questions.length === 0 ? (
              <p className="mt-6 text-sm text-gray-500">
                No questions found for this Job Information yet.
              </p>
            ) : !directLinks.length || !canvas ? (
              <p className="mt-6 text-sm text-gray-500">
                No one-to-one branch links are configured yet.
              </p>
            ) : (
              <div className="mt-4 min-h-0 flex-1 overflow-auto">
                <div
                  className="relative min-h-full min-w-max"
                  style={{ width: canvas.width, height: canvas.height }}
                >
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    aria-hidden="true"
                  >
                    {directLinks.map((_, index) => {
                      const top = CANVAS_PADDING_Y + index * (NODE_HEIGHT + ROW_GAP);
                      const centerY = top + NODE_HEIGHT / 2;
                      const sourceRight = CANVAS_PADDING_X + NODE_WIDTH;
                      const targetLeft = sourceRight + COLUMN_GAP;

                      return (
                        <path
                          key={`line-${index}`}
                          d={`M ${sourceRight} ${centerY} L ${targetLeft} ${centerY}`}
                          fill="none"
                          stroke="#9CA3AF"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </svg>

                  {directLinks.map((link, index) => {
                    const top = CANVAS_PADDING_Y + index * (NODE_HEIGHT + ROW_GAP);
                    const sourceLeft = CANVAS_PADDING_X;
                    const targetLeft = sourceLeft + NODE_WIDTH + COLUMN_GAP;

                    return (
                      <div key={link.id}>
                        <div
                          className="absolute h-[116px] w-[230px] rounded-lg border border-gray-200 bg-[#F2F2F2] px-4 py-3"
                          style={{ left: sourceLeft, top }}
                        >
                          <p className="text-xs font-semibold text-gray-700">
                            Q.{link.fromQuestionNumber}
                          </p>
                          <p className="mt-2 max-h-8 overflow-hidden text-xs leading-4 text-gray-700">
                            {link.fromQuestionText}
                          </p>
                          <p className="mt-3 text-xs font-semibold text-[#F25C54]">
                            {link.choiceTag}
                          </p>
                        </div>

                        <div
                          className="absolute h-[116px] w-[230px] rounded-lg border border-gray-200 bg-[#F2F2F2] px-4 py-3"
                          style={{ left: targetLeft, top }}
                        >
                          <p className="text-xs font-semibold text-gray-700">
                            Q.{link.toQuestionNumber}
                          </p>
                          <p className="mt-2 max-h-8 overflow-hidden text-xs leading-4 text-gray-700">
                            {link.toQuestionText}
                          </p>
                          <p className="mt-3 text-xs font-semibold text-[#F25C54]">
                            {link.toQuestionAnswerTag}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </PageContentContainer>
      </div>
    </>
  );
}
