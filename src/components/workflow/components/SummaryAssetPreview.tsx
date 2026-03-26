import { WORKFLOW_COLOR_CLASSES } from "../styles";

interface SummaryAssetPreviewProps {
  imageUrl: string;
  title: string;
  format: string;
}

export default function SummaryAssetPreview({ imageUrl, title, format }: SummaryAssetPreviewProps) {
  return (
    <div className="relative h-[77px] w-[76px] overflow-hidden rounded-md bg-gray-200">
      <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
      <span
        className={`absolute left-0 top-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${WORKFLOW_COLOR_CLASSES.summaryFormatBadge}`}
      >
        {format}
      </span>
    </div>
  );
}
