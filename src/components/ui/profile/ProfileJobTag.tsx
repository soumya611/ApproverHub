import type { JobTag } from "../../jobs/types";

interface ProfileJobTagProps {
  tag: JobTag;
  className?: string;
}

const TAG_STYLE_MAP: Record<Exclude<JobTag, null>, string> = {
  Urgent: "border-red-200 bg-red-50 text-red-500",
  "Expiry Due": "border-amber-200 bg-amber-50 text-amber-600",
  Late: "border-red-200 bg-red-50 text-red-500",
  Expired: "border-gray-300 bg-gray-100 text-gray-600",
};

export default function ProfileJobTag({ tag, className = "" }: ProfileJobTagProps) {
  if (!tag) return null;

  return (
    <span
      className={`inline-flex w-fit items-center rounded-sm border px-2 py-0.5 text-[10px] font-medium ${TAG_STYLE_MAP[tag]} ${className}`}
    >
      {tag}
    </span>
  );
}

