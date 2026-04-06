import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../button/Button";
import FilterCheckboxItem from "./FilterCheckboxItem";
import FilterDropdown, { FilterDropdownOption } from "./FilterDropdown";
import { Clear_Icon, CloseIcon, Export_Filter_Icon } from "../../../icons";
import AppIcon from "../icon/AppIcon";

export type FilterRow = {
  id: string;
  column: string;
  condition: string;
  value: string;
};

export type AdvanceFilterTab = "quick" | "advanced";

export type AdvanceFilterState = {
  activeTab: AdvanceFilterTab;
  rows: FilterRow[];
  quickSelections: Record<string, boolean>;
};

interface AdvanceFilterProps {
  defaultTab?: AdvanceFilterTab;
  defaultRows?: FilterRow[];
  onFilterChange?: (state: AdvanceFilterState) => void;
  onSaveView?: (state: AdvanceFilterState) => void;
  onClear?: () => void;
  columnOptions?: FilterDropdownOption[];
  conditionOptions?: FilterDropdownOption[];
  valueOptions?: FilterDropdownOption[];
  valueOptionsByColumn?: Record<string, FilterDropdownOption[]>;
  quickFilterColumns?: Array<{ title: string; items: string[] }>;
  className?: string;
}

const DEFAULT_COLUMN_OPTIONS: FilterDropdownOption[] = [
  { label: "Owner", value: "owner" },
  { label: "Status", value: "status" },
  { label: "Campaign Name", value: "campaign" },
  { label: "Reviewer", value: "reviewer" },
  { label: "Due Date", value: "due_date" },
];

const DEFAULT_CONDITION_OPTIONS: FilterDropdownOption[] = [
  { label: "Is", value: "is" },
  { label: "Is not", value: "is_not" },
  { label: "Contains", value: "contains" },
  { label: "Starts with", value: "starts_with" },
];

const DEFAULT_VALUE_OPTIONS: FilterDropdownOption[] = [
  { label: "To do", value: "todo" },
  { label: "In progress", value: "in_progress" },
  { label: "Complete", value: "complete" },
  { label: "On hold", value: "on_hold" },
];

const DEFAULT_QUICK_FILTER_COLUMNS = [
  {
    title: "My Teams",
    items: ["Team 1", "Team 2", "Team 3"],
  },
  {
    title: "Campaign Name",
    items: [
      "Campaign Name 1",
      "Campaign Name 2",
      "Campaign Name 3",
      "Campaign Name 4",
    ],
  },
  {
    title: "Status",
    items: ["Complete", "In process", "On Hold", "Not Started", "Live", "All", "Archive"],
  },
  {
    title: "Owner",
    items: ["Pranali Goswami", "Manasi P", "Krutika K", "Girish M"],
  },
  {
    title: "Reviewer",
    items: ["Pranali Goswami", "Manasi P", "Krutika K", "Girish M"],
  },
  {
    title: "Due Date",
    items: ["Complete", "In process", "On Hold", "Not Started", "Live", "All"],
  },
];

