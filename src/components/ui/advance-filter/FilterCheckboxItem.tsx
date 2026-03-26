import type React from "react";
import type { ReactNode } from "react";

interface FilterCheckboxItemProps {
  id?: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  startIcon?: ReactNode;
  startIconClassName?: string;
  checkboxClassName?: string;
  disabled?: boolean;
}

const FilterCheckboxItem: React.FC<FilterCheckboxItemProps> = ({
  id,
  label,
  checked,
  onChange,
  className = "",
  startIcon,
  startIconClassName = "",
  checkboxClassName = "",
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm transition hover:border-gray-300 ${
        disabled ? "cursor-not-allowed opacity-60 hover:border-gray-200" : ""
      } ${className}`}
    >
      {startIcon && (
        <span className={`inline-flex items-center ${startIconClassName}`}>
          {startIcon}
        </span>
      )}
      <input
        id={id}
        type="checkbox"
        className={`h-3.5 w-3.5 rounded border-gray-300 text-[var(--color-secondary-500)] focus:ring-[var(--color-secondary-500)] ${checkboxClassName}`}
        checked={checked}
        disabled={disabled}
        onChange={(event) => {
          if (disabled) return;
          onChange(event.target.checked);
        }}
      />
      <span className="truncate">{label}</span>
    </label>
  );
};

export default FilterCheckboxItem;
