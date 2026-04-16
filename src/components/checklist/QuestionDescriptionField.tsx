import { CHECKLIST_FORM_WIDTH_CLASS, CHECKLIST_QUESTION_ROW_CLASS } from "./layout";

interface QuestionDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function QuestionDescriptionField({
  value,
  onChange,
}: QuestionDescriptionFieldProps) {
  return (
    <div className={`${CHECKLIST_FORM_WIDTH_CLASS} ${CHECKLIST_QUESTION_ROW_CLASS}`}>
      <span />
      <label className="block min-w-0 space-y-1">
        <span className="text-sm font-semibold text-gray-900">Description</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter Summary"
          className="min-h-[52px] w-full resize-none rounded-sm border border-gray-200 px-2 py-1 text-sm text-gray-700 outline-none focus:border-[#007B8C]"
        />
      </label>
    </div>
  );
}

