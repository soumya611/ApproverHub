import { useId, useMemo, useState, type ComponentType, type ReactNode } from "react";
import Badge from "../badge/Badge";
import DescriptionText from "../description-text/DescriptionText";
import PopupTitle from "../popup-title/PopupTitle";
import UserCell from "../user-cell/UserCell";
import {
  CheckLineIcon,
  CloseLineIcon,
  TimeIcon,
  CheckListArrow,
  CheckListCommentIcon,
} from "../../../icons";

export type ChecklistResponse = "pass" | "fail" | "pending";

export interface ChecklistReviewer {
  name: string;
  avatarUrl?: string;
  role?: string;
  email?: string;
}

export interface ChecklistItem {
  id: string;
  question: string;
  description?: string;
  commentCount?: number;
  response?: ChecklistResponse;
  reviewer?: ChecklistReviewer;
}

interface ChecklistStageDropdownProps {
  stageCode: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  renderReviewer?: (reviewer: ChecklistReviewer | undefined, item: ChecklistItem) => ReactNode;
}

type ProgressSegment = {
  key: string;
  value: number;
  className: string;
};

const RESPONSE_STYLES: Record<
  ChecklistResponse,
  { label: string; icon: ComponentType<{ className?: string }>; color: string }
> = {
  pass: { label: "Pass", icon: CheckLineIcon, color: "bg-[var(--color-checklist-pass)]" },
  fail: { label: "Fail", icon: CloseLineIcon, color: "bg-[var(--color-checklist-fail)]" },
  pending: {
    label: "Progress",
    icon: TimeIcon,
    color: "bg-[var(--color-checklist-progress)]",
  },
};

function ChecklistProgressBar({
  segments,
  total: totalOverride,
  className = "",
}: {
  segments: ProgressSegment[];
  total?: number;
  className?: string;
}) {
  const segmentTotal = segments.reduce((sum, segment) => sum + segment.value, 0);
  const total = typeof totalOverride === "number" ? totalOverride : segmentTotal;

  if (total <= 0 || segmentTotal <= 0) {
    return <div className={`h-1.5 w-24 rounded-full bg-gray-200 ${className}`} />;
  }

  const visibleSegments = segments.filter((segment) => segment.value > 0);

  return (
    <div className={`flex h-1 w-24 overflow-hidden rounded-full bg-gray-200 ${className}`}>
      {visibleSegments.map((segment, index) => {
        const isFirst = index === 0;
        const isLast = index === visibleSegments.length - 1;
        const widthPercent = `${(segment.value / total) * 100}%`;
        return (
          <span
            key={segment.key}
            className={`${segment.className} ${isFirst ? "rounded-l-full" : ""} ${isLast ? "rounded-r-full" : ""}`}
            style={{ width: widthPercent }}
          />
        );
      })}
    </div>
  );
}

function ChecklistCommentBadge({
  count = 0,
  showZero = false,
}: {
  count?: number;
  showZero?: boolean;
}) {
  if (!showZero && count <= 0) {
    return <span className="text-[11px] text-gray-300">-</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-200 px-1.5 py-0.5 text-[11px] font-medium text-gray-600">
      <CheckListCommentIcon className="h-3 w-3 text-gray-500" />
      <span className="text-[11px] font-semibold text-gray-600">{count}</span>
    </span>
  );
}

