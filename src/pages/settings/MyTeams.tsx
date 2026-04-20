import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import SearchInput from "@/components/ui/search-input/SearchInput";
import PageHeader from "@/components/ui/page-header/PageHeader";
import { TableHeaderRow } from "@/components/ui/table";
import AdvanceFilter, { type AdvanceFilterState, type FilterRow } from "@/components/ui/advance-filter/AdvanceFilter";
import type { FilterDropdownOption } from "@/components/ui/advance-filter/FilterDropdown";
import Popup, { type PopupItem } from "@/components/ui/popup/Popup";
import JobsFAB from "@/components/jobs/JobsFAB";
import { AngleLeftIcon, AngleRightIcon, EditDetailsIcon, Export_Icon, FilterIcon } from "@/icons";

interface TeamRow {
  id: string;
  departmentName: string;
  members: number;
  teams: number;
  teamManager: string;
}

interface TeamColumn {
  id: "select" | "departmentName" | "members" | "teams" | "teamManager" | "edit";
  label: string;
  className?: string;
}

const TEAM_COLUMNS: TeamColumn[] = [
  { id: "select", label: "Select all", className: "py-2 px-4 text-left w-[110px]" },
  { id: "departmentName", label: "Department Name", className: "py-2 px-4 text-left" },
  { id: "members", label: "Members", className: "py-2 px-4 text-left w-[120px]" },
  { id: "teams", label: "Teams", className: "py-2 px-4 text-left w-[110px]" },
  { id: "teamManager", label: "Team Manager", className: "py-2 px-4 text-left" },
  { id: "edit", label: "Edit", className: "py-2 px-4 text-left w-[80px]" },
];

const TEAM_ROWS: TeamRow[] = [
  { id: "team-1", departmentName: "Web & App", members: 25, teams: 4, teamManager: "Samay" },
  { id: "team-2", departmentName: "Typesetting", members: 30, teams: 2, teamManager: "Mukesh Sharma" },
  { id: "team-3", departmentName: "Hudson", members: 20, teams: 1, teamManager: "Sweta" },
  { id: "team-4", departmentName: "Accounts", members: 7, teams: 1, teamManager: "Swati" },
  { id: "team-5", departmentName: "Perivan", members: 10, teams: 1, teamManager: "Anup Jamsandekar" },
];

const DEFAULT_FILTER_ROWS: FilterRow[] = [
  {
    id: "row-1",
    column: "",
    condition: "",
    value: "",
  },
];

const COLUMN_OPTIONS: FilterDropdownOption[] = [
  { label: "Department Name", value: "departmentName" },
  { label: "Members", value: "members" },
  { label: "Teams", value: "teams" },
  { label: "Team Manager", value: "teamManager" },
];

const CONDITION_OPTIONS: FilterDropdownOption[] = [
  { label: "IS", value: "is" },
  { label: "Is not", value: "is_not" },
  { label: "Contains", value: "contains" },
  { label: "Starts with", value: "starts_with" },
];

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

const parseCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
};

const parseCsvText = (content: string) =>
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCsvLine);

const escapeCsvValue = (value: string) => `"${String(value).replace(/"/g, '""')}"`;

