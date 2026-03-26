import { useEffect, useState } from "react";
import ToggleSwitch from "../toggle/ToggleSwitch";
import Popup from "../popup/Popup";
import {
  CheckLineIcon,
  GripDotsIcon,
  TrashBinIcon,
  VerticalDots,
} from "../../../icons";
import type { JobInfoQuestion, JobInfoQuestionType } from "../../../types/jobInformation";

interface JobInformationQuestionCardProps {
  index: number;
  question: JobInfoQuestion;
  onChange: (question: JobInfoQuestion) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const typeOptions: Array<{ id: JobInfoQuestionType; label: string }> = [
  { id: "choice", label: "Choice" },
  { id: "checkbox", label: "Checkbox" },
];

const createOptionId = () =>
  `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export default function JobInformationQuestionCard({
  index,
  question,
  onChange,
  onDelete,
  onDuplicate,
}: JobInformationQuestionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const showTypeSelector = question.options.length === 0;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".job-info-question-menu")) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const updateOptionLabel = (optionId: string, value: string) => {
    onChange({
      ...question,
      options: question.options.map((option) =>
        option.id === optionId ? { ...option, label: value } : option
      ),
    });
  };

  const handleAddOption = () => {
    onChange({
      ...question,
      options: [
        ...question.options,
        { id: createOptionId(), label: `Option ${question.options.length + 1}` },
      ],
    });
  };

  const handleRemoveOption = (optionId: string) => {
    onChange({
      ...question,
      options: question.options.filter((option) => option.id !== optionId),
    });
  };

  const handleTypeSelect = (type: JobInfoQuestionType) => {
    if (question.options.length === 0) {
      onChange({
        ...question,
        type,
        options: [{ id: createOptionId(), label: "Option 1" }],
      });
      return;
    }
    onChange({
      ...question,
      type,
    });
  };

  const menuItems = [
    {
      id: "duplicate",
      label: "Duplicate",
      onClick: () => {
        onDuplicate();
        setMenuOpen(false);
      },
    },
  ];

  const optionIndicator =
    question.type === "choice"
      ? "rounded-full border border-gray-300 h-4 w-4"
      : "rounded border border-gray-300 h-4 w-4";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <span className="cursor-grab rounded p-1 text-gray-400">
            <GripDotsIcon className="h-4 w-4" />
          </span>
          <span className="text-xs font-semibold text-gray-400">
            Q.{index + 1}
          </span>
          <input
            value={question.text}
            onChange={(event) =>
              onChange({ ...question, text: event.target.value })
            }
            placeholder="Enter question"
            className="w-full max-w-xl border-b border-gray-200 px-1 pb-1 text-sm text-gray-700 focus:border-[#007B8C] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full p-1 text-gray-400 hover:text-[#F25C54]"
            aria-label="Delete question"
          >
            <TrashBinIcon className="h-4 w-4" />
          </button>
          <div className="job-info-question-menu relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-full p-1 text-gray-400 hover:text-gray-600"
              aria-label="More options"
            >
              <VerticalDots className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-full z-20 mt-2">
                <Popup items={menuItems} className="!min-w-[160px] rounded-lg" />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showTypeSelector ? (
        <div className="mt-4 flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-500">Type</span>
          <div className="flex flex-col gap-2">
            {typeOptions.map((option) => {
              const isActive = question.type === option.id;
              const indicator =
                option.id === "choice" ? (
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                      isActive ? "border-black" : "border-gray-300"
                    }`}
                  >
                    {isActive ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-black" />
                    ) : null}
                  </span>
                ) : (
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                      isActive ? "border-black bg-black" : "border-gray-300"
                    }`}
                  >
                    {isActive ? (
                      <CheckLineIcon className="h-3 w-3 text-white" />
                    ) : null}
                  </span>
                );
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleTypeSelect(option.id)}
                  className={`flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold transition ${
                    isActive
                      ? "border-[#F25C54] bg-[#F25C54]/10 text-[#F25C54]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {indicator}
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {question.options.map((option) => (
            <div
              key={option.id}
              className="flex items-center gap-2 rounded-md border border-gray-100 px-2 py-2"
            >
              <span className={optionIndicator} />
              <input
                value={option.label}
                onChange={(event) => updateOptionLabel(option.id, event.target.value)}
                placeholder="Option"
                className="w-full max-w-[240px] bg-transparent text-sm text-gray-700 outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveOption(option.id)}
                className="shrink-0 rounded-full p-1 text-gray-400 hover:text-[#F25C54]"
                aria-label="Remove option"
              >
                <TrashBinIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="text-xs font-semibold text-[#F25C54] hover:text-[#E34A41]"
          >
            + Add option
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end">
        <ToggleSwitch
          checked={question.required}
          onChange={(checked) => onChange({ ...question, required: checked })}
          showLabel={false}
          size="sm"
        />
        <span className="ml-2 text-xs text-gray-400">Required</span>
      </div>
    </div>
  );
}
