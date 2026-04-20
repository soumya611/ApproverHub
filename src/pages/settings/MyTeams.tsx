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
import PopupModal from "@/components/ui/popup-modal/PopupModal";
import ToggleSwitch from "@/components/ui/toggle/ToggleSwitch";
import TextInput from "@/components/ui/text-input/TextInput";
import Button from "@/components/ui/button/Button";
import UserCell from "@/components/ui/user-cell/UserCell";
import JobsFAB from "@/components/jobs/JobsFAB";
import {
  AddpeopleIcon,
  AngleLeftIcon,
  AngleRightIcon,
  CloseIcon,
  Export_Icon,
  FilterIcon,
  GreenTickIcon,
  PlusIcon,
  TeamsEditIcon,
} from "@/icons";
import { useUsersStore, type UnifiedUser } from "@/stores/usersStore";

interface TeamRow {
  id: string;
  departmentName: string;
  members: number;
  teams: number;
  teamManager: string;
  active: boolean;
  teamManagerId?: string;
  memberIds?: string[];
}

interface TeamColumn {
  id: "departmentName" | "members" | "teams" | "teamManager" | "status" | "edit";
  label: string;
  className?: string;
}

const TEAM_COLUMNS: TeamColumn[] = [
  { id: "departmentName", label: "Department Name", className: "py-2 px-4 text-left w-[18%]" },
  { id: "members", label: "Members", className: "py-2 px-4 text-left w-[12%]" },
  { id: "teams", label: "No. of Teams", className: "py-2 px-4 text-left w-[14%]" },
  { id: "teamManager", label: "Team Manager", className: "py-2 px-4 text-left w-[40%]" },
  { id: "status", label: "Status", className: "py-2 px-4 text-left w-[12%]" },
  { id: "edit", label: "Edit", className: "py-2 px-4 text-left w-[4%]" },
];

const TEAM_ROWS: TeamRow[] = [
  { id: "team-1", departmentName: "Web & App", members: 25, teams: 5, teamManager: "Samay", active: true },
  {
    id: "team-2",
    departmentName: "Typesetting",
    members: 30,
    teams: 2,
    teamManager: "Mukesh Sharma",
    active: true,
  },
  { id: "team-3", departmentName: "Hudson", members: 20, teams: 1, teamManager: "Sweta", active: true },
  { id: "team-4", departmentName: "Accounts", members: 7, teams: 1, teamManager: "Swati", active: true },
  {
    id: "team-5",
    departmentName: "Perivan",
    members: 10,
    teams: 1,
    teamManager: "Anup Jamsandekar",
    active: true,
  },
];

