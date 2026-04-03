import type { ReactNode } from "react";

interface PageContentContainerProps {
  children: ReactNode;
  /** Optional extra class for the inner content */
  className?: string;
}

/**
 * Reusable main content area: white, rounded, elevated panel.
 * Use for Jobs and other pages that share the sidebar + main layout.
 */
export default function PageContentContainer({ children, className = "" }: PageContentContainerProps) {
  return (
    <div
      className={`custom-scrollbar flex h-full min-h-0 flex-1 flex-col rounded-xl bg-white shadow-[2px_4px_10px_0px_#0000000F] overflow-x-hidden overflow-y-auto ${className}`}
    >
      {children}
    </div>
  );
}
