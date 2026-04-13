import type { ComponentType } from "react";
import { CHECKLIST_FORM_WIDTH_CLASS } from "./layout";

interface QuestionSectionNameProps {
  sectionName: string;
  sectionTitle: string;
  onSectionTitleChange: (value: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  ToggleIcon: ComponentType<{ className?: string }>;
}

export default function QuestionSectionName({
  sectionName,
  sectionTitle,
  onSectionTitleChange,
  isExpanded,
  onToggleExpanded,
  ToggleIcon,
}: QuestionSectionNameProps) {
  return (
    <div className="border-b border-gray-200 px-3 py-2.5">
      <span className="mb-1 block text-[11px] font-medium text-[#64748B]">Section Name</span>
      <div className="flex items-center gap-2">
        <label
          className={`flex h-9 min-w-0 items-center rounded-sm border border-gray-200 bg-white px-3 ${CHECKLIST_FORM_WIDTH_CLASS}`}
        >
          <span className="shrink-0 text-sm font-semibold text-gray-900">{sectionName} :</span>
          <input
            type="text"
            value={sectionTitle}
            onChange={(event) => onSectionTitleChange(event.target.value)}
            placeholder="Enter Name"
            className="min-w-0 flex-1 border-0 bg-transparent px-1 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={onToggleExpanded}
          className="ml-auto shrink-0 text-gray-400 hover:text-gray-600"
          aria-label={isExpanded ? "Collapse section" : "Expand section"}
        >
          <ToggleIcon className={`transition-transform ${isExpanded ? "" : "rotate-180"}`} />
        </button>
      </div>
    </div>
  );
}

