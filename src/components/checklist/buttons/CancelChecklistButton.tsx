import Button from "../../ui/button/Button";

interface CancelChecklistButtonProps {
  onClick: () => void;
}

export default function CancelChecklistButton({ onClick }: CancelChecklistButtonProps) {
  return (
    <Button
      size="sm"
      variant="orangebutton"
      className="!rounded-sm !px-6 !py-1.5 !text-xs"
      onClick={onClick}
    >
      Cancel
    </Button>
  );
}

