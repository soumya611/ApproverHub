import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "sm" | "md" | "tiny";
  variant?:
  | "primary"
  | "outline"
  | "secondary"
  | "orangebutton"
  | "passbutton"
  | "failbutton"
  | "status";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  layout?: "inline" | "stacked"; // for top icon
  color?: string; // hex or css color (for text/icon)
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  layout = "inline",
  color = "#C6A500",
  className = "",
  disabled = false,
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3.5 text-sm",
    tiny: "w-[70px] h-[25px] text-[13px] p-0",
  };

  // Variant classes
  const variantClasses = {
    primary:
      "bg-[var(--color-secondary-500)] text-white shadow-theme-xs hover:bg-[var(--color-secondary-600)] disabled:bg-[var(--color-secondary-500)] rounded-[15px]",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
    secondary:
      "bg-[#FFFFFF] text-[#333333] border border-[#D5D5D5] rounded-[7px] hover:bg-gray-50",
    orangebutton:
      "bg-[#FFE6E1] text-[var(--color-secondary-500)] border border-[var(--color-secondary-500)] rounded-[7px] text-[16px]",
    passbutton:
      "bg-white text-[#5EBDB2] border border-[#E5E5E5] rounded-[22px] transition-colors",
    failbutton:
      "bg-white text-[#FF8D7D] border border-[#E5E5E5] rounded-[22px] transition-colors",
    status: `text-[${color}] rounded-[7px] p-8 text-center flex flex-col items-center justify-center`,
  };

  const layoutClasses =
    layout === "stacked"
      ? "flex flex-col items-center justify-center space-y-2"
      : "inline-flex items-center justify-center gap-2";

  return (
    <button
      className={`transition ${layoutClasses} ${sizeClasses[size]} ${variantClasses[variant]
        } ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {startIcon && (
        <span className="inline-flex items-center justify-center leading-none">
          {startIcon}
        </span>
      )}
      <span className="inline-flex items-center leading-none">{children}</span>
      {endIcon && (
        <span className="inline-flex items-center justify-center leading-none">
          {endIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
