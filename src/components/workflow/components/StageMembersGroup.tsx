import type { WorkflowMember } from "../types";

interface StageMembersGroupProps {
  members: WorkflowMember[];
}

export default function StageMembersGroup({ members }: StageMembersGroupProps) {
  return (
    <div className="flex items-center">
      {members.map((member, index) => (
        <span
          key={member.id}
          className={`-ml-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold ${member.className} ${index === 0 ? "ml-0" : ""}`}
        >
          {member.initials}
        </span>
      ))}
    </div>
  );
}
