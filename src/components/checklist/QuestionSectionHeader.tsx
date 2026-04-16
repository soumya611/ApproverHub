import type { ComponentType, DragEvent } from "react";
import Button from "../ui/button/Button";
import TextInput from "../ui/text-input/TextInput";
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
  showDeleteAction?: boolean;
  onDeleteQuestion?: () => void;
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
      <path d="M11.5781 5.64062H11.5831V5.64563H11.5781V5.64062Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.875 5.64062C11.875 5.71936 11.8437 5.79487 11.788 5.85055C11.7324 5.90622 11.6569 5.9375 11.5781 5.9375C11.4994 5.9375 11.4239 5.90622 11.3682 5.85055C11.3125 5.79487 11.2812 5.71936 11.2812 5.64062C11.2812 5.56189 11.3125 5.48638 11.3682 5.4307C11.4239 5.37503 11.4994 5.34375 11.5781 5.34375C11.6569 5.34375 11.7324 5.37503 11.788 5.4307C11.8437 5.48638 11.875 5.56189 11.875 5.64062ZM11.5781 9.49406H11.5841V9.5H11.5781V9.49406Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.875 9.5C11.875 9.57874 11.8437 9.65425 11.788 9.70992C11.7324 9.7656 11.6569 9.79688 11.5781 9.79688C11.4994 9.79688 11.4239 9.7656 11.3682 9.70992C11.3125 9.65425 11.2812 9.57874 11.2812 9.5C11.2812 9.42126 11.3125 9.34575 11.3682 9.29008C11.4239 9.2344 11.4994 9.20312 11.5781 9.20312C11.6569 9.20312 11.7324 9.2344 11.788 9.29008C11.8437 9.34575 11.875 9.42126 11.875 9.5ZM11.5781 13.3653H11.5841V13.3713H11.5781V13.3653Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.875 13.3594C11.875 13.4381 11.8437 13.5136 11.788 13.5693C11.7324 13.625 11.6569 13.6562 11.5781 13.6562C11.4994 13.6562 11.4239 13.625 11.3682 13.5693C11.3125 13.5136 11.2812 13.4381 11.2812 13.3594C11.2812 13.2806 11.3125 13.2051 11.3682 13.1495C11.4239 13.0938 11.4994 13.0625 11.5781 13.0625C11.6569 13.0625 11.7324 13.0938 11.788 13.1495C11.8437 13.2051 11.875 13.2806 11.875 13.3594ZM7.42188 5.64062H7.42781V5.64656H7.42188V5.64062Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.71875 5.64062C7.71875 5.71936 7.68747 5.79487 7.6318 5.85055C7.57612 5.90622 7.50061 5.9375 7.42188 5.9375C7.34314 5.9375 7.26763 5.90622 7.21195 5.85055C7.15628 5.79487 7.125 5.71936 7.125 5.64062C7.125 5.56189 7.15628 5.48638 7.21195 5.4307C7.26763 5.37503 7.34314 5.34375 7.42188 5.34375C7.50061 5.34375 7.57612 5.37503 7.6318 5.4307C7.68747 5.48638 7.71875 5.56189 7.71875 5.64062ZM7.42188 9.49406H7.42781V9.5H7.42188V9.49406Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.71875 9.5C7.71875 9.57874 7.68747 9.65425 7.6318 9.70992C7.57612 9.7656 7.50061 9.79688 7.42188 9.79688C7.34314 9.79688 7.26763 9.7656 7.21195 9.70992C7.15628 9.65425 7.125 9.57874 7.125 9.5C7.125 9.42126 7.15628 9.34575 7.21195 9.29008C7.26763 9.2344 7.34314 9.20312 7.42188 9.20312C7.50061 9.20312 7.57612 9.2344 7.6318 9.29008C7.68747 9.34575 7.71875 9.42126 7.71875 9.5ZM7.42188 13.3653H7.42781V13.3713H7.42188V13.3653Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.71875 13.3594C7.71875 13.4381 7.68747 13.5136 7.6318 13.5693C7.57612 13.625 7.50061 13.6562 7.42188 13.6562C7.34314 13.6562 7.26763 13.625 7.21195 13.5693C7.15628 13.5136 7.125 13.4381 7.125 13.3594C7.125 13.2806 7.15628 13.2051 7.21195 13.1495C7.26763 13.0938 7.34314 13.0625 7.42188 13.0625C7.50061 13.0625 7.57612 13.0938 7.6318 13.1495C7.68747 13.2051 7.71875 13.2806 7.71875 13.3594Z" stroke="#777777" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChecklistDeleteIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_6368_55609)">
        <path
          d="M7.29036 4.16146C7.29036 3.60892 7.50986 3.07902 7.90056 2.68832C8.29126 2.29762 8.82116 2.07813 9.3737 2.07812H15.6237C16.1762 2.07813 16.7061 2.29762 17.0968 2.68832C17.4875 3.07902 17.707 3.60892 17.707 4.16146V6.24479H21.8737C22.15 6.24479 22.4149 6.35454 22.6103 6.54989C22.8056 6.74524 22.9154 7.01019 22.9154 7.28646C22.9154 7.56273 22.8056 7.82768 22.6103 8.02303C22.4149 8.21838 22.15 8.32812 21.8737 8.32812H20.7602L19.857 20.976C19.8196 21.5016 19.5844 21.9936 19.1988 22.3527C18.8132 22.7118 18.3058 22.9115 17.7789 22.9115H7.21745C6.69051 22.9115 6.18314 22.7118 5.79754 22.3527C5.41193 21.9936 5.17674 21.5016 5.13932 20.976L4.23828 8.32812H3.1237C2.84743 8.32812 2.58248 8.21838 2.38713 8.02303C2.19178 7.82768 2.08203 7.56273 2.08203 7.28646C2.08203 7.01019 2.19178 6.74524 2.38713 6.54989C2.58248 6.35454 2.84743 6.24479 3.1237 6.24479H7.29036V4.16146ZM9.3737 6.24479H15.6237V4.16146H9.3737V6.24479ZM6.32578 8.32812L7.21849 20.8281H17.7799L18.6727 8.32812H6.32578ZM10.4154 10.4115C10.6916 10.4115 10.9566 10.5212 11.1519 10.7166C11.3473 10.9119 11.457 11.1769 11.457 11.4531V17.7031C11.457 17.9794 11.3473 18.2443 11.1519 18.4397C10.9566 18.635 10.6916 18.7448 10.4154 18.7448C10.1391 18.7448 9.87415 18.635 9.67879 18.4397C9.48344 18.2443 9.3737 17.9794 9.3737 17.7031V11.4531C9.3737 11.1769 9.48344 10.9119 9.67879 10.7166C9.87415 10.5212 10.1391 10.4115 10.4154 10.4115ZM14.582 10.4115C14.8583 10.4115 15.1233 10.5212 15.3186 10.7166C15.514 10.9119 15.6237 11.1769 15.6237 11.4531V17.7031C15.6237 17.9794 15.514 18.2443 15.3186 18.4397C15.1233 18.635 14.8583 18.7448 14.582 18.7448C14.3058 18.7448 14.0408 18.635 13.8455 18.4397C13.6501 18.2443 13.5404 17.9794 13.5404 17.7031V11.4531C13.5404 11.1769 13.6501 10.9119 13.8455 10.7166C14.0408 10.5212 14.3058 10.4115 14.582 10.4115Z"
          fill="#686868"
        />
      </g>
      <defs>
        <clipPath id="clip0_6368_55609">
          <rect width="25" height="25" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
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
  showDeleteAction = false,
  onDeleteQuestion,
}: QuestionSectionHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`${CHECKLIST_FORM_WIDTH_CLASS} ${CHECKLIST_QUESTION_ROW_CLASS}`}>
        <span className="flex w-[50px] shrink-0 items-center gap-2 text-sm font-semibold text-gray-900">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            aria-label={`Drag question ${index + 1}`}
            title="Drag to reorder"
            className="!h-auto !min-h-0 !border-0 !bg-transparent !p-0 !text-gray-300 hover:!bg-transparent hover:!text-gray-500 active:cursor-grabbing"
          >
            <ChecklistDragHandleIcon className="h-[19px] w-[19px]" />
          </Button>
          Q.{index + 1}
        </span>
        <TextInput
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="Enter Question"
          className="!h-9 !rounded-sm !border-gray-200 !px-2 !py-1 !text-sm"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        {showDeleteAction && onDeleteQuestion ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onDeleteQuestion}
            aria-label={`Delete question ${index + 1}`}
            className="!h-auto !min-h-0 !border-0 !bg-transparent !p-0 hover:!bg-transparent"
          >
            <ChecklistDeleteIcon className="h-[18px] w-[18px]" />
          </Button>
        ) : null}
        <button
          type="button"
          onClick={onToggleExpanded}
          className="text-gray-400 hover:text-gray-600"
          aria-label={isExpanded ? "Collapse question" : "Expand question"}
        >
          <ToggleIcon className={`h-[6px] w-[10px] transition-transform ${isExpanded ? "" : "rotate-180"}`} />
        </button>
      </div>
    </div>
  );
}

