import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import RichTextEditor from "@/components/ui/rich-text-editor/RichTextEditor";
import SearchInput from "@/components/ui/search-input/SearchInput";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import {
    useEmailTemplatesStore,
    ALL_EVENTS,
    type EmailTemplate,
} from "@/stores/emailTemplatesStore";

const BLANK: Omit<EmailTemplate, "id" | "lastUpdated"> = {
    event: "",
    name: "",
    subject: "",
    status: "Active",
    body: "",
    recipients: "Sender signature",
    contextMode: "intro_only",
};

export default function CreateEmailTemplate() {
    const navigate = useNavigate();
    const { goBack } = useAppNavigate();
    const { templateId } = useParams<{ templateId: string }>();
    const [searchParams] = useSearchParams();

    const isEdit = Boolean(templateId);
    const getById = useEmailTemplatesStore((s) => s.getById);
    const addTemplate = useEmailTemplatesStore((s) => s.addTemplate);
    const updateTemplate = useEmailTemplatesStore((s) => s.updateTemplate);

    const [form, setForm] = useState<Omit<EmailTemplate, "id" | "lastUpdated">>(BLANK);
    const [eventOpen, setEventOpen] = useState(false);

    useEffect(() => {
        if (isEdit && templateId) {
            const existing = getById(templateId);
            if (existing) {
                const { id: _id, lastUpdated: _lu, ...rest } = existing;
                setForm(rest);
            }
        } else {
            const eventParam = searchParams.get("event") ?? "";
            setForm({ ...BLANK, event: eventParam, name: eventParam });
        }
    }, [isEdit, templateId, getById, searchParams]);

    const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSave = () => {
        if (!form.event || !form.name) return;
        if (isEdit && templateId) {
            updateTemplate(templateId, form);
        } else {
            addTemplate(form);
        }
        navigate("/settings/jobs/email-templates");
    };

    const handleCancel = () => goBack({ fallbackTo: "/settings/jobs/email-templates" });

    return (
        <>
            <PageMeta
                title={isEdit ? "Edit Email Template" : "Create Email Template"}
                description="Configure email notification template"
            />

            <div className="flex h-full min-h-0 flex-col gap-4">
                <AppBreadcrumb />

                <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0 flex flex-col">
                    {/* Header */}
                    <PageHeader
                        title={isEdit ? "Edit Template" : "Create New"}
                        showBackButton
                        onBackClick={handleCancel}
                        className="!px-6 py-4 shrink-0"
                    />

                    {/* Two-column body — 50 / 50 */}
                    <div className="flex flex-1 min-h-0 overflow-hidden">

                        {/* ── LEFT PANEL (50%) ── */}
                        <div className="w-1/2 border-r border-gray-200 flex flex-col min-h-0">

                            {/* Scrollable fields */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

                                {/* Template name with pencil icon */}
                                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                                    <input
                                        type="text"
                                        placeholder="Enter template name"
                                        value={form.name}
                                        onChange={(e) => set("name", e.target.value)}
                                        className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                                    />
                                    <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4 1 1-4 12.362-12.726z" />
                                    </svg>
                                </div>

                                {/* Action / event dropdown */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">Action</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setEventOpen((o) => !o)}
                                            className="w-full flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white hover:border-gray-400 focus:outline-none focus:border-[#007B8C]"
                                        >
                                            <span className={form.event ? "text-gray-700" : "text-gray-400"}>
                                                {form.event || "Select event type"}
                                            </span>
                                            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {eventOpen && (
                                            <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-56 overflow-y-auto">
                                                {ALL_EVENTS.map((ev) => (
                                                    <button
                                                        key={ev}
                                                        type="button"
                                                        onClick={() => { set("event", ev); setEventOpen(false); }}
                                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${form.event === ev ? "text-[#007B8C] font-medium" : "text-gray-700"}`}
                                                    >
                                                        {ev}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recipients */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">Recipient(s)</label>
                                    <input
                                        type="text"
                                        value={form.recipients}
                                        onChange={(e) => set("recipients", e.target.value)}
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#007B8C] focus:ring-1 focus:ring-[#007B8C]"
                                    />
                                </div>

                                {/* Context */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">Context</label>
                                    <div className="rounded-lg border border-gray-200 p-3 flex flex-col gap-3">
                                        {(
                                            [
                                                { value: "intro_only", label: "Add intro text only when custom message is empty" },
                                                { value: "always_above", label: "Add intro text always above custom message" },
                                            ] as const
                                        ).map((opt) => (
                                            <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="contextMode"
                                                    checked={form.contextMode === opt.value}
                                                    onChange={() => set("contextMode", opt.value)}
                                                    className="mt-0.5 accent-[#007B8C]"
                                                />
                                                <span className="text-sm text-gray-700">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ── Left footer: Cancel + Save ── */}
                            <div className="shrink-0  px-6 py-4 flex items-center gap-3 bg-white">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="rounded-lg bg-[#F25C54] px-4 py-2 text-sm font-medium text-white hover:bg-[#e04e47] transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* ── RIGHT PANEL (50%) ── */}
                        <div className="w-1/2 flex flex-col min-h-0">

                            {/* Scrollable content */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                                <p className="text-sm font-semibold text-gray-700">Email content</p>

                                {/* Subject + RichText in one bordered card */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                                        <span className="text-sm font-medium text-gray-500 shrink-0">Subject :</span>
                                        <input
                                            type="text"
                                            placeholder="Enter subject"
                                            value={form.subject}
                                            onChange={(e) => set("subject", e.target.value)}
                                            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                                        />
                                    </div>
                                    <RichTextEditor
                                        value={form.body}
                                        onChange={(v) => set("body", v)}
                                        placeholder="Enter your message.."
                                        bodyClassName="min-h-[160px]"
                                        className="border-none"
                                        toolbarClassName="!rounded-t-none"
                                    />
                                </div>

                                {/* Preview */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50">
                                    <div className="px-4 py-2 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-700">Preview</p>
                                    </div>
                                    <div className="px-4 py-3 flex flex-col gap-1 min-h-[120px]">
                                        <p className="text-sm text-gray-400">{form.recipients || "Recipient"}</p>
                                        <p className="text-sm text-gray-500">{form.subject || "Subject"}</p>
                                        {form.body && (
                                            <div
                                                className="mt-2 text-sm text-gray-600 prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: form.body }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Right footer: Search to send email (uses SearchInput) ── */}
                            <div className="shrink-0 border-t border-gray-200 px-6 py-4 bg-white">
                                <div className="flex items-center gap-2 bg-[#F25C54] rounded-lg border border-[#F25C54] px-3 py-2 w-fit">
                                    <SearchInput
                                        placeholder="Search to send email"
                                        inputClassName="!text-sm !text-[#FFFFFF] placeholder:!text-[#FFFFFF] text-sm!"
                                        iconClassName="text-white"
                                        minSearchLength={1}
                                        containerClassName="w-44"
                                        iconSize="h-5! w-5!"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </PageContentContainer>
            </div>
        </>
    );
}