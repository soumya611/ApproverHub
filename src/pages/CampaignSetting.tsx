import PageMeta from "../components/common/PageMeta";
import PageContentContainer from "../components/layout/PageContentContainer";
import { ColumnsConfigProvider } from "../context/ColumnsConfigContext";
import ColumnsManager from "../components/ui/columns-filter/ColumnsManager";
import PageHeader from "../components/ui/page-header/PageHeader";
import { useState } from "react";

export default function CampaignSetting() {
    const [enabled, setEnabled] = useState(true);
    return (
        <ColumnsConfigProvider>
            <>
                <PageMeta
                    title="Campaign Settings"
                    description="Manage campaign columns and visibility settings"
                />
                <PageContentContainer>
                    <PageHeader
                        title="Campaign"
                        description="Define Campaign section edit tab name and columns name"
                        showToggle
                        isEnabled={enabled}
                        onToggle={setEnabled}
                    />
                    <ColumnsManager />
                </PageContentContainer>
            </>
        </ColumnsConfigProvider>
    );
}