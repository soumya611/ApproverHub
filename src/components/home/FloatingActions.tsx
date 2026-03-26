import { Briefcase, Rocket } from "lucide-react";

const actions = [
  { label: "Create Job", icon: Briefcase, path: "#" },
  { label: "Create Campaign", icon: Rocket, path: "#" },
];

export default function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col rounded-xl overflow-hidden shadow-lg">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <a
            key={action.label}
            href={action.path}
            className="flex items-center gap-3 bg-[var(--color-secondary-500)] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-secondary-600)] transition-colors border-b border-[var(--color-secondary-600)] last:border-b-0"
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {action.label}
          </a>
        );
      })}
    </div>
  );
}
