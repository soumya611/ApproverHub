import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type WheelEvent } from "react";
import { useNavigate } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import SavedViewChip from "@/components/common/SavedViewChip";
import PageContentContainer from "@/components/layout/PageContentContainer";
import SearchInput from "@/components/ui/search-input/SearchInput";
import AdvanceFilter, {
  hasActiveAdvanceFilterState,
  type AdvanceFilterState,
  type FilterRow,
} from "@/components/ui/advance-filter/AdvanceFilter";
import SelectedItem, {
  type SelectedItemAction,
} from "@/components/ui/selected-item/SelectedItem";
import type { FilterDropdownOption } from "@/components/ui/advance-filter/FilterDropdown";
import ColoumnsFilter, {
  type ColumnItem,
} from "@/components/ui/columns-filter/ColoumnsFilter";
import CampaignTableRow, {
  type CampaignColumnId,
} from "@/components/ui/campaign-table-row/CampaignTableRow";
import { JobsFAB } from "@/components/jobs";
import { TableHeaderRow } from "@/components/ui/table";
import { ChevronDownIcon, CloseIcon, FilterIcon, VerticalDots } from "@/icons";
import { normalizeColumns } from "@/data/columnsConfig";
import {
  type CampaignRowData,
} from "@/data/campaigns";
import { useColumnsConfig } from "@/context/ColumnsConfigContext";
import { useCampaignsStore } from "@/stores/campaignsStore";
import { resolveLabel } from "@/data/localization";
import { useLocalizationStore } from "@/stores/localizationStore";
import { getStickyColumns } from "@/utils/stickyColumns";
import { useInfiniteScrollItems } from "@/hooks/useInfiniteScrollItems";
import {
  getSavedViewsStorageKey,
  readSavedViewsStorage,
  writeSavedViewsStorage,
} from "@/utils/savedViewsStorage";
import AppIcon from "@/components/ui/icon/AppIcon";
type SavedView = {
  id: string;
  name: string;
  filterState: AdvanceFilterState;
};

const DEFAULT_FILTER_ROWS: FilterRow[] = [
  {
    id: "row-1",
    column: "",
    condition: "",
    value: "",
  },
];

const CAMPAIGNS_STICKY_COLUMN_COUNT = 3;
const CAMPAIGN_PREFIX_COLUMN_WIDTHS = [120, 56];
const CAMPAIGN_STICKY_COLUMN_WIDTHS: Partial<Record<CampaignColumnId, number>> =
  {
    campaign_id: 140,
    campaign_name: 240,
    owner: 110,
    business_area: 170,
    job_status: 170,
    campaign_status: 160,
    action: 140,
    campaign_type: 160,
    created_date: 150,
    start_date: 150,
    end_date: 140,
  };

type CampaignFilterableColumnId =
  | "campaign_id"
  | "campaign_name"
  | "owner"
  | "business_area"
  | "job_status"
  | "campaign_status"
  | "campaign_type"
  | "created_date"
  | "start_date"
  | "end_date";

const FILTERABLE_CAMPAIGN_COLUMN_IDS = new Set<CampaignFilterableColumnId>([
  "campaign_id",
  "campaign_name",
  "owner",
  "business_area",
  "job_status",
  "campaign_status",
  "campaign_type",
  "created_date",
  "start_date",
  "end_date",
]);

const ADVANCED_VALUE_TO_LABEL: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  complete: "Complete",
  on_hold: "On hold",
};


const parseQuickSelections = (quickSelections: Record<string, boolean>) => {
  const selectedByColumn: Record<string, string[]> = {};

  Object.entries(quickSelections).forEach(([key, checked]) => {
    if (!checked || key.endsWith("-__header__")) {
      return;
    }
    const splitIndex = key.indexOf("-");
    if (splitIndex === -1) return;
    const column = key.slice(0, splitIndex);
    const item = key.slice(splitIndex + 1);
    if (!selectedByColumn[column]) {
      selectedByColumn[column] = [];
    }
    selectedByColumn[column].push(item);
  });

  return selectedByColumn;
};

const normalizeCampaignFilterColumn = (columnId: string) => {
  switch (columnId) {
    case "campaign":
      return "campaign_name";
    case "status":
      return "campaign_status";
    case "due_date":
      return "end_date";
    default:
      return columnId;
  }
};

