import type { JobTag } from "../../jobs/types";
import Tag, { type TagTone } from "../tag";

interface ProfileJobTagProps {
  tag: JobTag;
  className?: string;
}

const TAG_TONE_MAP: Record<Exclude<JobTag, null>, TagTone> = {
  Urgent: "urgent",
  "Expiry Due": "warning",
  Late: "urgent",
  Expired: "neutral",
};

export default function ProfileJobTag({ tag, className = "" }: ProfileJobTagProps) {
  if (!tag) return null;

  return (
    <Tag tone={TAG_TONE_MAP[tag]} size="xs" rounded="sm" className={className}>
      {tag}
    </Tag>
  );
}

