import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import WorkflowBuilder from "@/components/ui/workflow-builder/WorkflowBuilder";
import { useWorkflowTemplatesStore } from "@/stores/workflowTemplatesStore";

export default function WorkflowDetails() {
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();
  const workflowTemplates = useWorkflowTemplatesStore((state) => state.workflowTemplates);

  const workflowTemplate = useMemo(
    () => workflowTemplates.find((template) => template.id === workflowId),
    [workflowTemplates, workflowId]
  );

  if (!workflowTemplate) {
    return (
      <>
        <PageMeta title="Workflow Details | Approver Hub" description="View workflow details" />
        <div className="flex h-full min-h-0 flex-col gap-4">
          <AppBreadcrumb />
          <PageContentContainer className="min-h-0 flex-1 overflow-auto p-4">
            <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-500">
              Workflow not found.
            </div>
          </PageContentContainer>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title="Workflow Details | Approver Hub" description="View workflow details" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb
          items={[
            { label: "Home", to: "/home" },
            { label: "Setting", to: "/settings" },
            { label: "Workflow", to: "/workflow-setting" },
            { label: "Workflow Details" },
          ]}
        />
        <PageContentContainer className="min-h-0 flex-1 overflow-auto p-0">
          <PageHeader
            title="View Details"
            onBackClick={() => navigate("/workflow-setting")}
            className="!px-4 py-4"
          />
          <div className="px-4 pb-4">
          <div className="pointer-events-none">
            <WorkflowBuilder
              mode="edit"
              value={workflowTemplate.workflowConfig}
              onSave={() => undefined}
              onCancel={() => navigate("/workflow-setting")}
            />
          </div>
          </div>
        </PageContentContainer>
      </div>
    </>
  );
}

