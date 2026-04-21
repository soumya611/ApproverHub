import { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { DropDownArrowIcon } from "@/icons";

interface BuilderSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
  selectClassName?: string;
}

export default function BuilderSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  selectClassName = "",
}: BuilderSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? placeholder ?? "Select";

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`dropdown-toggle flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-left focus:border-[#007B8C] focus:outline-none ${selectClassName}`}
      >
        <span className={`truncate text-sm font-medium ${value ? "text-gray-700" : "text-gray-400"}`}>
          {selectedLabel}
        </span>
        <DropDownArrowIcon
          className={`h-3 w-3 shrink-0 text-[#808080] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="left-0 right-auto w-full py-1 mt-1 max-h-[300px] overflow-y-auto"
      >
        {options.map((option) => (
          <DropdownItem
            key={option.value}
            onClick={() => { onChange(option.value); setIsOpen(false); }}
            baseClassName={`block w-full text-left px-4 py-2 text-sm transition hover:bg-gray-50 ${value === option.value ? "font-semibold text-[#007B8C]" : "text-gray-700"
              }`}
          >
            {option.label}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}