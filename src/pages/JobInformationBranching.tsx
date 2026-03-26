import { useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageContentContainer from "../components/layout/PageContentContainer";
import type { JobInfoQuestion, JobInfoTemplate } from "../types/jobInformation";
import { useJobInformationStore } from "../stores/jobInformationStore";
import { ChevronLeftIcon } from "../icons";

type LocationState = {
  templateName?: string;
  questions?: JobInfoQuestion[];
};

const FlowNode = ({
  question,
  index,
  indexMap,
}: {
  question: JobInfoQuestion;
  index: number;
  indexMap: Map<string, number>;
}) => {
  const options = question.options;
  return (
    <div className="min-w-[200px] rounded-lg border border-gray-200 bg-[#F2F2F2] px-4 py-3">
      <p className="text-xs font-semibold text-gray-700">Q.{index + 1}</p>
      <p className="text-xs text-gray-600">{question.text || "Untitled question"}</p>
      <div className="mt-2 space-y-1 text-[11px] text-[#F25C54]">
        {options.length === 0 ? <span>No options</span> : null}
        {options.map((option) => (
          <div key={option.id}>
            {option.label || "Option"}
            {option.nextQuestionId && indexMap.has(option.nextQuestionId) ? (
              <span className="text-gray-400">
                {" "}
                -&gt; Q.{indexMap.get(option.nextQuestionId)}
              </span>
            ) : null}
          </div>
        ))}
        {question.fallbackNextQuestionId &&
        indexMap.has(question.fallbackNextQuestionId) ? (
          <div className="text-gray-400">
            Else -&gt; Q.{indexMap.get(question.fallbackNextQuestionId)}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default function JobInformationBranching() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { templateName, questions: stateQuestions } =
    (location.state as LocationState | null) ?? {};
  const templates = useJobInformationStore((state) => state.templates);

  const template = useMemo<JobInfoTemplate | undefined>(
    () => templates.find((item) => item.id === templateId),
    [templateId, templates]
  );

  const questions = stateQuestions ?? template?.questions ?? [];
  const name = templateName ?? template?.name ?? "Job Information";
  const [rowOne, rowTwo] = [
    questions.slice(0, 3),
    questions.slice(3, 5),
  ];
  const indexMap = useMemo(
    () => new Map(questions.map((question, idx) => [question.id, idx + 1])),
    [questions]
  );

  return (
    <>
      <PageMeta title="Branching" description="Job information branching" />
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Home / Settings / Jobs /{" "}
          <span className="text-[#007B8C]">Branching</span>
        </p>
        <PageContentContainer className="p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
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

          <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
            <Link
              to="/settings/jobs/job-information"
              className="text-gray-600 hover:text-[#007B8C]"
            >
              Job Information
            </Link>
            <span>/</span>
            <span className="text-[#007B8C]">Branching</span>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-800">
              Conditional flow
            </h2>
            <p className="mt-1 text-xs text-gray-500">{name}</p>

            <div className="mt-6">
              <div className="relative inline-block min-w-max">
                <div className="flex items-center gap-12">
                  {rowOne.map((question, index) => (
                    <div key={question.id} className="flex items-center gap-12">
                      <FlowNode
                        question={question}
                        index={index}
                        indexMap={indexMap}
                      />
                      {index < rowOne.length - 1 ? (
                        <div className="h-px w-20 bg-gray-300" />
                      ) : null}
                    </div>
                  ))}
                </div>

                {rowTwo.length ? (
                  <div className="mt-16 flex min-w-full items-center gap-12">
                    {rowTwo.map((question, index) => (
                      <div key={question.id} className="flex items-center gap-12">
                        <FlowNode
                          question={question}
                          index={rowOne.length + index}
                          indexMap={indexMap}
                        />
                        {index < rowTwo.length - 1 ? (
                          <div className="h-px w-20 bg-gray-300" />
                        ) : null}
                      </div>
                    ))}
                    <div className="h-px flex-1 bg-gray-300" />
                  </div>
                ) : null}

                {rowTwo.length ? (
                  <div className="absolute right-0 top-[88px] h-[140px] w-px bg-gray-300" />
                ) : null}
              </div>
            </div>
          </div>
        </PageContentContainer>
      </div>
    </>
  );
}
