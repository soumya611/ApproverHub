import { useEffect, useMemo, useState } from "react";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageMeta from "../components/common/PageMeta";
import PaginationControls from "../components/common/PaginationControls";
import SearchInput from "../components/ui/search-input/SearchInput";
import PageContentContainer from "../components/layout/PageContentContainer";
import PageHeader from "../components/ui/page-header/PageHeader";
import ToggleSwitch from "../components/ui/toggle/ToggleSwitch";
import JobsFAB from "../components/jobs/JobsFAB";
import { EditDetailsIcon, VerticalDots } from "../icons";
import { useAppNavigate } from "../hooks/useAppNavigate";
import { TableHeaderRow } from "../components/ui/table";
import Popup, { type PopupItem } from "../components/ui/popup/Popup";

interface WorkflowTemplateRow {
  id: string;
  name: string;
  created: string;
  active: boolean;
  ownerName: string;
  ownerAvatarUrl?: string;
}

interface WorkflowColumn {
  id: "name" | "created" | "status" | "owner" | "edit";
  label: string;
  className?: string;
}

const BASE_TEMPLATES: WorkflowTemplateRow[] = [
  {
    id: "wf-001",
    name: "Content team approval",
    created: "Wed, 29 Dec 2:20 am",
    active: true,
    ownerName: "Liam West",
  },
  {
    id: "wf-002",
    name: "Marketing campaign",
    created: "Wed, 29 Dec 2:20 am",
    active: false,
    ownerName: "Emma Scott",
  },
  {
    id: "wf-003",
    name: "Marketing job",
    created: "Wed, 29 Dec 2:20 am",
    active: true,
    ownerName: "Noah Green",
  },
];

const MORE_TEMPLATES: WorkflowTemplateRow[] = Array.from({ length: 50 }, (_, index) => {
  const id = `wf-${String(index + 4).padStart(3, "0")}`;
  return {
    id,
    name: `Workflow template ${index + 4}`,
    created: "Mon, 15 Jan 9:30 am",
    active: index % 2 === 0,
    ownerName: `Owner ${index + 4}`,
  };
});

const ALL_TEMPLATES = [...BASE_TEMPLATES, ...MORE_TEMPLATES];

const WORKFLOW_COLUMNS: WorkflowColumn[] = [
  { id: "name", label: "Name", className: "py-3 px-4 text-left" },
  { id: "created", label: "Created", className: "py-3 px-4 text-left" },
  { id: "status", label: "Status", className: "py-3 px-4 text-left" },
  { id: "owner", label: "Owner", className: "py-3 px-4 text-left" },
  { id: "edit", label: "Edit", className: "py-3 px-4 text-center w-[120px]" },
];

const getOwnerInitials = (name: string) => {
  const compact = name.replace(/\s+/g, "").trim();
  if (!compact) return "NA";
  return compact.slice(0, 2).toUpperCase();
};

