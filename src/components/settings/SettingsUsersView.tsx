
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { getRoleLabel, normalizeAppRole, type AppUserRole } from "../../data/appUsers";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  CloseIcon,
  EditDetailsIcon,
  Export_Icon,
  FilterIcon,
  InfoIcon,
  Search,
  VerticalDots,
} from "../../icons";
import { type UnifiedUser, useUsersStore } from "../../stores/usersStore";
import PaginationControls from "../common/PaginationControls";
import PageContentContainer from "../layout/PageContentContainer";
import Button from "../ui/button/Button";
import SearchInput from "../ui/search-input/SearchInput";
import SelectedItem, { type SelectedItemAction } from "../ui/selected-item/SelectedItem";
import ToggleSwitch from "../ui/toggle/ToggleSwitch";
import AdvanceFilter, {
  type AdvanceFilterState,
  type FilterRow,
} from "../ui/advance-filter/AdvanceFilter";
import type { FilterDropdownOption } from "../ui/advance-filter/FilterDropdown";
import Popup, { type PopupItem } from "../ui/popup/Popup";
import PopupModal from "../ui/popup-modal/PopupModal";
import { TableHeaderRow } from "../ui/table";
import TextInput from "../ui/text-input/TextInput";
import { JobsFAB } from "../jobs";
import AppIcon from "../ui/icon/AppIcon";
import PageHeader from "../ui/page-header/PageHeader";

type SettingsUserRow = UnifiedUser;
type InviteState = UnifiedUser["inviteState"];
type UserType = "users" | "guest";

type AddUserDraft = {
  id: string;
  userType: UserType;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

const USERS_COLUMNS = [
  { id: "name", label: "Name" },
  { id: "role", label: "Roles" },
  { id: "email", label: "Email" },
  { id: "company", label: "Company" },
  { id: "status", label: "Status" },
  { id: "edit", label: "Edit" },
];

const DEFAULT_FILTER_ROWS: FilterRow[] = [
  {
    id: "row-1",
    column: "",
    condition: "",
    value: "",
  },
];

const ROLE_OPTIONS: Array<{ value: AppUserRole; label: string }> = [
  { value: "team_manager", label: "Team Manager" },
  { value: "manager", label: "Manager" },
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "org_admin", label: "Org Admin" },
];

const MAX_ADD_USERS = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createAddUserRow = (): AddUserDraft => ({
  id: `add-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  userType: "users",
  firstName: "",
  lastName: "",
  email: "",
  role: "user",
});

const getUniqueValues = (items: Array<string | null | undefined>) =>
  Array.from(new Set(items.filter(Boolean) as string[]));

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

const getUserStatusLabel = (user: SettingsUserRow) => {
  if (user.inviteState === "resend") return "Resend Invite";
  if (user.inviteState === "send") return "Send Invite";
  return user.isActive ? "Active" : "Inactive";
};

const getUserFieldValue = (user: SettingsUserRow, field: string) => {
  switch (field) {
    case "name":
      return user.name;
    case "role":
      return user.role;
    case "email":
      return user.email || "-";
    case "company":
      return user.company || "-";
    case "status":
      return getUserStatusLabel(user);
    default:
      return "";
  }
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

const applyQuickFilters = (data: SettingsUserRow[], quickSelections: Record<string, boolean>) => {
  const selections = parseQuickSelections(quickSelections);
  const hasSelections = Object.values(selections).some((items) => items.length > 0);

  if (!hasSelections) {
    return data;
  }

  return data.filter((user) => {
    const nameSelections = selections["Name"];
    if (nameSelections?.length && !nameSelections.includes(user.name)) {
      return false;
    }

    const roleSelections = selections["Roles"];
    if (roleSelections?.length && !roleSelections.includes(user.role)) {
      return false;
    }

    const emailValue = user.email || "-";
    const emailSelections = selections["Email"];
    if (emailSelections?.length && !emailSelections.includes(emailValue)) {
      return false;
    }

    const companyValue = user.company || "-";
    const companySelections = selections["Company"];
    if (companySelections?.length && !companySelections.includes(companyValue)) {
      return false;
    }

    const statusSelections = selections["Status"];
    if (statusSelections?.length && !statusSelections.includes(getUserStatusLabel(user))) {
      return false;
    }

    return true;
  });
};

const applyAdvancedFilters = (data: SettingsUserRow[], rows: FilterRow[]) => {
  const validRows = rows.filter((row) => row.column && row.condition && row.value);
  if (validRows.length === 0) {
    return data;
  }

  return data.filter((user) =>
    validRows.every((filterRow) => {
      const fieldValue = getUserFieldValue(user, filterRow.column).toLowerCase();
      const targetValue = filterRow.value.toLowerCase();
      return matchCondition(fieldValue, filterRow.condition, targetValue);
    })
  );
};

const applyUsersFilters = (data: SettingsUserRow[], filterState: AdvanceFilterState | null) => {
  if (!filterState) return data;
  let filtered = data;
  filtered = applyQuickFilters(filtered, filterState.quickSelections);
  filtered = applyAdvancedFilters(filtered, filterState.rows);
  return filtered;
};

const applySearchFilter = (data: SettingsUserRow[], term: string) => {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return data;

  return data.filter((user) => {
    const combined = [
      user.name,
      user.role,
      user.email || "-",
      user.company || "-",
      getUserStatusLabel(user),
    ]
      .join(" ")
      .toLowerCase();
    return combined.includes(normalized);
  });
};
const normalizeCsvHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, "")
    .replace(/\s+/g, "_");

const parseCsvLine = (line: string) => {
  const result: string[] = [];
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
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
};

const parseCsvText = (content: string) =>
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCsvLine);

const escapeCsvValue = (value: string) => `"${String(value).replace(/"/g, '""')}"`;

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const inferCompanyFromEmail = (email: string) => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return "";
  if (domain.includes("approverhub")) return "Approver Hub";
  const primaryDomain = domain.split(".")[0] ?? "";
  return primaryDomain ? toTitleCase(primaryDomain.replace(/[-_]/g, " ")) : "";
};

