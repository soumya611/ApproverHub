import Button from "../../ui/button/Button";
import { UploadIcon } from "../../../icons";

export default function UploadChecklistButton() {
  return (
    <Button
      size="sm"
      variant="secondary"
      className="!rounded-sm !px-3 !py-1.5 !text-xs"
      startIcon={<UploadIcon className="h-3.5 w-3.5" />}
    >
      Upload Checklist
    </Button>
  );
}

