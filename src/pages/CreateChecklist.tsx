import { useState } from "react";
import { useNavigate } from "react-router";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageMeta from "../components/common/PageMeta";
import PageContentContainer from "../components/layout/PageContentContainer";
import PageHeader from "../components/ui/page-header/PageHeader";
import ChecklistQuestionsBuilder from "../components/checklist/ChecklistQuestionsBuilder";
import CreateChecklistButton from "../components/checklist/buttons/CreateChecklistButton";
import CancelChecklistButton from "../components/checklist/buttons/CancelChecklistButton";
import DownloadFormatButton from "../components/checklist/buttons/DownloadFormatButton";
import UploadChecklistButton from "../components/checklist/buttons/UploadChecklistButton";
import ChecklistTopFields from "../components/checklist/ChecklistTopFields";

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
              <ChecklistTopFields
                checklistName={checklistName}
                checklistDescription={checklistDescription}
                onChecklistNameChange={setChecklistName}
                onChecklistDescriptionChange={setChecklistDescription}
              />

              <div className="flex items-center gap-2">
                <DownloadFormatButton />
                <UploadChecklistButton />
              </div>
            </div>

            <ChecklistQuestionsBuilder />

            <div className="flex items-center gap-3 pb-2 pt-2">
              <CreateChecklistButton />
              <CancelChecklistButton onClick={() => navigate("/checklist-setting")} />
            </div>
          </div>
        </PageContentContainer>
      </div>
    </>
  );
}
