import { CalenderIcon } from "../../../icons";
import { WORKFLOW_COLOR_CLASSES } from "../styles";

interface WorkflowDateMetaProps {
  date: string;
  ageText?: string;
  className?: string;
}

export default function WorkflowDateMeta({ date, ageText, className = "" }: WorkflowDateMetaProps) {
  return (
    <div className={`flex items-center gap-1 text-xs ${WORKFLOW_COLOR_CLASSES.stageMetaText} ${className}`}>
      <CalenderIcon className="h-3.5 w-3.5" />
      <span>{date}</span>
      {ageText ? <span>({ageText})</span> : null}
    </div>
  );
}
