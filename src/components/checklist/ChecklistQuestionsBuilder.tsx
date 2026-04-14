import { useChecklistBuilderStore } from "../../stores/checklistBuilderStore";
import { ChecklistAccordionIcon } from "@/icons";
import Button from "../ui/button/Button";
import PassFailOption from "./PassFailOption";
import QuestionSectionHeader from "./QuestionSectionHeader";
import QuestionSectionName from "./QuestionSectionName";
import QuestionDescriptionField from "./QuestionDescriptionField";

interface ChecklistQuestionsBuilderProps {
  showQuestionDeleteAction?: boolean;
}

export default function ChecklistQuestionsBuilder({
  showQuestionDeleteAction = false,
}: ChecklistQuestionsBuilderProps) {
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
    removeQuestion,
    toggleQuestionExpanded,
    reorderQuestions,
    addSection,
    setDragContext,
    setDragOverContext,
    clearDragContext,
  } = useChecklistBuilderStore();

  return (
    <div className="max-w-[750px] space-y-3">
      <p className="text-sm font-medium text-gray-800">Upload Checklist or add questions</p>
      {sections.map((section) => (
        <div key={section.id} className="rounded-md border border-gray-200 bg-white">
          <QuestionSectionName
            sectionName={section.sectionName}
            sectionTitle={section.sectionTitle}
            onSectionTitleChange={(value) => setSectionTitle(section.id, value)}
            isExpanded={section.isExpanded}
            onToggleExpanded={() => toggleSectionExpanded(section.id)}
            ToggleIcon={ChecklistAccordionIcon}
          />

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
                  <QuestionSectionHeader
                    index={index}
                    question={question.question}
                    onQuestionChange={(value) =>
                      updateQuestion(section.id, question.id, { question: value })
                    }
                    onDragStart={(event) => {
                      setDragContext(question.id, section.id);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={clearDragContext}
                    isExpanded={question.isExpanded}
                    onToggleExpanded={() => toggleQuestionExpanded(section.id, question.id)}
                    ToggleIcon={ChecklistAccordionIcon}
                    showDeleteAction={
                      showQuestionDeleteAction &&
                      (question.question.trim().length > 0 || question.description.trim().length > 0)
                    }
                    onDeleteQuestion={() => removeQuestion(section.id, question.id)}
                  />

                  {question.isExpanded ? (
                    <>
                      <QuestionDescriptionField
                        value={question.description}
                        onChange={(value) =>
                          updateQuestion(section.id, question.id, { description: value })
                        }
                      />

                      <PassFailOption
                        value={question.selectedAnswer}
                        onChange={(value) =>
                          updateQuestion(section.id, question.id, { selectedAnswer: value })
                        }
                      />
                    </>
                  ) : null}
                </div>
              ))}

              <div className="px-3 py-2.5 pl-[68px]">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => addQuestion(section.id)}
                  className="!h-auto !border-0 !bg-transparent !p-0 !text-sm !font-semibold !text-[var(--color-secondary-500)] hover:!bg-transparent"
                >
                  + Add Question
                </Button>
              </div>
            </>
          ) : null}
        </div>
      ))}

      <Button
        size="sm"
        variant="secondary"
        onClick={addSection}
        className="!flex !w-full !justify-start !rounded-md !border !border-gray-200 !bg-gray-50 !px-3 !py-2.5 !text-base !font-normal !text-gray-500 hover:!bg-gray-100"
      >
        + Add Section
      </Button>
    </div>
  );
}

