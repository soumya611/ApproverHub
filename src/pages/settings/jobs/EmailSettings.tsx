import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import TextInput from "@/components/ui/text-input/TextInput";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";

interface EmailFormState {
  senderEmail: string;
  name: string;
  host: string;
  username: string;
  password: string;
  port: string;
  autoTls: boolean;
  authentication: boolean;
}

const STORAGE_KEY = "email_settings";

const DEFAULT_FORM: EmailFormState = {
  senderEmail: "",
  name: "",
  host: "localhost",
  username: "",
  password: "",
  port: "",
  autoTls: false,
  authentication: false,
};

function loadFromStorage(): EmailFormState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_FORM, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_FORM;
}

export default function EmailSettings() {
  const navigate = useNavigate();
  const { goBack } = useAppNavigate();
  const [form, setForm] = useState<EmailFormState>(loadFromStorage);
  const [isSaved, setIsSaved] = useState(false);
  const [checkStatus, setCheckStatus] = useState<"idle" | "checking">("idle");

  const handleChange = (field: keyof EmailFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleCheckSettings = () => {
    setCheckStatus("checking");
    setTimeout(() => setCheckStatus("idle"), 1500);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setIsSaved(true);
  };

  const handleEdit = () => {
    setIsSaved(false);
  };

  return (
    <>
      <PageMeta title="Email Settings" description="Configure system email settings" />

      <div className="flex h-full min-h-0 flex-col space-y-4">
        <p className="text-sm text-gray-500">
          <button type="button" onClick={() => navigate("/settings")}
            className="hover:underline hover:text-[#007B8C] transition-colors">Home</button>
          {" / "}
          <button type="button" onClick={() => navigate("/settings")}
            className="hover:underline hover:text-[#007B8C] transition-colors">Settings</button>
          {" / "}
          <button type="button" onClick={() => navigate("/settings")}
            className="hover:underline hover:text-[#007B8C] transition-colors">Jobs</button>
          {" / "}
          <span className="font-semibold text-[#007B8C]">Email</span>
        </p>

        <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0">
          <PageHeader
            title="Email"
            description="configure system email settings"
            showBackButton
            onBackClick={() => goBack({ fallbackTo: "/settings" })}
            className="!px-4 py-4"
          />

          <div className="p-6">
            <div className="max-w-[680px] rounded-xl border border-gray-200 bg-white">
              <div className="flex justify-start items-center py-3 px-6 border-b border-[]">
                <p className="text-base font-semibold text-gray-800">Configure system email settings</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Sender Email Address"
                    type="email"
                    placeholder="noreply@company.com"
                    value={form.senderEmail}
                    onChange={(e) => handleChange("senderEmail", e.target.value)}
                    disabled={isSaved}
                  />
                  <TextInput
                    label="Name"
                    type="text"
                    placeholder="Enter name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={isSaved}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Host"
                    type="text"
                    placeholder="localhost"
                    value={form.host}
                    onChange={(e) => handleChange("host", e.target.value)}
                    disabled={isSaved}
                  />
                  <TextInput
                    label="Username"
                    type="text"
                    placeholder="e.g. user@example.com"
                    value={form.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    disabled={isSaved}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Password"
                    type="password"
                    placeholder="Blank to leave unchanged"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    disabled={isSaved}
                  />
                  <TextInput
                    label="Port"
                    type="text"
                    placeholder="e.g. 587"
                    value={form.port}
                    onChange={(e) => handleChange("port", e.target.value)}
                    disabled={isSaved}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <Checkbox
                    label="Auto TLS"
                    checked={form.autoTls}
                    onChange={(checked) => handleChange("autoTls", checked)}
                    className="rounded-[4px]"
                    disabled={isSaved}
                  />
                  <Checkbox
                    label="Authentication"
                    checked={form.authentication}
                    onChange={(checked) => handleChange("authentication", checked)}
                    className="rounded-[4px]"
                    disabled={isSaved}
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Button
                    variant="orangebutton"
                    size="sm"
                    onClick={handleCheckSettings}
                    disabled={checkStatus === "checking"}
                    className="border-transparent rounded-[4px]! py-2! text-sm!"
                  >
                    {checkStatus === "checking" ? "Checking…" : "Check settings"}
                  </Button>
                  {isSaved ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleEdit}
                      className="rounded-[4px]! py-2! text-sm!"
                    >
                      Edit
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      className="rounded-[4px]! py-2!"
                    >
                      Save
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </PageContentContainer>
      </div>
    </>
  );
}