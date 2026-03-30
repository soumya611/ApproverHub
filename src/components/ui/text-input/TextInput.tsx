import type { InputHTMLAttributes, ReactNode } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export default function TextInput({
  label,
  hint,
  containerClassName = "",
  labelClassName = "",
  inputClassName = "",
  className = "",
  ...props
}: TextInputProps) {
  return (
    <label className={`flex w-full flex-col gap-2 ${containerClassName}`}>
      {label ? (
        <span className={`text-sm font-medium text-gray-700 ${labelClassName}`}>
          {label}
        </span>
      ) : null}
      <input
        className={`h-11 w-full rounded-sm border border-gray-300 bg-transparent px-4 py-2.5 text-sm font-normal text-gray-800 shadow-theme-xs placeholder:text-gray-400 placeholder:font-semibold focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${className} ${inputClassName}`}
        {...props}
      />
      {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
    </label>
  );
}
