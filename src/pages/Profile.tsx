import UserAddressCard from "../components/UserProfile/UserAddressCard";
import AdminProfileView from "../components/UserProfile/AdminProfileView";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import TeamManagerProfileView from "../components/UserProfile/TeamManagerProfileView";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { getStoredUserIdentity } from "../utils/userIdentity";

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
