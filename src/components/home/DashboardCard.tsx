import { Link } from "react-router";
import type { DashboardCard } from "../../types/home";
import { BoxIcon, AnalyticsIcon, ListIcon } from "../../icons";

interface DashboardCardProps {
  card: DashboardCard;
}

const iconMap: Record<string, React.ReactNode> = {
  document: (
    <BoxIcon className="w-7 h-7 text-gray-400 group-hover:text-[#007B8C] transition-colors duration-300" />
  ),
  chart: (
    <AnalyticsIcon className="w-7 h-7 text-gray-400 group-hover:text-[#007B8C] transition-colors duration-300" />
  ),
  clipboard: (
    <ListIcon className="w-7 h-7 text-gray-400 group-hover:text-[#007B8C] transition-colors duration-300" />
  ),
};

export default function DashboardCard({ card }: DashboardCardProps) {
  const content = (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-full min-h-[240px] flex flex-col relative overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:bg-[#007B8C] hover:border-[#007B8C] hover:shadow-xl">

      {/* Title */}
      <h3 className="text-[15px] font-bold text-gray-800 mb-2 transition-colors duration-300 group-hover:text-white">
        {card.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-400 leading-relaxed flex-1 transition-colors duration-300 group-hover:text-white/80">
        {card.description}
      </p>

      {/* Badge */}
      {card.badge && (
        <div className="absolute bottom-6 left-6 z-10 flex items-center gap-1.5 rounded-full bg-[var(--color-secondary-500)] px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="text-xs font-semibold text-white">{card.badge}</span>
        </div>
      )}

      {/* Bubble */}
<div className="absolute -bottom-6 -right-6">
  <div
    className="w-24 h-24 rounded-full bg-gray-100 
               flex items-center justify-center
               transition-transform duration-300 ease-in-out
               transform-gpu
               group-hover:scale-130 group-hover:bg-white"
  >
    {card.value != null ? (
      <span className="text-2xl font-normal text-gray-600 transition-colors duration-300 group-hover:text-[#007B8C]">
        {card.value}
      </span>
    ) : (
      <span>{card.icon && iconMap[card.icon]}</span>
    )}
  </div>
</div>
    </div>
  );

  if (card.path) {
    return <Link to={card.path} className="block h-full">{content}</Link>;
  }

  return content;
}
