import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Popup from "@/components/ui/popup/Popup";
import { VerticalDots } from "@/icons";

interface SavedViewChipProps {
  id: string;
  name: string;
  count: number;
  isActive: boolean;
  activeClassName: string;
  inactiveClassName: string;
  onSelect: () => void;
  onRename: (nextName: string) => void;
  onRemove: () => void;
}

export default function SavedViewChip({
  id,
  name,
  count,
  isActive,
  activeClassName,
  inactiveClassName,
  onSelect,
  onRename,
  onRemove,
}: SavedViewChipProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setDraftName(name);
    }
  }, [isEditing, name]);

  useEffect(() => {
    if (!isMenuOpen && !isEditing) return;

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
        if (isEditing) {
          inputRef.current?.blur();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, isMenuOpen]);

  useEffect(() => {
    if (!isEditing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing]);

  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== name) {
      onRename(trimmed);
    } else {
      setDraftName(name);
    }
    setIsEditing(false);
  };

  const cancelRename = () => {
    setDraftName(name);
    setIsEditing(false);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitRename();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelRename();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`group relative inline-flex items-center rounded-sm border ${
        isActive ? activeClassName : inactiveClassName
      }`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onBlur={commitRename}
          onKeyDown={handleInputKeyDown}
          className="min-w-[88px] bg-transparent px-2 py-0.5 text-[13px] font-regular outline-none"
          aria-label={`Rename ${name}`}
        />
      ) : (
        <button
          type="button"
          onClick={onSelect}
          className="px-2 py-0.5 text-[13px] font-regular"
        >
          {name} ({count})
        </button>
      )}

      {!isEditing ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsMenuOpen((prev) => !prev);
          }}
          className="pr-1 text-gray-400 opacity-0 pointer-events-none transition hover:text-gray-600 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
          aria-label={`${name} options`}
        >
          <VerticalDots className="h-4 w-4" />
        </button>
      ) : null}

      {isMenuOpen ? (
        <div className="absolute right-0 top-full z-30 mt-2">
          <Popup
            items={[
              {
                id: `rename-${id}`,
                label: "Rename",
                onClick: () => {
                  setIsMenuOpen(false);
                  setIsEditing(true);
                },
              },
              {
                id: `remove-${id}`,
                label: "Remove",
                onClick: () => {
                  setIsMenuOpen(false);
                  onRemove();
                },
              },
            ]}
            className="!min-w-[160px] rounded-lg"
          />
        </div>
      ) : null}
    </div>
  );
}
