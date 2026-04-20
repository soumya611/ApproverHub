import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../button/Button";
import FilterCheckboxItem from "./FilterCheckboxItem";
import FilterDropdown, { type FilterDropdownOption } from "./FilterDropdown";
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

export type AdvanceFilterQuickColumn = {
  key?: string;
  title: string;
  items: string[];
};

export interface AdvanceFilterLabels {
  headerTitle: string;
  quickTab: string;
  advancedTab: string;
  clearAction: string;
  exportAction: string;
  saveViewAction: string;
  whereLabel: string;
  addNewFilterAction: string;
  applyFilterAction: string;
}

export interface AdvanceFilterVisibility {
  showHeader: boolean;
  showTabs: boolean;
  showQuickTab: boolean;
  showAdvancedTab: boolean;
  showClearAction: boolean;
  showExportAction: boolean;
  showSaveViewAction: boolean;
}

interface AdvanceFilterProps {
  defaultTab?: AdvanceFilterTab;
  defaultRows?: FilterRow[];
  initialState?: AdvanceFilterState | null;
  onFilterChange?: (state: AdvanceFilterState) => void;
  onSaveView?: (state: AdvanceFilterState) => void;
  onExport?: (state: AdvanceFilterState) => void;
  onClear?: () => void;
  columnOptions?: FilterDropdownOption[];
  conditionOptions?: FilterDropdownOption[];
  valueOptions?: FilterDropdownOption[];
  valueOptionsByColumn?: Record<string, FilterDropdownOption[]>;
  quickFilterColumns?: AdvanceFilterQuickColumn[];
  labels?: Partial<AdvanceFilterLabels>;
  visibility?: Partial<AdvanceFilterVisibility>;
  className?: string;
  advancedHeaderRowOnly?: boolean;
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

const DEFAULT_QUICK_FILTER_COLUMNS: AdvanceFilterQuickColumn[] = [
  {
    key: "team",
    title: "My Teams",
    items: ["Team 1", "Team 2", "Team 3"],
  },
  {
    key: "campaign",
    title: "Campaign Name",
    items: [
      "Campaign Name 1",
      "Campaign Name 2",
      "Campaign Name 3",
      "Campaign Name 4",
    ],
  },
  {
    key: "status",
    title: "Status",
    items: [
      "Complete",
      "In process",
      "On Hold",
      "Not Started",
      "Live",
      "All",
      "Archive",
    ],
  },
];

const createRow = (): FilterRow => ({
  id: `row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  column: "",
  condition: "",
  value: "",
});

const DEFAULT_LABELS: AdvanceFilterLabels = {
  headerTitle: "",
  quickTab: "Quick Filter",
  advancedTab: "Advance Filter",
  clearAction: "Clear Filter",
  exportAction: "Export",
  saveViewAction: "Save as view",
  whereLabel: "Where",
  addNewFilterAction: "+ Add new filter",
  applyFilterAction: "Apply Filter",
};

const DEFAULT_VISIBILITY: AdvanceFilterVisibility = {
  showHeader: true,
  showTabs: true,
  showQuickTab: true,
  showAdvancedTab: true,
  showClearAction: true,
  showExportAction: true,
  showSaveViewAction: true,
};

const getQuickColumnKey = (column: AdvanceFilterQuickColumn) =>
  column.key ?? column.title;

const cloneRows = (rows: FilterRow[]) => rows.map((row) => ({ ...row }));

const buildQuickSelections = (
  columns: AdvanceFilterQuickColumn[],
  existingSelections?: Record<string, boolean>
) => {
  const nextState: Record<string, boolean> = {};

  columns.forEach((column) => {
    const columnKey = getQuickColumnKey(column);
    nextState[`${columnKey}-__header__`] = false;
    column.items.forEach((item) => {
      nextState[`${columnKey}-${item}`] = false;
    });
  });

  if (existingSelections) {
    Object.entries(existingSelections).forEach(([key, value]) => {
      if (key in nextState) {
        nextState[key] = value;
      }
    });
  }

  columns.forEach((column) => {
    const columnKey = getQuickColumnKey(column);
    const allSelected =
      column.items.length > 0 &&
      column.items.every((item) => nextState[`${columnKey}-${item}`]);
    nextState[`${columnKey}-__header__`] = allSelected;
  });

  return nextState;
};

const hasSelectedQuickFilters = (quickSelections: Record<string, boolean>) =>
  Object.entries(quickSelections).some(
    ([key, checked]) => !key.endsWith("-__header__") && checked
  );

const hasSelectedAdvancedFilters = (rows: FilterRow[]) =>
  rows.some(
    (row) =>
      row.column.trim() !== "" &&
      row.condition.trim() !== "" &&
      row.value.trim() !== ""
  );

export const hasActiveAdvanceFilterState = (
  state?: AdvanceFilterState | null
) => {
  if (!state) {
    return false;
  }

  return (
    hasSelectedQuickFilters(state.quickSelections) ||
    hasSelectedAdvancedFilters(state.rows)
  );
};

const AdvanceFilter = ({
  defaultTab = "advanced",
  defaultRows,
  initialState,
  onFilterChange,
  onSaveView,
  onExport,
  onClear,
  columnOptions,
  conditionOptions,
  valueOptions,
  valueOptionsByColumn,
  quickFilterColumns,
  labels,
  visibility,
  className = "w-2/3",
  advancedHeaderRowOnly = false,
}: AdvanceFilterProps) => {
  const onFilterChangeRef = useRef(onFilterChange);
  const resolvedColumnOptions = columnOptions ?? DEFAULT_COLUMN_OPTIONS;
  const resolvedConditionOptions =
    conditionOptions ?? DEFAULT_CONDITION_OPTIONS;
  const resolvedValueOptions = valueOptions ?? DEFAULT_VALUE_OPTIONS;
  const resolvedQuickFilterColumns =
    quickFilterColumns ?? DEFAULT_QUICK_FILTER_COLUMNS;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const resolvedVisibility = { ...DEFAULT_VISIBILITY, ...visibility };

  const fallbackRows = useMemo<FilterRow[]>(
    () =>
      cloneRows(
        defaultRows ?? [
          {
            id: "row-1",
            column: "",
            condition: "",
            value: "",
          },
        ]
      ),
    [defaultRows]
  );

  const availableTabs = useMemo(() => {
    const tabs: AdvanceFilterTab[] = [];

    if (resolvedVisibility.showQuickTab) {
      tabs.push("quick");
    }
    if (resolvedVisibility.showAdvancedTab) {
      tabs.push("advanced");
    }

    return tabs.length > 0 ? tabs : [defaultTab];
  }, [
    defaultTab,
    resolvedVisibility.showAdvancedTab,
    resolvedVisibility.showQuickTab,
  ]);

  const resolvedDefaultTab = availableTabs.includes(defaultTab)
    ? defaultTab
    : availableTabs[0];

  const quickFilterState = useMemo(
    () => buildQuickSelections(resolvedQuickFilterColumns),
    [resolvedQuickFilterColumns]
  );

  const [activeTab, setActiveTab] = useState<AdvanceFilterTab>(() =>
    initialState?.activeTab && availableTabs.includes(initialState.activeTab)
      ? initialState.activeTab
      : resolvedDefaultTab
  );
  const [rows, setRows] = useState<FilterRow[]>(() =>
    initialState?.rows?.length ? cloneRows(initialState.rows) : fallbackRows
  );
  const [quickSelections, setQuickSelections] = useState<Record<string, boolean>>(
    () => buildQuickSelections(resolvedQuickFilterColumns, initialState?.quickSelections)
  );

  const currentState = useMemo(
    () => ({
      activeTab,
      rows,
      quickSelections,
    }),
    [activeTab, rows, quickSelections]
  );

  const hasQuickFilterSelection = useMemo(
    () => hasSelectedQuickFilters(quickSelections),
    [quickSelections]
  );

  const hasAdvancedFilterSelection = useMemo(
    () => hasSelectedAdvancedFilters(rows),
    [rows]
  );

  const hasActiveSelection =
    activeTab === "quick" ? hasQuickFilterSelection : hasAdvancedFilterSelection;
  const canClear = hasActiveSelection || hasActiveAdvanceFilterState(initialState);

  const emitFilterChange = (nextState: AdvanceFilterState) => {
    onFilterChangeRef.current?.(nextState);
  };

  const handleRowChange = (id: string, field: keyof FilterRow, value: string) => {
    setRows((previous) =>
      previous.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
              ...(field === "column" ? { value: "" } : {}),
            }
          : row
      )
    );
  };

  const handleAddRow = () => {
    setRows((previous) => [...previous, createRow()]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((previous) => {
      const nextRows = previous.filter((row) => row.id !== id);
      if (nextRows.length === 0) {
        const resetRows = [createRow()];
        emitFilterChange({
          activeTab: "advanced",
          rows: resetRows,
          quickSelections,
        });
        return resetRows;
      }
      emitFilterChange({
        activeTab: "advanced",
        rows: nextRows,
        quickSelections,
      });
      return nextRows;
    });
  };

  const handleQuickToggle = (column: AdvanceFilterQuickColumn, item: string | null, checked: boolean) => {
    const columnKey = getQuickColumnKey(column);
    const nextActiveTab: AdvanceFilterTab = "quick";

    setActiveTab(nextActiveTab);
    setQuickSelections((previous) => {
      const nextSelections = { ...previous };

      if (item === null) {
        nextSelections[`${columnKey}-__header__`] = checked;
        column.items.forEach((columnItem) => {
          nextSelections[`${columnKey}-${columnItem}`] = checked;
        });
      } else {
        nextSelections[`${columnKey}-${item}`] = checked;
        nextSelections[`${columnKey}-__header__`] =
          column.items.length > 0 &&
          column.items.every((columnItem) => nextSelections[`${columnKey}-${columnItem}`]);
      }

      emitFilterChange({
        activeTab: nextActiveTab,
        rows,
        quickSelections: nextSelections,
      });

      return nextSelections;
    });
  };

  const handleApplyFilter = () => {
    emitFilterChange({
      activeTab: "advanced",
      rows,
      quickSelections,
    });
  };

  const handleClearFilter = () => {
    const nextRows = fallbackRows;
    const nextQuickSelections = quickFilterState;
    const nextState = {
      activeTab: resolvedDefaultTab,
      rows: nextRows,
      quickSelections: nextQuickSelections,
    };

    setActiveTab(resolvedDefaultTab);
    setRows(nextRows);
    setQuickSelections(nextQuickSelections);
    emitFilterChange(nextState);
    onClear?.();
  };

  const handleExport = () => {
    if (onExport) {
      onExport(currentState);
      return;
    }

    handleClearFilter();
  };

  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(resolvedDefaultTab);
    }
  }, [activeTab, availableTabs, resolvedDefaultTab]);

  useEffect(() => {
    setActiveTab(
      initialState?.activeTab && availableTabs.includes(initialState.activeTab)
        ? initialState.activeTab
        : resolvedDefaultTab
    );
    setRows(initialState?.rows?.length ? cloneRows(initialState.rows) : fallbackRows);
    setQuickSelections(
      buildQuickSelections(
        resolvedQuickFilterColumns,
        initialState?.quickSelections
      )
    );
  }, [
    initialState,
    availableTabs,
    resolvedDefaultTab,
    fallbackRows,
    resolvedQuickFilterColumns,
  ]);

  const showHeader =
    resolvedVisibility.showHeader &&
    Boolean(
      resolvedLabels.headerTitle ||
        (resolvedVisibility.showTabs && availableTabs.length > 0) ||
        resolvedVisibility.showClearAction ||
        resolvedVisibility.showExportAction ||
        resolvedVisibility.showSaveViewAction
    );

  return (
    <section className={`border border-gray-200 p-4 shadow-sm ${className}`}>
      {showHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3 text-sm">
            {resolvedLabels.headerTitle ? (
              <span className="text-sm font-semibold text-gray-900">
                {resolvedLabels.headerTitle}
              </span>
            ) : null}

            {resolvedLabels.headerTitle &&
            resolvedVisibility.showTabs &&
            availableTabs.length > 0 ? (
              <span className="h-4 w-px bg-gray-200" />
            ) : null}

            {resolvedVisibility.showTabs && availableTabs.length > 0 ? (
              <>
                {availableTabs.includes("quick") ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("quick")}
                    className={`text-sm font-semibold ${
                      activeTab === "quick" ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {resolvedLabels.quickTab}
                  </button>
                ) : null}

                {availableTabs.includes("quick") &&
                availableTabs.includes("advanced") ? (
                  <span className="h-4 w-px bg-gray-200" />
                ) : null}

                {availableTabs.includes("advanced") ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("advanced")}
                    className={`text-sm font-semibold ${
                      activeTab === "advanced"
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {resolvedLabels.advancedTab}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>

          {resolvedVisibility.showClearAction ||
          resolvedVisibility.showExportAction ||
          resolvedVisibility.showSaveViewAction ? (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {resolvedVisibility.showClearAction ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleClearFilter}
                  disabled={!canClear}
                  startIcon={
                    <AppIcon
                      icon={Clear_Icon}
                      color="var(--color-secondary-600)"
                      forceColor
                    />
                  }
                  className="!h-auto !gap-1 !border-0 !bg-transparent !px-0 !py-0 !text-[11px] !font-medium text-[var(--color-secondary-500)] hover:!bg-transparent hover:!text-[var(--color-secondary-600)]"
                >
                  {resolvedLabels.clearAction}
                </Button>
              ) : null}

              {resolvedVisibility.showClearAction &&
              (resolvedVisibility.showExportAction ||
                resolvedVisibility.showSaveViewAction) ? (
                <span className="h-4 w-px bg-gray-200" />
              ) : null}

              {resolvedVisibility.showExportAction ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleExport}
                  disabled={!hasActiveAdvanceFilterState(currentState)}
                  startIcon={
                    <AppIcon
                      icon={Export_Filter_Icon}
                      color="var(--color-secondary-600)"
                      forceColor
                    />
                  }
                  className="!h-auto !gap-1 !border-0 !bg-transparent !px-0 !py-0 !text-[11px] !font-medium text-[var(--color-secondary-500)] hover:!bg-transparent hover:!text-[var(--color-secondary-600)]"
                >
                  {resolvedLabels.exportAction}
                </Button>
              ) : null}

              {resolvedVisibility.showExportAction &&
              resolvedVisibility.showSaveViewAction ? (
                <span className="h-4 w-px bg-gray-200" />
              ) : null}

              {resolvedVisibility.showSaveViewAction ? (
                <Button
                  size="sm"
                  variant="orangebutton"
                  disabled={!hasActiveAdvanceFilterState(currentState)}
                  className="border-transparent !rounded-sm !px-4 !py-1 !text-[11px] !font-semibold"
                  onClick={() => onSaveView?.(currentState)}
                >
                  {resolvedLabels.saveViewAction}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === "advanced" ? (
        <div className={`${showHeader ? "mt-4" : ""} w-full space-y-4`}>
          {advancedHeaderRowOnly ? (
            <div className="pl-[52px]">
              <div className="grid w-full grid-cols-[minmax(140px,1fr)_minmax(140px,1fr)_minmax(140px,1fr)_16px] gap-2">
                <span className="min-w-[140px] flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500">
                  Column
                </span>
                <span className="min-w-[140px] flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500">
                  Condition
                </span>
                <span className="min-w-[140px] flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500">
                  Value
                </span>
                <span className="w-4" />
              </div>
            </div>
          ) : null}
          {rows.map((row, index) => (
            <div key={row.id} className="flex flex-wrap items-start gap-2">
              {!advancedHeaderRowOnly && index === 0 ? (
                <span className="w-12 text-xs font-semibold text-gray-500">
                  {resolvedLabels.whereLabel}
                </span>
              ) : (
                <span className="w-12" />
              )}

              <div
                className={
                  advancedHeaderRowOnly
                    ? "grid w-full flex-1 grid-cols-[minmax(140px,1fr)_minmax(140px,1fr)_minmax(140px,1fr)_16px] gap-2"
                    : "flex w-full flex-1 flex-wrap gap-2"
                }
              >
                <FilterDropdown
                  value={row.column}
                  options={resolvedColumnOptions}
                  placeholder="Column"
                  onChange={(value) => handleRowChange(row.id, "column", value)}
                  className={advancedHeaderRowOnly ? "w-full" : "min-w-[140px] flex-1"}
                />
                <FilterDropdown
                  value={row.condition}
                  options={resolvedConditionOptions}
                  placeholder="Condition"
                  onChange={(value) =>
                    handleRowChange(row.id, "condition", value)
                  }
                  className={advancedHeaderRowOnly ? "w-full" : "min-w-[140px] flex-1"}
                />
                <FilterDropdown
                  value={row.value}
                  options={
                    valueOptionsByColumn?.[row.column] ?? resolvedValueOptions
                  }
                  placeholder="Value"
                  onChange={(value) => handleRowChange(row.id, "value", value)}
                  className={advancedHeaderRowOnly ? "w-full" : "min-w-[140px] flex-1"}
                />
                {advancedHeaderRowOnly ? (
                  <div className="flex items-center justify-center">
                    {rows.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="text-gray-400 transition hover:text-gray-600"
                        aria-label="Remove filter row"
                      >
                        <CloseIcon className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {!advancedHeaderRowOnly && rows.length > 1 ? (
                <button
                  type="button"
                  onClick={() => handleRemoveRow(row.id)}
                  className="text-gray-400 transition hover:text-gray-600"
                  aria-label="Remove filter row"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ))}

          <div className="pl-[52px]">
            <button
              type="button"
              onClick={handleAddRow}
              className="text-sm font-medium text-[var(--color-secondary-500)] transition hover:text-[var(--color-secondary-600)]"
            >
              {resolvedLabels.addNewFilterAction}
            </button>
          </div>

          <div className="pl-[52px]">
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={handleApplyFilter}
              disabled={!hasAdvancedFilterSelection}
              className="!rounded-[4px] !px-4 !py-2 !text-[13px]"
            >
              {resolvedLabels.applyFilterAction}
            </Button>
          </div>
        </div>
      ) : (
        <div className={`${showHeader ? "mt-4" : ""} overflow-x-auto custom-scrollbar`}>
          <div className="grid min-w-max grid-flow-col auto-cols-[minmax(150px,1fr)] gap-1">
            {resolvedQuickFilterColumns.map((column) => {
              const columnKey = getQuickColumnKey(column);

              return (
                <div key={columnKey} className="space-y-1">
                  <FilterCheckboxItem
                    id={`quick-${columnKey}-header`}
                    label={column.title}
                    checked={quickSelections[`${columnKey}-__header__`] ?? false}
                    onChange={(checked) =>
                      handleQuickToggle(column, null, checked)
                    }
                    className="!border-transparent !bg-[#EBE9E9] !py-1.5 font-semibold text-gray-600 !shadow-none"
                  />

                  {column.items.map((item) => {
                    const itemKey = `${columnKey}-${item}`;

                    return (
                      <FilterCheckboxItem
                        key={itemKey}
                        id={`quick-${itemKey}`}
                        label={item}
                        checked={quickSelections[itemKey] ?? false}
                        onChange={(checked) =>
                          handleQuickToggle(column, item, checked)
                        }
                        className="!py-1.5 !shadow-none"
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default AdvanceFilter;
