import type { ComponentType, DragEvent } from "react";
import TextInput from "../ui/text-input/TextInput";
import DraggableHandleButton from "./buttons/DraggableHandleButton";
import { CHECKLIST_FORM_WIDTH_CLASS, CHECKLIST_QUESTION_ROW_CLASS } from "./layout";

interface QuestionSectionHeaderProps {
  index: number;
  question: string;
  onQuestionChange: (value: string) => void;
  onDragStart: (event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  ToggleIcon: ComponentType<{ className?: string }>;
}

export default function QuestionSectionHeader({
  index,
  question,
  onQuestionChange,
  onDragStart,
  onDragEnd,
  isExpanded,
  onToggleExpanded,
  ToggleIcon,
}: QuestionSectionHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`${CHECKLIST_FORM_WIDTH_CLASS} ${CHECKLIST_QUESTION_ROW_CLASS}`}>
        <span className="flex w-[50px] shrink-0 items-center gap-2 text-sm font-semibold text-gray-900">
          <DraggableHandleButton
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            ariaLabel={`Drag question ${index + 1}`}
          />
          Q.{index + 1}
        </span>
        <TextInput
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="Enter Question"
          className="!h-9 !rounded-sm !border-gray-200 !px-2 !py-1 !text-sm"
        />
      </div>
      <button
        type="button"
        onClick={onToggleExpanded}
        className="ml-auto text-gray-400 hover:text-gray-600"
        aria-label={isExpanded ? "Collapse question" : "Expand question"}
      >
        <ToggleIcon className={`transition-transform ${isExpanded ? "" : "rotate-180"}`} />
      </button>
    </div>
  );
}

