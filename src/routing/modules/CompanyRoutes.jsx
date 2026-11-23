import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';

import ProtectedRoute from '../../components/layout/ProtectedRoute';

// Lazy loaded company components
const CompanyDashboard = lazy(() => import('../../pages/company/CompanyDashboard'));
const AcceptCompanyInvitation = lazy(() => import('../../pages/company/AcceptCompanyInvitation'));
const CompanySettings = lazy(() => import('../../pages/company/CompanySettings'));
const CompanyJobs = lazy(() => import('../../pages/company/CompanyJobs'));
const CompanyApplications = lazy(() => import('../../pages/company/CompanyApplications'));
const CompanyProfile = lazy(() => import('../../pages/company/CompanyProfile'));
const CreateNewJob = lazy(() => import('../../pages/company/CreateNewJob'));
const ScheduleInterview = lazy(() => import('../../pages/company/ScheduleInterview'));
const ViewAnalytics = lazy(() => import('../../pages/company/ViewAnalytics'));
const ManageTeams = lazy(() => import('../../pages/company/ManageTeams'));
const DocumentHub = lazy(() => import('../../pages/company/DocumentHub'));
const Communication = lazy(() => import('../../pages/company/chat/CompanyChat'));
const BrowseCandidates = lazy(() => import('../../pages/company/BrowseCandidates'));
const CompanyAnalytics = lazy(() => import('../../pages/company/CompanyAnalytics'));
const JobPosting = lazy(() => import('../../pages/company/JobPosting'));
const ApplicationDetails = lazy(() => import('../../pages/company/ApplicationDetails'));
const SearchMarket = lazy(() => import('../../pages/company/SearchMarket'));
const SearchPartners = lazy(() => import('../../pages/company/SearchPartners'));
const SearchStudents = lazy(() => import('../../pages/company/SearchStudents'));
const CompanyCandidates = lazy(() => import('../../pages/company/CompanyCandidates'));

// New Company Features
const CompanyChat = lazy(() => import('../../pages/company/chat/CompanyChat'));
const Notifications = lazy(() => import('../../pages/Notifications'));
const CompanyFollowers = lazy(() => import('../../pages/company/CompanyFollowers'));
const AIMatching = lazy(() => import('../../pages/company/ai-matching/AIMatching'));
const VideoInterviews = lazy(() => import('../../pages/company/VideoInterviews'));
// Branding is edited through the persisted company profile so this route never
// renders the former placeholder-only branding studio.
const CompanyBranding = lazy(() => import('../../pages/company/CompanyBranding'));
const DiversityAnalytics = lazy(
  () => import('../../pages/company/diversity-analytics/DiversityAnalytics')
);
const TalentPool = lazy(() => import('../../pages/company/talent-pool/TalentPool'));
const SkillsAssessment = lazy(() => import('../../pages/company/assessments/SkillsAssessment'));
const ReferralProgram = lazy(() => import('../../pages/company/referrals/ReferralProgram'));
const CompetitorAnalysis = lazy(
  () => import('../../pages/company/competitor-analysis/CompetitorAnalysis')
);
const OnboardingAutomation = lazy(
  () => import('../../pages/company/onboarding/OnboardingAutomation')
);
const PredictiveAnalyticsHub = lazy(
  () => import('../../pages/company/predictive-analytics/PredictiveAnalyticsUnavailable')
);
const Marketplace = lazy(() => import('../../pages/company/marketplace/MarketplaceDatabase'));
const TeamWorkspace = lazy(() => import('../../pages/company/team-workspace/TeamWorkspace'));

/**
 * Company Routes Module
 * Contains all company-specific routes (requires company authentication)
 */
