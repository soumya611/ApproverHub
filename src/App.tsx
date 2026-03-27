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
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/new" element={<CreateCampaign />} />
              <Route path="/campaigns/:campaignId/edit" element={<CreateCampaign />} />
              <Route path="/job-tracker" element={<JobTracker />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/campaign-setting" element={<CampaignSetting />} />
              <Route
                path="/settings/jobs/job-information"
                element={<JobInformationSettings />}
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
