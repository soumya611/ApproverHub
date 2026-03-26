import type { HomeDateInfo } from "../../types/home";

interface DateCardProps {
  date: HomeDateInfo;
}

export default function DateCard({ date }: DateCardProps) {
  return (
    <div className="rounded-xl bg-gray-100 px-5 py-3 min-w-[80px] text-center flex-shrink-0">
      <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">{date.month}</p>
      <p className="text-3xl font-bold text-[#007B8C] leading-tight mt-0.5">{date.day}</p>
      <p className="text-xs text-gray-400 mt-0.5">{date.weekday}</p>
    </div>
  );
}
