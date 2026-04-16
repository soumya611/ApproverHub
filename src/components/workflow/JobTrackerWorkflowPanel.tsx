import { useEffect, useMemo, useRef, useState, type MouseEvent, type WheelEvent } from "react";
import { ChevronsRight, ChevronsLeft } from "../../icons";
import JobTrackerSummaryCard from "./JobTrackerSummaryCard";
import WorkflowStageCard from "./WorkflowStageCard";
import type { JobTrackerSummary, WorkflowStage } from "./types";
import { WORKFLOW_COLOR_CLASSES } from "./styles";

interface JobTrackerWorkflowPanelProps {
  summary: JobTrackerSummary;
  stages: WorkflowStage[];
  defaultExpanded?: boolean;
  showExpandToggle?: boolean;
}

export default function JobTrackerWorkflowPanel({
  summary,
  stages,
  defaultExpanded = false,
  showExpandToggle = true,
}: JobTrackerWorkflowPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const stageLaneRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const inProgressIndex = useMemo(
    () => stages.findIndex((stage) => stage.status === "In Progress"),
    [stages]
  );

  const stageSequence = useMemo(() => {
    const copy = [...stages];
    copy.sort((a, b) => {
      const aIndex = Number((a.stepLabel || "").replace(/\D+/g, "")) || 0;
      const bIndex = Number((b.stepLabel || "").replace(/\D+/g, "")) || 0;
      return aIndex - bIndex;
    });
    return copy;
  }, [stages]);

  const handleStageLaneWheel = (event: WheelEvent<HTMLDivElement>) => {
    const lane = stageLaneRef.current;
    if (!lane) return;
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

    lane.scrollLeft += event.deltaY;
    event.preventDefault();
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const lane = stageLaneRef.current;
    if (!lane || event.button !== 0) return;
    isDraggingRef.current = true;
    startXRef.current = event.clientX;
    startScrollLeftRef.current = lane.scrollLeft;
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const lane = stageLaneRef.current;
    if (!lane || !isDraggingRef.current) return;
    const delta = event.clientX - startXRef.current;
    lane.scrollLeft = startScrollLeftRef.current - delta;
    event.preventDefault();
  };

  const stopDragging = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const lane = stageLaneRef.current;
    if (!lane || isExpanded) return;

    const targetIndex = inProgressIndex >= 0 ? inProgressIndex : 0;
    const targetLeft = targetIndex * lane.clientWidth;
    lane.scrollTo({ left: targetLeft, behavior: "auto" });
  }, [isExpanded, inProgressIndex]);

  return (
    <div className="relative ">
      <div className="flex items-stretch">
        <JobTrackerSummaryCard
          summary={summary}
          className="relative z-20 shrink-0 shadow-[12px_0_14px_-12px_rgba(15,23,42,0.35)]"
        />

        <div className={`relative min-w-0 overflow-hidden  border-t border-b border-gray-100  ${isExpanded ? "flex-1" : "w-[334px] max-w-full"}`}>
          <div
            ref={stageLaneRef}
            onWheel={handleStageLaneWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            className="no-scrollbar h-full overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
          >
            {isExpanded ? (
              <div className="flex min-w-full items-stretch pr-8">
                {stageSequence.map((stage) => (
                  <div key={stage.id} className="w-[334px] shrink-0">
                    <WorkflowStageCard
                      stage={stage}
                      variant="fluid"
                      showRightChevron
                    />
                  </div>
                ))}
                <div className="w-40 shrink-0" />
              </div>
            ) : (
              <div className="flex min-w-full items-stretch pr-3">
                {stageSequence.map((stage) => (
                  <div key={stage.id} className="w-[334px] shrink-0">
                    <WorkflowStageCard
                      stage={stage}
                      variant="fluid"
                      showRightChevron
                    />
                  </div>
                ))}
                <div className="w-40 shrink-0" />
              </div>
            )}
          </div>

          {showExpandToggle && stages.length > 1 && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className={`absolute right-0 top-0 z-40 h-full w-5 text-[11px] font-semibold leading-none transition-colors ${
                isExpanded
                  ? WORKFLOW_COLOR_CLASSES.handleExpanded
                  : WORKFLOW_COLOR_CLASSES.handleCollapsed
              }`}
              aria-label={isExpanded ? "Collapse stages" : "Expand stages"}
              title={isExpanded ? "Collapse stages" : "Expand stages"}
            >
              {isExpanded ? (
                <ChevronsLeft className="mx-auto h-3 w-3 "  />
              ) : (
                <ChevronsRight className="mx-auto h-3 w-3 text-workflow-teal" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
