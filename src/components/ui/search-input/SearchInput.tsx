import type { InputHTMLAttributes, ReactNode } from "react";
import { Search } from "../../../icons";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  icon?: ReactNode;
  iconSize?: string;
}

export default function SearchInput({
  containerClassName = "",
  inputClassName = "",
  iconClassName = "-disabled-text",
  icon,
  iconSize,
  className = "",
  ...props
}: SearchInputProps) {
  return (
    <div className={`flex items-center gap-2   ${containerClassName}`}>
      <span className={iconClassName}>
        {icon ?? (
        < Search className={`h-6 w-6 text-disabled-text ${iconSize}`} />
        )}
      </span>
      <input
        type="text"
        className={`w-full bg-transparent text-lg text-disabled-text placeholder:text-gray-400 focus:outline-none ${className} ${inputClassName}`}
        {...props}
      />
    </div>
  );
}
