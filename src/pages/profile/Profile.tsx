import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
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
        <div className="flex h-full min-h-0 flex-col gap-4">
          <PageBreadcrumb pageTitle="Profile" />
          <PageContentContainer className="min-h-0 flex-1 overflow-hidden p-0">
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <UserMetaCard />
                <UserInfoCard />
                <UserAddressCard />
              </div>
            </div>
          </PageContentContainer>
        </div>
      )}
    </>
  );
}
