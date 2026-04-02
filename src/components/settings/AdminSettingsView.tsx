import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import type { AppSvgIcon } from "../../icons";
import {
  AddpeopleIcon,
  DashboardIcon,
  JobIcon,
  ListIcon,
  NotificationIcon,
  TableRulerIcon,
  TickIcon,
  UserIcon,
  WebIcon,
  ColorIcon,
  BrandingIcon,
  AssigneeIcon,
  SiteInfoIcon,
  CustomisationIcon,
  DashboardSetting,
  UserSettingIcon,
  EmailSettingIcon,
  EmailTemplateIcon,
  ExpiryIcon,
  ArchiveIcon,
  CommentSettingIcon,
} from "../../icons";
import PageContentContainer from "../layout/PageContentContainer";
import SearchInput from "../ui/search-input/SearchInput";
import SettingsOptionRow from "../ui/settings/SettingsOptionRow";
import UnderlineTabs from "../ui/tabs/UnderlineTabs";

type AdminSettingsTab =
  | "general"
  | "people"
  | "campaigns"
  | "jobs"
  | "workflow"
  | "checklist"
  | "analytics";

interface AdminSettingItem {
  id: string;
  icon: AppSvgIcon;
  title: string;
  description: string;
  tab: AdminSettingsTab;
  onClickPath?: string;
}

const SETTINGS_TABS: Array<{ id: AdminSettingsTab; label: string; onClickPath?: string }> = [
  { id: "general", label: "General" },
  { id: "people", label: "People" },
  { id: "campaigns", label: "Campaigns", onClickPath: "/campaign-setting" },
  { id: "jobs", label: "Jobs" },
  { id: "workflow", label: "Workflow" },
  { id: "checklist", label: "Checklist" },
  { id: "analytics", label: "Analytics" },
];

const SETTINGS_ITEMS: AdminSettingItem[] = [
  {
    id: "branding",
    icon: BrandingIcon,
    title: "Branding",
    description:
      "Manage your organisation logo, colors, and themes to personalise the appearance of the platform.",
    tab: "general",
  },
  {
    id: "assignee",
    icon: AssigneeIcon,
    title: "Assignee",
    description:
      "Set default assignment rules and preferences for jobs to streamline workflows.",
    tab: "general",
  },
  {
    id: "site_info",
    icon: SiteInfoIcon,
    title: "Site Info",
    description:
      "Adjust language, date formats, and regional settings to support local preferences and global accessibility.",
    tab: "general",
  },
  {
    id: "customisation",
    icon: CustomisationIcon,
    title: "Customisation",
    description: "Change the name of columns and titles",
    tab: "general",
    onClickPath: "/analytics",
  },
  {
    id: "dashboard",
    icon: DashboardSetting,
    title: "Dashboard",
    description:
      "Customise the layout, widgets, and display preferences of dashboards for personalized data visualization.",
    tab: "general",
  },
  {
    id: "people_roles",
    icon: UserSettingIcon,
    title: "Users",
    description: "Add,edit,or remove users and manage their access to the system.",
    tab: "people",
    onClickPath: "/settings/people/users",
  },
  {
    id: "campaign_defaults",
    icon: TickIcon,
    title: "Campaign Defaults",
    description: "Set naming and status defaults for campaign creation.",
    tab: "campaigns",
  },
  {
    id: "email",
    icon: EmailSettingIcon,
    title: "Email",
    description: "customize email notification and communication templates sent to users.",
    tab: "jobs",
    onClickPath: "/settings/jobs/job-information",
  },
   {
    id: "email_templates",
    icon: EmailTemplateIcon,
    title: "Email Templates",
    description: "Create and manage reusable templates for common emails to ensure consistent messaging.",
    tab: "jobs",
    onClickPath: "/settings/jobs/job-information",
  },
   {
    id: "expiry_management",
    icon: ExpiryIcon,
    title: "Expiry Management",
    description: "Set rules for job expiration dates and automatic notifications to keep projects on track.",
    tab: "jobs",
    onClickPath: "/settings/jobs/job-information",
  },
   {
    id: "archiving",
    icon: ArchiveIcon,
    title: "Archiving",
    description: "Define rules for when and how jobs are automatically or manually archived",
    tab: "jobs",
    onClickPath: "/settings/jobs/job-information",
  },
   {
    id: "job_information",
    icon: JobIcon,
    title: "Job Information",
    description: "Define metadata questions that can later be linked to job creation",
    tab: "jobs",
    onClickPath: "/settings/jobs/job-information",
  },
   {
    id: "comments",
    icon: CommentSettingIcon,
    title: "Comments",
    description: "configure how tags can be labelled",
    tab: "jobs",
    onClickPath: "/settings/jobs/comment",
  },
  {
    id: "workflow_permissions",
    icon: ListIcon,
    title: "Workflow Permissions",
    description: "Control stage-level actions and reviewer permissions.",
    tab: "workflow",
  },
  {
    id: "checklist_templates",
    icon: TickIcon,
    title: "Checklist Templates",
    description: "Create reusable checklist templates for quality checks.",
    tab: "checklist",
  },
  {
    id: "analytics_alerts",
    icon: NotificationIcon,
    title: "Analytics Alerts",
    description: "Set threshold notifications and summary schedules.",
    tab: "analytics",
  },
];

export default function AdminSettingsView() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState<AdminSettingsTab>("general");

  const handleTabChange = (nextTab: AdminSettingsTab) => {
    setActiveTab(nextTab);
    const tab = SETTINGS_TABS.find((item) => item.id === nextTab);
    if (tab?.onClickPath) {
      navigate(tab.onClickPath);
    }
  };

  const filteredItems = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    const tabItems = SETTINGS_ITEMS.filter((item) => item.tab === activeTab);
    if (!term) return tabItems;
    return tabItems.filter((item) => {
      const combined = `${item.title} ${item.description}`.toLowerCase();
      return combined.includes(term);
    });
  }, [activeTab, searchValue]);

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-[#007B8C]">Settings</p>

      <PageContentContainer className="min-h-[660px] p-0">
        <div className="border-b border-gray-200 px-6 py-4">
            <SearchInput
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search Settings"
              containerClassName="gap-3"
              className="text-sm text-gray-600"
              inputClassName="text-sm text-gray-600"
              iconClassName="text-gray-400"
              iconSize="!h-5 !w-5"
            />
        </div>

        <div className="border-b border-gray-200 px-6">
          <UnderlineTabs
            tabs={SETTINGS_TABS}
            activeTab={activeTab}
            onChange={handleTabChange}
            className="flex flex-wrap items-end gap-8"
            tabClassName="-mb-px border-b-2 px-1 pb-3 pt-3 text-base transition"
            activeClassName="border-[#007B8C] font-semibold text-[#007B8C]"
            inactiveClassName="border-transparent font-medium text-gray-500 hover:text-gray-700"
          />
        </div>

        <div className="p-6">
          <div className="max-w-[780px] space-y-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <SettingsOptionRow
                  key={item.id}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  onClick={item.onClickPath ? () => navigate(item.onClickPath as string) : undefined}
                />
              ))
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
                No settings found for this search.
              </div>
            )}
          </div>
        </div>
      </PageContentContainer>
    </div>
  );
}
