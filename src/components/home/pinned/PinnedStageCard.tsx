import { useEffect, useRef, useState, type MouseEventHandler, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { WorkflowStage, WorkflowStatus } from "../../../types/workflow.types";
import PinnedMembersGroup, { type PinnedMemberSummary } from "./PinnedMembersGroup";

const STATUS_PROGRESS: Record<WorkflowStatus, number> = {
  Approved: 100,
  "In Progress": 60,
  "Not Started": 0,
};

const STATUS_BAR_CLASS: Record<WorkflowStatus, string> = {
  Approved: "bg-emerald-500",
  "In Progress": "bg-cyan-500",
  "Not Started": "bg-gray-300",
};

interface PinnedStageCardProps {
  stage: WorkflowStage;
  members: PinnedMemberSummary[];
  onMembersClick?: MouseEventHandler<HTMLButtonElement>;
  popover?: ReactNode;
  className?: string;
}

export default function PinnedStageCard({
  stage,
  members,
  onMembersClick,
  popover,
  className = "",
}: PinnedStageCardProps) {
  const progress =
    STATUS_PROGRESS[stage.status] ?? STATUS_PROGRESS["Not Started"];
  const barClass =
    STATUS_BAR_CLASS[stage.status] ?? STATUS_BAR_CLASS["Not Started"];
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsPopoverOpen(false);
    }, 120);
  };

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, []);

  const handleTriggerEnter: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!popover) return;
    clearCloseTimeout();
    setAnchorRect(event.currentTarget.getBoundingClientRect());
    setIsPopoverOpen(true);
  };

  const popoverNode =
    isPopoverOpen && anchorRect && popover
      ? createPortal(
          <div className="fixed inset-0 z-[1000] pointer-events-none">
            <div
              className="pointer-events-auto fixed w-[334px] rounded-xl border border-gray-200 bg-white p-0 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.45)]"
              style={{
                top: anchorRect.top,
                left: anchorRect.right + 12,
              }}
              onMouseEnter={clearCloseTimeout}
              onMouseLeave={scheduleClose}
            >
              <span
                className="pointer-events-none absolute -left-[7px] z-10 h-[13px] w-[13px] rotate-45 border-b border-l border-gray-200 bg-white"
                style={{ top: 14 }}
              />
              <div className="relative z-20 divide-y divide-gray-100 overflow-hidden">
                {popover}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div
      className={`relative rounded-xl border border-gray-200 bg-gray-50/70 p-2 h-[80px] ${className}`}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center font-semibold text-gray-500 transition hover:border-gray-300 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          aria-label={`View ${stage.stepLabel} workflow stages`}
          title={`View ${stage.stepLabel} workflow stages`}
          onMouseEnter={handleTriggerEnter}
          onMouseLeave={scheduleClose}
        >
          <span className="relative py-0.5 pr-3 text-[13px] text-gray-600 after:absolute after:top-1/2 after:-translate-y-1/2 after:border-y-[6px] after:border-y-transparent">
            {stage.stepLabel}
          </span>
        </button>
        {members.length > 0 ? (
          <PinnedMembersGroup members={members} onClick={onMembersClick} />
        ) : null}
      </div>
      <p className="mt-2 text-[10px] font-medium">{stage.status}</p>
      <div className="mt-0.5 h-1 w-full rounded-full bg-gray-200">
        <span
          className={`block h-1 rounded-full ${barClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {popoverNode}
    </div>
  );
}
