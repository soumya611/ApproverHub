import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { ChevronDownIcon } from "../../../icons";

export type BranchingSelectOption = {
  value: string;
  label: string;
  selectedLabel?: string;
};

interface BranchingOperatorSelectProps {
  value: string;
  options: BranchingSelectOption[];
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

interface BranchingTaggedSelectProps {
  value: string;
  options: BranchingSelectOption[];
  onChange?: (value: string) => void;
  badgeText?: string;
  badgeVariant?: "filled" | "outline" | "plain";
  emptyOptionLabel?: string;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

const operatorBaseClassName =
  "h-9 w-[66px] appearance-none rounded border border-gray-200 bg-white pl-3 pr-8 text-left text-xs font-semibold text-gray-800";
const taggedBaseClassName =
  "h-9 w-full appearance-none rounded border border-gray-200 bg-white pr-8 p-2 text-xs font-semibold";
const filledBadgeClassName =
  "pointer-events-none absolute left-2 top-1/2 -translate-y-1/2  bg-[#FFF2EE] px-1.5 py-0.5 text-[12px] font-semibold text-secondary-300";
const plainBadgeClassName =
  "pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-secondary-300";
const outlineBadgeClassName =
  "pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 border border-secondary-300 px-2 py-0.2 text-[12px] font-semibold text-secondary-300";

const handleSelectChange =
  (onChange?: (value: string) => void) => (event: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event.target.value);
  };

export function BranchingOperatorSelect({
  value,
  options,
  onChange,
  className = "",
  disabled = false,
}: BranchingOperatorSelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={handleSelectChange(onChange)}
        disabled={disabled}
        className={operatorBaseClassName}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
    </div>
  );
}

export function BranchingTaggedSelect({
  value,
  options,
  onChange,
  badgeText,
  badgeVariant = "filled",
  emptyOptionLabel,
  className = "",
  disabled = false,
  fullWidth = true,
}: BranchingTaggedSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const badgeClassName =
    badgeVariant === "outline"
      ? outlineBadgeClassName
      : badgeVariant === "plain"
        ? plainBadgeClassName
        : filledBadgeClassName;

  const selectedOption = options.find((option) => option.value === value);
  const selectedLabel = useMemo(() => {
    if (selectedOption) {
      return selectedOption.selectedLabel ?? selectedOption.label;
    }
    if (value === "" && emptyOptionLabel !== undefined) return emptyOptionLabel;
    return "";
  }, [selectedOption, value, emptyOptionLabel]);
  const selectedTextLeftClass = badgeText ? "left-14" : "left-3";
  const menuOptions = useMemo(
    () =>
      emptyOptionLabel !== undefined
        ? [{ value: "", label: emptyOptionLabel }, ...options]
        : options,
    [emptyOptionLabel, options]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!wrapperRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const handleOptionSelect = (nextValue: string) => {
    onChange?.(nextValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative ${fullWidth ? "flex-1" : ""} ${className}`}
    >
      {badgeText ? <span className={badgeClassName}>{badgeText}</span> : null}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={`${taggedBaseClassName} ${badgeText ? "pl-14" : "pl-3"} text-left ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span
          className={`absolute ${selectedTextLeftClass} right-8 top-1/2 -translate-y-1/2 truncate text-xs font-semibold text-gray-800`}
        >
          {selectedLabel}
        </span>
      </button>
      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-auto rounded border border-gray-200 bg-white py-1 shadow-sm">
          {menuOptions.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                className={`block w-full px-3 py-1.5 text-left text-xs font-semibold ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
                onClick={() => handleOptionSelect(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
      <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
    </div>
  );
}