export const getCompanyRoutes = () => [
  <Route
    key="company-invitation-accept"
    path="/company/invitations/accept"
    element={<AcceptCompanyInvitation />}
  />,

  <Route
    key="company-root"
    path="/company"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <Navigate to="/company/dashboard" replace />
      </ProtectedRoute>
    }
  />,

  // Company Dashboard
  <Route
    key="company-dashboard"
    path="/company/dashboard"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompanyDashboard />
      </ProtectedRoute>
    }
  />,

  <Route key="company-friends" path="/company/friends" element={<ProtectedRoute allowedUserTypes={['company']}><Navigate to="/company/followers" replace /></ProtectedRoute>} />,

  // Company Profile & Settings
  <Route
    key="company-profile"
    path="/company/profile"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompanyProfile />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-settings"
    path="/company/settings"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompanySettings />
      </ProtectedRoute>
    }
  />,

  // Company Jobs
  <Route
    key="company-jobs"
    path="/company/jobs"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompanyJobs />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-create-job"
    path="/company/jobs/create"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CreateNewJob />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-job-posting"
    path="/company/job-posting"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <JobPosting />
      </ProtectedRoute>
    }
  />,

  // Company Applications
  <Route
    key="company-applications"
    path="/company/applications"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompanyApplications />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-application-details"
    path="/company/application/:applicationId"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <ApplicationDetails />
      </ProtectedRoute>
    }
  />,

  // Company Candidates
  <Route
    key="company-candidates"
    path="/company/candidates"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompanyCandidates />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-browse-candidates"
    path="/company/browse-candidates"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <BrowseCandidates />
      </ProtectedRoute>
    }
  />,

  // Company Analytics
  <Route
    key="company-analytics"
    path="/company/analytics"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <ViewAnalytics />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-company-analytics"
    path="/company/company-analytics"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompanyAnalytics />
      </ProtectedRoute>
    }
  />,

  // Company Operations
  <Route
    key="company-teams"
    path="/company/teams"
    element={
      <ProtectedRoute allowedUserTypes={['company', 'company_staff']}>
        <ManageTeams />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-documents"
    path="/company/documents"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <DocumentHub />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-communication"
    path="/company/communication"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <Communication />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-schedule-interview"
    path="/company/schedule-interview"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <ScheduleInterview />
      </ProtectedRoute>
    }
  />,

  // Extended Company Features
  <Route
    key="company-chat"
    path="/company/chat"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompanyChat />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-notifications"
    path="/company/notifications"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <Notifications />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-followers"
    path="/company/followers"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompanyFollowers />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-ai-matching"
    path="/company/ai-matching"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <AIMatching />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-video-interviews"
    path="/company/video-interviews"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <VideoInterviews />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-branding"
    path="/company/branding"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompanyBranding />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-diversity-analytics"
    path="/company/diversity-analytics"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <DiversityAnalytics />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-talent-pool"
    path="/company/talent-pool"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <TalentPool />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-assessments"
    path="/company/assessments"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <SkillsAssessment />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-referrals"
    path="/company/referrals"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <ReferralProgram />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-competitor-analysis"
    path="/company/competitor-analysis"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompetitorAnalysis />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-onboarding"
    path="/company/onboarding"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <OnboardingAutomation />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-predictive-analytics"
    path="/company/predictive-analytics"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <PredictiveAnalyticsHub />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-marketplace"
    path="/company/marketplace"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <Marketplace />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-team-workspace"
    path="/company/team-workspace"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <TeamWorkspace />
      </ProtectedRoute>
    }
  />,

  // Company Search Routes
  <Route
    key="company-search-market"
    path="/company/search/market"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <SearchMarket />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-search-partners"
    path="/company/search/partners"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <SearchPartners />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-search-students"
    path="/company/search/students"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <SearchStudents />
      </ProtectedRoute>
    }
  />,

  <Route
    key="company-search-candidates"
    path="/company/search/candidates"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <BrowseCandidates />
      </ProtectedRoute>
    }
  />,

  // Legacy Company Routes (backward compatibility)
  <Route
    key="companyprofile"
    path="/companyprofile"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompanyProfile />
      </ProtectedRoute>
    }
  />,

  <Route
    key="companyjobs"
    path="/companyjobs"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompanyJobs />
      </ProtectedRoute>
    }
  />,

  <Route
    key="companycandidates"
    path="/companycandidates"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <CompanyCandidates />
      </ProtectedRoute>
    }
  />,

  <Route
    key="searchmarket"
    path="/searchmarket"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <SearchMarket />
      </ProtectedRoute>
    }
  />,

  <Route
    key="searchpartners"
    path="/searchpartners"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <SearchPartners />
      </ProtectedRoute>
    }
  />,

  <Route
    key="searchstudents"
    path="/searchstudents"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <SearchStudents />
      </ProtectedRoute>
    }
  />,

  <Route
    key="browsecandidates"
    path="/browsecandidates"
    element={
      <ProtectedRoute allowedUserTypes={['company']}>
        <BrowseCandidates />
      </ProtectedRoute>
    }
  />,
];

export default getCompanyRoutes;
