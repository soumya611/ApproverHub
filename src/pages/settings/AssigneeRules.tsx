import { useState } from "react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import ToggleSwitch from "@/components/ui/toggle/ToggleSwitch";
import { useAppNavigate } from "@/hooks/useAppNavigate";

interface AssigneeRule {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const INITIAL_RULES: AssigneeRule[] = [
  {
    id: "assign_switched_on",
    title: "Assign switched on",
    description: "Enable or disable the assignment feature for jobs.",
    enabled: true,
  },
  {
    id: "assign_jobs_to_themselves",
    title: "Assign jobs to themselves.",
    description:
      "Restrict assignment rights so that only designated approvers can assign jobs.",
    enabled: true,
  },
  {
    id: "suppress_email_notifications",
    title:
      "Suppress all email notifications to other reviewers and approvers and switch their status to 'Not Required'",
    description: "Turn off email alerts to reviewers after a job has been assigned.",
    enabled: true,
  },
  {
    id: "send_system_generated_emails",
    title: "Send system generated emails to non assigned users once a job has been assigned.",
    description:
      "Automatically update the status of other approvers to 'not required' when a job is assigned.",
    enabled: true,
  },
];

export default function AssigneeRules() {
  const { goBack } = useAppNavigate();
  const [rules, setRules] = useState<AssigneeRule[]>(INITIAL_RULES);

  const handleRuleToggle = (id: string, checked: boolean) => {
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, enabled: checked } : rule)));
  };

  return (
    <>
      <PageMeta title="Assignee Rules | Approver Hub" description="Configure assignee rules" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb
          items={[
            { label: "Home", to: "/home" },
            { label: "Setting", to: "/settings" },
            { label: "General Global Settings", to: "/settings" },
            { label: "Assignee" },
          ]}
        />
        <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0">
          <PageHeader
            title="Assignee Rules"
            description="Set settings for assignee rules."
            onBackClick={() => goBack({ fallbackTo: "/settings" })}
            className="!px-4 py-4"
          />
          <div className="min-h-0 flex-1 overflow-auto px-8 py-6">
            <div className="max-w-[920px] space-y-6">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-start gap-3">
                  <ToggleSwitch
                    checked={rule.enabled}
                    onChange={(checked) => handleRuleToggle(rule.id, checked)}
                    showLabel={false}
                    size="md"
                    className="pt-0.5"
                    trackClassName="!h-6 !w-10 !bg-[#D9DEE5] peer-checked:!bg-[#0B9BAF]"
                    thumbClassName="!h-5 !w-5 peer-checked:!translate-x-4"
                  />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-gray-800">{rule.title}</p>
                    <p className="text-sm text-gray-400">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageContentContainer>
      </div>
    </>
  );
}

