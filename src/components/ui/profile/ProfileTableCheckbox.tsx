import type { InputHTMLAttributes } from "react";

export const PROFILE_TABLE_CHECKBOX_CLASS =
  "columns-checkbox !bg-gray-200 !border-none h-4 w-4 rounded-sm";

interface ProfileTableCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  wrapperClassName?: string;
  inputClassName?: string;
}

export default function ProfileTableCheckbox({
  label,
  wrapperClassName = "",
  inputClassName = "",
  ...props
}: ProfileTableCheckboxProps) {
  const input = (
    <input
      type="checkbox"
      className={`${PROFILE_TABLE_CHECKBOX_CLASS} ${inputClassName}`}
      {...props}
    />
  );

  if (!label) {
    return input;
  }

  return (
    <label className={`inline-flex items-center gap-2 text-sm font-medium text-gray-700 ${wrapperClassName}`}>
      {input}
      {label}
    </label>
  );
}

