import { useEffect, useMemo, useState, type DragEvent } from "react";
import Button from "../button/Button";
import SearchInput from "../search-input/SearchInput";
import FilterCheckboxItem from "../advance-filter/FilterCheckboxItem";
import { GripDotsHorizontalIcon, Search } from "../../../icons";
import {
  DEFAULT_COLUMNS,
  normalizeColumns,
  type ColumnConfigItem,
} from "../../../data/columnsConfig";

export type ColumnItem = ColumnConfigItem;

interface ColoumnsFilterProps {
  items?: ColumnItem[];
  onItemsChange?: (items: ColumnItem[]) => void;
  onSaveView?: (items: ColumnItem[]) => void;
  saveLabel?: string;
  className?: string;
  searchPlaceholder?: string;
  showSave?: boolean;
}

const ColoumnsFilter = ({
  items: itemsProp,
  onItemsChange,
  onSaveView,
  saveLabel = "Save view",
  className = "",
  searchPlaceholder = "search",
  showSave = true,
}: ColoumnsFilterProps) => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ColumnItem[]>(
    normalizeColumns(itemsProp ?? DEFAULT_COLUMNS)
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    if (!itemsProp) return;
    setItems(normalizeColumns(itemsProp));
  }, [itemsProp]);

  const visibleItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return items;
    }
    return items.filter((item) => item.label.toLowerCase().includes(term));
  }, [items, query]);

  const updateItems = (next: ColumnItem[]) => {
    const normalized = normalizeColumns(next);
    if (!itemsProp) {
      setItems(normalized);
    }
    onItemsChange?.(normalized);
  };

  const handleToggle = (id: string, checked: boolean) => {
    const current = items.find((item) => item.id === id);
    if (current?.required && !checked) {
      return;
    }
    updateItems(
      items.map((item) =>
        item.id === id ? { ...item, checked } : item
      )
    );
  };

  const handleDragStart = (id: string, event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = "move";
    setDraggedId(id);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      return;
    }

    updateItems(
      (() => {
        const next = [...items];
      const fromIndex = next.findIndex((item) => item.id === draggedId);
      const toIndex = next.findIndex((item) => item.id === targetId);
      if (fromIndex === -1 || toIndex === -1) {
          return items;
      }
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
      })()
    );

    setDraggedId(null);
  };

  return (
    <section
      className={`w-[240px] rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <div className="border-b px-5 p-2 ">
        <SearchInput
          value={query}
          placeholder={searchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
          containerClassName="mt-0 gap-1.5"
          inputClassName="text-sm text-gray-700"
          className="text-sm text-gray-700"
          iconClassName="text-gray-400"
          icon={<Search className="h-4 w-4 text-gray-400" />}
        />
      </div>
      <div className="custom-scrollbar max-h-[320px] space-y-2 overflow-y-auto px-0 py-2">
        {visibleItems.length === 0 && (
          <p className="px-3 py-4 text-xs text-gray-400">No columns found</p>
        )}
        {visibleItems.map((item) => (
          <div
            key={item.id}
            role="listitem"
            draggable
            onDragStart={(event) => handleDragStart(item.id, event)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(item.id)}
            onDragEnd={() => setDraggedId(null)}
            className={`rounded-md ${
              draggedId === item.id ? "opacity-60" : "opacity-100"
            }`}
          >
            <FilterCheckboxItem
              id={`column-${item.id}`}
              label={item.label}
              checked={item.required ? true : item.checked}
              onChange={(checked) => handleToggle(item.id, checked)}
              disabled={item.required}
              className="w-full cursor-pointer !border-0 !shadow-none"
              checkboxClassName="columns-checkbox"
              startIcon={<GripDotsHorizontalIcon className="h-4 w-4 text-gray-400" />}
              startIconClassName="cursor-grab active:cursor-grabbing"
            />
          </div>
        ))}
      </div>
      {showSave ? (
        <div className="border-t border-gray-100 px-3 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <Button
            size="sm"
            variant="secondary"
            className="w-full border-transparent bg-white text-[var(--color-secondary-500)] shadow-theme-xs hover:bg-[var(--color-secondary-50)]"
            onClick={() => onSaveView?.(items)}
          >
            {saveLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
};

export default ColoumnsFilter;
