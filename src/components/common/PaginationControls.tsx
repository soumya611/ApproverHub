import { useEffect, useRef, useState } from "react";
import { AngleLeftIcon, AngleRightIcon } from "../../icons";
import Popup, { type PopupItem } from "../ui/popup/Popup";
import ItemsCountSummary from "./ItemsCountSummary";

interface PaginationControlsProps {
  total: number;
  from: number;
  to: number;
  label: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

export default function PaginationControls({
  total,
  from,
  to,
  label,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  pageSize,
  pageSizeOptions = [],
  onPageSizeChange,
  className = "",
}: PaginationControlsProps) {
  const [isRowsMenuOpen, setIsRowsMenuOpen] = useState(false);
  const rowsMenuRef = useRef<HTMLDivElement | null>(null);
  const baseButtonClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-md transition";
  const canManageRows =
    typeof onPageSizeChange === "function" &&
    pageSizeOptions.length > 0 &&
    typeof pageSize === "number";

  useEffect(() => {
    if (!isRowsMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (rowsMenuRef.current && !rowsMenuRef.current.contains(target)) {
        setIsRowsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isRowsMenuOpen]);

  const rowsMenuItems: PopupItem[] = pageSizeOptions.map((size) => ({
    id: `rows-${size}`,
    label: `${size} Rows`,
    onClick: () => {
      onPageSizeChange?.(size);
      setIsRowsMenuOpen(false);
    },
  }));

  return (
    <div className={`mt-4 flex items-center justify-end gap-3 ${className}`}>
      <div ref={rowsMenuRef} className="relative">
        {canManageRows ? (
          <button
            type="button"
            onClick={() => setIsRowsMenuOpen((previous) => !previous)}
            className="rounded-md px-1 text-left transition hover:text-gray-700"
            aria-label="Select rows per page"
            aria-expanded={isRowsMenuOpen}
          >
            <ItemsCountSummary total={total} from={from} to={to} label={label} />
          </button>
        ) : (
          <ItemsCountSummary total={total} from={from} to={to} label={label} />
        )}

        {canManageRows && isRowsMenuOpen ? (
          <div className="absolute right-0 top-full z-40 mt-2">
            <Popup items={rowsMenuItems} className="!min-w-[130px] rounded-sm" />
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`${baseButtonClass} ${
            canGoPrevious
              ? "bg-white text-gray-600 hover:bg-gray-50"
              : "cursor-not-allowed bg-gray-50 text-gray-300"
          }`}
          aria-label="Previous page"
        >
          <AngleLeftIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className={`${baseButtonClass} ${
            canGoNext
              ? "bg-white text-gray-600 hover:bg-gray-50"
              : "cursor-not-allowed bg-gray-50 text-gray-300"
          }`}
          aria-label="Next page"
        >
          <AngleRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
