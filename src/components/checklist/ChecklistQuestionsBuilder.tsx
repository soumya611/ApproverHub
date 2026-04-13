import TextInput from "../ui/text-input/TextInput";
import { useChecklistBuilderStore } from "../../stores/checklistBuilderStore";

function ChecklistAccordionIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="13"
      height="8"
      viewBox="0 0 13 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10.7329 7.44181L6.0536 2.95304L1.55463 7.62249L0.117152 6.24051L5.9979 0.123587L12.1148 6.00434L10.7329 7.44181Z"
        fill="#808080"
      />
    </svg>
  );
}

function ChecklistDragHandleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M11.5781 5.64062H11.5831V5.64563H11.5781V5.64062Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.875 5.64062C11.875 5.71936 11.8437 5.79487 11.788 5.85055C11.7324 5.90622 11.6569 5.9375 11.5781 5.9375C11.4994 5.9375 11.4239 5.90622 11.3682 5.85055C11.3125 5.79487 11.2812 5.71936 11.2812 5.64062C11.2812 5.56189 11.3125 5.48638 11.3682 5.4307C11.4239 5.37503 11.4994 5.34375 11.5781 5.34375C11.6569 5.34375 11.7324 5.37503 11.788 5.4307C11.8437 5.48638 11.875 5.56189 11.875 5.64062ZM11.5781 9.49406H11.5841V9.5H11.5781V9.49406Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.875 9.5C11.875 9.57874 11.8437 9.65425 11.788 9.70992C11.7324 9.7656 11.6569 9.79688 11.5781 9.79688C11.4994 9.79688 11.4239 9.7656 11.3682 9.70992C11.3125 9.65425 11.2812 9.57874 11.2812 9.5C11.2812 9.42126 11.3125 9.34575 11.3682 9.29008C11.4239 9.2344 11.4994 9.20312 11.5781 9.20312C11.6569 9.20312 11.7324 9.2344 11.788 9.29008C11.8437 9.34575 11.875 9.42126 11.875 9.5ZM11.5781 13.3653H11.5841V13.3713H11.5781V13.3653Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.875 13.3594C11.875 13.4381 11.8437 13.5136 11.788 13.5693C11.7324 13.625 11.6569 13.6562 11.5781 13.6562C11.4994 13.6562 11.4239 13.625 11.3682 13.5693C11.3125 13.5136 11.2812 13.4381 11.2812 13.3594C11.2812 13.2806 11.3125 13.2051 11.3682 13.1495C11.4239 13.0938 11.4994 13.0625 11.5781 13.0625C11.6569 13.0625 11.7324 13.0938 11.788 13.1495C11.8437 13.2051 11.875 13.2806 11.875 13.3594ZM7.42188 5.64062H7.42781V5.64656H7.42188V5.64062Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.71875 5.64062C7.71875 5.71936 7.68747 5.79487 7.6318 5.85055C7.57612 5.90622 7.50061 5.9375 7.42188 5.9375C7.34314 5.9375 7.26763 5.90622 7.21195 5.85055C7.15628 5.79487 7.125 5.71936 7.125 5.64062C7.125 5.56189 7.15628 5.48638 7.21195 5.4307C7.26763 5.37503 7.34314 5.34375 7.42188 5.34375C7.50061 5.34375 7.57612 5.37503 7.6318 5.4307C7.68747 5.48638 7.71875 5.56189 7.71875 5.64062ZM7.42188 9.49406H7.42781V9.5H7.42188V9.49406Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.71875 9.5C7.71875 9.57874 7.68747 9.65425 7.6318 9.70992C7.57612 9.7656 7.50061 9.79688 7.42188 9.79688C7.34314 9.79688 7.26763 9.7656 7.21195 9.70992C7.15628 9.65425 7.125 9.57874 7.125 9.5C7.125 9.42126 7.15628 9.34575 7.21195 9.29008C7.26763 9.2344 7.34314 9.20312 7.42188 9.20312C7.50061 9.20312 7.57612 9.2344 7.6318 9.29008C7.68747 9.34575 7.71875 9.42126 7.71875 9.5ZM7.42188 13.3653H7.42781V13.3713H7.42188V13.3653Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.71875 13.3594C7.71875 13.4381 7.68747 13.5136 7.6318 13.5693C7.57612 13.625 7.50061 13.6562 7.42188 13.6562C7.34314 13.6562 7.26763 13.625 7.21195 13.5693C7.15628 13.5136 7.125 13.4381 7.125 13.3594C7.125 13.2806 7.15628 13.2051 7.21195 13.1495C7.26763 13.0938 7.34314 13.0625 7.42188 13.0625C7.50061 13.0625 7.57612 13.0938 7.6318 13.1495C7.68747 13.2051 7.71875 13.2806 7.71875 13.3594Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function ChecklistQuestionsBuilder() {
  const {
    sections,
    draggedQuestionId,
    draggedSectionId,
    dragOverQuestionId,
    dragOverSectionId,
    setSectionTitle,
    toggleSectionExpanded,
    updateQuestion,
    addQuestion,
    toggleQuestionExpanded,
    reorderQuestions,
    addSection,
    setDragContext,
    setDragOverContext,
    clearDragContext,
  } = useChecklistBuilderStore();

  return (
    <div className="max-w-[760px] space-y-3">
      <p className="text-sm font-medium text-gray-800">Upload Checklist or add questions</p>
      {sections.map((section) => (
        <div key={section.id} className="rounded-md border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-3 py-2.5">
            <span className="mb-1 block text-[11px] font-medium text-[#64748B]">Section Name</span>
            <div className="flex items-center gap-2">
              <label className="flex h-9 min-w-0 flex-1 items-center rounded-sm border border-gray-200 bg-white px-3">
                <span className="shrink-0 text-sm font-semibold text-gray-900">
                  {section.sectionName} :
                </span>
                <input
                  type="text"
                  value={section.sectionTitle}
                  onChange={(event) => setSectionTitle(section.id, event.target.value)}
                  placeholder="Enter Name"
                  className="min-w-0 flex-1 border-0 bg-transparent px-1 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                />
              </label>
              <button
                type="button"
                onClick={() => toggleSectionExpanded(section.id)}
                className="shrink-0 text-gray-400 hover:text-gray-600"
                aria-label={section.isExpanded ? "Collapse section" : "Expand section"}
              >
                <ChecklistAccordionIcon
                  className={`transition-transform ${
                    section.isExpanded ? "" : "rotate-180"
                  }`}
                />
              </button>
            </div>
          </div>

          {section.isExpanded ? (
            <>
              {section.questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`space-y-2 border-b border-gray-100 px-3 py-3 ${
                    dragOverQuestionId === question.id && dragOverSectionId === section.id
                      ? "bg-[#F8FCFD]"
                      : ""
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (
                      draggedQuestionId &&
                      draggedSectionId === section.id &&
                      draggedQuestionId !== question.id
                    ) {
                      setDragOverContext(question.id, section.id);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggedQuestionId && draggedSectionId === section.id) {
                      reorderQuestions(section.id, draggedQuestionId, question.id);
                    }
                    clearDragContext();
                  }}
                >
                  <div className="grid gap-2 sm:grid-cols-[50px_1fr_auto] sm:items-center">
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <button
                        type="button"
                        draggable
                        onDragStart={(event) => {
                          setDragContext(question.id, section.id);
                          event.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={clearDragContext}
                        className="cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
                        aria-label={`Drag question ${index + 1}`}
                        title="Drag to reorder"
                      >
                        <ChecklistDragHandleIcon className="h-[19px] w-[19px]" />
                      </button>
                      Q.{index + 1}
                    </span>
                    <TextInput
                      value={question.question}
                      onChange={(event) =>
                        updateQuestion(section.id, question.id, {
                          question: event.target.value,
                        })
                      }
                      placeholder="Enter Question"
                      className="!h-9 !rounded-sm !border-gray-200 !px-2 !py-1 !text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => toggleQuestionExpanded(section.id, question.id)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label={question.isExpanded ? "Collapse question" : "Expand question"}
                    >
                      <ChecklistAccordionIcon
                        className={`transition-transform ${
                          question.isExpanded ? "" : "rotate-180"
                        }`}
                      />
                    </button>
                  </div>

                  {question.isExpanded ? (
                    <>
                      <label className="block space-y-1 pl-[50px]">
                        <span className="text-sm font-semibold text-gray-900">Description</span>
                        <textarea
                          value={question.description}
                          onChange={(event) =>
                            updateQuestion(section.id, question.id, {
                              description: event.target.value,
                            })
                          }
                          placeholder="Enter Summary"
                          className="min-h-[52px] w-full resize-none rounded-sm border border-gray-200 px-2 py-1 text-sm text-gray-700 outline-none focus:border-[#007B8C]"
                        />
                      </label>

                      <div className="pl-[50px]">
                        <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                          <input type="radio" checked readOnly className="h-3.5 w-3.5" />
                          <span className="rounded-sm border border-gray-200 px-2 py-1 text-sm text-gray-600">
                            Pass/fail
                          </span>
                        </label>
                      </div>
                    </>
                  ) : null}
                </div>
              ))}

              <div className="px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => addQuestion(section.id)}
                  className="text-sm font-semibold text-[var(--color-secondary-500)]"
                >
                  + Add Question
                </button>
              </div>
            </>
          ) : null}
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="flex w-full items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-base text-gray-500 hover:bg-gray-100"
      >
        + Add Section
      </button>
    </div>
  );
}

