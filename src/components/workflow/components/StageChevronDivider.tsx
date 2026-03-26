import { WORKFLOW_DIVIDER_STROKE } from "../styles";

interface StageChevronDividerProps {
  show: boolean;
}

export default function StageChevronDivider({ show }: StageChevronDividerProps) {
  if (!show) return null;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute -right-4 top-0 z-10 h-full w-4"
      viewBox="0 0 16 112"
      preserveAspectRatio="none"
    >
      <polygon points="0,0 16,56 0,112" fill="#ffffff" />
      <polyline
        points="0,0 16,56 0,112"
        fill="none"
        stroke={WORKFLOW_DIVIDER_STROKE}
        strokeWidth="1"
        strokeDasharray="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        shapeRendering="geometricPrecision"
      />
    </svg>
  );
}
