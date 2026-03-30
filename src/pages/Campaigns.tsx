import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type WheelEvent } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageContentContainer from "../components/layout/PageContentContainer";
import PaginationControls from "../components/common/PaginationControls";
import SearchInput from "../components/ui/search-input/SearchInput";
import AdvanceFilter, {
  type AdvanceFilterState,
  type FilterRow,
} from "../components/ui/advance-filter/AdvanceFilter";
import SelectedItem, {
  type SelectedItemAction,
} from "../components/ui/selected-item/SelectedItem";
import Popup from "../components/ui/popup/Popup";
import ColoumnsFilter, {
  type ColumnItem,
} from "../components/ui/columns-filter/ColoumnsFilter";
import CampaignTableRow from "../components/ui/campaign-table-row/CampaignTableRow";
import { JobsFAB } from "../components/jobs";
import { TableHeaderRow } from "../components/ui/table";
import { ChevronDownIcon, FilterIcon, VerticalDots } from "../icons";
import { normalizeColumns } from "../data/columnsConfig";
import {
  type CampaignRowData,
  type StatusCategory,
} from "../data/campaigns";
import { useColumnsConfig } from "../context/ColumnsConfigContext";
import { useCampaignsStore } from "../stores/campaignsStore";
import { resolveLabel } from "../data/localization";
import { useLocalizationStore } from "../stores/localizationStore";
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

const STATUS_LABEL_TO_CATEGORY: Record<string, StatusCategory | null> = {
  Complete: "complete",
  "In process": "in_progress",
  "On Hold": "on_hold",
  "Not Started": "not_started",
  Live: "live",
  Archive: "archive",
  All: null,
};

