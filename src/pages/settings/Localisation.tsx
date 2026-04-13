import PageMeta from "@/components/common/PageMeta";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageContentContainer from "@/components/layout/PageContentContainer";
import PageHeader from "@/components/ui/page-header/PageHeader";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import LocalizationSettingsCard from "@/components/settings/LocalizationSettingsCard";

export default function Localisation() {
  const { goBack } = useAppNavigate();

  return (
    <>
      <PageMeta
        title="Localisation"
        description="Configure platform label localisation"
      />

      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb />

        <PageContentContainer className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
          <PageHeader
            title="Localisation"
            description="Choose how platform labels are displayed."
            onBackClick={() => goBack({ fallbackTo: "/settings" })}
            className="!px-4 py-4"
          />

          <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar">
            <LocalizationSettingsCard />
          </div>
        </PageContentContainer>
      </div>
    </>
  );
}
