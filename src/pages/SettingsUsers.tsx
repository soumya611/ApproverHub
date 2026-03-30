import PageMeta from "../components/common/PageMeta";
import SettingsUsersView from "../components/settings/SettingsUsersView";

export default function SettingsUsers() {
  return (
    <>
      <PageMeta title="Users Settings | Approver Hub" description="Manage users settings" />
      <SettingsUsersView />
    </>
  );
}
