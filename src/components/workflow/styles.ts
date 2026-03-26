import type { WorkflowStatus } from "./types";

export const WORKFLOW_COLOR_CLASSES = {
  stageBorder: "border-gray-100",
  stageMetaText: "text-gray-500",
  stageCommentBadge: "text-gray-500",
  summaryFormatBadge: "bg-workflow-teal text-white",
  summaryStatusBadge: "bg-red-50 text-red-500",
  handleCollapsed: "border-cyan-200 bg-workflow-handle-bg text-workflow-handle-text",
  handleExpanded: "border-gray-300 bg-workflow-handle-bg text-gray-500",
} as const;

export const WORKFLOW_DIVIDER_STROKE = "var(--color-workflow-divider)";

export function getWorkflowStatusStyles(status: WorkflowStatus) {
  if (status === "Approved") {
    return {
      badge: "bg-[#ECFDF3] text-[#4BA100]",
      topBar: "bg-green-500/70",
    };
  }

  if (status === "In Progress") {
    return {
      badge: "bg-[var(--color-primary-50)] text-[var(--color-primary-500)]",
      topBar: "bg-cyan-500/80",
    };
  }

  return {
    badge: "bg-[#F1F1F1] text-[#7A7A7A]",
    topBar: "",
  };
}
