interface ItemsCountSummaryProps {
  total: number;
  from?: number;
  to?: number;
  label?: string;
  className?: string;
}

export default function ItemsCountSummary({
  total,
  from,
  to,
  label = "items",
  className = "",
}: ItemsCountSummaryProps) {
  const safeTotal = Math.max(0, total);
  const safeFrom = Math.max(0, from ?? (safeTotal > 0 ? 1 : 0));
  const safeTo = Math.max(safeFrom, to ?? safeTotal);
  const boundedFrom = Math.min(safeFrom, safeTotal);
  const boundedTo = Math.min(safeTo, safeTotal);

  return (
    <span className={`text-xs text-gray-500 ${className}`}>
      {boundedFrom}-{boundedTo} of {safeTotal} {label} showing
    </span>
  );
}
