import type { ButtonHTMLAttributes } from "react";
import Button from "../button/Button";
import { CloseIcon } from "../../../icons";

export type SelectedItemAction = {
  id: string;
  label: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  disabled?: boolean;
};

interface SelectedItemProps {
  selectedCount: number;
  actions?: SelectedItemAction[];
  onClose?: () => void;
  className?: string;
  actionButtonClassName?: string;
  selectedCountClassName?: string;
}

const defaultActions: SelectedItemAction[] = [
  { id: "duplicate", label: "Duplicate" },
  { id: "hold", label: "Hold" },
  { id: "archive", label: "Archive" },
  { id: "export", label: "Export" },
  { id: "pin", label: "Pin" },
];

export default function SelectedItem({
  selectedCount,
  actions = defaultActions,
  onClose,
  className = "",
  actionButtonClassName = "",
  selectedCountClassName = "text-[var(--color-secondary-500)]",
}: SelectedItemProps) {
  return (
    <div
      className={`inline-flex w-fit max-w-full items-center gap-4 px-4 py-3 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className={`font-semibold ${selectedCountClassName}`}>
          {selectedCount} Selected
        </span>
        {actions.map((action, index) => (
          <div key={action.id} className="flex items-center gap-4">
            {index === 0 ? null : <span className="h-4 w-px bg-gray-200" />}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={action.onClick}
              disabled={action.disabled}
              className={`!border-0 !bg-transparent !px-0 !py-0 text-sm font-medium text-gray-700 hover:!bg-transparent ${actionButtonClassName}`}
            >
              {action.label}
            </Button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-gray-400 transition hover:text-gray-600"
        aria-label="Clear selection"
      >
        <CloseIcon />
      </button>
    </div>
  );
}
