import { useState, type DragEvent } from "react";
import { Drag_Handle_Icon } from "../../../icons";
import StageStepPill from "./StageStepPill";

export interface StageStepItem {
  label: string;
  title: string;
  isActive?: boolean;
  commentsCount?: number;
}

interface StageStepListProps {
  steps: StageStepItem[];
  className?: string;
  onStepClick?: (index: number) => void;
  variant?: "filled" | "outline" | "bordered";
  showConnector?: boolean;
  draggable?: boolean;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export default function StageStepList({
  steps,
  className = "",
  onStepClick,
  variant = "filled",
  showConnector = true,
  draggable = false,
  onReorder,
}: StageStepListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const canDrag = draggable && typeof onReorder === "function";

  const handleDragStart = (index: number) => (event: DragEvent<HTMLDivElement>) => {
    if (!canDrag) return;
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (index: number) => (event: DragEvent<HTMLDivElement>) => {
    if (!canDrag) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (overIndex !== index) {
      setOverIndex(index);
    }
  };

  const handleDrop = (index: number) => (event: DragEvent<HTMLDivElement>) => {
    if (!canDrag) return;
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    const fromIndex = dragIndex ?? Number(data);
    if (!Number.isFinite(fromIndex) || fromIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    onReorder?.(fromIndex, index);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    if (!canDrag) return;
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {steps.map((step, index) => {
        const isDropTarget = canDrag && overIndex === index && dragIndex !== index;
        return (
          <div
            key={`${step.label}-${step.title}-${index}`}
            draggable={canDrag}
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver(index)}
            onDrop={handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={canDrag ? "cursor-grab active:cursor-grabbing" : ""}
          >
            <StageStepPill
              stageLabel={step.label}
              title={step.title}
              isActive={step.isActive}
              commentsCount={step.commentsCount}
              showConnector={showConnector && index <= steps.length - 2}
              className={`w-full ${isDropTarget ? "ring-2 ring-[#007B8C]/25" : ""}`}
              onClick={onStepClick ? () => onStepClick(index) : undefined}
              variant={variant}
              leftSlot={
                canDrag ? (
                  <Drag_Handle_Icon className="h-3.5 w-3.5 text-gray-300 transition group-hover:text-gray-400" />
                ) : null
              }
            />
          </div>
        );
      })}
    </div>
  );
}