const getCampaignFilterValue = (
  row: CampaignRowData,
  columnId: CampaignFilterableColumnId
) => {
  switch (columnId) {
    case "campaign_id":
      return row.campaignId;
    case "campaign_name":
      return row.campaignName ?? row.title;
    case "owner":
      return row.ownerName;
    case "business_area":
      return row.businessArea ?? "";
    case "job_status":
      return row.jobProgress;
    case "campaign_status":
      return row.campaignStatus;
    case "campaign_type":
      return row.campaignType ?? "";
    case "created_date":
      return row.createdDate ?? "";
    case "start_date":
      return row.startDate ?? "";
    case "end_date":
      return row.endDate;
    default:
      return "";
  }
};

const applyQuickFilters = (
  data: CampaignRowData[],
  quickSelections: Record<string, boolean>
) => {
  const selections = parseQuickSelections(quickSelections);

  const hasSelections = Object.values(selections).some(
    (items) => items.length > 0
  );
  if (!hasSelections) {
    return data;
  }

  return data.filter((row) =>
    Object.entries(selections).every(([columnKey, selectedValues]) => {
      if (!selectedValues.length) {
        return true;
      }

      const normalizedColumn = normalizeCampaignFilterColumn(columnKey);
      if (
        !FILTERABLE_CAMPAIGN_COLUMN_IDS.has(
          normalizedColumn as CampaignFilterableColumnId
        )
      ) {
        return true;
      }

      const fieldValue = getCampaignFilterValue(
        row,
        normalizedColumn as CampaignFilterableColumnId
      );

      return Boolean(fieldValue) && selectedValues.includes(fieldValue);
    })
  );
};

const matchCondition = (fieldValue: string, condition: string, target: string) => {
  switch (condition) {
    case "is":
      return fieldValue === target;
    case "is_not":
      return fieldValue !== target;
    case "contains":
      return fieldValue.includes(target);
    case "starts_with":
      return fieldValue.startsWith(target);
    default:
      return true;
  }
};

const applyAdvancedFilters = (data: CampaignRowData[], rows: FilterRow[]) => {
  const validRows = rows.filter(
    (row) => row.column && row.condition && row.value
  );
  if (validRows.length === 0) {
    return data;
  }

  return data.filter((row) =>
    validRows.every((filterRow) => {
      const normalizedColumn = normalizeCampaignFilterColumn(filterRow.column);
      if (
        !FILTERABLE_CAMPAIGN_COLUMN_IDS.has(
          normalizedColumn as CampaignFilterableColumnId
        )
      ) {
        return true;
      }

      const fieldValue = getCampaignFilterValue(
        row,
        normalizedColumn as CampaignFilterableColumnId
      );
      const targetValue =
        ADVANCED_VALUE_TO_LABEL[filterRow.value] ?? filterRow.value;

      if (!fieldValue || !targetValue) {
        return true;
      }

      const normalizedField = String(fieldValue).toLowerCase();
      const normalizedTarget = String(targetValue).toLowerCase();

      return matchCondition(
        normalizedField,
        filterRow.condition,
        normalizedTarget
      );
    })
  );
};

