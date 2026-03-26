import { WORKFLOW_COLOR_CLASSES } from "../styles";
import CommentsBadge from "../../ui/comments/CommentsBadge";

interface StageTitleWithCommentsProps {
  title: string;
  commentsCount?: number;
}

export default function StageTitleWithComments({ title, commentsCount }: StageTitleWithCommentsProps) {
  return (
    <div className="mb-3 flex items-center gap-2 text-gray-900">
      <p className="truncate text-[13px] text-base font-semibold workflow-summary-title">{title}</p>
      <CommentsBadge
        count={commentsCount}
        size="sm"
        className={WORKFLOW_COLOR_CLASSES.stageCommentBadge}
      />
    </div>
  );
}
