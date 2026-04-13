import TextInput from "../ui/text-input/TextInput";
import { CHECKLIST_FORM_WIDTH_CLASS } from "./layout";

interface ChecklistTopFieldsProps {
  checklistName: string;
  checklistDescription: string;
  onChecklistNameChange: (value: string) => void;
  onChecklistDescriptionChange: (value: string) => void;
}

export default function ChecklistTopFields({
  checklistName,
  checklistDescription,
  onChecklistNameChange,
  onChecklistDescriptionChange,
}: ChecklistTopFieldsProps) {
  return (
    <div className={`${CHECKLIST_FORM_WIDTH_CLASS} space-y-3`}>
      <div className="space-y-1">
        <TextInput
          label="Checklist Name"
          value={checklistName}
          onChange={(event) => onChecklistNameChange(event.target.value)}
          placeholder="Untitled"
          labelClassName="text-[11px] font-medium text-[#64748B]"
          className="!h-8 !rounded-sm !border-gray-200 !px-2.5 !py-1.5 !text-sm !font-semibold !text-[#007B8C] placeholder:!font-semibold placeholder:!text-[#007B8C] focus:!border-[#007B8C] focus:!ring-0"
        />
        <div className="text-right text-xs text-[#64748B]">Created on :</div>
      </div>

      <label className="flex w-full flex-col gap-1">
        <span className="text-[11px] font-medium text-[#64748B]">Checklist Description</span>
        <textarea
          value={checklistDescription}
          onChange={(event) => onChecklistDescriptionChange(event.target.value)}
          placeholder="Enter"
          className="min-h-[68px] w-full resize-none rounded-sm border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-[#007B8C]"
        />
      </label>
    </div>
  );
}

