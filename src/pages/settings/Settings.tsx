import PageMeta from "@/components/common/PageMeta";
import AdminSettingsView from "@/components/settings/AdminSettingsView";

export default function Settings() {
  return (
    <>
      <PageMeta title="Settings | Approver Hub" description="Platform settings" />
      <AdminSettingsView />
    </>
  );
}
