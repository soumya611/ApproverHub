import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageContentContainer from "../components/layout/PageContentContainer";
import Button from "../components/ui/button/Button";
import DescriptionText from "../components/ui/description-text/DescriptionText";
import JobInformationQuestionCard from "../components/ui/job-information-question/JobInformationQuestionCard";
import PopupTitle from "../components/ui/popup-title/PopupTitle";
import { ChevronLeftIcon, EditPenIcon, SettingOnIcon } from "../icons";
import { useJobInformationStore } from "../stores/jobInformationStore";
import type { JobInfoQuestion, JobInfoTemplate } from "../types/jobInformation";

const createQuestionId = () =>
  `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const createOptionId = () =>
  `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const createQuestion = (): JobInfoQuestion => ({
  id: createQuestionId(),
  text: "",
  type: "choice",
  required: false,
  options: [],
});

export default function JobInformationEditor() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const templates = useJobInformationStore((state) => state.templates);
  const addTemplate = useJobInformationStore((state) => state.addTemplate);
  const updateTemplate = useJobInformationStore((state) => state.updateTemplate);
  const isNew = templateId === "new";

  const template = useMemo<JobInfoTemplate | undefined>(
    () => templates.find((item) => item.id === templateId),
    [templateId, templates]
  );

  const [name, setName] = useState(template?.name ?? "");
  const [questions, setQuestions] = useState<JobInfoQuestion[]>(
    template?.questions ?? [createQuestion()]
  );
  const [version, setVersion] = useState(template?.version ?? "V1");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const questionIndexMap = useMemo(
    () => new Map(questions.map((question, index) => [question.id, index + 1])),
    [questions]
  );

  useEffect(() => {
    if (!template || isNew) return;
    setName(template.name);
    setQuestions(template.questions);
    setVersion(template.version);
  }, [template, isNew]);

  useEffect(() => {
    if (!isNew || !draftId) return;
    const resolvedName = name.trim() || "Job Information";
    updateTemplate(draftId, { name: resolvedName, version, questions });
  }, [isNew, draftId, name, version, questions, updateTemplate]);

  useEffect(() => {
    if (!isNew || draftId || template) return;
    const resolvedName = name.trim() || "Job Information";
    const nextTemplate: JobInfoTemplate = {
      id: `job-info-${Date.now()}`,
      name: resolvedName,
      version,
      isActive: false,
      questions,
    };
    addTemplate(nextTemplate);
    setDraftId(nextTemplate.id);
  }, [isNew, draftId, template, name, version, questions, addTemplate]);

  const handleQuestionChange = (index: number, updated: JobInfoQuestion) => {
    setQuestions((prev) => prev.map((item, i) => (i === index ? updated : item)));
  };

  const handleQuestionDelete = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionDuplicate = (index: number) => {
    setQuestions((prev) => {
      const item = prev[index];
      if (!item) return prev;
      const cloned: JobInfoQuestion = {
        ...item,
        id: createQuestionId(),
        options: item.options.map((option) => ({
          ...option,
          id: createOptionId(),
        })),
      };
      const next = [...prev];
      next.splice(index + 1, 0, cloned);
      return next;
    });
  };

  const handleSave = () => {
    if (!template) return;
    const resolvedName = name.trim() || template.name || "Job Information";
    updateTemplate(template.id, { name: resolvedName, version, questions });
    navigate("/settings/jobs/job-information");
  };

  const handleShowConditions = () => {
    if (template?.id) {
      const resolvedName = name.trim() || template.name || "Job Information";
      updateTemplate(template.id, { name: resolvedName, version, questions });
      navigate(`/settings/jobs/job-information/${template.id}/branching`);
      return;
    }
    if (draftId) {
      const resolvedName = name.trim() || "Job Information";
      updateTemplate(draftId, { name: resolvedName, version, questions });
      navigate(`/settings/jobs/job-information/${draftId}/branching`);
      return;
    }
    const resolvedName = name.trim() || "Job Information";
    const nextTemplate: JobInfoTemplate = {
      id: `job-info-${Date.now()}`,
      name: resolvedName,
      version,
      isActive: false,
      questions,
    };
    addTemplate(nextTemplate);
    setDraftId(nextTemplate.id);
    navigate(`/settings/jobs/job-information/${nextTemplate.id}/branching`);
  };

  const handleAddQuestion = () => {
    const nextQuestions = [...questions, createQuestion()];
    setQuestions(nextQuestions);
    if (!isNew || draftId) return;
    const resolvedName = name.trim() || "Job Information";
    const nextTemplate: JobInfoTemplate = {
      id: `job-info-${Date.now()}`,
      name: resolvedName,
      version,
      isActive: false,
      questions: nextQuestions,
    };
    addTemplate(nextTemplate);
    setDraftId(nextTemplate.id);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    setQuestions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

  const handleOptionNextChange = (
    questionId: string,
    optionId: string,
    nextQuestionId: string
  ) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optionId
                  ? {
                      ...option,
                      nextQuestionId: nextQuestionId || undefined,
                    }
                  : option
              ),
            }
          : question
      )
    );
  };

  const handleFallbackNextChange = (
    questionId: string,
    nextQuestionId: string
  ) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? {
              ...question,
              fallbackNextQuestionId: nextQuestionId || undefined,
            }
          : question
      )
    );
  };

  const handleAddRule = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: [
                ...question.options,
                {
                  id: createOptionId(),
                  label: `Option ${question.options.length + 1}`,
                },
              ],
            }
          : question
      )
    );
  };

  return (
    <>
      <PageMeta title="Job information" description="Job information" />
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Home / Settings / Jobs /{" "}
          <span className="text-[#007B8C]">Job Information</span>
        </p>
        <PageContentContainer className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex flex-1 items-start gap-3">
              <button
                type="button"
                onClick={() => navigate("/settings/jobs/job-information")}
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleShowConditions}
                className="flex items-center gap-2 text-xs font-semibold text-[#F25C54]"
              >
                <SettingOnIcon className="h-4 w-4" />
                Show Conditions
              </button>
              {!isNew ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="!rounded-md !px-4 !py-2 text-xs"
                  onClick={handleSave}
                >
                  Save
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-3">
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter Name"
                    className="w-full max-w-[360px] border-b border-gray-200 px-1 pb-1 text-sm text-gray-700 focus:border-[#007B8C] focus:outline-none"
                  />
                  <EditPenIcon className="h-4 w-4 text-gray-400" />
                </div>
                {!isNew ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Version</span>
                    <input
                      value={version}
                      onChange={(event) => setVersion(event.target.value)}
                      className="h-7 w-16 rounded-md border border-gray-200 px-2 text-xs text-gray-500"
                    />
                  </div>
                ) : null}
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
                      onChange={(updated) => handleQuestionChange(index, updated)}
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
                  className="!rounded-md !px-4 !py-2 text-xs"
                  onClick={handleAddQuestion}
                >
                  Add Questions
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Branching</h2>
              </div>
              <div className="mt-4 space-y-4">
                {questions.map((question, index) => {
                  const nextQuestions = questions.filter(
                    (item) => item.id !== question.id
                  );
                  return (
                    <div
                      key={question.id}
                      className="rounded-lg border border-gray-100 bg-[#FAFAFA] p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-600">
                        <span className="rounded bg-[#F25C54]/10 px-2 py-0.5 text-[10px] font-semibold text-[#F25C54]">
                          Q.{index + 1}
                        </span>
                        <span className="text-gray-700">
                          {question.text || "Untitled question"}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {question.options.length ? (
                          question.options.map((option) => (
                            <div
                              key={option.id}
                              className="flex flex-wrap items-center gap-2 text-xs text-gray-600"
                            >
                              <span className="text-gray-400">is</span>
                              <span className="rounded border border-gray-200 bg-white px-2 py-1 text-gray-700">
                                {option.label || "Option"}
                              </span>
                              <span className="text-gray-400">Go to</span>
                              <select
                                value={option.nextQuestionId ?? ""}
                                onChange={(event) =>
                                  handleOptionNextChange(
                                    question.id,
                                    option.id,
                                    event.target.value
                                  )
                                }
                                className="min-w-[200px] rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500"
                              >
                                <option value="">Select...</option>
                                {nextQuestions.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    Q.{questionIndexMap.get(item.id)}{" "}
                                    {item.text || "Untitled question"}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400">
                            Add an option to set branching rules.
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <span className="text-gray-400">
                          All other cases go to
                        </span>
                        <select
                          value={question.fallbackNextQuestionId ?? ""}
                          onChange={(event) =>
                            handleFallbackNextChange(
                              question.id,
                              event.target.value
                            )
                          }
                          className="min-w-[200px] rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500"
                        >
                          <option value="">Select...</option>
                          {nextQuestions.map((item) => (
                            <option key={item.id} value={item.id}>
                              Q.{questionIndexMap.get(item.id)}{" "}
                              {item.text || "Untitled question"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddRule(question.id)}
                        className="mt-3 text-xs font-semibold text-[#F25C54] hover:text-[#E34A41]"
                      >
                        + Add Rule
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </PageContentContainer>
      </div>
    </>
  );
}
