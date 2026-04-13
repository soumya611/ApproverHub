import { BrowserRouter as Router, Routes, Route } from "react-router";
import Login from "./pages/AuthPages/Login";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ColorThemeProvider } from "./context/ColorThemeContext";
import { ColumnsConfigProvider } from "./context/ColumnsConfigContext";
import { JobsColumnsConfigProvider } from "./context/JobsColumnsConfigContext";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CreateJob from "./pages/CreateJob";
import JobDetails from "./pages/JobDetails";
import JobTracker from "./pages/JobTracker";
import Analytics from "./pages/Analytics";
import JobInformationSettings from "./pages/JobInformationSettings";
import JobInformationEditor from "./pages/JobInformationEditor";
import JobInformationBranching from "./pages/JobInformationBranching";
import CampaignSetting from "./pages/CampaignSetting";
import Profile from "./pages/Profile";
import ProfileWorkSchedule from "./pages/ProfileWorkSchedule";
import ProfileNotifications from "./pages/ProfileNotifications";
import Settings from "./pages/Settings";
import SettingsUsers from "./pages/SettingsUsers";
import SettingsUserDetail from "./pages/SettingsUserDetail";
import Localisation from "./pages/Localisation";
import CampaignsRouteGuard from "./components/common/CampaignsRouteGuard";
import CommentSetting from "./pages/CommentSetting";
import SettingsUserEditProfile from "./pages/SettingsUserEditProfile";
import SettingsUserNotifications from "./pages/SettingsUserNotifications";
import SettingsUserWorkSchedule from "./pages/SettingsUserWorkSchedule";
import WorkflowSetting from "./pages/WorkflowSetting";
import ChecklistSetting from "./pages/ChecklistSetting";
import CreateChecklist from "./pages/CreateChecklist";

export default function App() {
  return (
    <ColorThemeProvider>
      <ColumnsConfigProvider>
        <JobsColumnsConfigProvider>
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
              <Route path="/checklist-setting" element={<ChecklistSetting />} />
              <Route path="/checklist-setting/new" element={<CreateChecklist />} />
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
              <Route
                path="/settings/jobs/comment"
                element={<CommentSetting />}
              />
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
        </JobsColumnsConfigProvider>
      </ColumnsConfigProvider>
    </ColorThemeProvider>
  );
}
