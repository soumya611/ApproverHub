import Button from "../../ui/button/Button";

interface CreateChecklistButtonProps {
  onClick?: () => void;
}

export default function CreateChecklistButton({ onClick }: CreateChecklistButtonProps) {
  return (
    <Button
      size="sm"
      variant="primary"
      className="!rounded-sm !px-6 !py-1.5 !text-xs"
      onClick={onClick}
    >
      Create
    </Button>
  );
}

