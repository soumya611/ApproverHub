import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import UserCell from "../user-cell/UserCell";

export interface ReviewerListItem {
  id: string;
  name: string;
  avatarUrl?: string;
  subtitle?: string;
}

interface ReviewerListProps {
  isOpen: boolean;
  onClose: () => void;
  reviewers: ReviewerListItem[];
  anchorRect?: DOMRect | null;
  placement?: "top-start" | "bottom-start";
  title?: string;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
  overlayClassName?: string;
}

export default function ReviewerList({
  isOpen,
  onClose,
  reviewers,
  anchorRect,
  placement = "top-start",
  title,
  showCloseButton = false,
  className = "",
  contentClassName = "",
  itemClassName = "",
  overlayClassName = "bg-transparent",
}: ReviewerListProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const offset = 8;

  const positionStyle = useMemo(() => {
    if (!anchorRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      } as const;
    }

    const preferTop = placement === "top-start";
    const shouldFlipToBottom = preferTop && anchorRect.top < 140;
    const placeTop = preferTop && !shouldFlipToBottom;

    return {
      top: placeTop ? anchorRect.top - offset : anchorRect.bottom + offset,
      left: anchorRect.left,
      transform: placeTop ? "translateY(-100%)" : "translateY(0)",
    } as const;
  }, [anchorRect, placement]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-99999">
      <button
        type="button"
        className={`absolute inset-0 cursor-default ${overlayClassName}`}
        onClick={onClose}
        aria-label="Close reviewer list"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={`fixed w-[220px] max-w-[240px] rounded-xl border border-gray-200 bg-white p-2 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.5)] ${className}`}
        style={positionStyle}
        onClick={(event) => event.stopPropagation()}
      >
        {title || showCloseButton ? (
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-xs font-semibold text-gray-600">{title}</span>
            {showCloseButton ? (
              <button
                type="button"
                className="rounded-full px-1 text-xs text-gray-400 hover:text-gray-600"
                onClick={onClose}
                aria-label="Close"
              >
                x
              </button>
            ) : null}
          </div>
        ) : null}
        <div className={`space-y-1 ${contentClassName}`}>
          {reviewers.map((reviewer) => (
            <div
              key={reviewer.id}
              className={`rounded-lg px-2 py-1.5 transition hover:bg-gray-50 ${itemClassName}`}
            >
              <UserCell
                title={reviewer.name}
                subtitle={reviewer.subtitle}
                avatarUrl={reviewer.avatarUrl}
                avatarSize="xsmall"
                className="gap-2"
                contentClassName="leading-tight"
                titleClassName="text-[13px] font-medium text-gray-700"
                subtitleClassName="text-[11px] text-gray-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