export default function WorkflowSetting() {
  const { goBack } = useAppNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [templates, setTemplates] = useState<WorkflowTemplateRow[]>(ALL_TEMPLATES);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter((item) => {
      const combined = `${item.name} ${item.ownerName}`.toLowerCase();
      return combined.includes(term);
    });
  }, [search, templates]);

  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const from = filteredTemplates.length ? (currentPage - 1) * pageSize + 1 : 0;
  const to = filteredTemplates.length
    ? Math.min(filteredTemplates.length, currentPage * pageSize)
    : 0;
  const pagedTemplates = filteredTemplates.slice(from > 0 ? from - 1 : 0, to);

  const handleToggle = (id: string, checked: boolean) => {
    setTemplates((previous) =>
      previous.map((item) => (item.id === id ? { ...item, active: checked } : item))
    );
  };
  const workflowMenuItems: PopupItem[] = [
    {
      id: "details",
      label: "Details",
      onClick: () => setOpenMenuId(null),
    },
    {
      id: "delete",
      label: "Delete",
      onClick: () => setOpenMenuId(null),
    },
  ];

  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".workflow-row-menu")) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  return (
    <>
      <PageMeta title="Workflow Settings | Approver Hub" description="Manage workflow templates" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb />
        <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0">
          <PageHeader
            title="Workflow Templates"
            description="Create and manage workflow templates."
            onBackClick={() => goBack({ fallbackTo: "/settings" })}
            className="!px-4 py-4"
          />

          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex w-full items-center rounded-md bg-white px-3 py-2">
              <SearchInput
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search Settings"
                containerClassName="w-full gap-3 no-border"
                inputClassName="text-sm text-gray-600"
                className="text-sm text-gray-600"
                iconClassName="text-gray-400"
                iconSize="!h-5 !w-5"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            <div className="mb-2 flex justify-end">
              <PaginationControls
                total={filteredTemplates.length}
                from={from}
                to={to}
                label="results"
                showShowingText={false}
                canGoPrevious={currentPage > 1}
                canGoNext={currentPage < totalPages}
                onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
                onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                pageSize={pageSize}
                pageSizeOptions={[10,50, 100, 200]}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                className="!mt-0"
              />
              
            </div>
            

            <div className="overflow-hidden rounded-md border border-gray-200 bg-white p-3">
              <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[900px] border-separate [border-spacing:0_10px] text-sm">
                <thead>
                  <TableHeaderRow
                    className="bg-white text-[12px] font-bold text-gray-600"
                    columns={WORKFLOW_COLUMNS}
                    getColumnKey={(column) => column.id}
                    renderColumn={(column) => column.label}
                    columnClassName={(column) => column.className ?? "py-3 px-4"}
                  />
                </thead>
                <tbody>
                  {pagedTemplates.length > 0 ? (
                    pagedTemplates.map((item) => (
                      <tr key={item.id} className="group text-sm text-gray-600">
                        <td className="rounded-l-md border-y border-l border-gray-200 bg-white py-3 px-4 font-medium text-gray-700 transition-colors group-hover:bg-gray-50/80">
                          {item.name}
                        </td>
                        <td className="border-y border-gray-200 bg-white py-3 px-4 transition-colors group-hover:bg-gray-50/80">
                          {item.created}
                        </td>
                        <td className="border-y border-gray-200 bg-white py-3 px-4 transition-colors group-hover:bg-gray-50/80">
                          <div className="inline-flex items-center gap-2">
                            <ToggleSwitch
                              checked={item.active}
                              onChange={(checked) => handleToggle(item.id, checked)}
                              showLabel={false}
                              size="sm"
                            />
                            <span className={item.active ? "text-gray-700" : "text-gray-400"}>
                              {item.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="border-y border-gray-200 bg-white py-3 px-4 transition-colors group-hover:bg-gray-50/80">
                          {item.ownerAvatarUrl ? (
                            <img
                              src={item.ownerAvatarUrl}
                              alt={item.ownerName}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <span
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                              style={{ backgroundColor: "#098399" }}
                              aria-label={item.ownerName}
                              title={item.ownerName}
                            >
                              {getOwnerInitials(item.ownerName)}
                            </span>
                          )}
                        </td>
                        <td className="rounded-r-md border-y  border-gray-200 bg-white py-3 px-4 transition-colors group-hover:bg-gray-50/80">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-300 transition hover:bg-gray-100 hover:text-[#007B8C]"
                              aria-label={`Edit ${item.name}`}
                            >
                              <EditDetailsIcon className="h-4 w-4" />
                            </button>
                            
                          </div>
                        </td>
                        <td className="rounded-r-md border-y border-r border-gray-200 bg-white py-3 px-4 transition-colors group-hover:bg-gray-50/80">
                          <div className="workflow-row-menu relative flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId((previous) =>
                                  previous === item.id ? null : item.id
                                )
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-300 transition hover:bg-gray-100 hover:text-gray-500"
                              aria-label={`More actions for ${item.name}`}
                              aria-haspopup="menu"
                              aria-expanded={openMenuId === item.id}
                            >
                              <VerticalDots className="h-4 w-4" />
                            </button>
                            {openMenuId === item.id ? (
                              <div className="absolute right-0 top-full z-30 mt-2">
                                <Popup
                                  items={workflowMenuItems}
                                  className="!min-w-[120px] rounded-lg"
                                />
                              </div>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={WORKFLOW_COLUMNS.length} className="px-4 py-10 text-center text-sm text-gray-400">
                        No workflow templates match the current search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        </PageContentContainer>
      </div>

      <JobsFAB onClick={() => undefined} ariaLabel="Create workflow template" />
    </>
  );
}
