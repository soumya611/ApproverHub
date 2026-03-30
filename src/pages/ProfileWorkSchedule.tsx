import PageMeta from "../components/common/PageMeta";
import TeamManagerWorkScheduleView from "../components/UserProfile/TeamManagerWorkScheduleView";

export default function ProfileWorkSchedule() {
  return (
    <>
      <PageMeta
        title="Work Schedule | Approver Hub"
        description="Manage team manager work schedule"
      />
      <TeamManagerWorkScheduleView />
    </>
  );
}
