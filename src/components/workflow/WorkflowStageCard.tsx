import type { WorkflowStage } from "./types";
import {
  getWorkflowStatusStyles,
  WORKFLOW_COLOR_CLASSES,
} from "./styles";
import WorkflowDateMeta from "./components/WorkflowDateMeta";
import StageHeaderRow from "./components/StageHeaderRow";
import StageMembersGroup from "./components/StageMembersGroup";
import StageChevronDivider from "./components/StageChevronDivider";
import StageTitleWithComments from "./components/StageTitleWithComments";

interface WorkflowStageCardProps {
  stage: WorkflowStage;
  showRightChevron?: boolean;
  variant?: "fixed" | "fluid";
  className?: string;
  fallbackTopBarClass?: string;
}

export default function WorkflowStageCard({
  stage,
  showRightChevron = true,
  variant = "fixed",
  className = "",
  fallbackTopBarClass = "",
}: WorkflowStageCardProps) {
  const statusStyles = getWorkflowStatusStyles(stage.status);
  const topBarClass = statusStyles.topBar || fallbackTopBarClass;
  const sizeClass =
    variant === "fluid"
      ? "h-full min-h-[112px] w-[334px] shrink-0"
      : "h-full min-h-[112px] w-[334px] shrink-0";

  return (
    <div
      className={`relative border-y ${WORKFLOW_COLOR_CLASSES.stageBorder} bg-white p-3 pt-2 sm:p-10 sm:pt-2 sm:pb-2 ${sizeClass} ${className}`}
    >
      {topBarClass ? (
        <span className={`absolute left-0 top-0 h-1 w-full ${topBarClass}`} />
      ) : null}

      <StageHeaderRow
        stepLabel={stage.stepLabel}
        status={stage.status}
      />
      <StageTitleWithComments
        title={stage.name}
        commentsCount={stage.commentsCount}
      />

      <div className="mt-auto flex items-center justify-between">
        <WorkflowDateMeta date={stage.dueDate} />
        <StageMembersGroup members={stage.members} />
      </div>

      <StageChevronDivider show={showRightChevron} />
    </div>
  );
}
