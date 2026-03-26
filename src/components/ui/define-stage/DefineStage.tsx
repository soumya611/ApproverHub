import { useState } from "react";
import PopupModal from "../popup-modal/PopupModal";
import Button from "../button/Button";
import Select from "../../form/Select";
import Label from "../../form/Label";
import { ChevronDownIcon } from "../../../icons";

type StageOption = {
  value: string;
  label: string;
};

interface DefineStageProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  stageCode?: string;
  stageName?: string;
  stageOptions?: StageOption[];
  defaultStage?: string;
  onSave?: (stage: string) => void;
  closeOnSave?: boolean;
  className?: string;
}

interface StagePreviewInputProps {
  stageCode: string;
  stageName: string;
  className?: string;
}

const defaultStageOptions: StageOption[] = [
  { value: "s1", label: "S1 - Marketing" },
  { value: "s2", label: "S2 - Marketing" },
  { value: "s3", label: "S3 - Sales" },
];

function StagePreviewInput({
  stageCode,
  stageName,
  className = "",
}: StagePreviewInputProps) {
  return (
    <div
      className={`flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-[#F3F3F3] px-3 py-2.5 ${className}`}
      role="textbox"
      aria-label={`${stageCode} ${stageName}`}
      aria-readonly="true"
    >
      <span className="rounded-[4px] bg-gray-200 px-2 py-0.5 text-[11px] font-semibold shadow-sm">
        {stageCode}
      </span>
      <span className="text-[13px] font-medium">{stageName}</span>
    </div>
  );
}

export default function DefineStage({
  isOpen,
  onClose,
  title = "Define stage",
  description = "New version uploaded onstage",
  stageCode = "S2",
  stageName = "Marketing",
  stageOptions = defaultStageOptions,
  defaultStage = "",
  onSave,
  closeOnSave = true,
  className = "",
}: DefineStageProps) {
  const [selectedStage, setSelectedStage] = useState(defaultStage);

  const handleSave = () => {
    onSave?.(selectedStage);
    if (closeOnSave) {
      onClose();
    }
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      className={`!max-w-[520px] rounded-xl ${className}`}
      contentClassName="!p-5"
      titleClassName="!text-[15px] !font-bold !text-[var(--color-brand-teal)]"
    >
      <div className="space-y-3">
        <p className="text-[14px] !font-bold text-gray-700">{description}</p>

        <StagePreviewInput stageCode={stageCode} stageName={stageName} />

        <div className="space-y-1.5">
          <Label className="!text-[14px] !font-bold">
            Select stage to start review
          </Label>
          <div className="relative">
            <Select
              options={stageOptions}
              placeholder="Select Stage"
              onChange={setSelectedStage}
              defaultValue={selectedStage}
              className="!h-9 !bg-[#F3F3F3] !text-[12px] !font-normal !pr-9"
            />
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-teal" />
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={onClose}
          className="!rounded-[7px] !px-4 !py-2 !text-[12px]"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={handleSave}
          className="!rounded-[7px] !px-4 !py-2 !text-[12px]"
        >
          Save
        </Button>
      </div>
    </PopupModal>
  );
}
