import PageMeta from "../components/common/PageMeta";
import TeamManagerNotificationsView from "../components/UserProfile/TeamManagerNotificationsView";

export default function ProfileNotifications() {
  return (
    <>
      <PageMeta
        title="Notifications | Approver Hub"
        description="Manage notification preferences"
      />
      <TeamManagerNotificationsView />
    </>
  );
}
