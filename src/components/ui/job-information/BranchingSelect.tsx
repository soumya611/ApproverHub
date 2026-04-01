import type { ChangeEvent } from "react";
import { ChevronDownIcon } from "../../../icons";

export type BranchingSelectOption = {
  value: string;
  label: string;
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
  "h-9 w-full appearance-none rounded border border-gray-200 bg-white pr-8 text-xs font-semibold";
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
  const badgeClassName =
    badgeVariant === "outline"
      ? outlineBadgeClassName
      : badgeVariant === "plain"
        ? plainBadgeClassName
        : filledBadgeClassName;

  return (
    <div className={`relative ${fullWidth ? "flex-1" : ""} ${className}`}>
      {badgeText ? <span className={badgeClassName}>{badgeText}</span> : null}
      <select
        value={value}
        onChange={handleSelectChange(onChange)}
        disabled={disabled}
        className={`${taggedBaseClassName} ${badgeText ? "pl-14" : "pl-3"}`}
      >
        {emptyOptionLabel !== undefined ? (
          <option value="">{emptyOptionLabel}</option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
    </div>
  );
}
