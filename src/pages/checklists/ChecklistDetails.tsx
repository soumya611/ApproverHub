import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import Button from "@/components/ui/button/Button";
import { EditDetailsIcon } from "@/icons";
import { useChecklistTemplatesStore } from "@/stores/checklistTemplatesStore";

const formatCreatedDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "--/--/--";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const escapeCsv = (value: string) => {
  const escaped = value.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

export default function ChecklistDetails() {
  const navigate = useNavigate();
  const { checklistId } = useParams<{ checklistId: string }>();
  const templates = useChecklistTemplatesStore((state) => state.checklistTemplates);

  const checklist = useMemo(
    () => templates.find((template) => template.id === checklistId),
    [templates, checklistId]
  );

  const handleDownloadChecklist = () => {
    if (!checklist) return;

    const header = [
      "checklist_name",
      "checklist_description",
      "section_title",
      "question",
      "question_description",
      "answer_type",
    ];

    const rows = checklist.sections.flatMap((section) =>
      section.questions.map((question) => [
        checklist.name,
        checklist.description,
        section.sectionTitle,
        question.question,
        question.description,
        question.selectedAnswer ?? "",
      ])
    );

    const safeRows = rows.length ? rows : [["", "", "", "", "", ""]];
    const csvContent = [header.join(","), ...safeRows.map((row) => row.map(escapeCsv).join(","))].join(
      "\n"
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(checklist.name || "checklist").replace(/\s+/g, "-").toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!checklist) {
    return (
      <>
        <PageMeta title="Checklist Details | Approver Hub" description="Checklist details" />
        <div className="flex h-full min-h-0 flex-col gap-4">
          <AppBreadcrumb />
          <PageContentContainer className="min-h-0 flex-1 overflow-auto p-4">
            <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-500">
              Checklist not found.
            </div>
          </PageContentContainer>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title="Checklist Details | Approver Hub" description="Checklist details" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb
          items={[
            { label: "Home", to: "/home" },
            { label: "Settings", to: "/settings" },
            { label: "Checklist", to: "/checklist-setting" },
            { label: "Checklist Details" },
          ]}
        />

        <PageContentContainer className="min-h-0 flex-1 overflow-auto p-0">
          <PageHeader
            title={checklist.name || "Checklist"}
            description={`Created on : ${formatCreatedDate(checklist.createdAt)}`}
            onBackClick={() => navigate("/checklist-setting")}
            className="!px-4 py-4"
            rightContent={
              <button
                type="button"
                aria-label="Edit checklist"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-[#007B8C]"
                onClick={() => navigate(`/checklist-setting/${checklist.id}/edit`)}
              >
                <EditDetailsIcon className="h-4 w-4" />
              </button>
            }
          />

          <div className="space-y-4 px-8 py-4">
            <div className="flex items-start justify-between gap-4">
              <p className="max-w-[620px] text-sm text-gray-500">{checklist.description || "--"}</p>
              <Button
                size="sm"
                variant="orangebutton"
                className="!rounded-sm !px-3 !py-1.5 !text-xs"
                onClick={handleDownloadChecklist}
              >
                Download checklist
              </Button>
            </div>

            {checklist.sections.length ? (
              checklist.sections.map((section) => (
                <div key={section.id} className="max-w-[760px] rounded-md border border-gray-200 bg-white">
                  <div className="border-b border-gray-200 px-4 py-2.5">
                    <p className="text-xl font-semibold text-gray-900">
                      {section.sectionName} : {section.sectionTitle || "--"}
                    </p>
                  </div>

                  <div className="space-y-4 px-4 py-3">
                    {section.questions.map((question, index) => (
                      <div key={question.id} className="space-y-2">
                        <p className="text-sm font-semibold text-gray-900">
                          Q.{index + 1} {question.question || "--"}
                        </p>
                        {question.description ? (
                          <p className="max-w-[560px] text-xs text-gray-400">{question.description}</p>
                        ) : null}
                        <div className="flex items-center gap-8 text-sm text-gray-700">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="radio"
                              name={`${section.id}-${question.id}`}
                              checked={question.selectedAnswer === "pass"}
                              readOnly
                            />
                            <span>Pass</span>
                          </label>
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="radio"
                              name={`${section.id}-${question.id}`}
                              checked={question.selectedAnswer === "fail"}
                              readOnly
                            />
                            <span>Fail</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="max-w-[760px] rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-500">
                No questions added yet.
              </div>
            )}
          </div>
        </PageContentContainer>
      </div>
    </>
  );
}

