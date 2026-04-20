import { useNavigate } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import SearchInput from "@/components/ui/search-input/SearchInput";
import PaginationControls from "@/components/common/PaginationControls";
import ToggleSwitch from "@/components/ui/toggle/ToggleSwitch";
import TableGridHeader from "@/components/common/TableGridHeader";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { EditDetailsIcon } from "@/icons";
import {
    useEmailTemplatesStore,
    ALL_EVENTS,
} from "@/stores/emailTemplatesStore";

const GRID = "grid grid-cols-[2fr_2fr_3fr_1.2fr_1.5fr_40px] items-center gap-8 px-5 py-4 min-w-0";

const TABLE_COLUMNS = [
    { label: "Event" },
    { label: "Name" },
    { label: "Subject" },
    { label: "Status" },
    { label: "Last updated" },
    { label: "" },
];

export default function EmailTemplates() {
    const navigate = useNavigate();
    const { goBack } = useAppNavigate();

    const templates = useEmailTemplatesStore((s) => s.templates);
    const searchQuery = useEmailTemplatesStore((s) => s.searchQuery);
    const page = useEmailTemplatesStore((s) => s.page);
    const pageSize = useEmailTemplatesStore((s) => s.pageSize);
    const setSearchQuery = useEmailTemplatesStore((s) => s.setSearchQuery);
    const setPage = useEmailTemplatesStore((s) => s.setPage);
    const toggleStatus = useEmailTemplatesStore((s) => s.toggleStatus);

    // Filter
    const filtered = templates.filter((t) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            t.event.toLowerCase().includes(q) ||
            t.name.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q)
        );
    });

    // Pagination
    const total = ALL_EVENTS.length;
    const from = page * pageSize + 1;
    const to = Math.min(from + pageSize - 1, total);

    const templatesByEvent = new Map(
        templates.map((t) => [t.event, t])
    );

    const visibleEvents = ALL_EVENTS.slice(
        page * pageSize,
        (page + 1) * pageSize
    ).filter((event) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const t = templatesByEvent.get(event);
        return (
            event.toLowerCase().includes(q) ||
            (t &&
                (t.name.toLowerCase().includes(q) ||
                    t.subject.toLowerCase().includes(q)))
        );
    });

    return (
        <>
            <PageMeta
                title="Email Templates"
                description="Manage email notification templates"
            />

            <div className="flex h-full min-h-0 flex-col gap-4">
                <AppBreadcrumb />

                <PageContentContainer className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">

                    {/* HEADER (FIXED) */}
                    <PageHeader
                        title="Email Template"
                        description="Add or edit email templates"
                        showBackButton
                        onBackClick={() => goBack({ fallbackTo: "/settings" })}
                        className="!px-6 py-4 shrink-0"
                    />

                    {/* CONTENT WRAPPER */}
                    <div className="flex flex-col flex-1 min-h-0 p-6">

                        {/* SEARCH + PAGINATION (FIXED) */}
                        <div className="flex items-center justify-between py-2 shrink-0">
                            <div className="flex w-82 items-center gap-2 rounded-full border border-[#E5E8EE] bg-white px-3 py-2">
                                <SearchInput
                                    value={searchQuery}
                                    onSearchTrigger={setSearchQuery}
                                    placeholder="Search job"
                                    containerClassName="gap-1"
                                    inputClassName="text-sm text-gray-700"
                                    className="text-1xl text-gray-700"
                                    iconClassName="text-gray-300"
                                    iconSize="!h-4.5"
                                />
                            </div>

                            <PaginationControls
                                total={total}
                                from={from}
                                to={to}
                                label="results"
                                showShowingText={false}
                                canGoPrevious={page > 0}
                                canGoNext={to < total}
                                onPrevious={() => setPage(page - 1)}
                                onNext={() => setPage(page + 1)}
                                className="!mt-0"
                            />
                        </div>

                        {/* TABLE WRAPPER */}
                        <div className="flex flex-col flex-1 min-h-0 mt-2 border border-[#E5E8EE] rounded-xl bg-[#FAFBFC] p-2">

                            <div className="md:overflow-x-auto md:custom-scrollbar">


                                <div className="md:min-w-[1100px]">

                                    {/* TABLE HEADER (FIXED) */}
                                    <div className="shrink-0 bg-gray-50">
                                        <TableGridHeader gridClassName={GRID} columns={TABLE_COLUMNS} />
                                    </div>

                                    {/* TABLE BODY (SCROLLABLE ONLY THIS) */}
                                    <div className="flex-1 overflow-y-auto min-h-0 space-y-2 p-2 custom-scrollbar">
                                        {visibleEvents.map((event) => {
                                            const tmpl = templatesByEvent.get(event);

                                            if (!tmpl) {
                                                return (
                                                    <div
                                                        key={event}
                                                        className={`${GRID} bg-white rounded-lg border border-[#E5E8EE] transition-all`}
                                                    >
                                                        <span className="text-base text-gray-500">
                                                            {event}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/settings/jobs/email-templates/new?event=${encodeURIComponent(
                                                                        event
                                                                    )}`
                                                                )
                                                            }
                                                            className="text-base font-semibold text-[#F25C54] text-left"
                                                        >
                                                            + Add Template
                                                        </button>

                                                        <span />
                                                        <span />
                                                        <span />
                                                        <span />
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div
                                                    key={tmpl.id}
                                                    className={`${GRID} bg-white rounded-lg border border-[#E5E8EE] transition-all`}
                                                >
                                                    <div className="min-w-0 truncate" title={event}>
                                                        <span className="text-base text-gray-500">
                                                            {event}
                                                        </span>
                                                    </div>

                                                    <div className="min-w-0 truncate" title={tmpl.name}>
                                                        <span className="text-base text-[#212121]">
                                                            {tmpl.name}
                                                        </span>
                                                    </div>

                                                    <div className="min-w-0 truncate" title={tmpl.subject}>
                                                        <span className="text-base text-[#212121]">
                                                            {tmpl.subject}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <ToggleSwitch
                                                            checked={tmpl.status === "Active"}
                                                            onChange={() => toggleStatus(tmpl.id)}
                                                            size="sm"
                                                            showLabel={false}
                                                        />
                                                        <span className="text-base text-[#212121]">
                                                            {tmpl.status}
                                                        </span>
                                                    </div>

                                                    <span className="text-base text-[#212121] pl-6">
                                                        {tmpl.lastUpdated}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/settings/jobs/email-templates/${tmpl.id}/edit`
                                                            )
                                                        }
                                                        className="text-[#656565] transition-colors"
                                                    >
                                                        <EditDetailsIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </PageContentContainer>
            </div>
        </>
    );
}