import type { ChangeEvent } from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  trackClassName?: string;
  thumbClassName?: string;
  size?: "sm" | "md";
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  showLabel = true,
  disabled = false,
  className = "",
  labelClassName = "",
  trackClassName = "",
  thumbClassName = "",
  size = "md",
}: ToggleSwitchProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange(event.target.checked);
  };

  const trackSize =
    size === "sm" ? "h-4 w-8" : "h-5 w-10";
  const knobSize =
    size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const knobTranslate =
    size === "sm" ? "peer-checked:translate-x-4" : "peer-checked:translate-x-5";

  return (
    <label className={`inline-flex items-center gap-2 ${disabled ? "opacity-60" : ""} ${className}`}>
      {showLabel && label && (
        <span className={`text-sm text-gray-dark ${labelClassName}`}>
          {label}
        </span>
      )}
      <span className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="peer sr-only"
          aria-checked={checked}
          role="switch"
        />
        <span
          className={`relative ${trackSize} rounded-full bg-gray-300 transition-colors peer-checked:bg-[var(--color-brand-teal)] ${trackClassName}`}
        />
        <span
          className={`absolute left-0.5 top-1/2 -translate-y-1/2 ${knobSize} rounded-full bg-white shadow transition-transform ${knobTranslate} ${thumbClassName}`}
        />
      </span>
    </label>
  );
}
