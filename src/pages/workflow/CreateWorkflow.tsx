import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import WorkflowBuilder, {
  type WorkflowBuilderValue,
} from "@/components/ui/workflow-builder/WorkflowBuilder";
import { getStoredUserIdentity } from "@/utils/userIdentity";
import { useWorkflowTemplatesStore } from "@/stores/workflowTemplatesStore";

export default function CreateWorkflow() {
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();
  const isEditMode = Boolean(workflowId);
  const workflowTemplates = useWorkflowTemplatesStore((state) => state.workflowTemplates);
  const createWorkflowTemplate = useWorkflowTemplatesStore((state) => state.createWorkflowTemplate);
  const updateWorkflowTemplate = useWorkflowTemplatesStore((state) => state.updateWorkflowTemplate);

  const editingTemplate = useMemo(
    () => workflowTemplates.find((template) => template.id === workflowId),
    [workflowTemplates, workflowId]
  );

  useEffect(() => {
    if (isEditMode && workflowId && !editingTemplate) {
      navigate("/workflow-setting");
    }
  }, [isEditMode, workflowId, editingTemplate, navigate]);

  const handleSaveWorkflow = (value: WorkflowBuilderValue) => {
    if (isEditMode && editingTemplate) {
      updateWorkflowTemplate(editingTemplate.id, value);
      navigate("/workflow-setting");
      return;
    }

    const owner = getStoredUserIdentity();
    createWorkflowTemplate({
      workflowConfig: value,
      ownerName: owner?.name || "Admin",
      ownerAvatarUrl: owner?.avatarUrl,
    });
    navigate("/workflow-setting");
  };

  return (
    <>
      <PageMeta
        title={`${isEditMode ? "Edit Workflow" : "Create Workflow"} | Approver Hub`}
        description="Create workflow template"
      />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb
          items={[
            { label: "Home", to: "/home" },
            { label: "Setting", to: "/settings" },
            { label: "Workflow", to: "/workflow-setting" },
            { label: isEditMode ? "Edit Workflow" : "Create New Workflow" },
          ]}
        />
        <PageContentContainer className="min-h-0 flex-1 overflow-auto p-0">
          <PageHeader
            title={isEditMode ? "Edit" : "Create New"}
            onBackClick={() => navigate("/workflow-setting")}
            className="!px-4 py-4"
          />
          <div className="px-4 py-4">
          <WorkflowBuilder
            mode={isEditMode ? "edit" : "create"}
            value={editingTemplate?.workflowConfig}
            onSave={handleSaveWorkflow}
            onCancel={() => navigate("/workflow-setting")}
          />
          </div>
        </PageContentContainer>
      </div>
    </>
  );
}

