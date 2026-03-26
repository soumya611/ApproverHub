import type React from "react";
import { useEffect, useRef, useState } from "react";
import {  ChevronDownIcon  } from "../../../icons";

export interface FilterDropdownOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  id?: string;
  label?: string;
  value: string;
  options: FilterDropdownOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  id,
  label,
  value,
  options,
  placeholder = "Select",
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <label className={`flex w-full flex-col gap-1 text-xs ${className}`}>
      {label && <span className="text-[11px] text-gray-500">{label}</span>}
      <div ref={dropdownRef} className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-8 w-full items-center justify-between  border border-gray-200 bg-white px-2.5 pr-2 text-[11px] text-gray-700 shadow-sm"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={selectedOption ? "" : "text-gray-400"}>
            {selectedOption?.label ?? placeholder}
          </span>
        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </button>

        {isOpen && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 w-full  border border-gray-200 bg-white  text-[11px] text-gray-700 shadow-sm"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center border border-gray-200 px-2.5 py-1.5 text-left transition hover:bg-gray-50 ${
                      isSelected ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </label>
  );
};

export default FilterDropdown;
