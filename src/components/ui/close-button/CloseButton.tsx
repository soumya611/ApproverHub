import type { ButtonHTMLAttributes } from "react";

interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
  iconClassName?: string;
}

export default function CloseButton({
  size = "md",
  iconClassName = "",
  className = "",
  ...props
}: CloseButtonProps) {
  const sizeClasses = size === "sm" ? "h-7 w-7" : "h-8 w-8";

  return (
    <button
      type="button"
      aria-label="Close"
      className={`flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ${sizeClasses} ${className}`}
      {...props}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={iconClassName}>
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  );
}
