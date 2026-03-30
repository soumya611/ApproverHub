import type { HomeProgressInfo } from "../../types/home";

const TEAL = "#007B8C";
const TRACK = "#E0E4E7";

interface ProgressCardProps {
  progress: HomeProgressInfo;
}

export default function ProgressCard({ progress }: ProgressCardProps) {
  const { completed, total } = progress;
  const percent = total > 0 ? (completed / total) * 100 : 0;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r={radius} fill="none" stroke={TRACK} strokeWidth="5" />
        <circle
          cx="34" cy="34" r={radius}
          fill="none" stroke={TEAL} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="butt"
          className="transition-all duration-500"
        />
      </svg>
      <p className="text-sm text-gray-500 text-center whitespace-nowrap">
        {completed} out of {total} tasks completed
      </p>
    </div>
  );
}