const inferInviteStateFromStatus = (status: string): InviteState => {
  const normalized = status.trim().toLowerCase();
  if (!normalized) return "none";
  if (normalized === "issue" || normalized === "resend" || normalized === "resend_invite") {
    return "resend";
  }
  if (normalized === "inactive" || normalized === "send" || normalized === "send_invite") {
    return "send";
  }
  return "none";
};

const getCsvCell = (row: string[], headerMap: Map<string, number>, keys: string[]) => {
  for (const key of keys) {
    const index = headerMap.get(key);
    if (index !== undefined) {
      return row[index]?.trim() ?? "";
    }
  }
  return "";
};

const buildTransferSourceLabel = (sourceUsers: SettingsUserRow[]) => {
  if (sourceUsers.length === 0) return "";
  if (sourceUsers.length === 1) return sourceUsers[0].name;
  if (sourceUsers.length === 2) return `${sourceUsers[0].name}, ${sourceUsers[1].name}`;
  return `${sourceUsers[0].name}, ${sourceUsers[1].name} +${sourceUsers.length - 2} more`;
};

export default function SettingsUsersView() {
  const navigate = useNavigate();
  const users = useUsersStore((state) => state.users);
  const refreshUsers = useUsersStore((state) => state.refreshUsers);
  const setUsers = useUsersStore((state) => state.setUsers);
  const upsertUser = useUsersStore((state) => state.upsertUser);
  const updateUserStatusInStore = useUsersStore((state) => state.updateUserStatus);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [currentFilterState, setCurrentFilterState] = useState<AdvanceFilterState | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [detailsUser, setDetailsUser] = useState<SettingsUserRow | null>(null);

  const [transferSourceIds, setTransferSourceIds] = useState<string[]>([]);
  const [transferSearch, setTransferSearch] = useState("");
  const [transferTargetUserId, setTransferTargetUserId] = useState("");

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddModalImportMenuOpen, setIsAddModalImportMenuOpen] = useState(false);
  const [addUserRows, setAddUserRows] = useState<AddUserDraft[]>([createAddUserRow()]);
  const [sendInviteOnSave, setSendInviteOnSave] = useState(false);

  const csvFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (!target.closest(".users-import-menu")) {
        setIsImportMenuOpen(false);
      }
      if (!target.closest(".users-modal-import-menu")) {
        setIsAddModalImportMenuOpen(false);
      }
      if (!target.closest(".users-action-menu")) {
        setOpenActionMenuId(null);
      }
      if (!target.closest(".users-filter-panel") && !target.closest(".users-filter-toggle")) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const nameOptions = useMemo<FilterDropdownOption[]>(
    () =>
      getUniqueValues(users.map((user) => user.name)).map((value) => ({
        label: value,
        value,
      })),
    [users]
  );

  const roleOptions = useMemo<FilterDropdownOption[]>(
    () =>
      getUniqueValues(users.map((user) => user.role)).map((value) => ({
        label: value,
        value,
      })),
    [users]
  );

  const emailOptions = useMemo<FilterDropdownOption[]>(
    () =>
      getUniqueValues(users.map((user) => user.email || "-")).map((value) => ({
        label: value,
        value,
      })),
    [users]
  );

  const companyOptions = useMemo<FilterDropdownOption[]>(
    () =>
      getUniqueValues(users.map((user) => user.company || "-")).map((value) => ({
        label: value,
        value,
      })),
    [users]
  );

  const statusOptions = useMemo<FilterDropdownOption[]>(
    () =>
      getUniqueValues(users.map((user) => getUserStatusLabel(user))).map((value) => ({
        label: value,
        value,
      })),
    [users]
  );

  const quickFilterColumns = useMemo(
    () => [
      {
        title: "Name",
        items: nameOptions.map((option) => option.label),
      },
      {
        title: "Roles",
        items: roleOptions.map((option) => option.label),
      },
      {
        title: "Email",
        items: emailOptions.map((option) => option.label),
      },
      {
        title: "Company",
        items: companyOptions.map((option) => option.label),
      },
      {
        title: "Status",
        items: statusOptions.map((option) => option.label),
      },
    ],
    [nameOptions, roleOptions, emailOptions, companyOptions, statusOptions]
  );

  const columnOptions: FilterDropdownOption[] = [
    { label: "Name", value: "name" },
    { label: "Roles", value: "role" },
    { label: "Email", value: "email" },
    { label: "Company", value: "company" },
    { label: "Status", value: "status" },
  ];

  const valueOptionsByColumn = useMemo(
    () => ({
      name: nameOptions,
      role: roleOptions,
      email: emailOptions,
      company: companyOptions,
      status: statusOptions,
    }),
    [nameOptions, roleOptions, emailOptions, companyOptions, statusOptions]
  );

  const filteredByPanelUsers = useMemo(
    () => applyUsersFilters(users, currentFilterState),
    [users, currentFilterState]
  );

  const filteredUsers = useMemo(
    () => applySearchFilter(filteredByPanelUsers, searchValue),
    [filteredByPanelUsers, searchValue]
  );
  const visibleUserIds = useMemo(
    () => new Set(filteredUsers.map((user) => user.id)),
    [filteredUsers]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, currentFilterState]);

  useEffect(() => {
    setSelectedIds((previous) => {
      const next = new Set(Array.from(previous).filter((id) => visibleUserIds.has(id)));
      return next.size === previous.size ? previous : next;
    });
  }, [visibleUserIds]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const boundedPage = Math.min(currentPage, totalPages);
  const pageStart = (boundedPage - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const paginatedUsers = filteredUsers.slice(pageStart, pageEnd);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const allCurrentPageSelected =
    paginatedUsers.length > 0 && paginatedUsers.every((user) => selectedIds.has(user.id));

  const resultsFrom = filteredUsers.length === 0 ? 0 : pageStart + 1;
  const resultsTo = Math.min(pageEnd, filteredUsers.length);

  const transferSourceUsers = useMemo(
    () => users.filter((user) => transferSourceIds.includes(user.id)),
    [users, transferSourceIds]
  );

  const transferCandidates = useMemo(() => {
    const sourceIdSet = new Set(transferSourceIds);

    return users.filter((user) => {
      if (sourceIdSet.has(user.id)) return false;
      if (!transferSearch.trim()) return true;
      return user.name.toLowerCase().includes(transferSearch.trim().toLowerCase());
    });
  }, [transferSearch, transferSourceIds, users]);

  const selectedUsers = useMemo(
    () => users.filter((user) => selectedIds.has(user.id)),
    [users, selectedIds]
  );

  const addUserRowsWithData = useMemo(
    () =>
      addUserRows.filter(
        (row) =>
          row.firstName.trim() ||
          row.lastName.trim() ||
          row.email.trim() ||
          row.role.trim()
      ),
    [addUserRows]
  );

  const hasInvalidAddUserRows = useMemo(
    () =>
      addUserRowsWithData.some(
        (row) =>
          !row.firstName.trim() ||
          !row.lastName.trim() ||
          !row.email.trim() ||
          !EMAIL_PATTERN.test(row.email.trim()) ||
          !row.role.trim()
      ),
    [addUserRowsWithData]
  );

  const canSaveAddedUsers = addUserRowsWithData.length > 0 && !hasInvalidAddUserRows;
  const remainingUserSlots = Math.max(0, MAX_ADD_USERS - (addUserRows.length - 1));

  const toggleSelectAllCurrentPage = () => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (allCurrentPageSelected) {
        paginatedUsers.forEach((user) => next.delete(user.id));
      } else {
        paginatedUsers.forEach((user) => next.add(user.id));
      }
      return next;
    });
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const toggleUserStatus = (userId: string, checked: boolean) => {
    updateUserStatusInStore(userId, checked);
  };

  const closeTransferModal = () => {
    setTransferSourceIds([]);
    setTransferSearch("");
    setTransferTargetUserId("");
  };

  const openTransferModalForIds = (userIds: string[]) => {
    setTransferSourceIds(userIds);
    setTransferSearch("");
    setTransferTargetUserId("");
  };

  const handleTransferOwnership = () => {
    if (transferSourceIds.length === 0 || !transferTargetUserId) return;

    setSelectedIds((previous) => {
      const next = new Set(previous);
      transferSourceIds.forEach((id) => next.delete(id));
      return next;
    });

    closeTransferModal();
    setOpenActionMenuId(null);
  };

  const buildActionItems = (user: SettingsUserRow): PopupItem[] => [
    {
      id: `details-${user.id}`,
      label: "Details",
      onClick: () => {
        setDetailsUser(user);
        setOpenActionMenuId(null);
      },
    },
    {
      id: `transfer-${user.id}`,
      label: "Transfer all job ownership",
      onClick: () => {
        openTransferModalForIds([user.id]);
        setOpenActionMenuId(null);
      },
    },
  ];

  const markUsersAsInvited = (userIds: string[]) => {
    if (userIds.length === 0) return;
    const idSet = new Set(userIds);

    setUsers(
      users.map((user) =>
        idSet.has(user.id)
          ? {
              ...user,
              inviteState: "resend",
              lastSent: "Last sent just now",
              isActive: false,
              accountStatus: "issue",
            }
          : user
      )
    );
  };

  const selectionActions: SelectedItemAction[] = [
    {
      id: "send_invite",
      label: "Send Invite",
      onClick: () => {
        markUsersAsInvited(Array.from(selectedIds));
        clearSelection();
      },
      disabled: selectedUsers.length === 0,
    },
    {
      id: "delete",
      label: "Delete",
      onClick: () => {
        if (selectedUsers.length === 0) return;
        const selectedIdSet = new Set(Array.from(selectedIds));
        setUsers(users.filter((user) => !selectedIdSet.has(user.id)));
        clearSelection();
      },
      disabled: selectedUsers.length === 0,
    },
    {
      id: "transfer",
      label: "Transfer",
      onClick: () => {
        if (selectedUsers.length === 0) return;
        openTransferModalForIds(Array.from(selectedIds));
      },
      disabled: selectedUsers.length === 0,
    },
  ];

  const inviteCell = (user: SettingsUserRow) => {
    if (user.inviteState === "none") {
      return (
        <div className="flex items-center gap-3">
          <ToggleSwitch
            checked={user.isActive}
            onChange={(checked) => toggleUserStatus(user.id, checked)}
            showLabel={false}
            size="sm"
          />
          <span className="text-sm text-gray-700">{user.isActive ? "Active" : "Inactive"}</span>
        </div>
      );
    }

    const label = user.inviteState === "resend" ? "Resend Invite" : "Send Invite";

    return (
      <button
        type="button"
        onClick={() => markUsersAsInvited([user.id])}
        className="group relative inline-flex items-center gap-1 rounded-md border border-[var(--color-secondary-500)] bg-[#FFF4F2] px-3 py-1 text-xs font-medium text-[var(--color-secondary-500)]"
      >
        {label}
        {user.inviteState === "resend" ? (
          <span className="relative inline-flex items-center">
            <InfoIcon className="h-3.5 w-3.5" />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 opacity-0 shadow-lg transition group-hover:opacity-100">
              {user.lastSent ?? "Last sent recently"}
            </span>
          </span>
        ) : null}
      </button>
    );
  };

  const openCsvFilePicker = () => {
    setIsImportMenuOpen(false);
    setIsAddModalImportMenuOpen(false);
    csvFileInputRef.current?.click();
  };

  const exportUsersAsCsv = (rows: SettingsUserRow[]) => {
    if (!rows.length) return;

    const headers = ["ID", "Name", "Email", "Role", "Company", "Status", "Invite State", "Source"];
    const lines = rows.map((user) => {
      const status = user.isActive ? "active" : "inactive";
      return [
        user.id,
        user.name,
        user.email,
        user.role,
        user.company,
        status,
        user.inviteState,
        user.source,
      ]
        .map((value) => escapeCsvValue(String(value ?? "")))
        .join(",");
    });

    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-export-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };
  const buildImportedUser = (row: string[], headerMap: Map<string, number>, rowIndex: number) => {
    const name = getCsvCell(row, headerMap, ["name", "full_name", "user_name"]);
    const firstName = getCsvCell(row, headerMap, ["first_name", "firstname"]);
    const lastName = getCsvCell(row, headerMap, ["last_name", "lastname"]);
    const email = getCsvCell(row, headerMap, ["email", "email_address"]).toLowerCase();
    const roleRaw = getCsvCell(row, headerMap, ["role", "roles"]);
    const companyRaw = getCsvCell(row, headerMap, ["company", "organization", "organisation"]);
    const statusRaw = getCsvCell(row, headerMap, ["status", "account_status"]);
    const inviteRaw = getCsvCell(row, headerMap, ["invite_state", "invite"]);
    const isActiveRaw = getCsvCell(row, headerMap, ["is_active", "active"]);
    const typeRaw = getCsvCell(row, headerMap, ["user_type", "type"]);

    const composedName =
      name ||
      [firstName, lastName].filter(Boolean).join(" ") ||
      email.split("@")[0]?.replace(/[._-]+/g, " ") ||
      "Imported User";

    const normalizedRole = normalizeAppRole(roleRaw);
    const roleLabel =
      (normalizedRole ? getRoleLabel(normalizedRole) : "") ||
      roleRaw ||
      (typeRaw.toLowerCase() === "guest" ? "Guest" : "User");

    const inviteStateFromStatus = inferInviteStateFromStatus(statusRaw);
    const inviteState: InviteState =
      inviteRaw === "none" || inviteRaw === "send" || inviteRaw === "resend"
        ? inviteRaw
        : inviteStateFromStatus;

    const normalizedActiveFlag = isActiveRaw.trim().toLowerCase();
    const isActive =
      normalizedActiveFlag === "true" || normalizedActiveFlag === "1"
        ? true
        : normalizedActiveFlag === "false" || normalizedActiveFlag === "0"
          ? false
          : inviteState === "none" && statusRaw.trim().toLowerCase() !== "inactive";

    const shouldSkip = !composedName.trim() && !email.trim();
    if (shouldSkip) return null;

    if (email && !EMAIL_PATTERN.test(email)) {
      return null;
    }

    return {
      id: `imported-user-${Date.now()}-${rowIndex + 1}`,
      name: toTitleCase(composedName),
      email,
      role: roleLabel,
      appRole: normalizedRole,
      company: companyRaw || inferCompanyFromEmail(email),
      isActive,
      accountStatus: isActive ? "active" : "inactive",
      inviteState,
      lastSent: inviteState === "resend" ? "Last sent recently" : undefined,
      source: "session" as const,
    } satisfies UnifiedUser;
  };

  const handleImportCsv = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const rows = parseCsvText(text);
      if (rows.length < 2) {
        event.target.value = "";
        return;
      }

      const headers = rows[0].map(normalizeCsvHeader);
      const headerMap = new Map<string, number>();
      headers.forEach((header, index) => {
        if (!headerMap.has(header)) {
          headerMap.set(header, index);
        }
      });

      const importedUsers = rows.slice(1).reduce<UnifiedUser[]>((accumulator, row, index) => {
        const importedUser = buildImportedUser(row, headerMap, index);
        if (importedUser) {
          accumulator.push(importedUser);
        }
        return accumulator;
      }, []);

      if (importedUsers.length > 0) {
        setUsers([...users, ...importedUsers]);
      }

      event.target.value = "";
    };

    reader.readAsText(file);
  };

  const resetAddUserModalState = () => {
    setAddUserRows([createAddUserRow()]);
    setSendInviteOnSave(false);
    setIsAddModalImportMenuOpen(false);
  };

  const closeAddUserModal = () => {
    setIsAddUserModalOpen(false);
    resetAddUserModalState();
  };

  const updateAddUserRow = (rowId: string, field: keyof Omit<AddUserDraft, "id">, value: string) => {
    setAddUserRows((previous) =>
      previous.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const addNewUserRow = () => {
    setAddUserRows((previous) => {
      if (previous.length >= MAX_ADD_USERS + 1) return previous;
      return [...previous, createAddUserRow()];
    });
  };

  const removeAddUserRow = (rowId: string) => {
    setAddUserRows((previous) => {
      if (previous.length <= 1) return previous;
      return previous.filter((row) => row.id !== rowId);
    });
  };

  const saveAddedUsers = () => {
    if (!canSaveAddedUsers) return;

    addUserRowsWithData.forEach((row, index) => {
      const normalizedRole = normalizeAppRole(row.role);
      const roleLabel = (normalizedRole ? getRoleLabel(normalizedRole) : "") || row.role || "User";
      const email = row.email.trim().toLowerCase();
      const inviteState: InviteState = sendInviteOnSave ? "resend" : "send";
      const fullName = [row.firstName.trim(), row.lastName.trim()].filter(Boolean).join(" ");

      const nextUser: UnifiedUser = {
        id: `session-user-${Date.now()}-${index + 1}`,
        name: toTitleCase(fullName),
        email,
        role: roleLabel,
        appRole: normalizedRole,
        company: inferCompanyFromEmail(email),
        isActive: false,
        accountStatus: "inactive",
        inviteState,
        lastSent: sendInviteOnSave ? "Last sent just now" : undefined,
        source: "session",
        title: row.userType === "guest" ? "Guest" : "User",
      };

      upsertUser(nextUser);
    });

    closeAddUserModal();
  };

  const addUserImportMenuItems: PopupItem[] = [
    {
      id: "import-csv-modal",
      label: "Import CSV file",
      onClick: openCsvFilePicker,
    },
    {
      id: "export-csv-modal",
      label: "Export CSV file",
      onClick: () => {
        exportUsersAsCsv(users);
        setIsAddModalImportMenuOpen(false);
      },
    },
  ];

  const topImportMenuItems: PopupItem[] = [
    {
      id: "import-csv",
      label: "Import CSV file",
      onClick: openCsvFilePicker,
    },
    {
      id: "export-csv",
      label: "Export CSV file",
      onClick: () => {
        exportUsersAsCsv(filteredUsers.length > 0 ? filteredUsers : users);
        setIsImportMenuOpen(false);
      },
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Settings / People / <span className="font-semibold text-[#007B8C]">User Detail</span>
      </p>

      <PageContentContainer className="relative min-h-[660px] p-0">
             <PageHeader
             className="!px-4 py-3"
                        title="Users"
                        description=" Manage individual user profiles, their assignments, roles, and activity status
                across campaigns and jobs."
                onBackClick={() => navigate("/settings")}
                    />

        <div className="px-4 py-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex items-center gap-2">
              <div className="w-[250px] rounded-full border border-gray-200 bg-white px-3 py-2 sm:w-[300px]">
                <SearchInput
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search users"
                  containerClassName="gap-2"
                  icon={<Search className="h-5 w-5 text-gray-400" />}
                  className="text-sm text-gray-700"
                  inputClassName="text-sm text-gray-700"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsFilterOpen((previous) => !previous)}
                className="users-filter-toggle rounded-md border border-gray-200 bg-white p-2 text-gray-500 transition hover:bg-gray-50"
                aria-label="Open filter"
              >
                <FilterIcon className="h-4 w-4" />
              </button>

              <div className="users-import-menu relative">
                <button
                  type="button"
                  onClick={() => setIsImportMenuOpen((previous) => !previous)}
                  className="rounded-md border border-gray-200 bg-white p-2 text-gray-500 transition hover:bg-gray-50"
                  aria-label="Import or export users"
                >
                  <Export_Icon className="h-4 w-4" />
                </button>

                {isImportMenuOpen ? (
                  <div className="absolute left-0 top-full z-40 mt-2">
                    <Popup items={topImportMenuItems} className="!min-w-[170px] rounded-lg" />
                  </div>
                ) : null}
              </div>

              {isFilterOpen ? (
                <div className="users-filter-panel absolute left-0 top-full z-40 mt-3">
                  <AdvanceFilter
                    defaultTab="quick"
                    defaultRows={DEFAULT_FILTER_ROWS}
                    onFilterChange={(state) => setCurrentFilterState(state)}
                    onClear={() => setCurrentFilterState(null)}
                    className="w-[860px] max-w-[92vw] rounded-xl bg-white"
                    columnOptions={columnOptions}
                    valueOptions={statusOptions}
                    valueOptionsByColumn={valueOptionsByColumn}
                    quickFilterColumns={quickFilterColumns}
                  />
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <PaginationControls
                total={filteredUsers.length}
                from={resultsFrom}
                to={resultsTo}
                label="results"
                canGoPrevious={boundedPage > 1}
                canGoNext={boundedPage < totalPages}
                onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
                onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                pageSize={pageSize}
                pageSizeOptions={[5, 10, 20]}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                className="!mt-0"
              />
               </div>
          </div>
        </div>

        <div className="px-4">
          <div className="overflow-x-auto rounded-sm border border-gray-200 bg-white px-3 py-1">
            <table className="w-full min-w-[1100px] border-separate border-spacing-y-3  text-sm">
              <thead>
                <TableHeaderRow
                  className="text-left text-sm text-gray-700"
                  columns={USERS_COLUMNS}
                  getColumnKey={(column) => column.id}
                  renderColumn={(column) =>
                    column.id === "name" ? (
                      <span>
                        Name <span className="font-normal text-gray-400">({(pageSize<=filteredUsers?.length)?pageSize:filteredUsers.length} People)</span>
                      </span>
                    ) : (
                      column.label
                    )
                  }
                  columnClassName="px-4 py-2 !font-medium"
                  prefixCells={[
                    {
                      className: "px-4 py-2",
                      content: (
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            className="columns-checkbox h-4 w-4"
                            checked={allCurrentPageSelected}
                            onChange={toggleSelectAllCurrentPage}
                          />
                          Select all
                        </label>
                      ),
                    },
                  ]}
                  suffixCells={[{ className: "px-4 py-2 text-right", content: "" }]}
                />
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const baseCellClass = "border-y border-gray-200 bg-white px-4 py-3 align-middle";
                  const leftCellClass = `${baseCellClass} border-l rounded-l-lg`;
                  const rightCellClass = `${baseCellClass} border-r rounded-r-lg text-right`;
                  const actionItems = buildActionItems(user);

                  return (
                    <tr key={user.id} className="text-sm text-gray-700">
                      <td className={leftCellClass}>
                        <input
                          type="checkbox"
                          className="columns-checkbox h-4 w-4"
                          checked={selectedIds.has(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                          aria-label={`Select ${user.name}`}
                        />
                      </td>
                      <td className={baseCellClass}>{user.name}</td>
                      <td className={baseCellClass}>{user.role}</td>
                      <td className={baseCellClass}>{user.email || "-"}</td>
                      <td className={baseCellClass}>{user.company || "-"}</td>
                      <td className={baseCellClass}>{inviteCell(user)}</td>
                      <td className={baseCellClass}>
                        <button
                          type="button"
                          onClick={() => navigate(`/settings/people/users/${user.id}`)}
                          className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                          aria-label={`Edit ${user.name}`}
                        >
                          <EditDetailsIcon className="h-4 w-4" />
                        </button>
                      </td>
                      <td className={rightCellClass}>
                        <div className="users-action-menu relative inline-flex">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenActionMenuId((current) => (current === user.id ? null : user.id))
                            }
                            className="rounded-full p-1 text-gray-400 hover:text-gray-600"
                            aria-label={`Actions for ${user.name}`}
                          >
                            <VerticalDots className="h-4 w-4" />
                          </button>
                          {openActionMenuId === user.id ? (
                            <div className="absolute right-0 top-full z-40 mt-2">
                              <Popup items={actionItems} className="!min-w-[190px] rounded-lg" />
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <JobsFAB onClick={() => setIsAddUserModalOpen(true)} />
          </div>
        </div>
      </PageContentContainer>

      <input
        ref={csvFileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleImportCsv}
      />

      {selectedIds.size > 0 ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <SelectedItem
            selectedCountClassName="text-[var(--color-gray-500)] !font-bold"
            selectedCount={selectedIds.size}
            actions={selectionActions}
            onClose={clearSelection}
            className="rounded-xl border border-gray-200 bg-white shadow-[0_12px_24px_-12px_rgba(15,23,42,0.45)]"
          />
        </div>
      ) : null}

      <PopupModal
        isOpen={Boolean(detailsUser)}
        onClose={() => setDetailsUser(null)}
        title="User Details"
        className="max-w-[520px]"
        contentClassName="!p-6"
      >
        {detailsUser ? (
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Name:</span> {detailsUser.name}
            </p>
            <p>
              <span className="font-semibold">Role:</span> {detailsUser.role}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {detailsUser.email || "-"}
            </p>
            <p>
              <span className="font-semibold">Company:</span> {detailsUser.company || "-"}
            </p>
          </div>
        ) : null}
      </PopupModal>

      <PopupModal
        isOpen={transferSourceIds.length > 0}
        onClose={closeTransferModal}
        title="Transfer all job ownership to"
        className="max-w-[700px]"
        contentClassName="!p-6"
      >
        <div className="space-y-4">
          {transferSourceUsers.length > 0 ? (
            <p className="text-sm text-gray-500">
              Selected users: {buildTransferSourceLabel(transferSourceUsers)}
            </p>
          ) : null}

          <div className="border-b border-gray-300 pb-2">
            <SearchInput
              value={transferSearch}
              onChange={(event) => setTransferSearch(event.target.value)}
              placeholder="Search"
              containerClassName="gap-2"
              className="text-sm text-gray-700"
              inputClassName="text-sm text-gray-700"
              iconClassName="text-gray-400"
              iconSize="!h-5 !w-5"
            />
          </div>

          <div className="max-h-[180px] space-y-1 overflow-y-auto">
            {transferCandidates.length > 0 ? (
              transferCandidates.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => setTransferTargetUserId(candidate.id)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${
                    transferTargetUserId === candidate.id
                      ? "border-[#007B8C] bg-[#007B8C]/10 text-[#007B8C]"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{candidate.name}</span>
                  <span className="text-xs text-gray-400">{candidate.role}</span>
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500">No users found.</p>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              size="sm"
              variant="primary"
              className="!w-[120px] !rounded-md !bg-[var(--color-secondary-500)] !py-2 text-white hover:!bg-[var(--color-secondary-600)]"
              onClick={handleTransferOwnership}
              disabled={!transferTargetUserId}
            >
              Transfer
            </Button>
          </div>
        </div>
      </PopupModal>

      <PopupModal
        isOpen={isAddUserModalOpen}
        onClose={closeAddUserModal}
        title={
          <span className="inline-flex flex-wrap items-baseline gap-2">
            <span>Add User</span>
            <span className="text-sm font-normal italic text-gray-400">
              (You can add {remainingUserSlots} more people)
            </span>
          </span>
        }
        className="max-w-[980px] rounded-md"
        contentClassName="!p-8"
        titleClassName="!text-gray-900"
        headerRight={
          <div className="users-modal-import-menu relative">
            <button
              type="button"
              onClick={() => setIsAddModalImportMenuOpen((previous) => !previous)}
              className="rounded-md bg-[#FFF4F2] p-2 text-[var(--color-secondary-500)] transition hover:bg-[#FFE8E3]"
              aria-label="Import or export users"
            >
              <AppIcon
                icon={Export_Icon}
                size={16}
                color="var(--color-secondary-400)"
                strokeWidth={0.2}
                forceColor
              />
            </button>
            {isAddModalImportMenuOpen ? (
              <div className="absolute right-0 top-full z-40 mt-2">
                <Popup items={addUserImportMenuItems} className="!min-w-[170px] rounded-lg" />
              </div>
            ) : null}
          </div>
        }
      >
        <div className="space-y-5">
          <div className="space-y-3">
            {addUserRows.map((row) => {
              const isInvalidEmail = row.email.trim() !== "" && !EMAIL_PATTERN.test(row.email.trim());

              return (
                <div key={row.id} className="space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <label className="flex w-full max-w-[220px] flex-col gap-2">
                      <span className="text-sm font-medium text-gray-700">Select User Type</span>
                      <div className="relative">
                        <select
                          value={row.userType}
                          onChange={(event) =>
                            updateAddUserRow(row.id, "userType", event.target.value as UserType)
                          }
                          className="h-11 w-full appearance-none rounded-sm border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-700 focus:border-[#007B8C] focus:outline-none"
                        >
                          <option value="users">Users</option>
                          <option value="guest">Guest</option>
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      </div>
                    </label>

                    {addUserRows.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeAddUserRow(row.id)}
                        className="mb-1 rounded-md p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Remove row"
                      >
                        <CloseIcon />
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <TextInput
                      label="First Name"
                      placeholder="Enter"
                      value={row.firstName}
                      onChange={(event) => updateAddUserRow(row.id, "firstName", event.target.value)}
                    />
                    <TextInput
                      label="Last Name"
                      placeholder="Enter"
                      value={row.lastName}
                      onChange={(event) => updateAddUserRow(row.id, "lastName", event.target.value)}
                    />
                    <TextInput
                      type="email"
                      label="Email address"
                      placeholder="Enter"
                      value={row.email}
                      onChange={(event) => updateAddUserRow(row.id, "email", event.target.value)}
                      hint={isInvalidEmail ? "Please enter a valid email address." : undefined}
                      className={isInvalidEmail ? "!border-red-400 focus:!border-red-400" : ""}
                    />

                    <label className="flex w-full flex-col gap-2">
                      <span className="text-sm font-medium text-gray-700">Role</span>
                      <div className="relative">
                        <select
                          value={row.role}
                          onChange={(event) => updateAddUserRow(row.id, "role", event.target.value)}
                          className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-700 focus:border-[#007B8C] focus:outline-none"
                        >
                          {ROLE_OPTIONS.map((roleOption) => (
                            <option key={roleOption.value} value={roleOption.value}>
                              {roleOption.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      </div>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addNewUserRow}
            disabled={remainingUserSlots === 0}
            className="inline-flex items-center text-sm font-semibold text-[#007B8C] transition hover:text-[#006271] disabled:cursor-not-allowed disabled:text-gray-300"
          >
            + Add users
          </button>

          <div className="flex flex-wrap items-center justify-end gap-4 pt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Send invite</span>
              <ToggleSwitch
                checked={sendInviteOnSave}
                onChange={setSendInviteOnSave}
                showLabel={false}
                size="sm"
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={saveAddedUsers}
              disabled={!canSaveAddedUsers}
              className="!min-w-[120px] !rounded-md !py-2"
            >
              Save
            </Button>
          </div>
        </div>
      </PopupModal>
    </div>
  );
}
