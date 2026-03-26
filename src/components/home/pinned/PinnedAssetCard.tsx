import { PPTIcon } from "../../../icons";

interface PinnedAssetCardProps {
  title: string;
  subtitle?: string;
  format?: string;
  className?: string;
}

export default function PinnedAssetCard({
  title,
  subtitle,
  format = "PPT",
  className = "",
}: PinnedAssetCardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-gray-50/70 p-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex">
          {/* {format} */}
          <PPTIcon className="h-12 w-12"/>
        </div>
        <div>
          <p className="text-xs  text-gray-700">{title}</p>
          {subtitle ? (
            <p className="text-[11px] text-gray-400">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
