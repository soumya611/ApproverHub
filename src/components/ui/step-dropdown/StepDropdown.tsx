import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "../../../icons";

export interface StepDropdownStep {
  id: string;
  content: ReactNode;
}

interface StepDropdownProps {
  title: string;
  steps: StepDropdownStep[];
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonClassName?: string;
  backLabel?: string;
  showBackButton?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultStepIndex?: number;
  stepIndex?: number;
  onStepChange?: (stepIndex: number) => void;
  resetStepOnClose?: boolean;
}

export default function StepDropdown({
  title,
  steps,
  className = "",
  headerClassName = "",
  contentClassName = "",
  footerClassName = "",
  backButtonClassName = "",
  backLabel = "Back",
  showBackButton = true,
  defaultOpen = false,
  open,
  onOpenChange,
  defaultStepIndex = 0,
  stepIndex,
  onStepChange,
  resetStepOnClose = false,
}: StepDropdownProps) {
  const contentId = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalStepIndex, setInternalStepIndex] = useState(defaultStepIndex);
  const isOpenControlled = typeof open === "boolean";
  const isStepControlled = typeof stepIndex === "number";

  const isOpen = isOpenControlled ? open : internalOpen;
  const rawStepIndex = isStepControlled ? stepIndex : internalStepIndex;
  const maxStepIndex = Math.max(steps.length - 1, 0);
  const resolvedStepIndex = Math.min(Math.max(rawStepIndex, 0), maxStepIndex);

  useEffect(() => {
    if (!isStepControlled) {
      setInternalStepIndex((prev) => Math.min(Math.max(prev, 0), maxStepIndex));
    }
  }, [isStepControlled, maxStepIndex]);

  const setStepIndex = (nextIndex: number) => {
    const clamped = Math.min(Math.max(nextIndex, 0), maxStepIndex);
    if (!isStepControlled) {
      setInternalStepIndex(clamped);
    }
    onStepChange?.(clamped);
  };

  const setOpenState = (nextOpen: boolean) => {
    if (!isOpenControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
    if (!nextOpen && resetStepOnClose) {
      setStepIndex(0);
    }
  };

  const handleToggle = () => {
    setOpenState(!isOpen);
  };

  const currentStep = steps[resolvedStepIndex];
  const shouldShowBack =
    showBackButton && isOpen && steps.length > 0 && resolvedStepIndex > 0;

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      <button
        type="button"
        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-900 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${headerClassName}`}
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={handleToggle}
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </button>

      {isOpen && currentStep ? (
        <div
          id={contentId}
          role="region"
          aria-label={`${title} details`}
          className={`border-t border-gray-200 px-4 pb-4 pt-3 ${contentClassName}`}
        >
          {currentStep.content}
          {shouldShowBack ? (
            <div className={`mt-4 flex items-center justify-center ${footerClassName}`}>
              <button
                type="button"
                onClick={() => setStepIndex(resolvedStepIndex - 1)}
                className={`text-xs font-medium text-gray-400 transition hover:text-gray-600 ${backButtonClassName}`}
              >
                {backLabel}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
