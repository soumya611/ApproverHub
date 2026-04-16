import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import Button from "@/components/ui/button/Button";
import { UploadIcon } from "@/icons";
import ChecklistQuestionsBuilder from "@/components/checklist/ChecklistQuestionsBuilder";
import ChecklistTopFields from "@/components/checklist/ChecklistTopFields";
import {
  type ChecklistSection,
  createDefaultChecklistSections,
  useChecklistBuilderStore,
} from "@/stores/checklistBuilderStore";
import { useChecklistTemplatesStore } from "@/stores/checklistTemplatesStore";
import { getStoredUserIdentity } from "@/utils/userIdentity";

const formatCreatedDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "--/--/--";
  return date.toLocaleDateString("en-GB").replace(/\//g, "/");
};

const CSV_HEADERS = [
  "checklist_name",
  "checklist_description",
  "section_title",
  "question",
  "question_description",
  "answer_type",
] as const;

const escapeCsv = (value: string) => {
  const escaped = value.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const parseCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
};

const parseCsv = (content: string): string[][] =>
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(parseCsvLine);

const buildSectionsFromRows = (rows: string[][]): ChecklistSection[] => {
  const sectionsMap = new Map<
    string,
    { id: string; sectionName: string; sectionTitle: string; isExpanded: boolean; questions: ChecklistSection["questions"] }
  >();

  rows.forEach((row, index) => {
    const sectionTitle = row[2]?.trim() || `Section ${sectionsMap.size + 1}`;
    const question = row[3]?.trim() || "";
    const questionDescription = row[4]?.trim() || "";
    const rawAnswer = row[5]?.trim().toLowerCase();
    const selectedAnswer = rawAnswer === "pass" || rawAnswer === "fail" ? rawAnswer : null;

    if (!sectionsMap.has(sectionTitle)) {
      sectionsMap.set(sectionTitle, {
        id: `section-${Date.now()}-${index}`,
        sectionName: `Section ${sectionsMap.size + 1}`,
        sectionTitle,
        isExpanded: true,
        questions: [],
      });
    }

    const section = sectionsMap.get(sectionTitle);
    if (!section) return;

    if (question || questionDescription) {
      section.questions.push({
        id: `q-${Date.now()}-${index}`,
        question,
        description: questionDescription,
        answerType: "pass_fail",
        selectedAnswer,
        isExpanded: true,
      });
    }
  });

  const parsedSections = Array.from(sectionsMap.values()).map((section, sectionIndex) => ({
    ...section,
    sectionName: `Section ${sectionIndex + 1}`,
    questions:
      section.questions.length > 0
        ? section.questions
        : [
            {
              id: `q-${Date.now()}-${sectionIndex}`,
              question: "",
              description: "",
              answerType: "pass_fail" as const,
              selectedAnswer: null,
              isExpanded: true,
            },
          ],
  }));

  return parsedSections.length > 0 ? parsedSections : createDefaultChecklistSections();
};

