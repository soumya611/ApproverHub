import type { ReactNode } from "react";

interface PopupTitleProps {
  children: ReactNode;
  colorClassName?: string;
  sizeClassName?: string;
  weightClassName?: string;
  alignClassName?: string;
  className?: string;
}

export default function PopupTitle({
  children,
  colorClassName = "text-[var(--color-brand-teal)]",
  sizeClassName = "text-[22px]",
  weightClassName = "font-semibold",
  alignClassName = "",
  className = "",
}: PopupTitleProps) {
  return (
    <h2 className={`${sizeClassName} ${weightClassName} ${colorClassName} ${alignClassName} ${className}`}>
      {children}
    </h2>
  );
}