const createRow = (): FilterRow => ({
  id: `row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  column: "",
  condition: "",
  value: "",
});

const AdvanceFilter = ({
  defaultTab = "advanced",
  defaultRows,
  onFilterChange,
  onSaveView,
  onClear,
  columnOptions,
  conditionOptions,
  valueOptions,
  valueOptionsByColumn,
  quickFilterColumns,
  className = "w-2/3",
}: AdvanceFilterProps) => {
  const onFilterChangeRef = useRef(onFilterChange);
  const resolvedColumnOptions = columnOptions ?? DEFAULT_COLUMN_OPTIONS;
  const resolvedConditionOptions = conditionOptions ?? DEFAULT_CONDITION_OPTIONS;
  const resolvedValueOptions = valueOptions ?? DEFAULT_VALUE_OPTIONS;
  const resolvedQuickFilterColumns =
    quickFilterColumns ?? DEFAULT_QUICK_FILTER_COLUMNS;
  const fallbackRows: FilterRow[] = [
    {
      id: "row-1",
      column: "",
      condition: "",
      value: "",
    },
  ];

  const initialRows = defaultRows ?? fallbackRows;

  const [activeTab, setActiveTab] = useState<AdvanceFilterTab>(defaultTab);
  const [rows, setRows] = useState<FilterRow[]>(initialRows);

  const quickFilterState = useMemo(() => {
    const initialState: Record<string, boolean> = {};
    resolvedQuickFilterColumns.forEach((column) => {
      initialState[`${column.title}-__header__`] = false;
      column.items.forEach((item) => {
        initialState[`${column.title}-${item}`] = false;
      });
    });
    return initialState;
  }, [resolvedQuickFilterColumns]);

  const [quickSelections, setQuickSelections] =
    useState<Record<string, boolean>>(quickFilterState);

  const hasQuickFilterSelection = useMemo(
    () =>
      Object.entries(quickSelections).some(
        ([key, checked]) => !key.endsWith("-__header__") && checked
      ),
    [quickSelections]
  );

  const hasAdvancedFilterSelection = useMemo(
    () =>
      rows.some(
        (row) =>
          row.column.trim() !== "" &&
          row.condition.trim() !== "" &&
          row.value.trim() !== ""
      ),
    [rows]
  );

  const hasActiveSelection =
    activeTab === "quick" ? hasQuickFilterSelection : hasAdvancedFilterSelection;

  const handleRowChange = (id: string, field: keyof FilterRow, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createRow()]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleQuickToggle = (key: string, checked: boolean) => {
    setQuickSelections((prev) => {
      if (key.endsWith("-__header__")) {
        const columnTitle = key.replace("-__header__", "");
        const updated: Record<string, boolean> = { ...prev, [key]: checked };
        resolvedQuickFilterColumns
          .find((column) => column.title === columnTitle)
          ?.items.forEach((item) => {
            updated[`${columnTitle}-${item}`] = checked;
          });
        return updated;
      }
      return { ...prev, [key]: checked };
    });
  };

  const handleClearFilter = () => {
    setRows(initialRows);
    setQuickSelections(quickFilterState);
    onClear?.();
  };

  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  useEffect(() => {
    setQuickSelections((prev) => {
      const merged = { ...quickFilterState };
      Object.entries(prev).forEach(([key, value]) => {
        if (key in merged) {
          merged[key] = value;
        }
      });
      return merged;
    });
  }, [quickFilterState]);

  useEffect(() => {
    onFilterChangeRef.current?.({
      activeTab,
      rows,
      quickSelections,
    });
  }, [activeTab, rows, quickSelections]);

  return (
    <section className={`border border-gray-200 p-4 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("quick")}
            className={`text-sm font-semibold ${
              activeTab === "quick" ? "text-gray-900" : "text-gray-400"
            }`}
          >
            Quick Filter
          </button>
          <span className="h-4 w-px bg-gray-200" />
          <button
            type="button"
            onClick={() => setActiveTab("advanced")}
            className={`text-sm font-semibold ${
              activeTab === "advanced" ? "text-gray-900" : "text-gray-400"
            }`}
          >
            Advance Filter
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleClearFilter}
            disabled={!hasActiveSelection}
            startIcon={
              <AppIcon
                icon={Clear_Icon}
                color="var(--color-secondary-600)"
                forceColor
              />
            }
            className="!h-auto !gap-1 !border-0 !bg-transparent !px-0 !py-0 !text-[11px] !font-medium text-[var(--color-secondary-500)] hover:!bg-transparent hover:!text-[var(--color-secondary-600)]"
          >
            Clear Filter
          </Button>
          <span className="h-4 w-px bg-gray-200" />
           <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleClearFilter}
            disabled={!hasActiveSelection}
            startIcon={
              <AppIcon
                icon={Export_Filter_Icon}
                color="var(--color-secondary-600)"
                forceColor
              />
            }
            className="!h-auto !gap-1 !border-0 !bg-transparent !px-0 !py-0 !text-[11px] !font-medium text-[var(--color-secondary-500)] hover:!bg-transparent hover:!text-[var(--color-secondary-600)]"
          >
            Export
          </Button>
          <span className="h-4 w-px bg-gray-200" />
          <Button
            size="sm"
            variant="orangebutton"
            disabled={!hasActiveSelection}
            className="border-transparent !font-semibold !px-4 !py-1 !rounded-sm !text-[11px]"
            onClick={() =>
              onSaveView?.({
                activeTab,
                rows,
                quickSelections,
              })
            }
          >
            Save as view
          </Button>
        </div>
      </div>

      {activeTab === "advanced" ? (
        <div className="mt-4 space-y-3 w-full">
          {rows.map((row, index) => (
            <div key={row.id} className="flex flex-wrap items-center gap-2">
              {index === 0 && (
                <span className="w-12 text-xs font-semibold text-gray-500">
                  Where
                </span>
              )}
              {index !== 0 && <span className="w-12" />}
              <div className="flex w-full flex-1 flex-wrap gap-2">
                <FilterDropdown
                  value={row.column}
                  options={resolvedColumnOptions}
                  placeholder="Column"
                  onChange={(value) => handleRowChange(row.id, "column", value)}
                  className="min-w-[140px] flex-1"
                />
                <FilterDropdown
                  value={row.condition}
                  options={resolvedConditionOptions}
                  placeholder="Condition"
                  onChange={(value) =>
                    handleRowChange(row.id, "condition", value)
                  }
                  className="min-w-[140px] flex-1"
                />
                <FilterDropdown
                  value={row.value}
                  options={
                    valueOptionsByColumn?.[row.column] ?? resolvedValueOptions
                  }
                  placeholder="Value"
                  onChange={(value) => handleRowChange(row.id, "value", value)}
                  className="min-w-[140px] flex-1"
                />
              </div>
              {rows.length > 1 && (
               
                <button
                  type="button"
                  onClick={() => handleRemoveRow(row.id)}
                  className="text-gray-400 transition hover:text-gray-600"
                  aria-label="Remove filter row"
                >
                   <CloseIcon/>
                </button>
              )}
            </div>
          ))}
          <div className="pl-[52px]">
            <Button size="sm" className="!rounded-[4px] text-[13px] px-2 py-2" variant="primary" onClick={handleAddRow}>
              Apply New Filter
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {resolvedQuickFilterColumns.map((column) => (
            <div key={column.title} className="space-y-2">
              <FilterCheckboxItem
                id={`quick-${column.title}-header`}
                label={column.title}
                checked={quickSelections[`${column.title}-__header__`] ?? false}
                onChange={(checked) =>
                  handleQuickToggle(`${column.title}-__header__`, checked)
                }
                className="!bg-[#EBE9E9] font-semibold text-gray-600 !border-transparent !shadow-none"
              />
              {column.items.map((item) => {
                const key = `${column.title}-${item}`;
                return (
                  <FilterCheckboxItem
                    key={key}
                    id={`quick-${key}`}
                    label={item}
                    checked={quickSelections[key]}
                    onChange={(checked) => handleQuickToggle(key, checked)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdvanceFilter;