function ChecklistResponseBadge({ response }: { response?: ChecklistResponse }) {
  if (!response || !Object.prototype.hasOwnProperty.call(RESPONSE_STYLES, response)) {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-[4px] border border-gray-300 text-[11px] font-semibold text-gray-400"
        aria-label="No response"
        title="No response"
      >
        -
      </span>
    );
  }

  const style = RESPONSE_STYLES[response];
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-[4px] ${style.color}`}
      aria-label={style.label}
      title={style.label}
    >
      <Icon className="h-3.5 w-3.5 text-white" />
    </span>
  );
}

function ReviewerCell({ reviewer }: { reviewer?: ChecklistReviewer }) {
  if (!reviewer) {
    return <span className="text-[11px] text-gray-300">-</span>;
  }

  return (
    <UserCell
      title={reviewer.name}
      avatarUrl={reviewer.avatarUrl ?? ""}
      avatarAlt={reviewer.name}
      avatarSize="xsmall"
      avatarFallback="initials"
      className="gap-2"
      titleClassName="text-[11px] font-medium text-gray-600"
    />
  );
}

export default function ChecklistStageDropdown({
  stageCode,
  title,
  description,
  items,
  defaultOpen = false,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  renderReviewer,
}: ChecklistStageDropdownProps) {
  const contentId = useId();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const { completedCount, totalCount, segments } = useMemo(() => {
    const nextCounts = { pass: 0, fail: 0, pending: 0, unknown: 0 };
    items.forEach((item) => {
      if (item.response === "pass") {
        nextCounts.pass += 1;
      } else if (item.response === "fail") {
        nextCounts.fail += 1;
      } else if (item.response === "pending") {
        nextCounts.pending += 1;
      } else {
        nextCounts.unknown += 1;
      }
    });

    return {
      counts: nextCounts,
      completedCount: nextCounts.pass + nextCounts.fail,
      totalCount: items.length,
      segments: [
        {
          key: "pass",
          value: nextCounts.pass,
          className: RESPONSE_STYLES.pass.color,
        },
        {
          key: "pending",
          value: nextCounts.pending,
          className: RESPONSE_STYLES.pending.color,
        },
        {
          key: "fail",
          value: nextCounts.fail,
          className: RESPONSE_STYLES.fail.color,
        },
      ],
    };
  }, [items]);

  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={`flex w-full items-start justify-between gap-4 px-4 py-3 text-left transition hover:bg-gray-50 ${headerClassName}`}
      >
        <div className="flex min-w-0 items-start gap-3">
          <Badge variant="light" color="light" size="sm">
            {stageCode}
          </Badge>
          <div className="flex min-w-0 gap-5">
            <PopupTitle
              colorClassName="text-gray-900"
              sizeClassName="text-[13px]"
              weightClassName="font-semibold"
              className="truncate"
            >
              {title}
            </PopupTitle>
            {description ? (
              <DescriptionText
                label={null}
                text={description}
                className="mt-1 text-[11px]"
                textClassName="text-gray-500"
              />
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-2">
            <ChecklistProgressBar segments={segments} total={totalCount} />
            <span className="text-[13px] font-gilroy-semibold text-gray-400">
              Complete {completedCount} of {totalCount}
            </span>
          </div>
          <CheckListArrow
            className={`h-3 w-3 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen ? (
        <div id={contentId} className={`border-t border-gray-100 px-4 pb-4 pt-3 ${bodyClassName}`}>
          <div className="overflow-x-auto">
            <div className="min-w-[620px] rounded-lg border border-gray-200">
              <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_160px] items-center gap-2 border-b border-gray-100 px-3 py-2 text-[11px] font-medium text-gray-400">
                <span>Expand all</span>
                <span className="text-center">Comment</span>
                <span className="text-center">Response</span>
                <span>Reviewer</span>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[minmax(0,1fr)_90px_90px_160px] items-start gap-2 px-3 py-3"
                  >
                    <div className="space-y-1">
                      <p className="text-[12px] font-semibold text-gray-900">
                        {item.question}
                      </p>
                      {item.description ? (
                        <p className="text-[11px] text-gray-500">{item.description}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-center">
                      <ChecklistCommentBadge count={item.commentCount} />
                    </div>
                    <div className="flex items-center justify-center">
                      <ChecklistResponseBadge response={item.response} />
                    </div>
                    <div className="flex items-center">
                      {renderReviewer ? (
                        renderReviewer(item.reviewer, item)
                      ) : (
                        <ReviewerCell reviewer={item.reviewer} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
