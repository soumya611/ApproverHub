import type { MouseEventHandler, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { AngleRightIcon } from "../../../icons";

export type PopupItem = {
  id: string;
  label?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  subItems?: PopupItem[];
};

interface PopupProps {
  items: PopupItem[];
  className?: string;
  listClassName?: string;
  itemClassName?: string;
}

const isRichItem = (item: PopupItem) =>
  Boolean(item.title || item.description || item.icon);

export default function Popup({
  items,
  className = "",
  listClassName = "",
  itemClassName = "",
}: PopupProps) {
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setOpenSubmenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const baseClassName =
    "w-fit min-w-[180px] border border-gray-200 bg-white shadow-[0_14px_36px_-18px_rgba(15,23,42,0.5)]";

  const renderPopup = (popupItems: PopupItem[], isNested: boolean) => (
    <div className={`${baseClassName} ${isNested ? "" : className}`}>
      <div className={`flex flex-col ${listClassName}`}>
        {popupItems.map((item, index) => {
          const rich = isRichItem(item);
          const hasSubItems = Boolean(item.subItems?.length);
          const content = rich ? (
            <div className="flex items-start gap-3">
              {item.icon ? (
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  {item.icon}
                </span>
              ) : null}
              <div className="space-y-1 text-left">
                {item.title ? (
                  <div className="text-sm font-semibold text-gray-900">
                    {item.title}
                  </div>
                ) : null}
                {item.description ? (
                  <div className="text-xs text-gray-500">
                    {item.description}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 cursor-pointer">{item.label}</div>
          );

          const rowContent = hasSubItems ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">{content}</div>
              <AngleRightIcon className="h-4 w-4 text-gray-400" />
            </div>
          ) : (
            content
          );

          const spacingClass = rich ? "px-4 py-3" : "px-4 py-2.5";
          const dividerClass = index === 0 ? "" : "border-t border-gray-100";
          const isInteractive = Boolean(item.onClick || hasSubItems);
          const hoverClass = isInteractive ? "hover:bg-gray-50" : "";
          const disabledClass = item.disabled
            ? "cursor-not-allowed opacity-50"
            : "";
          const isSubmenuOpen = openSubmenuId === item.id;

          const handleItemClick: MouseEventHandler<HTMLButtonElement> = (
            event
          ) => {
            if (item.disabled) return;
            if (hasSubItems) {
              setOpenSubmenuId((prev) => (prev === item.id ? null : item.id));
              return;
            }
            if (item.onClick) {
              item.onClick(event);
              setOpenSubmenuId(null);
            }
          };

          if (isInteractive) {
            return (
              <div key={item.id} className="relative">
                <button
                  type="button"
                  onClick={handleItemClick}
                  disabled={item.disabled}
                  aria-haspopup={hasSubItems ? "menu" : undefined}
                  aria-expanded={hasSubItems ? isSubmenuOpen : undefined}
                  className={`w-full text-left transition ${spacingClass} ${dividerClass} ${hoverClass} ${disabledClass} ${itemClassName}`}
                >
                  {rowContent}
                </button>
                {hasSubItems && isSubmenuOpen ? (
                  <div className="absolute z-20 mt-1">
                    {renderPopup(item.subItems ?? [], true)}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className={`w-full ${spacingClass} ${dividerClass} ${itemClassName}`}
            >
              {rowContent}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={popupRef}>
      {renderPopup(items, false)}
    </div>
  );
}
