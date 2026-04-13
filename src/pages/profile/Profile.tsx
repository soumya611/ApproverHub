import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import {
  AdminProfileView,
  TeamManagerProfileView,
  UserAddressCard,
  UserInfoCard,
  UserMetaCard,
} from "@/components/profile";
import { getStoredUserIdentity } from "@/utils/userIdentity";

export default function Profile() {
  const user = getStoredUserIdentity();
  const isTeamManager = user?.role === "team_manager";
  const isAdmin = user?.role === "admin";

  return (
    <>
      <PageMeta title="Profile | Approver Hub" description="Manage profile details" />
      {isTeamManager ? (
        <TeamManagerProfileView />
      ) : isAdmin ? (
        <AdminProfileView />
      ) : (
        <>
          <PageBreadcrumb pageTitle="Profile" />
          <div className="space-y-6">
            <UserMetaCard />
            <UserInfoCard />
            <UserAddressCard />
          </div>
        </>
      )}
    </>
  );
}
