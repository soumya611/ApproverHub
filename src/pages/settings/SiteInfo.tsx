import { useState } from "react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import TextInput from "@/components/ui/text-input/TextInput";
import PageHeader from "@/components/ui/page-header/PageHeader";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import RadioSm from "@/components/form/input/RadioSm";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { DropDownArrowIcon } from "@/icons";

function InlineFieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-3">
      <span className="whitespace-nowrap text-sm font-medium text-gray-700">{label}</span>
      {children}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function DropdownField({
  value,
  options,
  placeholder,
  onChange,
  isOpen,
  onToggle,
  onClose,
  className = "",
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  onChange: (next: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  className?: string;
}) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? placeholder;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="dropdown-toggle flex h-9 w-full items-center justify-between rounded-sm border border-gray-300 bg-transparent px-3 py-1.5 text-left text-xs text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20"
      >
        <span className="truncate">{selectedLabel}</span>
        <DropDownArrowIcon
          className={`h-3 w-3 shrink-0 text-[#808080] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={onClose}
        className="left-0 right-auto mt-1 min-w-full rounded-sm border border-gray-200 py-1 shadow-lg"
      >
        {options.map((option) => (
          <DropdownItem
            key={option.value}
            onClick={() => {
              onChange(option.value);
              onClose();
            }}
            baseClassName={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-50 ${
              option.value === value ? "font-semibold text-[#007B8C]" : "text-gray-700"
            }`}
          >
            {option.label}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}