const parseQuickSelections = (quickSelections: Record<string, boolean>) => {
  const selectedByColumn: Record<string, string[]> = {};

  Object.entries(quickSelections).forEach(([key, checked]) => {
    if (!checked || key.endsWith("-__header__")) return;
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

const applyQuickFilters = (rows: TeamRow[], quickSelections: Record<string, boolean>) => {
  const selections = parseQuickSelections(quickSelections);
  const hasSelections = Object.values(selections).some((items) => items.length > 0);
  if (!hasSelections) return rows;

  return rows.filter((row) => {
    const teamSelections = selections["My Teams"];
    if (teamSelections?.length && !teamSelections.includes(row.departmentName)) return false;

    const campaignSelections = selections["Campaign Name"];
    if (campaignSelections?.length && !campaignSelections.includes(row.departmentName)) return false;

    const statusSelections = selections["Status"];
    if (statusSelections?.length && !statusSelections.includes(String(row.teams))) return false;

    const ownerSelections = selections["Owner"];
    if (ownerSelections?.length && !ownerSelections.includes(row.teamManager)) return false;

    const reviewerSelections = selections["Reviewer"];
    if (reviewerSelections?.length && !reviewerSelections.includes(row.teamManager)) return false;

    const dueDateSelections = selections["Due Date"];
    if (dueDateSelections?.length && !dueDateSelections.includes(String(row.members))) return false;

    return true;
  });
};

export default function MyTeams() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [teamRows, setTeamRows] = useState<TeamRow[]>(TEAM_ROWS);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [currentFilterState, setCurrentFilterState] = useState<AdvanceFilterState | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 50;

  const uniqueDepartments = useMemo(
    () => Array.from(new Set(teamRows.map((row) => row.departmentName))),
    [teamRows]
  );
  const uniqueManagers = useMemo(
    () => Array.from(new Set(teamRows.map((row) => row.teamManager))),
    [teamRows]
  );
  const uniqueMemberCounts = useMemo(
    () => Array.from(new Set(teamRows.map((row) => String(row.members)))),
    [teamRows]
  );
  const uniqueTeamCounts = useMemo(
    () => Array.from(new Set(teamRows.map((row) => String(row.teams)))),
    [teamRows]
  );

  const filteredBySearchRows = teamRows.filter((row) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return `${row.departmentName} ${row.teamManager}`.toLowerCase().includes(term);
  });

  const valueOptionsByColumn: Record<string, FilterDropdownOption[]> = {
    departmentName: Array.from(new Set(teamRows.map((row) => row.departmentName))).map((value) => ({
      label: value,
      value,
    })),
    members: Array.from(new Set(teamRows.map((row) => String(row.members)))).map((value) => ({
      label: value,
      value,
    })),
    teams: Array.from(new Set(teamRows.map((row) => String(row.teams)))).map((value) => ({
      label: value,
      value,
    })),
    teamManager: Array.from(new Set(teamRows.map((row) => row.teamManager))).map((value) => ({
      label: value,
      value,
    })),
  };

  const filteredRows = (() => {
    if (!currentFilterState) return filteredBySearchRows;

    let nextRows = applyQuickFilters(filteredBySearchRows, currentFilterState.quickSelections);

    const validRows =
      currentFilterState.rows?.filter(
        (filterRow) =>
          filterRow.column.trim() !== "" &&
          filterRow.condition.trim() !== "" &&
          filterRow.value.trim() !== ""
      ) ?? [];

    if (validRows.length === 0) return nextRows;

    nextRows = nextRows.filter((row) =>
      validRows.every((filterRow) => {
        const fieldValue =
          filterRow.column === "departmentName"
            ? row.departmentName
            : filterRow.column === "members"
              ? String(row.members)
              : filterRow.column === "teams"
                ? String(row.teams)
                : row.teamManager;
        return matchCondition(
          fieldValue.toLowerCase(),
          filterRow.condition,
          filterRow.value.toLowerCase()
        );
      })
    );

    return nextRows;
  })();

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const boundedPage = Math.min(currentPage, totalPages);
  const pageStart = (boundedPage - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const paginatedRows = filteredRows.slice(pageStart, pageEnd);
  const resultsFrom = filteredRows.length === 0 ? 0 : pageStart + 1;
  const resultsTo = Math.min(pageEnd, filteredRows.length);
  const allCurrentPageSelected =
    paginatedRows.length > 0 && paginatedRows.every((row) => selectedRowIds.has(row.id));

  const toggleOne = (id: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllCurrentPage = () => {
    setSelectedRowIds((previous) => {
      const next = new Set(previous);
      if (allCurrentPageSelected) {
        paginatedRows.forEach((row) => next.delete(row.id));
      } else {
        paginatedRows.forEach((row) => next.add(row.id));
      }
      return next;
    });
  };

  const handleExportCsv = () => {
    const headers = ["department_name", "members", "teams", "team_manager"];
    const rows = teamRows.map((row) => [
      row.departmentName,
      String(row.members),
      String(row.teams),
      row.teamManager,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => escapeCsvValue(cell)).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-teams.csv";
    link.click();
    URL.revokeObjectURL(url);
    setIsImportMenuOpen(false);
  };

  const handleImportCsv = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      const rows = parseCsvText(content);
      if (rows.length < 2) {
        event.target.value = "";
        return;
      }
      const header = rows[0].map((cell) => cell.trim().toLowerCase());
      const expected = ["department_name", "members", "teams", "team_manager"];
      const validHeader = expected.every((name, index) => header[index] === name);
      if (!validHeader) {
        event.target.value = "";
        return;
      }
      const parsedRows: TeamRow[] = rows.slice(1).map((cells, index) => ({
        id: `team-import-${Date.now()}-${index}`,
        departmentName: cells[0] ?? "",
        members: Number(cells[1] ?? "0") || 0,
        teams: Number(cells[2] ?? "0") || 0,
        teamManager: cells[3] ?? "",
      }));
      setTeamRows(parsedRows.length ? parsedRows : TEAM_ROWS);
      setSelectedRowIds(new Set());
      setIsImportMenuOpen(false);
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  const importMenuItems: PopupItem[] = [
    {
      id: "import-csv",
      label: "Import CSV file",
      onClick: () => {
        csvFileInputRef.current?.click();
        setIsImportMenuOpen(false);
      },
    },
    {
      id: "export-csv",
      label: "Export CSV file",
      onClick: handleExportCsv,
    },
  ];

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest(".teams-filter-panel") && !target.closest(".teams-filter-toggle")) {
        setIsFilterOpen(false);
      }
      if (!target.closest(".teams-import-menu")) {
        setIsImportMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <>
      <PageMeta title="My Teams | Approver Hub" description="Manage teams settings" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb
          items={[
            { label: "Settings", to: "/settings" },
            { label: "My Teams" },
          ]}
        />

        <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0">
          <PageHeader
            title="My Teams"
            description="Create, edit, your teams or add, remove users in your team"
            onBackClick={() => navigate("/settings")}
            className="!px-4 py-3"
          />

          <div className="min-h-0 flex-1 overflow-auto px-4 py-2">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex items-center gap-2">
                <div className="w-[250px] rounded-full border border-gray-200 bg-white px-3 py-2 sm:w-[300px]">
                  <SearchInput
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search users"
                    containerClassName="gap-2"
                    className="text-sm text-gray-700"
                    inputClassName="text-sm text-gray-700"
                    iconClassName="text-gray-400"
                    iconSize="!h-5 !w-5"
                  />
                </div>
                <div className="teams-filter-toggle relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen((previous) => !previous)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-gray-500 transition hover:bg-gray-50"
                    aria-label="Filter teams"
                  >
                    <FilterIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="teams-import-menu relative">
                  <button
                    type="button"
                    onClick={() => setIsImportMenuOpen((previous) => !previous)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-gray-500 transition hover:bg-gray-50"
                    aria-label="Import or export teams"
                  >
                    <Export_Icon className="h-4 w-4" />
                  </button>
                  {isImportMenuOpen ? (
                    <div className="absolute left-0 top-full z-40 mt-2">
                      <Popup items={importMenuItems} className="!min-w-[170px] rounded-lg" />
                    </div>
                  ) : null}
                </div>

                {isFilterOpen ? (
                  <div className="teams-filter-panel absolute left-0 top-full z-40 mt-3">
                    <AdvanceFilter
                      defaultTab="quick"
                      defaultRows={DEFAULT_FILTER_ROWS}
                      initialState={currentFilterState}
                      onFilterChange={setCurrentFilterState}
                      className="w-[860px] max-w-[92vw] rounded-xl bg-white"
                      advancedHeaderRowOnly
                      columnOptions={COLUMN_OPTIONS}
                      conditionOptions={CONDITION_OPTIONS}
                      valueOptionsByColumn={valueOptionsByColumn}
                      quickFilterColumns={[
                        {
                          title: "My Teams",
                          items: uniqueDepartments,
                        },
                        {
                          title: "Campaign Name",
                          items: uniqueDepartments,
                        },
                        {
                          title: "Status",
                          items: uniqueTeamCounts,
                        },
                        {
                          title: "Owner",
                          items: uniqueManagers,
                        },
                        {
                          title: "Reviewer",
                          items: uniqueManagers,
                        },
                        {
                          title: "Due Date",
                          items: uniqueMemberCounts,
                        },
                      ]}
                      labels={{
                        headerTitle: "",
                        whereLabel: "Where",
                      }}
                    />
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <p>
                  {resultsFrom} to {resultsTo} of {filteredRows.length} results
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={boundedPage <= 1}
                  className="inline-flex h-4 w-4 items-center justify-center rounded text-gray-400 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <AngleLeftIcon className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={boundedPage >= totalPages}
                  className="inline-flex h-4 w-4 items-center justify-center rounded text-gray-400 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <AngleRightIcon className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-sm border border-gray-200 bg-white px-3 py-1 custom-scrollbar">
              <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-sm">
                  <thead>
                    <TableHeaderRow
                      className="text-left text-[13px] text-gray-700"
                      columns={TEAM_COLUMNS}
                      getColumnKey={(column) => column.id}
                      renderColumn={(column) =>
                        column.id === "select" ? (
                          <label className="inline-flex items-center gap-2 whitespace-nowrap text-[13px] font-medium text-gray-700">
                            <input
                              type="checkbox"
                              checked={allCurrentPageSelected}
                              onChange={toggleSelectAllCurrentPage}
                              className="h-3.5 w-3.5 accent-secondary rounded-none border-gray-300 columns-checkbox"
                            />
                            Select all
                          </label>
                        ) : (
                          column.label
                        )
                      }
                      columnClassName={(column) => `${column.className ?? "py-2 px-4"} !font-medium`}
                    />
                  </thead>
                  <tbody>
                    {paginatedRows.map((row) => (
                      <tr key={row.id} className="text-[13px] text-gray-700">
                        <td className="rounded-l-md border-y border-l border-gray-200 bg-white px-4 py-3 align-middle">
                          <input
                            type="checkbox"
                            checked={selectedRowIds.has(row.id)}
                            onChange={() => toggleOne(row.id)}
                            className="h-3.5 w-3.5 accent-secondary rounded-none border-gray-300 columns-checkbox"
                          />
                        </td>
                        <td className="border-y border-gray-200 bg-white px-4 py-3 align-middle">
                          {row.departmentName}
                        </td>
                        <td className="border-y border-gray-200 bg-white px-4 py-3 align-middle">{row.members}</td>
                        <td className="border-y border-gray-200 bg-white px-4 py-3 align-middle">{row.teams}</td>
                        <td className="border-y border-gray-200 bg-white px-4 py-3 align-middle">{row.teamManager}</td>
                        <td className="rounded-r-md border-y border-r border-gray-200 bg-white px-4 py-3 align-middle">
                          <button
                            type="button"
                            className="inline-flex h-6 w-6 items-center justify-center text-gray-300 transition hover:text-gray-500"
                            aria-label={`Edit ${row.departmentName}`}
                          >
                            <EditDetailsIcon className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        </PageContentContainer>
      </div>

      <JobsFAB className="!rounded-[10px]" iconSize={20} iconStrokeWidth={2} side="right" offsetX={32} offsetY={32} onClick={() => undefined} ariaLabel="Add team" />
      <input
        ref={csvFileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleImportCsv}
      />
    </>
  );
}

