import type React from "react";

interface CheckboxProps {
  label?: string;
  checked: boolean;
  className?: string;
  id?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  labelClassName?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  id,
  onChange,
  className = "",
  disabled = false,
  labelClassName = "",
}) => {
  return (
    <label
      className={`flex items-center space-x-3 group cursor-pointer ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      <div className="relative inline-flex h-5 w-5 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          className={`h-5 w-5 appearance-none cursor-pointer border disabled:opacity-60 ${
            checked
              ? disabled
                ? "border-[#E4E7EC] bg-[#E4E7EC]"
                : "border-transparent bg-[var(--color-secondary-500)]"
              : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
          } ${className}`}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        {checked && !disabled && (
          <svg
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="white"
              strokeWidth="1.94437"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {checked && disabled && (
          <svg
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="#E4E7EC"
              strokeWidth="2.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {label && (
        <span className={`text-sm font-medium text-gray-800 dark:text-gray-200 ${labelClassName}`}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
