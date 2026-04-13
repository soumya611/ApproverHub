import { useChecklistBuilderStore } from "../../stores/checklistBuilderStore";
import AddSectionButton from "./buttons/AddSectionButton";
import AddQuestionButton from "./buttons/AddQuestionButton";
import PassFailOption from "./PassFailOption";
import QuestionSectionHeader from "./QuestionSectionHeader";
import QuestionSectionName from "./QuestionSectionName";
import ChecklistAccordionIcon from "./icons/ChecklistAccordionIcon";
import QuestionDescriptionField from "./QuestionDescriptionField";

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
                  />

                  {question.isExpanded ? (
                    <>
                      <QuestionDescriptionField
                        value={question.description}
                        onChange={(value) =>
                          updateQuestion(section.id, question.id, { description: value })
                        }
                      />

                      <PassFailOption />
                    </>
                  ) : null}
                </div>
              ))}

              <div className="px-3 py-2.5 pl-[68px]">
                <AddQuestionButton onClick={() => addQuestion(section.id)} />
              </div>
            </>
          ) : null}
        </div>
      ))}

      <AddSectionButton onClick={addSection} />
    </div>
  );
}

