import type { HomeDateInfo } from "../../types/home";

interface DateCardProps {
  date: HomeDateInfo;
}

export default function DateCard({ date }: DateCardProps) {
  return (
    <div className="rounded-xl bg-[#EDEEEE] px-5 py-3 min-w-[80px] text-center flex-shrink-0 shadow-[2px_4px_10px_0px_#0000000F]">
      <p className="text-xs text-[var(--color-primary-500)] uppercase tracking-widest font-medium">{date.month}</p>
      <p className="text-3xl font-bold text-[var(--color-primary-500)] leading-tight mt-0.5">{date.day}</p>
      <p className="text-xs text-[var(--color-primary-500)] mt-0.5">{date.weekday}</p>
    </div>
  );
}
