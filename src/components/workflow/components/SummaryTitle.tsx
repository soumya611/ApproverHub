interface SummaryTitleProps {
  title: string;
  className?: string;
}

export default function SummaryTitle({ title, className = "" }: SummaryTitleProps) {
  return <p className={`truncate text-base workflow-summary-title ${className}`}>{title}</p>;
}
