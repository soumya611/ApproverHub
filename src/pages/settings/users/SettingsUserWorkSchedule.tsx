import { useParams } from "react-router";
import { TeamManagerWorkScheduleView } from "@/components/profile";

export default function SettingsUserWorkSchedule() {
  const { userId } = useParams<{ userId: string }>();

  return <TeamManagerWorkScheduleView userId={userId} backTo={`/settings/people/users/${userId}`} />;
}
