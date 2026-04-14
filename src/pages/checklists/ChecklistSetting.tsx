import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageMeta from "@/components/common/PageMeta";
import PaginationControls from "@/components/common/PaginationControls";
import SearchInput from "@/components/ui/search-input/SearchInput";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import ToggleSwitch from "@/components/ui/toggle/ToggleSwitch";
import JobsFAB from "@/components/jobs/JobsFAB";
import { EditDetailsIcon, VerticalDots } from "@/icons";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { TableHeaderRow } from "@/components/ui/table";
import Popup from "@/components/ui/popup/Popup";
import { useChecklistTemplatesStore } from "@/stores/checklistTemplatesStore";

interface ChecklistTemplateRow {
  id: string;
  name: string;
  created: string;
  active: boolean;
  ownerName: string;
  ownerAvatarUrl?: string;
}

interface ChecklistColumn {
  id: "name" | "created" | "status" | "owner" | "edit";
  label: string;
  className?: string;
}

const CHECKLIST_COLUMNS: ChecklistColumn[] = [
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

const formatCreatedDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-GB");
};

export default function ChecklistSetting() {
  const { goBack } = useAppNavigate();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const checklistTemplates = useChecklistTemplatesStore((state) => state.checklistTemplates);
  const toggleChecklistTemplateStatus = useChecklistTemplatesStore(
    (state) => state.toggleChecklistTemplateStatus
  );
  const duplicateChecklistTemplate = useChecklistTemplatesStore(
    (state) => state.duplicateChecklistTemplate
  );
  const removeChecklistTemplate = useChecklistTemplatesStore((state) => state.removeChecklistTemplate);

  const templates: ChecklistTemplateRow[] = useMemo(
    () =>
      checklistTemplates.map((item) => ({
        id: item.id,
        name: item.name,
        created: formatCreatedDate(item.createdAt),
        active: item.active,
        ownerName: item.ownerName,
        ownerAvatarUrl: item.ownerAvatarUrl,
      })),
    [checklistTemplates]
  );

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

  const handleToggle = (id: string, checked: boolean) =>
    toggleChecklistTemplateStatus(id, checked);
  const handleDuplicateTemplate = (id: string) => {
    duplicateChecklistTemplate(id);
    setOpenMenuId(null);
  };
  const handleRemoveTemplate = (id: string) => {
    removeChecklistTemplate(id);
    setOpenMenuId(null);
  };
  const handleOpenDetail = (id: string) => {
    navigate(`/checklist-setting/${id}/details`);
    setOpenMenuId(null);
  };

  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".checklist-row-menu")) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  return (
    <>
      <PageMeta title="Checklist Settings | Approver Hub" description="Manage checklist templates" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb />
        <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0">
          <PageHeader
            title="Checklist Templates"
            description="Create and manage checklist templates."
            onBackClick={() => goBack({ fallbackTo: "/settings" })}
            className="!px-4 py-4"
          />

          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex w-full max-w-[320px] items-center rounded-md bg-white px-3 py-2">
                <SearchInput
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search checklist..."
                  containerClassName="gap-3 border px-4 py-2 rounded-[20px]"
                  inputClassName="text-sm text-gray-600"
                  className="text-sm text-gray-600"
                  iconClassName="text-gray-400"
                  iconSize="!h-5 !w-5"
                />
              </div>
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
                pageSizeOptions={[10, 50, 100, 200]}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                className="!mt-0 shrink-0"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden p-4">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white p-3">
              <div className="min-h-0 flex-1 overflow-auto custom-scrollbar">
                <table className="w-full min-w-[900px] border-separate [border-spacing:0_10px] text-sm">
                  <thead>
                    <TableHeaderRow
                      className="bg-white text-[12px] font-bold text-gray-600"
                      columns={CHECKLIST_COLUMNS}
                      getColumnKey={(column) => column.id}
                      renderColumn={(column) => column.label}
                      columnClassName={(column) =>
                        `${column.className ?? "py-3 px-4"} sticky top-0 z-20 bg-white`
                      }
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
                          <td className="rounded-r-md border-y border-r border-gray-200 bg-white py-3 px-4 transition-colors group-hover:bg-gray-50/80">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-300 transition hover:bg-gray-100 hover:text-[#007B8C]"
                                aria-label={`Edit ${item.name}`}
                                onClick={() => navigate(`/checklist-setting/${item.id}/edit`)}
                              >
                                <EditDetailsIcon className="h-4 w-4" />
                              </button>
                              <div className="checklist-row-menu relative">
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
                                      items={[
                                        {
                                          id: "open-detail",
                                          label: "Open detail",
                                          onClick: () => handleOpenDetail(item.id),
                                        },
                                        {
                                          id: "duplicate",
                                          label: "Duplicate",
                                          onClick: () => handleDuplicateTemplate(item.id),
                                        },
                                        {
                                          id: "remove",
                                          label: "Remove",
                                          onClick: () => handleRemoveTemplate(item.id),
                                        },
                                      ]}
                                      className="!min-w-[120px] rounded-lg"
                                    />
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={CHECKLIST_COLUMNS.length}
                          className="px-4 py-10 text-center text-sm text-gray-400"
                        >
                          No checklist templates match the current search.
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

      <JobsFAB
        onClick={() => navigate("/checklist-setting/new")}
        ariaLabel="Create checklist template"
      />
    </>
  );
}