const applySearchFilter = (data: CampaignRowData[], term: string) => {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return data;

  return data.filter((row) => {
    const haystack = [
      row.campaignId,
      row.title,
      row.ownerName,
      row.jobProgress,
      row.campaignStatus,
      row.campaignName,
      row.businessArea,
      row.campaignType,
      row.createdDate,
      row.startDate,
      row.team,
      row.reviewerName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (haystack.includes(normalized)) {
      return true;
    }

    return (
      row.subRows?.some((subRow) => {
        const subHaystack = [
          subRow.jobNumber,
          subRow.title,
          subRow.ownerName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return subHaystack.includes(normalized);
      }) ?? false
    );
  });
};

const applyFilters = (
  data: CampaignRowData[],
  filterState: AdvanceFilterState | null
) => {
  if (!filterState) return data;
  let filtered = data;
  filtered = applyQuickFilters(filtered, filterState.quickSelections);
  filtered = applyAdvancedFilters(filtered, filterState.rows);
  return filtered;
};

export default function Campaigns() {
  const savedViewsStorageKey = useMemo(
    () => getSavedViewsStorageKey("campaigns"),
    []
  );
  const persistedSavedViewsState = useMemo(
    () => readSavedViewsStorage<AdvanceFilterState>(savedViewsStorageKey),
    [savedViewsStorageKey]
  );
  const [search, setSearch] = useState("");
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(
    null
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeViewId, setActiveViewId] = useState<string>(
    persistedSavedViewsState.activeViewId
  );
  const [savedViews, setSavedViews] = useState<SavedView[]>(
    persistedSavedViewsState.savedViews
  );
  const [currentFilterState, setCurrentFilterState] =
    useState<AdvanceFilterState | null>(null);
  const [filterResetKey, setFilterResetKey] = useState(0);
  const { columns, setColumns } = useColumnsConfig();
  const [columnsDraft, setColumnsDraft] = useState<ColumnItem[]>(columns);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const localizationOverrides = useLocalizationStore((s) => s.overrides);
  const campaignsTitle = resolveLabel(
    "page.campaigns.title",
    localizationOverrides
  );
  const navigate = useNavigate();

  const filterPanelRef = useRef<HTMLDivElement>(null);
  const columnsPanelRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const isTableDraggingRef = useRef(false);
  const tableStartXRef = useRef(0);
  const tableScrollLeftRef = useRef(0);

  const {
    campaigns,
    duplicateCampaigns,
    archiveCampaigns,
    pinCampaigns,
  } = useCampaignsStore();
  const allCount = campaigns.length;
  const visibleColumns = useMemo(() => columns.filter((item) => item.checked), [
    columns,
  ]);
  const visibleColumnIds = useMemo(
    () => visibleColumns.map((column) => column.id as CampaignColumnId),
    [visibleColumns]
  );
  const stickyColumns = useMemo(
    () =>
      getStickyColumns({
        stickyColumnCount: CAMPAIGNS_STICKY_COLUMN_COUNT,
        prefixColumnWidths: CAMPAIGN_PREFIX_COLUMN_WIDTHS,
        visibleColumnIds,
        dataColumnWidths: CAMPAIGN_STICKY_COLUMN_WIDTHS,
      }),
    [visibleColumnIds]
  );
  const tableMinWidth = useMemo(() => {
    const baseWidth = 320;
    const columnWidth = 150;
    return Math.max(900, baseWidth + visibleColumns.length * columnWidth);
  }, [visibleColumns.length]);

  const filterableVisibleColumns = useMemo(
    () =>
      visibleColumns.filter((column) =>
        FILTERABLE_CAMPAIGN_COLUMN_IDS.has(
          column.id as CampaignFilterableColumnId
        )
      ),
    [visibleColumns]
  );

  const valueOptionsByColumn = useMemo(
    () =>
      Object.fromEntries(
        filterableVisibleColumns.map((column) => {
          const columnId = column.id as CampaignFilterableColumnId;
          const options: FilterDropdownOption[] = Array.from(
            new Set(
              campaigns
                .map((row) => getCampaignFilterValue(row, columnId))
                .filter(Boolean)
            )
          ).map((value) => ({
            label: value,
            value,
          }));

          return [column.id, options];
        })
      ),
    [campaigns, filterableVisibleColumns]
  );

  const quickFilterColumns = useMemo(
    () =>
      filterableVisibleColumns.map((column) => ({
        key: column.id,
        title: column.label,
        items:
          valueOptionsByColumn[column.id]?.map((option) => option.label) ?? [],
      })),
    [filterableVisibleColumns, valueOptionsByColumn]
  );

  const columnOptions = useMemo<FilterDropdownOption[]>(
    () =>
      filterableVisibleColumns.map((column) => ({
        label: column.label,
        value: column.id,
      })),
    [filterableVisibleColumns]
  );

  const renderColumnHeader = (column: ColumnItem) => {
    if (column.id === "campaign_status") {
      return (
        <span className="inline-flex items-center gap-1">
          {column.label}
          <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
        </span>
      );
    }
    return column.label;
  };

  const activeFilterState = useMemo(() => {
    if (activeViewId === "all") {
      return currentFilterState;
    }
    const view = savedViews.find((item) => item.id === activeViewId);
    return view?.filterState ?? currentFilterState;
  }, [activeViewId, savedViews, currentFilterState]);
  const hasAppliedFilters = hasActiveAdvanceFilterState(activeFilterState);

  const filteredCampaigns = useMemo(
    () => applyFilters(campaigns, activeFilterState),
    [activeFilterState, campaigns]
  );

  const visibleCampaigns = useMemo(
    () => applySearchFilter(filteredCampaigns, search),
    [filteredCampaigns, search]
  );

  const campaignsInfiniteResetKey = useMemo(
    () =>
      JSON.stringify({
        search,
        activeViewId,
        activeFilterState,
      }),
    [search, activeViewId, activeFilterState]
  );

  const {
    visibleItems: renderedCampaigns,
    hasMore: hasMoreCampaigns,
    loaderRef: campaignsLoadMoreRef,
  } = useInfiniteScrollItems(visibleCampaigns, {
    initialCount: 10,
    step: 10,
    resetKey: campaignsInfiniteResetKey,
  });

  const visibleIds = useMemo(
    () => new Set(visibleCampaigns.map((row) => row.id)),
    [visibleCampaigns]
  );

  const allCampaignsSelected =
    renderedCampaigns.length > 0 &&
    renderedCampaigns.every((row) => selectedCampaignIds.includes(row.id));

  const selectionActions: SelectedItemAction[] = [
    {
      id: "duplicate",
      label: "Duplicate",
      onClick: () => {
        duplicateCampaigns(selectedCampaignIds);
        setSelectedCampaignIds([]);
      },
    },
    {
      id: "hold",
      label: "Hold",
      onClick: () => {
        setSelectedCampaignIds([]);
      },
    },
    {
      id: "archive",
      label: "Archive",
      onClick: () => {
        archiveCampaigns(selectedCampaignIds);
        setSelectedCampaignIds([]);
      },
    },
    {
      id: "export",
      label: "Export",
      onClick: () => {
        const rowsToExport = campaigns.filter((row) =>
          selectedCampaignIds.includes(row.id)
        );
        if (!rowsToExport.length) return;
        const headers = [
          "Campaign ID",
          "Title",
          "End Date",
          "Owner",
          "Campaign Status",
        ];
        const lines = rowsToExport.map((row) =>
          [
            row.campaignId,
            row.title,
            row.endDate,
            row.ownerName,
            row.campaignStatus,
          ]
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        );
        const csv = [headers.join(","), ...lines].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `campaigns-export-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      },
    },
    {
      id: "pin",
      label: "Pin",
      onClick: () => {
        pinCampaigns(selectedCampaignIds);
        setSelectedCampaignIds([]);
      },
    },
  ];

  useEffect(() => {
    if (!isFilterOpen) return;
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  useEffect(() => {
    if (!isColumnsOpen) return;
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        columnsPanelRef.current &&
        !columnsPanelRef.current.contains(event.target as Node)
      ) {
        setIsColumnsOpen(false);
        setColumnsDraft(columns);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isColumnsOpen, columns]);

  useEffect(() => {
    if (!isColumnsOpen) {
      setColumnsDraft(columns);
    }
  }, [columns, isColumnsOpen]);

  useEffect(() => {
    writeSavedViewsStorage(savedViewsStorageKey, {
      activeViewId,
      savedViews,
    });
  }, [activeViewId, savedViews, savedViewsStorageKey]);

  useEffect(() => {
    setSelectedCampaignIds((prev) => {
      const next = prev.filter((id) => visibleIds.has(id));
      return next.length === prev.length ? prev : next;
    });
    setExpandedCampaignId((prev) => {
      const next = prev && visibleIds.has(prev) ? prev : null;
      return next === prev ? prev : next;
    });
  }, [visibleIds]);

  const toggleCampaignSelection = (id: string) => {
    setSelectedCampaignIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllCampaigns = (checked: boolean) => {
    setSelectedCampaignIds((prev) => {
      if (!checked) {
        return prev.filter(
          (id) => !renderedCampaigns.some((row) => row.id === id)
        );
      }
      const next = new Set(prev);
      renderedCampaigns.forEach((row) => {
        next.add(row.id);
      });
      return Array.from(next);
    });
  };

  const handleSaveView = (state: AdvanceFilterState) => {
    const existing = savedViews.find(
      (view) => view.name.toLowerCase() === "my campaign"
    );
    if (existing) {
      setSavedViews((prev) =>
        prev.map((view) =>
          view.id === existing.id ? { ...view, filterState: state } : view
        )
      );
      setActiveViewId(existing.id);
    } else {
      const newView = {
        id: `view-${Date.now()}`,
        name: "My Campaign",
        filterState: state,
      };
      setSavedViews((prev) => [...prev, newView]);
      setActiveViewId(newView.id);
    }
    setIsFilterOpen(false);
  };

  const handleAllClick = () => {
    setActiveViewId("all");
    setCurrentFilterState(null);
    setFilterResetKey((prev) => prev + 1);
  };

  const handleClearFilters = () => {
    handleAllClick();
    setIsFilterOpen(false);
  };

  const handleViewSelect = (view: SavedView) => {
    setActiveViewId(view.id);
    setCurrentFilterState(view.filterState);
  };

  const handleColumnsOpen = () => {
    setIsColumnsOpen(true);
    setColumnsDraft(columns);
  };

  const handleColumnsSave = (nextItems: ColumnItem[]) => {
    const normalized = normalizeColumns(nextItems);
    setColumns(normalized);
    setColumnsDraft(normalized);
    setIsColumnsOpen(false);
  };

  const handleTableWheel = (event: WheelEvent<HTMLDivElement>) => {
    const container = tableScrollRef.current;
    if (!container) return;

    // Keep vertical wheel scrolling for the page; only custom-handle horizontal gestures.
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    container.scrollLeft += event.deltaX;
    event.preventDefault();
  };

  const handleTableMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    const container = tableScrollRef.current;
    if (!container || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("input, button, a, select, textarea, label")) {
      return;
    }
    isTableDraggingRef.current = true;
    tableStartXRef.current = event.clientX;
    tableScrollLeftRef.current = container.scrollLeft;
  };

  const handleTableMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const container = tableScrollRef.current;
    if (!container || !isTableDraggingRef.current) return;
    const delta = event.clientX - tableStartXRef.current;
    container.scrollLeft = tableScrollLeftRef.current - delta;
    event.preventDefault();
  };

  const stopTableDragging = () => {
    isTableDraggingRef.current = false;
  };

  const handleRenameView = (viewId: string, nextName: string) => {
    setSavedViews((prev) =>
      prev.map((item) =>
        item.id === viewId ? { ...item, name: nextName } : item
      )
    );
  };

  const handleRemoveView = (viewId: string) => {
    setSavedViews((prev) => prev.filter((item) => item.id !== viewId));
    if (activeViewId === viewId) {
      handleAllClick();
    }
  };

  const getViewCount = (view: SavedView) =>
    applyFilters(campaigns, view.filterState).length;

  return (
    <>
      <PageMeta title={campaignsTitle} description="Manage campaigns" />

      <PageContentContainer className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-[#007B8C]">{campaignsTitle}</h1>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="flex min-w-[220px] max-w-[320px] flex-1 items-center rounded-full border border-gray-200 bg-white px-2 py-1">
              <SearchInput
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder="Search campaign"
                containerClassName="gap-2 "
                inputClassName="text-sm text-gray-700"
                className="text-1xl text-gray-700"
                iconClassName="text-gray-300"
                iconSize="!h-4"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAllClick}
                className={`rounded-sm border px-2 py-0.5 text-[13px] font-regular transition ${
                  activeViewId === "all"
                    ? "border-transparent bg-[var(--color-10)] text-[var(--color-primary-500)]"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                All ({allCount})
              </button>
              {savedViews.map((view) => {
                const isActive = activeViewId === view.id;
                return (
                  <SavedViewChip
                    key={view.id}
                    id={view.id}
                    name={view.name}
                    count={getViewCount(view)}
                    isActive={isActive}
                    activeClassName="border-transparent bg-[var(--color-10)] text-[var(--color-primary-500)]"
                    inactiveClassName="border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    onSelect={() => handleViewSelect(view)}
                    onRename={(nextName) => handleRenameView(view.id, nextName)}
                    onRemove={() => handleRemoveView(view.id)}
                  />
                );
              })}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div ref={filterPanelRef} className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className={`flex items-center justify-center rounded-sm border bg-white p-1 text-gray-500 transition hover:bg-gray-50 ${
                  hasAppliedFilters
                    ? "border-[var(--color-secondary-300)] text-[var(--color-secondary-500)]"
                    : "border-gray-200"
                }`}
                aria-label="Open filters"
              >
               <AppIcon 
                                icon={FilterIcon} 
                                size={16} 
                                color={hasAppliedFilters ? "var(--color-secondary-500)" : "currentColor"} 
                              /> 
              </button>
              {hasAppliedFilters ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClearFilters();
                  }}
                  className="absolute -right-1 -top-1 z-40 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-secondary-500)] text-white shadow-sm"
                  aria-label="Clear active filters"
                >
                  <CloseIcon className="h-2.5 w-2.5" />
                </button>
              ) : null}
              <div
                className={`absolute right-0 top-full z-30 mt-3 transition ${
                  isFilterOpen
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                }`}
              >
                <AdvanceFilter
                  key={filterResetKey}
                  defaultTab="quick"
                  defaultRows={DEFAULT_FILTER_ROWS}
                  initialState={activeFilterState}
                  onFilterChange={(state) => {
                    setCurrentFilterState(
                      hasActiveAdvanceFilterState(state) ? state : null
                    );
                    setActiveViewId("all");
                  }}
                  onClear={handleClearFilters}
                  onSaveView={handleSaveView}
                  className="w-[860px] max-w-[90vw] rounded-xl bg-white"
                  columnOptions={columnOptions}
                  valueOptionsByColumn={valueOptionsByColumn}
                  quickFilterColumns={quickFilterColumns}
                />
              </div>
            </div>
          </div>
        </div>

        {selectedCampaignIds.length > 0 ? (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
            <SelectedItem
              selectedCount={selectedCampaignIds.length}
              actions={selectionActions}
              onClose={() => setSelectedCampaignIds([])}
              className="rounded-xl border border-gray-200 bg-white shadow-[0_12px_24px_-12px_rgba(15,23,42,0.45)]"
            />
          </div>
        ) : null}

        <div className="mt-6 bg-white">
          {visibleCampaigns.length > 0 ? (
            <div
              ref={tableScrollRef}
              onWheel={handleTableWheel}
              onMouseDown={handleTableMouseDown}
              onMouseMove={handleTableMouseMove}
              onMouseUp={stopTableDragging}
              onMouseLeave={stopTableDragging}
              className="overflow-x-auto custom-scrollbar cursor-grab active:cursor-grabbing"
            >
              <table
                className="w-full border-separate border-spacing-y-2"
                style={{ minWidth: `${tableMinWidth}px` }}
              >
                <thead>
                  <TableHeaderRow
                    className="text-left text-[12px] font-bold text-gray-600"
                    columns={visibleColumns}
                    getColumnKey={(column) => column.id}
                    renderColumn={renderColumnHeader}
                    columnClassName={(column) => {
                      const columnId = column.id as CampaignColumnId;
                      const isSticky =
                        stickyColumns.stickyDataColumnIds.has(columnId);

                      return `px-3 py-2 ${
                        isSticky
                          ? "sticky z-20 bg-white shadow-[4px_0_6px_-6px_rgba(15,23,42,0.2)]"
                          : ""
                      }`;
                    }}
                    columnStyle={(column) => {
                      const columnId = column.id as CampaignColumnId;

                      if (!stickyColumns.stickyDataColumnIds.has(columnId)) {
                        return undefined;
                      }

                      const width =
                        CAMPAIGN_STICKY_COLUMN_WIDTHS[columnId] ?? 150;

                      return {
                        left: `${stickyColumns.stickyDataOffsets[columnId] ?? 0}px`,
                        minWidth: `${width}px`,
                        width: `${width}px`,
                      };
                    }}
                    prefixCells={[
                      {
                        className: `${
                          stickyColumns.stickyPrefixIndexes.has(0)
                            ? "sticky z-30 shadow-[4px_0_6px_-6px_rgba(15,23,42,0.2)]"
                            : ""
                        } min-w-[120px] bg-white px-3 py-2 text-gray-300`,
                        style: {
                          left: `${stickyColumns.stickyPrefixOffsets[0] ?? 0}px`,
                          minWidth: `${CAMPAIGN_PREFIX_COLUMN_WIDTHS[0]}px`,
                          width: `${CAMPAIGN_PREFIX_COLUMN_WIDTHS[0]}px`,
                        },
                        content: (
                          <label className="flex items-center gap-2 text-right whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={allCampaignsSelected}
                              onChange={(event) =>
                                toggleAllCampaigns(event.target.checked)
                              }
                              className="h-4 w-4 columns-checkbox"
                            />
                            Select All
                          </label>
                        ),
                      },
                      {
                        className: `${
                          stickyColumns.stickyPrefixIndexes.has(1)
                            ? "sticky z-30 shadow-[4px_0_6px_-6px_rgba(15,23,42,0.2)]"
                            : ""
                        } min-w-[56px] bg-white px-3 py-2`,
                        style: {
                          left: `${stickyColumns.stickyPrefixOffsets[1] ?? 0}px`,
                          minWidth: `${CAMPAIGN_PREFIX_COLUMN_WIDTHS[1]}px`,
                          width: `${CAMPAIGN_PREFIX_COLUMN_WIDTHS[1]}px`,
                        },
                        content: null,
                      },
                    ]}
                    suffixCells={[
                      {
                        className: "px-3 py-2 text-right",
                        content: (
                          <div
                            ref={columnsPanelRef}
                            className="relative flex justify-end"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (isColumnsOpen) {
                                  setIsColumnsOpen(false);
                                  setColumnsDraft(columns);
                                } else {
                                  handleColumnsOpen();
                                }
                              }}
                              className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                              aria-label="Open column settings"
                            >
                              <VerticalDots className="h-4 w-4" />
                            </button>
                            {isColumnsOpen ? (
                              <div className="absolute right-0 top-full z-30 mt-2">
                                <ColoumnsFilter
                                  items={columnsDraft}
                                  onItemsChange={setColumnsDraft}
                                  onSaveView={handleColumnsSave}
                                />
                              </div>
                            ) : null}
                          </div>
                        ),
                      },
                    ]}
                  />
                </thead>
                <tbody>
                  {renderedCampaigns.map((row) => (
                    <CampaignTableRow
                      key={row.id}
                      campaignId={row.campaignId}
                      title={row.title}
                      endDate={row.endDate}
                      jobProgress={row.jobProgress}
                      campaignStatus={row.campaignStatus}
                      jobStatusTag={row.jobStatusTag}
                      ownerName={row.ownerName}
                      ownerAvatarUrl={row.ownerAvatarUrl}
                      subRows={row.subRows}
                      businessArea={row.businessArea}
                      campaignType={row.campaignType}
                      createdDate={row.createdDate}
                      startDate={row.startDate}
                      campaignName={row.campaignName}
                      isSelected={selectedCampaignIds.includes(row.id)}
                      onToggleSelect={() => toggleCampaignSelection(row.id)}
                      isExpanded={expandedCampaignId === row.id}
                      onToggleExpand={() =>
                        setExpandedCampaignId((prev) =>
                          prev === row.id ? null : row.id
                        )
                      }
                      onEdit={() => navigate(`/campaigns/${row.id}/edit`)}
                      visibleColumns={visibleColumnIds}
                      stickyDataColumnIds={stickyColumns.stickyDataColumnIds}
                      stickyDataColumnOffsets={stickyColumns.stickyDataOffsets}
                      stickyDataColumnWidths={CAMPAIGN_STICKY_COLUMN_WIDTHS}
                      isSelectionColumnSticky={stickyColumns.stickyPrefixIndexes.has(
                        0
                      )}
                      selectionColumnOffset={
                        stickyColumns.stickyPrefixOffsets[0] ?? 0
                      }
                      selectionColumnWidth={CAMPAIGN_PREFIX_COLUMN_WIDTHS[0]}
                      isExpandColumnSticky={stickyColumns.stickyPrefixIndexes.has(
                        1
                      )}
                      expandColumnOffset={stickyColumns.stickyPrefixOffsets[1] ?? 0}
                      expandColumnWidth={CAMPAIGN_PREFIX_COLUMN_WIDTHS[1]}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              No campaigns match the current filters.
            </div>
          )}

          {hasMoreCampaigns ? (
            <div
              ref={campaignsLoadMoreRef}
              className="flex justify-center py-5 text-xs text-gray-400"
            >
              Scroll to load more campaigns
            </div>
          ) : null}
        </div>
      </PageContentContainer>

      <JobsFAB
        onClick={() => navigate("/campaigns/new")}
        ariaLabel="Create new campaign"
      />


    </>
  );
}