const ADVANCED_VALUE_TO_CATEGORY: Record<string, StatusCategory | null> = {
  todo: "not_started",
  in_progress: "in_progress",
  complete: "complete",
  on_hold: "on_hold",
};

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

  return data.filter((row) => {
    const teamSelections = selections["My Teams"];
    if (teamSelections?.length && !teamSelections.includes(row.team ?? "")) {
      return false;
    }

    const campaignSelections = selections["Campaign Name"];
    const campaignLabel = row.campaignName ?? row.title;
    if (
      campaignSelections?.length &&
      !campaignSelections.includes(campaignLabel)
    ) {
      return false;
    }

    const ownerSelections = selections["Owner"];
    if (ownerSelections?.length && !ownerSelections.includes(row.ownerName)) {
      return false;
    }

    const reviewerSelections = selections["Reviewer"];
    if (
      reviewerSelections?.length &&
      !reviewerSelections.includes(row.reviewerName ?? "")
    ) {
      return false;
    }

    const statusSelections = selections["Status"];
    if (statusSelections?.length && !statusSelections.includes("All")) {
      const categories = statusSelections
        .map((item) => STATUS_LABEL_TO_CATEGORY[item])
        .filter((value): value is StatusCategory => Boolean(value));
      if (categories.length > 0 && !categories.includes(row.statusCategory)) {
        return false;
      }
    }

    const dueSelections = selections["Due Date"];
    if (dueSelections?.length && !dueSelections.includes("All")) {
      const categories = dueSelections
        .map((item) => STATUS_LABEL_TO_CATEGORY[item])
        .filter((value): value is StatusCategory => Boolean(value));
      if (categories.length > 0 && !categories.includes(row.dueDateCategory)) {
        return false;
      }
    }

    return true;
  });
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
      const column = filterRow.column;
      const isStatusColumn = column === "status" || column === "due_date";
      const fieldValue = (() => {
        switch (column) {
          case "owner":
            return row.ownerName;
          case "status":
            return row.statusCategory;
          case "campaign":
            return row.campaignName ?? row.title;
          case "reviewer":
            return row.reviewerName ?? "";
          case "due_date":
            return row.dueDateCategory ?? row.endDate;
          default:
            return "";
        }
      })();

      const targetValue = isStatusColumn
        ? ADVANCED_VALUE_TO_CATEGORY[filterRow.value] ?? ""
        : ADVANCED_VALUE_TO_LABEL[filterRow.value] ?? filterRow.value;

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
  const [search, setSearch] = useState("");
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(
    null
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeViewId, setActiveViewId] = useState<string>("all");
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [openViewMenuId, setOpenViewMenuId] = useState<string | null>(null);
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
  const viewMenuRef = useRef<HTMLDivElement>(null);
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
    pagination,
    goToNextPage,
    goToPreviousPage,
    setCurrentPage,
    setPageSize,
    resetPagination,
  } = useCampaignsStore();
  const campaignsCurrentPage = pagination.currentPage;
  const campaignsPageSize = pagination.pageSize;
  const allCount = campaigns.length;
  const visibleColumns = useMemo(() => columns.filter((item) => item.checked), [
    columns,
  ]);
  const tableMinWidth = useMemo(() => {
    const baseWidth = 320;
    const columnWidth = 150;
    return Math.max(900, baseWidth + visibleColumns.length * columnWidth);
  }, [visibleColumns.length]);

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

  const filteredCampaigns = useMemo(
    () => applyFilters(campaigns, activeFilterState),
    [activeFilterState, campaigns]
  );

  const visibleCampaigns = useMemo(
    () => applySearchFilter(filteredCampaigns, search),
    [filteredCampaigns, search]
  );

  const totalCampaignPages = useMemo(
    () => Math.max(1, Math.ceil(visibleCampaigns.length / campaignsPageSize)),
    [visibleCampaigns.length, campaignsPageSize]
  );

  const currentCampaignPage = Math.min(campaignsCurrentPage, totalCampaignPages);

  const paginatedCampaigns = useMemo(() => {
    const start = (currentCampaignPage - 1) * campaignsPageSize;
    return visibleCampaigns.slice(start, start + campaignsPageSize);
  }, [visibleCampaigns, currentCampaignPage, campaignsPageSize]);

  const campaignsFrom = visibleCampaigns.length
    ? (currentCampaignPage - 1) * campaignsPageSize + 1
    : 0;
  const campaignsTo = visibleCampaigns.length
    ? Math.min(visibleCampaigns.length, currentCampaignPage * campaignsPageSize)
    : 0;

  const canGoToPreviousCampaignPage = currentCampaignPage > 1;
  const canGoToNextCampaignPage = currentCampaignPage < totalCampaignPages;

  const visibleIds = useMemo(
    () => new Set(visibleCampaigns.map((row) => row.id)),
    [visibleCampaigns]
  );

  const allCampaignsSelected =
    paginatedCampaigns.length > 0 &&
    paginatedCampaigns.every((row) => selectedCampaignIds.includes(row.id));

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
    if (!openViewMenuId) return;
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        viewMenuRef.current &&
        !viewMenuRef.current.contains(event.target as Node)
      ) {
        setOpenViewMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openViewMenuId]);

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
          (id) => !paginatedCampaigns.some((row) => row.id === id)
        );
      }
      const next = new Set(prev);
      paginatedCampaigns.forEach((row) => {
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
    setOpenViewMenuId(null);
    setCurrentFilterState(null);
    setFilterResetKey((prev) => prev + 1);
    resetPagination();
  };

  const handleViewSelect = (view: SavedView) => {
    setActiveViewId(view.id);
    setOpenViewMenuId(null);
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
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    container.scrollLeft += event.deltaY;
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

  const handleRenameView = (viewId: string) => {
    const view = savedViews.find((item) => item.id === viewId);
    if (!view) return;
    const nextName = window.prompt("Rename view", view.name);
    if (!nextName?.trim()) return;
    setSavedViews((prev) =>
      prev.map((item) =>
        item.id === viewId ? { ...item, name: nextName.trim() } : item
      )
    );
  };

  const handleRemoveView = (viewId: string) => {
    setSavedViews((prev) => prev.filter((item) => item.id !== viewId));
    setOpenViewMenuId(null);
    if (activeViewId === viewId) {
      handleAllClick();
    }
  };

  const getViewCount = (view: SavedView) =>
    applyFilters(campaigns, view.filterState).length;

  useEffect(() => {
    if (campaignsCurrentPage > totalCampaignPages) {
      setCurrentPage(totalCampaignPages);
    }
  }, [campaignsCurrentPage, totalCampaignPages, setCurrentPage]);

  return (
    <>
      <PageMeta title={campaignsTitle} description="Manage campaigns" />

      <PageContentContainer className="p-6 overflow-visible">
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
                    ? "border-transparent bg-[var(--color-primary-50)] text-[var(--color-primary-500)]"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                All ({allCount})
              </button>
              {savedViews.map((view) => {
                const isActive = activeViewId === view.id;
                return (
                  <div
                    key={view.id}
                    className={`group relative inline-flex items-center rounded-sm border ${
                      isActive
                        ? "border-transparent bg-[var(--color-primary-50)] text-[var(--color-primary-500)]"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleViewSelect(view)}
                      className="px-2 py-0.5 text-[13px] font-regular"
                    >
                      {view.name} ({getViewCount(view)})
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenViewMenuId((prev) =>
                          prev === view.id ? null : view.id
                        );
                        setActiveViewId(view.id);
                      }}
                      className="pr-1 text-gray-400 opacity-0 pointer-events-none transition hover:text-gray-600 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                      aria-label={`${view.name} options`}
                    >
                      <VerticalDots className="h-4 w-4" />
                    </button>
                    {openViewMenuId === view.id ? (
                      <div
                        ref={viewMenuRef}
                        className="absolute right-0 top-full z-30 mt-2"
                      >
                        <Popup
                          items={[
                            {
                              id: "rename",
                              label: "Rename",
                              onClick: () => handleRenameView(view.id),
                            },
                            {
                              id: "remove",
                              label: "Remove",
                              onClick: () => handleRemoveView(view.id),
                            },
                          ]}
                          className="!min-w-[160px] rounded-lg"
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div ref={filterPanelRef} className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="rounded-sm border border-gray-200 bg-white p-1 text-gray-500 transition hover:bg-gray-50"
                aria-label="Open filters"
              >
                <FilterIcon  className="h-3 w-3" />
              </button>
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
                  onFilterChange={(state) => {
                    setCurrentFilterState(state);
                    setActiveViewId("all");
                  }}
                  onSaveView={handleSaveView}
                  className="w-[860px] max-w-[90vw] rounded-xl bg-white"
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
                    columnClassName="px-3 py-2"
                    prefixCells={[
                      {
                        className: "px-3 py-2 text-gray-300",
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
                      { className: "px-3 py-2", content: null },
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
                  {paginatedCampaigns.map((row) => (
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
                      visibleColumns={visibleColumns.map((column) => column.id)}
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

          {visibleCampaigns.length > 0 ? (
            <PaginationControls
              total={visibleCampaigns.length}
              from={campaignsFrom}
              to={campaignsTo}
              label="results"
              canGoPrevious={canGoToPreviousCampaignPage}
              canGoNext={canGoToNextCampaignPage}
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
              pageSize={campaignsPageSize}
              pageSizeOptions={[5, 10, 20]}
              onPageSizeChange={setPageSize}
            />
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
