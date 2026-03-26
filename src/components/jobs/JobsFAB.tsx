import { PlusIcon } from "../../icons";

interface JobsFABProps {
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
}

export default function JobsFAB({
  onClick,
  ariaLabel = "Add new",
  className = "",
  iconClassName = "",
}: JobsFABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-secondary-500)] text-white shadow-lg hover:bg-[var(--color-secondary-600)] transition-colors z-40 ${className}`}
      aria-label={ariaLabel}
    >
      <PlusIcon className={`h-7 w-7 ${iconClassName}`} />
    </button>
  );
}
