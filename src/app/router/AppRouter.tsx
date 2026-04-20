import { BrowserRouter as Router, Route, Routes } from "react-router";
import CampaignsRouteGuard from "@/components/common/CampaignsRouteGuard";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import AppLayout from "@/layout/AppLayout";
import {
  Analytics,
  CampaignSetting,
  Campaigns,
  ChecklistDetails,
  ChecklistSetting,
  CommentSetting,
  CreateCampaign,
  CreateChecklist,
  CreateWorkflow,
  CreateJob,
  Home,
  JobDetails,
  JobInformationBranching,
  JobInformationEditor,
  JobInformationSettings,
  EmailSettings,
  Jobs,
  JobTracker,
  Localisation,
  Login,
  Profile,
  ProfileNotifications,
  ProfileWorkSchedule,
  Settings,
  SettingsUserDetail,
  SettingsUserEditProfile,
  SettingsUserNotifications,
  SettingsUserWorkSchedule,
  SettingsUsers,
  WorkflowSetting,
  WorkflowDetails,
  EmailTemplates,
  CreateEmailTemplate,
} from "@/pages";

export default function AppRouter() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/new" element={<CreateJob />} />
          <Route path="/jobs/:jobId/edit" element={<JobDetails />} />
          <Route
            path="/campaigns"
            element={
              <CampaignsRouteGuard>
                <Campaigns />
              </CampaignsRouteGuard>
            }
          />
          <Route
            path="/campaigns/new"
            element={
              <CampaignsRouteGuard>
                <CreateCampaign />
              </CampaignsRouteGuard>
            }
          />
          <Route
            path="/campaigns/:campaignId/edit"
            element={
              <CampaignsRouteGuard>
                <CreateCampaign />
              </CampaignsRouteGuard>
            }
          />
          <Route path="/job-tracker" element={<JobTracker />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/campaign-setting" element={<CampaignSetting />} />
          <Route path="/workflow-setting" element={<WorkflowSetting />} />
          <Route path="/workflow-setting/new" element={<CreateWorkflow />} />
          <Route path="/workflow-setting/:workflowId/edit" element={<CreateWorkflow />} />
          <Route path="/workflow-setting/:workflowId/details" element={<WorkflowDetails />} />
          <Route path="/checklist-setting" element={<ChecklistSetting />} />
          <Route path="/checklist-setting/new" element={<CreateChecklist />} />
          <Route path="/checklist-setting/:checklistId/edit" element={<CreateChecklist />} />
          <Route path="/checklist-setting/:checklistId/details" element={<ChecklistDetails />} />
          <Route path="/comment-setting" element={<CommentSetting />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/localisation" element={<Localisation />} />
          <Route path="/settings/people/users" element={<SettingsUsers />} />
          <Route path="/settings/people/users/:userId" element={<SettingsUserDetail />} />
          <Route
            path="/settings/people/users/:userId/edit"
            element={<SettingsUserEditProfile />}
          />
          <Route
            path="/settings/people/users/:userId/notifications"
            element={<SettingsUserNotifications />}
          />
          <Route
            path="/settings/people/users/:userId/work-schedule"
            element={<SettingsUserWorkSchedule />}
          />
          <Route path="/profile/work-schedule" element={<ProfileWorkSchedule />} />
          <Route path="/profile/notifications" element={<ProfileNotifications />} />
          <Route
            path="/settings/jobs/job-information"
            element={<JobInformationSettings />}
          />
          <Route path="/settings/jobs/comment" element={<CommentSetting />} />
          <Route path="/settings/jobs/email" element={<EmailSettings />} />
           <Route path="/settings/jobs/email-templates" element={<EmailTemplates />} />
          <Route path="/settings/jobs/email-templates/new" element={<CreateEmailTemplate />} />
          <Route path="/settings/jobs/email-templates/:templateId/edit" element={<CreateEmailTemplate />} />
          <Route
            path="/settings/jobs/job-information/new"
            element={<JobInformationEditor />}
          />
          <Route
            path="/settings/jobs/job-information/:templateId"
            element={<JobInformationEditor />}
          />
          <Route
            path="/settings/jobs/job-information/:templateId/branching"
            element={<JobInformationBranching />}
          />
        </Route>
      </Routes>
    </Router>
  );
}