export default function SiteInfo() {
  const { goBack } = useAppNavigate();

  const [siteName, setSiteName] = useState("ApproversHub");
  const [siteDescription, setSiteDescription] = useState("");

  const [language, setLanguage] = useState("en_UK");
  const [timeZone, setTimeZone] = useState("Asia/Kolkata");
  const [dateFormat, setDateFormat] = useState<"ddmmyyyy" | "mmddyyyy">("ddmmyyyy");
  const [timeFormat, setTimeFormat] = useState<"24h" | "12h">("24h");

  const [supportEmail, setSupportEmail] = useState("Perivan@gmail.com");
  const [contactPhone, setContactPhone] = useState("8097892100");
  const [helpdeskUrl, setHelpdeskUrl] = useState("022 - 8799-8678");

  const [companyName, setCompanyName] = useState("Perivan");
  const [address, setAddress] = useState("U-9 Area 51");
  const [optionalField, setOptionalField] = useState("English (UK)");
  const [openDropdownKey, setOpenDropdownKey] = useState<"language" | "timeZone" | null>(null);

  return (
    <>
      <PageMeta title="Site Info | Approver Hub" description="Configure organisation-level settings" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb
          items={[
            { label: "Home", to: "/home" },
            { label: "Setting", to: "/settings" },
            { label: "General Global Settings", to: "/settings" },
            { label: "Sitemap" },
          ]}
        />

        <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0">
          <PageHeader
            title="Sitemap"
            description="Configure organisation-level details such as site name, contact information, and default regional settings to keep your platform aligned with business context."
            onBackClick={() => goBack({ fallbackTo: "/settings" })}
            className="!px-4 py-4"
          />

          <div className="min-h-0 flex-1 overflow-auto px-8 py-6">
            <div className="w-full max-w-none space-y-6">
              <div className="w-full rounded-md border border-gray-200 bg-white p-4">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
                  <TextInput
                    label="Site Name"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="h-9 text-xs"
                    inputWrapperClassName="w-full"
                  />
                  <TextInput
                    label="Site Description"
                    placeholder="Enter Description"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    className="h-9 text-xs"
                    inputWrapperClassName="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card title="Localisation">
                  <div className="space-y-5">
                    <InlineFieldRow label="Language :">
                      <DropdownField
                        value={language}
                        onChange={setLanguage}
                        placeholder="Select language"
                        isOpen={openDropdownKey === "language"}
                        onToggle={() =>
                          setOpenDropdownKey((prev) => (prev === "language" ? null : "language"))
                        }
                        onClose={() => setOpenDropdownKey(null)}
                        className="max-w-[180px]"
                        options={[
                          { value: "en_UK", label: "English (UK)" },
                          { value: "en_US", label: "English (US)" },
                        ]}
                      />
                    </InlineFieldRow>
                    <InlineFieldRow label="Time zone :">
                      <DropdownField
                        value={timeZone}
                        onChange={setTimeZone}
                        placeholder="Select time zone"
                        isOpen={openDropdownKey === "timeZone"}
                        onToggle={() =>
                          setOpenDropdownKey((prev) => (prev === "timeZone" ? null : "timeZone"))
                        }
                        onClose={() => setOpenDropdownKey(null)}
                        className="max-w-[180px]"
                        options={[
                          { value: "Asia/Kolkata", label: "Kolkata IST" },
                          { value: "Europe/London", label: "London GMT" },
                        ]}
                      />
                    </InlineFieldRow>

                    <InlineFieldRow label="Date Format :">
                      <div className="flex flex-wrap items-center gap-6">
                        <RadioSm
                          id="date-format-ddmmyyyy"
                          name="dateFormat"
                          value="ddmmyyyy"
                          checked={dateFormat === "ddmmyyyy"}
                          label="dd/mm/yyyy"
                          onChange={(value) => setDateFormat(value as "ddmmyyyy" | "mmddyyyy")}
                          className="!text-xs !text-gray-700"
                        />
                        <RadioSm
                          id="date-format-mmddyyyy"
                          name="dateFormat"
                          value="mmddyyyy"
                          checked={dateFormat === "mmddyyyy"}
                          label="mm/dd/yyyy"
                          onChange={(value) => setDateFormat(value as "ddmmyyyy" | "mmddyyyy")}
                          className="!text-xs !text-gray-700"
                        />
                      </div>
                    </InlineFieldRow>

                    <InlineFieldRow label="Time Format :">
                      <div className="flex flex-wrap items-center gap-6">
                        <RadioSm
                          id="time-format-24h"
                          name="timeFormat"
                          value="24h"
                          checked={timeFormat === "24h"}
                          label="24h"
                          onChange={(value) => setTimeFormat(value as "24h" | "12h")}
                          className="!text-xs !text-gray-700"
                        />
                        <RadioSm
                          id="time-format-12h"
                          name="timeFormat"
                          value="12h"
                          checked={timeFormat === "12h"}
                          label="12h"
                          onChange={(value) => setTimeFormat(value as "24h" | "12h")}
                          className="!text-xs !text-gray-700"
                        />
                      </div>
                    </InlineFieldRow>
                  </div>
                </Card>

                <Card title="Contact Information">
                  <div className="space-y-5">
                    <InlineFieldRow label="Support Email :">
                      <TextInput
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        containerClassName="!gap-0"
                        className="h-9 text-xs"
                        inputWrapperClassName="max-w-[180px]"
                      />
                    </InlineFieldRow>
                    <InlineFieldRow label="Contact Phone :">
                      <TextInput
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        containerClassName="!gap-0"
                        className="h-9 text-xs"
                        inputWrapperClassName="max-w-[180px]"
                      />
                    </InlineFieldRow>
                    <InlineFieldRow label="Helpdesk URL :">
                      <TextInput
                        value={helpdeskUrl}
                        onChange={(e) => setHelpdeskUrl(e.target.value)}
                        containerClassName="!gap-0"
                        className="h-9 text-xs"
                        inputWrapperClassName="max-w-[180px]"
                      />
                    </InlineFieldRow>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card title="Legal Information">
                  <div className="space-y-5">
                    <InlineFieldRow label="Company Name :">
                      <TextInput
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        containerClassName="!gap-0"
                        className="h-9 text-xs"
                        inputWrapperClassName="max-w-[180px]"
                      />
                    </InlineFieldRow>
                    <InlineFieldRow label="Address :">
                      <TextInput
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        containerClassName="!gap-0"
                        className="h-9 text-xs"
                        inputWrapperClassName="max-w-[180px]"
                      />
                    </InlineFieldRow>
                    <InlineFieldRow label="Optional Field :">
                      <TextInput
                        value={optionalField}
                        onChange={(e) => setOptionalField(e.target.value)}
                        containerClassName="!gap-0"
                        className="h-9 text-xs"
                        inputWrapperClassName="max-w-[180px]"
                      />
                    </InlineFieldRow>
                  </div>
                </Card>
                <div />
              </div>
            </div>
          </div>
        </PageContentContainer>
      </div>
    </>
  );
}

