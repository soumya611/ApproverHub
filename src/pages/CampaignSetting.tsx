import PageMeta from "../components/common/PageMeta";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageContentContainer from "../components/layout/PageContentContainer";
import { ColumnsConfigProvider } from "../context/ColumnsConfigContext";
import ColumnsManager from "../components/ui/columns-filter/ColumnsManager";
import PageHeader from "../components/ui/page-header/PageHeader";
import { useState } from "react";
import { useAppNavigate } from "../hooks/useAppNavigate";
import { useAppSettingsStore } from "../stores/appSettingsStore";

export default function CampaignSetting() {
  const { goBack } = useAppNavigate();
  const isCampaignsDisabled = useAppSettingsStore((state) => state.isCampaignsDisabled);
  const setCampaignsDisabled = useAppSettingsStore((state) => state.setCampaignsDisabled);
  const [isAddFieldInputVisible, setIsAddFieldInputVisible] = useState(false);
  const [isNewFieldDefaultChecked, setIsNewFieldDefaultChecked] = useState(!isCampaignsDisabled);

  const handleHeaderToggle = (checked: boolean) => {
    if (isAddFieldInputVisible) {
      setIsNewFieldDefaultChecked(checked);
      return;
    }
    setCampaignsDisabled(checked);
  };

  const handleAddFieldInputVisibleChange = (visible: boolean) => {
    setIsAddFieldInputVisible(visible);
    if (visible) {
      setIsNewFieldDefaultChecked(!isCampaignsDisabled);
    }
  };

  return (
    <ColumnsConfigProvider>
      <>
        <PageMeta
          title="Campaign Settings"
          description="Manage campaign columns and visibility settings"
        />

        <div className="flex h-full min-h-0 flex-col gap-4">
          <AppBreadcrumb />

          <PageContentContainer className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
            <PageHeader
              title="Campaign"
              description="Define Campaign section edit tab name and columns name"
              showToggle
              toggleLabel={isAddFieldInputVisible ? "On/Off" : "Disable"}
              toggleClassName="text-sm font-semibold text-gray-900"
              isEnabled={isAddFieldInputVisible ? isNewFieldDefaultChecked : isCampaignsDisabled}
              onToggle={handleHeaderToggle}
              onBackClick={() => goBack({ fallbackTo: "/settings" })}
              className="!px-4 py-4"
            />
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ColumnsManager
                disabled={isCampaignsDisabled}
                defaultNewFieldChecked={isNewFieldDefaultChecked}
                addFieldInputVisible={isAddFieldInputVisible}
                onAddFieldInputVisibleChange={handleAddFieldInputVisibleChange}
              />
            </div>
          </PageContentContainer>
        </div>
      </>
    </ColumnsConfigProvider>
  );
}
