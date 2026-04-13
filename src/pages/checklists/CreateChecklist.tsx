import { useState } from "react";
import { useNavigate } from "react-router";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import TextInput from "@/components/ui/text-input/TextInput";
import Button from "@/components/ui/button/Button";
import { UploadIcon } from "@/icons";
import ChecklistQuestionsBuilder from "@/components/checklist/ChecklistQuestionsBuilder";

export default function CreateChecklist() {
  const navigate = useNavigate();
  const [checklistName, setChecklistName] = useState("");
  const [checklistDescription, setChecklistDescription] = useState("");

  return (
    <>
      <PageMeta title="Create New Checklist | Approver Hub" description="Create checklist template" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb
          items={[
            { label: "Home", to: "/home" },
            { label: "Settings", to: "/settings" },
            { label: "Checklist", to: "/checklist-setting" },
            { label: "Create New Checklist" },
          ]}
        />

        <PageContentContainer className="min-h-0 flex-1 overflow-auto p-0">
          <PageHeader
            title="Create New Checklist"
            onBackClick={() => navigate("/checklist-setting")}
            className="!px-4 py-4"
          />

          <div className="space-y-4 px-8 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="w-full max-w-[533px] space-y-3">
                <div className="space-y-1">
                  <TextInput
                    label="Checklist Name"
                    value={checklistName}
                    onChange={(event) => setChecklistName(event.target.value)}
                    placeholder="Untitled"
                    labelClassName="text-[11px] font-medium text-[#64748B]"
                    className="!h-8 !rounded-sm !border-gray-200 !px-2.5 !py-1.5 !text-sm !font-semibold !text-[#007B8C] placeholder:!font-semibold placeholder:!text-[#007B8C] focus:!border-[#007B8C] focus:!ring-0"
                  />
                  <div className="text-right text-xs text-[#64748B]">Created on :</div>
                </div>

                <label className="flex w-full flex-col gap-1">
                  <span className="text-[11px] font-medium text-[#64748B]">Checklist Description</span>
                  <textarea
                    value={checklistDescription}
                    onChange={(event) => setChecklistDescription(event.target.value)}
                    placeholder="Enter"
                    className="min-h-[68px] w-full resize-none rounded-sm border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-[#007B8C]"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="orangebutton"
                  className="!rounded-sm !px-3 !py-1.5 !text-xs"
                >
                  Download Format
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="!rounded-sm !px-3 !py-1.5 !text-xs"
                  startIcon={<UploadIcon className="h-3.5 w-3.5" />}
                >
                  Upload Checklist
                </Button>
              </div>
            </div>

            <ChecklistQuestionsBuilder />

            <div className="flex items-center gap-3 pb-2 pt-2">
              <Button size="sm" variant="primary" className="!rounded-sm !px-6 !py-1.5 !text-xs">
                Create
              </Button>
              <Button
                size="sm"
                variant="orangebutton"
                className="!rounded-sm !px-6 !py-1.5 !text-xs"
                onClick={() => navigate("/checklist-setting")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </PageContentContainer>
      </div>
    </>
  );
}
