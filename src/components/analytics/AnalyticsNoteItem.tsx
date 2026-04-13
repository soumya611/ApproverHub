import { useEffect, useState, type KeyboardEvent } from "react";
import PopupTitle from "../ui/popup-title/PopupTitle";
import DescriptionText from "../ui/description-text/DescriptionText";
import { NotesDelIcon, NotesEditIcon } from "../../icons";

interface AnalyticsNoteItemProps {
  variant: "note" | "mention";
  title?: string;
  description: string;
  userName?: string;
  message?: string;
  date?: string;
  avatarUrl?: string;
  avatarAlt?: string;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  editableTitle?: boolean;
  onTitleSave?: (nextTitle: string) => void;
}

export default function AnalyticsNoteItem({
  variant,
  title,
  description,
  userName,
  message,
  date,
  avatarUrl,
  avatarAlt = "User",
  className = "",
  onEdit,
  onDelete,
  editableTitle = false,
  onTitleSave,
}: AnalyticsNoteItemProps) {
  const showActions = Boolean(onDelete || onEdit);
  const showAvatar = variant === "mention" && avatarUrl;
  const showTextPrefix = variant === "note";
  const showEditAction = variant === "note" && onEdit;
  const showDeleteAction = onDelete;
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title ?? "");

  useEffect(() => {
    setTitleDraft(title ?? "");
  }, [title]);

  const commitTitle = () => {
    const nextTitle = titleDraft.trim() || title?.trim() || "New note";
    if (onTitleSave && nextTitle !== title) {
      onTitleSave(nextTitle);
    }
    setTitleDraft(nextTitle);
    setIsTitleEditing(false);
  };

  const cancelTitleEdit = () => {
    setTitleDraft(title ?? "");
    setIsTitleEditing(false);
  };

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitTitle();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelTitleEdit();
    }
  };

  return (
    <div
      className={`group flex items-start justify-between  rounded-lg border border-gray-200 bg-white px-4 py-3 transition-colors hover:bg-[#EFF0F0] ${className}`}
    >
      <div className="min-w-0 flex items-start gap-3">
        {showAvatar ? (
          <img
            src={avatarUrl}
            alt={avatarAlt}
            className="mt-0.5 h-8 w-8 rounded-full object-cover"
          />
        ) : null}
        <div className="min-w-0">
          {variant === "mention" ? (
            <PopupTitle
              sizeClassName="text-[15px]"
              weightClassName="font-semibold"
              colorClassName="text-gray-900"
              className="mb-1"
            >
              <strong className="font-semibold">{userName}</strong>{" "}
              <span className="font-normal">{message}</span>
            </PopupTitle>
          ) : (
            <PopupTitle
              sizeClassName="text-[15px]"
              weightClassName="font-semibold"
              colorClassName="text-gray-900"
              className="mb-1"
            >
              {isTitleEditing && editableTitle ? (
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={handleTitleKeyDown}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm font-semibold text-gray-900 outline-none focus:border-[#007B8C]"
                />
              ) : (
                <strong
                  className={editableTitle ? "cursor-text font-semibold" : "font-semibold"}
                  onDoubleClick={() => {
                    if (!editableTitle) return;
                    setIsTitleEditing(true);
                  }}
                  title={editableTitle ? "Double click to edit title" : undefined}
                >
                  {title}
                </strong>
              )}
            </PopupTitle>
          )}
          <DescriptionText
            label={showTextPrefix ? "Text:" : ""}
            text={
              variant === "mention" ? (
                <strong className="font-semibold">{description}</strong>
              ) : (
                description
              )
            }
          />
        </div>
      </div>

      {(date || showActions) && (
        <div className="relative flex w-12 shrink-0 self-stretch">
          {date ? (
            <span className="self-start text-xs text-gray-500 transition-opacity group-hover:opacity-0">
              {date}
            </span>
          ) : null}
          {showActions ? (
            <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 transition-opacity group-hover:opacity-100">
              {showEditAction ? (
                <button
                  type="button"
                  onClick={onEdit}
                  aria-label="Edit"
                  className="rounded p-1 text-gray-500 transition-colors"
                >
                  <NotesEditIcon/>
                </button>
              ) : null}
              {showDeleteAction ? (
                <button
                  type="button"
                  onClick={onDelete}
                  aria-label="Delete"
                  className="rounded p-1 text-gray-500 transition-colors"
                >
                  <NotesDelIcon className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
