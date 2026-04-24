import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import RichTextEditor from "@/components/ui/rich-text-editor/RichTextEditor";
import SearchInput from "@/components/ui/search-input/SearchInput";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import BuilderSelect from "@/components/ui/dropdown/BuilderSelect";
import {
    useEmailTemplatesStore,
    ALL_EVENTS,
    type EmailTemplate,
} from "@/stores/emailTemplatesStore";
import { EditPenIcon } from "@/icons";

const BLANK: Omit<EmailTemplate, "id" | "lastUpdated"> = {
    event: "",
    name: "",
    subject: "",
    status: "Active",
    body: "",
    recipients: "Sender signature",
    contextMode: "intro_only",
};

const APPROVAL_PERIODS = ["1 month", "2 months", "3 months", "6 months", "1 year"];
const TRIGGER_POINTS = ["Pre - expiry early", "Pre - expiry final", "On expiry", "Post expiry", "Continued escalation"];

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
    const [approvalPeriod, setApprovalPeriod] = useState("1 month");
    const [triggerPoint, setTriggerPoint] = useState("Pre expiry, early");

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

                    {/* Two-column */}
                    <div className="flex flex-1 min-h-0 overflow-hidden">

                        {/* ── LEFT PANEL  ── */}
                        <div className="w-1/2  flex flex-col min-h-0">

                            {/* Scrollable fields */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar">

                                {/* Template name with pencil icon */}
                                <div className="inline-flex items-center gap-2 border-b border-gray-300 pb-2 max-w-[280px] w-full">
                                    <input
                                        type="text"
                                        placeholder="Enter template name"
                                        value={form.name}
                                        onChange={(e) => set("name", e.target.value)}
                                        className={`flex-1 bg-transparent text-base text-[#212121] placeholder-gray-400 outline-none ${form.name ? "font-semibold" : "font-normal"}`}
                                    />
                                    {isEdit && <EditPenIcon className="w-3.5 h-3.5" />}
                                </div>

                                {/* Action / event dropdown */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">Action</label>
                                    <BuilderSelect
                                        value={form.event}
                                        onChange={(v) => set("event", v)}
                                        options={ALL_EVENTS.map((ev) => ({ value: ev, label: ev }))}
                                        placeholder="Select event type"
                                        className="w-full"
                                        selectClassName="rounded-lg border-gray-300 text-sm h-[38px]"
                                    />
                                </div>

                                {/* Approval period + Trigger point — only for Expiry warning */}
                                {form.event === "Expiry warning" && (
                                    <div className="flex gap-4">
                                        <div className="flex flex-col gap-1 flex-1">
                                            <label className="text-sm font-medium text-gray-700">Approval period</label>
                                            <BuilderSelect
                                                value={approvalPeriod}
                                                onChange={setApprovalPeriod}
                                                options={APPROVAL_PERIODS.map((p) => ({ value: p, label: p }))}
                                                className="w-full"
                                                selectClassName="rounded-lg border-gray-300 text-sm h-[38px]"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1 flex-1">
                                            <label className="text-sm font-medium text-gray-700">Trigger point</label>
                                            <BuilderSelect
                                                value={triggerPoint}
                                                onChange={setTriggerPoint}
                                                options={TRIGGER_POINTS.map((t) => ({ value: t, label: t }))}
                                                className="w-full"
                                                selectClassName="rounded-lg border-gray-300 text-sm h-[38px]"
                                            />
                                        </div>
                                    </div>
                                )}
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
                                                    className="mt-0.5 accent-[#000000] cursor-pointer"
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
                                    className="rounded-[4px] px-4 py-2 text-base bg-[#9F9F9F26] font-medium text-[#676767D1] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="rounded-[4px] bg-[#F25C54] px-4 py-2 text-base font-medium text-white hover:bg-[#e04e47] transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* ── RIGHT PANEL (50%) ── */}
                        <div className="w-1/2 flex flex-col min-h-0">

                            {/* Scrollable content */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
                                <p className="text-sm font-semibold text-gray-700">Email content</p>

                                {/* Subject + RichText in one bordered card */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden min-h-[200px]">
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
                                <div className="rounded-t-none rounded-b-[6px] bg-[#F6F6F6]">
                                    <div className="px-4 py-2 border-b border-gray-200 bg-[#F0F0F0]">
                                        <p className="text-sm font-semibold text-gray-700">Preview</p>
                                    </div>
                                    <div className="px-4 flex flex-col min-h-[320px]">
                                        <p className="text-sm text-gray-400 py-3 border-b border-[#E9E9E9]">{form.recipients || "Recipient"}</p>
                                        <p className="text-sm text-gray-500 py-3 border-b border-[#E9E9E9]">{form.subject || "Subject"}</p>
                                        {form.body && (
                                            <div
                                                className="mt-2 text-sm text-gray-600 prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: form.body }}
                                            />
                                        )}
                                    </div>
                                    {/* ── Right footer: Search to send email (uses SearchInput) ── */}
                                    <div className="shrink-0 border-t border-[#B1B1B1] px-6 py-4">
                                        <div className="flex items-center gap-2 bg-[#F25C54] rounded-[4px] border border-[#F25C54] px-3 py-2 w-fit">
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

                        </div>
                    </div>
                </PageContentContainer>
            </div>
        </>
    );
}