export default function CreateChecklist() {
  const navigate = useNavigate();
  const { checklistId } = useParams<{ checklistId: string }>();
  const isEditMode = Boolean(checklistId);
  const [checklistName, setChecklistName] = useState("");
  const [checklistDescription, setChecklistDescription] = useState("");
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const templates = useChecklistTemplatesStore((state) => state.checklistTemplates);
  const createChecklistTemplate = useChecklistTemplatesStore((state) => state.createChecklistTemplate);
  const updateChecklistTemplate = useChecklistTemplatesStore((state) => state.updateChecklistTemplate);
  const sections = useChecklistBuilderStore((state) => state.sections);
  const setSections = useChecklistBuilderStore((state) => state.setSections);
  const resetBuilder = useChecklistBuilderStore((state) => state.resetBuilder);

  const editingTemplate = useMemo(
    () => templates.find((template) => template.id === checklistId),
    [templates, checklistId]
  );

  useEffect(() => {
    if (isEditMode && checklistId && !editingTemplate) {
      navigate("/checklist-setting");
      return;
    }

    if (editingTemplate) {
      setChecklistName(editingTemplate.name);
      setChecklistDescription(editingTemplate.description);
      setCreatedAt(editingTemplate.createdAt);
      setSections(editingTemplate.sections);
      return;
    }

    setChecklistName("");
    setChecklistDescription("");
    setCreatedAt(new Date().toISOString());
    resetBuilder();
  }, [isEditMode, checklistId, editingTemplate, navigate, setSections, resetBuilder]);

  const handleSubmit = () => {
    const resolvedName = checklistName.trim() || "Untitled";
    const resolvedDescription = checklistDescription.trim();
    const owner = getStoredUserIdentity();
    const ownerName = owner?.name || "Admin";

    if (editingTemplate) {
      updateChecklistTemplate(editingTemplate.id, {
        name: resolvedName,
        description: resolvedDescription,
        sections,
      });
      navigate("/checklist-setting");
      return;
    }

    createChecklistTemplate({
      name: resolvedName,
      description: resolvedDescription,
      ownerName,
      ownerAvatarUrl: owner?.avatarUrl,
      sections: sections.length ? sections : createDefaultChecklistSections(),
    });

    navigate("/checklist-setting");
  };

  const handleDownloadFormat = () => {
    const sectionRows = sections.flatMap((section) =>
      section.questions.map((question) => [
        checklistName.trim() || "Untitled",
        checklistDescription.trim(),
        section.sectionTitle,
        question.question,
        question.description,
        question.selectedAnswer ?? "",
      ])
    );

    const rows = sectionRows.length > 0 ? sectionRows : [["", "", "", "", "", "pass_fail"]];
    const csvContent = [CSV_HEADERS.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join(
      "\n"
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(checklistName.trim() || "checklist-format").replace(/\s+/g, "-").toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadChecklist = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const lines = parseCsv(content);
      if (lines.length < 2) {
        window.alert("CSV is empty. Please upload a valid checklist CSV file.");
        return;
      }

      const header = lines[0].map((cell) => cell.trim().toLowerCase());
      const isHeaderValid = CSV_HEADERS.every((name, index) => header[index] === name);
      if (!isHeaderValid) {
        window.alert(
          "Invalid CSV header. Expected: checklist_name, checklist_description, section_title, question, question_description, answer_type"
        );
        return;
      }

      const rows = lines.slice(1);
      const firstRow = rows[0] ?? [];
      setChecklistName(firstRow[0]?.trim() || "");
      setChecklistDescription(firstRow[1]?.trim() || "");
      setSections(buildSectionsFromRows(rows));
    } catch {
      window.alert("Failed to read CSV file. Please try again.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <>
      <PageMeta
        title={`${isEditMode ? "Edit Checklist" : "Create New Checklist"} | Approver Hub`}
        description="Create checklist template"
      />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb
          items={[
            { label: "Home", to: "/home" },
            { label: "Settings", to: "/settings" },
            { label: "Checklist", to: "/checklist-setting" },
            { label: isEditMode ? "Edit Checklist" : "Create New Checklist" },
          ]}
        />

        <PageContentContainer className="min-h-0 flex-1 overflow-auto p-0">
          <PageHeader
            title={isEditMode ? "Edit Checklist" : "Create New Checklist"}
            onBackClick={() => navigate("/checklist-setting")}
            className="!px-4 py-4"
          />

          <div className="space-y-4 px-8 py-4">
            <div className="flex items-start justify-between gap-4">
              <ChecklistTopFields
                checklistName={checklistName}
                checklistDescription={checklistDescription}
                createdOnLabel={formatCreatedDate(createdAt)}
                onChecklistNameChange={setChecklistName}
                onChecklistDescriptionChange={setChecklistDescription}
              />

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="orangebutton"
                  className="!rounded-sm !px-3 !py-1.5 !text-xs"
                  onClick={handleDownloadFormat}
                >
                  Download Format
                </Button>
                {isEditMode ? (
                  <Button
                    size="sm"
                    variant="primary"
                    className="!rounded-sm !px-3 !py-1.5 !text-xs"
                    onClick={handleSubmit}
                  >
                    Save Changes
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="!rounded-sm !px-3 !py-1.5 !text-xs"
                    startIcon={<UploadIcon className="h-3.5 w-3.5" />}
                    onClick={() => uploadInputRef.current?.click()}
                  >
                    Upload Checklist
                  </Button>
                )}
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleUploadChecklist}
                />
              </div>
            </div>

            <ChecklistQuestionsBuilder showQuestionDeleteAction={isEditMode} />

            <div className="flex items-center gap-3 pb-2 pt-2">
              <Button
                size="sm"
                variant="primary"
                className="!rounded-sm !px-6 !py-1.5 !text-xs"
                onClick={handleSubmit}
              >
                {isEditMode ? "Save Changes" : "Create"}
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