const QUICK_FILTER_DEFINITIONS: Array<{ title: string; getValue: (row: TeamRow) => string }> = [
  { title: "Department name", getValue: (row) => row.departmentName },
  { title: "Team manager", getValue: (row) => row.teamManager },
  { title: "Status", getValue: (row) => (row.active ? "Active" : "Deactive") },
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
  { label: "No. of Teams", value: "teams" },
  { label: "Team Manager", value: "teamManager" },
  { label: "Status", value: "active" },
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

const applyQuickFilters = (
  rows: TeamRow[],
  quickSelections: Record<string, boolean>,
  filterDefinitions: Array<{ title: string; getValue: (row: TeamRow) => string }>
) => {
  const selections = parseQuickSelections(quickSelections);
  const hasSelections = Object.values(selections).some((items) => items.length > 0);
  if (!hasSelections) return rows;

  return rows.filter((row) => {
    return filterDefinitions.every((definition) => {
      const selectedValues = selections[definition.title];
      if (!selectedValues?.length) return true;
      return selectedValues.includes(definition.getValue(row));
    });
  });
};

export default function MyTeams() {
  const navigate = useNavigate();
  const users = useUsersStore((state) => state.users);
  const refreshUsers = useUsersStore((state) => state.refreshUsers);
  const [search, setSearch] = useState("");
  const [teamRows, setTeamRows] = useState<TeamRow[]>(TEAM_ROWS);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [teamNameDraft, setTeamNameDraft] = useState("");
  const [managerSearch, setManagerSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [currentFilterState, setCurrentFilterState] = useState<AdvanceFilterState | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 50;

  const activeUsers = useMemo(() => users.filter((user) => user.isActive), [users]);

  const selectedManager = useMemo(
    () => activeUsers.find((user) => user.id === selectedManagerId) ?? null,
    [activeUsers, selectedManagerId]
  );

  const filteredManagers = useMemo(() => {
    const term = managerSearch.trim().toLowerCase();
    const pool = activeUsers.filter((user) =>
      user.role.toLowerCase().includes("manager")
    );
    if (!term) return [];
    return pool.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(term)
    );
  }, [activeUsers, managerSearch]);

  const filteredMembers = useMemo(() => {
    const term = memberSearch.trim().toLowerCase();
    const pool = activeUsers.filter((user) => user.id !== selectedManagerId);
    if (!term) return [];
    return pool.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(term)
    );
  }, [activeUsers, memberSearch, selectedManagerId]);

  const quickFilterColumns = useMemo(
    () =>
      QUICK_FILTER_DEFINITIONS.map((definition) => ({
        title: definition.title,
        items: Array.from(new Set(teamRows.map((row) => definition.getValue(row)))),
      })),
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
    active: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  };

  const filteredRows = (() => {
    if (!currentFilterState) return filteredBySearchRows;

    let nextRows = applyQuickFilters(
      filteredBySearchRows,
      currentFilterState.quickSelections,
      QUICK_FILTER_DEFINITIONS
    );

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
                : filterRow.column === "active"
                  ? row.active
                    ? "active"
                    : "inactive"
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
  const toggleTeamStatus = (id: string, checked: boolean) => {
    setTeamRows((previous) =>
      previous.map((row) => (row.id === id ? { ...row, active: checked } : row))
    );
  };

  const resetCreateTeamForm = () => {
    setTeamNameDraft("");
    setManagerSearch("");
    setMemberSearch("");
    setSelectedManagerId(null);
    setSelectedMemberIds([]);
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
    );
  };

  const handleManagerToggle = (id: string, isSelected: boolean) => {
    const nextManagerId = isSelected ? null : id;
    setSelectedManagerId(nextManagerId);
    if (nextManagerId) {
      setSelectedMemberIds((previous) => previous.filter((memberId) => memberId !== nextManagerId));
    }
  };

  const normalizedDepartmentName = teamNameDraft.trim().toLowerCase();
  const isDepartmentDuplicate =
    normalizedDepartmentName.length > 0 &&
    teamRows.some((row) => row.departmentName.trim().toLowerCase() === normalizedDepartmentName);

  const canCreateTeam =
    teamNameDraft.trim().length > 0 &&
    Boolean(selectedManagerId) &&
    selectedMemberIds.length > 0 &&
    !isDepartmentDuplicate;

  const handleCreateTeam = () => {
    if (!selectedManager || !canCreateTeam || isDepartmentDuplicate) return;

    const newTeam: TeamRow = {
      id: `team-${Date.now()}`,
      departmentName: teamNameDraft.trim(),
      members: selectedMemberIds.length,
      teams: 1,
      teamManager: selectedManager.name,
      active: true,
      teamManagerId: selectedManager.id,
      memberIds: selectedMemberIds,
    };

    setTeamRows((previous) => [newTeam, ...previous]);
    setCurrentPage(1);
    setIsCreateTeamOpen(false);
    resetCreateTeamForm();
  };

  const handleExportCsv = () => {
    const headers = ["department_name", "members", "teams", "team_manager", "status"];
    const rows = teamRows.map((row) => [
      row.departmentName,
      String(row.members),
      String(row.teams),
      row.teamManager,
      row.active ? "active" : "inactive",
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
        active: (cells[4] ?? "active").trim().toLowerCase() !== "inactive",
      }));
      setTeamRows(parsedRows.length ? parsedRows : TEAM_ROWS);
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
    refreshUsers();
  }, [refreshUsers]);

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

  useEffect(() => {
    if (!isCreateTeamOpen) {
      resetCreateTeamForm();
    }
  }, [isCreateTeamOpen]);

  const renderSelectableUser = (
    user: UnifiedUser,
    isSelected: boolean,
    onClick: () => void,
    _mode: "single" | "multi"
  ) => (
    <button
      key={user.id}
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition ${
        isSelected ? "border-[#D7E8DC] bg-[#F7FBF8]" : "border-gray-200 bg-[#F9F9F9] hover:bg-gray-50"
      }`}
    >
      <UserCell
        title={user.name}
        subtitle={user.email}
        avatarUrl={user.avatarUrl}
        avatarSize="xsmall"
        className="gap-2"
        contentClassName="leading-tight"
        titleClassName="text-[13px] font-medium text-gray-700"
        subtitleClassName="text-[11px] text-gray-500"
      />
      <span className="inline-flex h-5 w-5 items-center justify-center">
        {isSelected ? (
          <GreenTickIcon className="h-4.5 w-4.5 text-[#20A95A]" />
        ) : (
          <PlusIcon className="h-4 w-4 text-[#3A3A3A]" />
        )}
      </span>
    </button>
  );

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
            onBackClick={() => navigate("/settings?tab=people")}
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
                      className="w-[560px] max-w-[92vw] rounded-xl bg-white"
                      advancedHeaderRowOnly
                      columnOptions={COLUMN_OPTIONS}
                      conditionOptions={CONDITION_OPTIONS}
                      valueOptionsByColumn={valueOptionsByColumn}
                      quickFilterColumns={quickFilterColumns}
                      labels={{
                        headerTitle: "Filter by",
                        whereLabel: "Where",
                        applyFilterAction: "Apply",
                        saveViewAction: "Apply",
                      }}
                      visibility={{
                        showTabs: false,
                        showAdvancedTab: false,
                        showClearAction: false,
                        showExportAction: false,
                        showSaveViewAction: true,
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
              <table className="w-full min-w-[980px] table-fixed border-separate border-spacing-y-2 text-sm">
                  <thead>
                    <TableHeaderRow
                      className="text-left text-[13px] text-gray-700"
                      columns={TEAM_COLUMNS}
                      getColumnKey={(column) => column.id}
                      renderColumn={(column) => column.label}
                      columnClassName={(column) => `${column.className ?? "py-2 px-4"} !font-medium`}
                    />
                  </thead>
                  <tbody>
                    {paginatedRows.map((row) => (
                      <tr key={row.id} className="text-[13px] text-gray-700">
                        <td className="rounded-l-md border-y border-l border-gray-200 bg-white px-4 py-3 align-middle">
                          {row.departmentName}
                        </td>
                        <td className="border-y border-gray-200 bg-white px-4 py-3 align-middle">{row.members}</td>
                        <td className="border-y border-gray-200 bg-white px-4 py-3 align-middle">{row.teams}</td>
                        <td className="border-y border-gray-200 bg-white px-4 py-3 align-middle">{row.teamManager}</td>
                        <td className="border-y border-gray-200 bg-white px-4 py-3 align-middle">
                          <div className="flex items-center gap-2">
                            <ToggleSwitch
                              checked={row.active}
                              onChange={(checked) => toggleTeamStatus(row.id, checked)}
                              label=""
                              trackClassName="!h-[18px] !w-[30px] [&>span]:!h-[14px] [&>span]:!w-[14px]"
                              className="!gap-0"
                            />
                            <span className="text-[13px] text-gray-700">
                              {row.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="rounded-r-md border-y border-r border-gray-200 bg-white px-4 py-3 align-middle">
                          <button
                            type="button"
                            className="inline-flex h-6 w-6 items-center justify-center text-[#656565] transition hover:text-gray-500"
                            aria-label={`Edit ${row.departmentName}`}
                          >
                            <TeamsEditIcon className="h-[19px] w-[19px] shrink-0" />
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

      <JobsFAB
        className="!rounded-[10px]"
        iconSize={20}
        iconStrokeWidth={2}
        side="right"
        offsetX={32}
        offsetY={32}
        onClick={() => setIsCreateTeamOpen(true)}
        ariaLabel="Add team"
      />
      <input
        ref={csvFileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleImportCsv}
      />
      <PopupModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        showCloseButton={false}
        className="max-w-[390px] rounded-[4px]"
        contentClassName="px-0 pb-0 pt-0"
      >
        <div className="px-4 py-3">
          <div className="mb-1 flex justify-end">
            <button
              type="button"
              onClick={() => setIsCreateTeamOpen(false)}
              className="inline-flex h-5 w-5 items-center justify-center text-[#1F1F1F]"
              aria-label="Close create team popup"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <TextInput
            placeholder="|Enter Department Name"
            value={teamNameDraft}
            onChange={(event) => setTeamNameDraft(event.target.value)}
            className="h-9 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 text-sm !shadow-none focus:border-gray-300 focus:ring-0"
          />
          {isDepartmentDuplicate ? (
            <p className="mt-1 text-xs text-red-500">
              This department already exists. Please use a different department name.
            </p>
          ) : null}

          <div className="mt-4 pb-4">
            <p className="mb-3 text-[16px] font-gilroy-regular text-[#2B2B2B]">Add Team Manager</p>
            <div className="flex items-center gap-3">
              <AddpeopleIcon className="h-4 w-4 text-[#64748B]" />
              <div className="w-full">
                <SearchInput
                  placeholder="Search by name or email address"
                  value={managerSearch}
                  onChange={(event) => setManagerSearch(event.target.value)}
                  className="text-xs text-[#666666]"
                  inputClassName="text-xs text-[#666666]"
                  iconClassName="text-[#64748B]"
                  iconSize="!h-3.5 !w-3.5"
                  containerClassName="rounded-full border border-gray-200 px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-2 max-h-[140px] space-y-2 overflow-y-auto pr-1">
              {filteredManagers.map((user) => {
                const isSelected = user.id === selectedManagerId;
                return renderSelectableUser(
                  user,
                  isSelected,
                  () => handleManagerToggle(user.id, isSelected),
                  "single"
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 pb-2">
            <p className="mb-3 text-[16px] font-gilroy-regular text-[#2B2B2B]">Add members</p>
            <div className="flex items-center gap-3">
              <AddpeopleIcon className="h-4 w-4 text-[#64748B]" />
              <div className="w-full">
                <SearchInput
                  placeholder="Search by name or email address"
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                  className="text-xs text-[#666666]"
                  inputClassName="text-xs text-[#666666]"
                  iconClassName="text-[#64748B]"
                  iconSize="!h-3.5 !w-3.5"
                  containerClassName="rounded-full border border-gray-200 px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-2 max-h-[180px] space-y-2 overflow-y-auto pr-1">
              {filteredMembers.map((user) =>
                renderSelectableUser(
                  user,
                  selectedMemberIds.includes(user.id),
                  () => toggleMember(user.id),
                  "multi"
                )
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center border-t border-gray-200 px-4 py-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateTeam}
            disabled={!canCreateTeam}
            className="!h-7 !rounded-[4px] !bg-[#F25C54] !px-7 !text-[14px] !font-medium !text-white hover:!bg-[#eb554f]"
          >
            Create
          </Button>
        </div>
      </PopupModal>
    </>
  );
}

