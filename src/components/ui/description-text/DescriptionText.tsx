import type { ReactNode } from "react";

interface DescriptionTextProps {
  label?: ReactNode;
  text: ReactNode;
  className?: string;
  labelClassName?: string;
  textClassName?: string;
}

export default function DescriptionText({
  label = "Text:",
  text,
  className = "",
  labelClassName = "text-gray-500 font-medium",
  textClassName = "text-gray-600",
}: DescriptionTextProps) {
  const showLabel = Boolean(label);

  return (
    <p className={`text-sm ${className}`}>
      {showLabel ? <span className={labelClassName}>{label} </span> : null}
      <span className={textClassName}>{text}</span>
    </p>
  );
}
