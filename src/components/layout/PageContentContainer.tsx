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
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
