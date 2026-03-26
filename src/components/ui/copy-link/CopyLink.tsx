import type { ButtonHTMLAttributes } from "react";
import { CopyLinkIcon } from "../../../icons";

interface CopyLinkProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  iconClassName?: string;
  textClassName?: string;
}

export default function CopyLink({
  label = "Copy link",
  iconClassName = "",
  textClassName = "",
  className = "",
  type = "button",
  ...props
}: CopyLinkProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center gap-2 text-sm font-semibold text-[#007B8C] transition hover:text-[#006070] ${className}`}
      {...props}
    >
      <CopyLinkIcon className={`h-4 w-4 ${iconClassName}`} />
      <span className={textClassName}>{label}</span>
    </button>
  );
}
