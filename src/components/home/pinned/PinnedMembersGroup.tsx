import type { MouseEventHandler } from "react";

export interface PinnedMemberSummary {
  id: string;
  initials: string;
  className: string;
  name?: string;
}

interface PinnedMembersGroupProps {
  members: PinnedMemberSummary[];
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export default function PinnedMembersGroup({
  members,
  onClick,
  className = "",
}: PinnedMembersGroupProps) {
  const visibleMembers = members.slice(0, 3);
  const remaining = Math.max(0, members.length - visibleMembers.length);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center ${className}`}
      aria-label="View members"
    >
      {visibleMembers.map((member, index) => (
        <span
          key={member.id}
          className={`-ml-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold ${member.className} ${index === 0 ? "ml-0" : ""}`}
        >
          {member.initials}
        </span>
      ))}
      {remaining > 0 ? (
        <span className="-ml-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] font-semibold text-gray-600">
          +{remaining}
        </span>
      ) : null}
    </button>
  );
}
