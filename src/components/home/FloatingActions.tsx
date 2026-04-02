import { CampaignIcon, JobIcon } from "../../icons";

const actions = [
  { label: "Create Job", icon: JobIcon, path: "#" },
  { label: "Create Campaign", icon: CampaignIcon, path: "#" },
];

export default function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col rounded-[20px] overflow-hidden shadow-[2px_5px_10px_0px_#00000036]">
      {actions.map((action) => {
        const Icon = action.icon;
        const [word1, word2] = action.label.split(" ");
        return (
          <a
            key={action.label}
            href={action.path}
            className="flex items-center gap-3 bg-[var(--color-secondary-500)] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-secondary-600)] transition-colors "
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="leading-tight">
              {word1}<br />{word2}
            </span>
          </a>
        );
      })}
    </div>
  );
}
