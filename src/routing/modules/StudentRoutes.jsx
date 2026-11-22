import { Navigate, Route } from 'react-router-dom';

import ProtectedRoute from '../../components/layout/ProtectedRoute';
import Settings from '../../pages/Settings';

// Import all student components
import StudentDashboard from '../../pages/student/StudentDashboard';
import StudentApplications from '../../pages/student/StudentApplications';
import StudentDocuments from '../../pages/student/StudentDocuments';
import StudentProfile from '../../pages/student/StudentProfile';
import StudentSettings from '../../pages/student/StudentSettings';
import ApplyJob from '../../pages/student/ApplyJob';
import Jobs from '../../pages/student/StudentJobs';
import StudentNotifications from '../../pages/student/Notifications';
import ViewApplication from '../../pages/student/ViewApplication';
import JobMatches from '../../pages/student/JobMatches';
import StudentAnalytics from '../../pages/student/analytics/StudentAnalytics';
import ActivityFeed from '../../pages/student/ActivityFeed';
import Deadlines from '../../pages/student/Deadlines';
import Recommendations from '../../pages/student/Recommendations';
import PerformanceMetrics from '../../pages/student/PerformanceMetrics';
import QuickActions from '../../pages/student/QuickActions';
import Calendar from '../../pages/student/Calendar';
import Mentorship from '../../pages/student/StudentMentorship';
import SearchInternships from '../../pages/student/SearchInternships';
import StudentCourses from '../../pages/student/StudentCoursesLive';
import FriendsNetwork from '../../pages/FriendsNetwork';
import StudentAssessments from '../../pages/student/StudentAssessments';

/**
 * Student Routes Module
 * Contains all student-specific routes (requires student authentication)
 */
export const getStudentRoutes = () => {
  return [
    <Route
      key="student-root"
      path="/student"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <Navigate to="/student/dashboard" replace />
        </ProtectedRoute>
      }
    />,

    // Student Dashboard - Main Entry Point
    <Route
      key="student-dashboard"
      path="/student/dashboard"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      }
    />,

    // Student Profile & Settings
    <Route
      key="student-profile"
      path="/student/profile"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <StudentProfile />
        </ProtectedRoute>
      }
    />,

    <Route
      key="student-settings-page"
      path="/student/settings"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <StudentSettings />
        </ProtectedRoute>
      }
    />,

    <Route
      key="student-settings"
      path="/settings"
      element={
        <ProtectedRoute allowedUserTypes={['student', 'company', 'admin', 'mentor', 'parent', 'alumni', 'entrepreneur', 'youth', 'institute']}>
          <Settings />
        </ProtectedRoute>
      }
    />,

    <Route key="student-assessments" path="/student/assessments" element={<ProtectedRoute allowedUserTypes={['student']}><StudentAssessments /></ProtectedRoute>} />,

    // Student Applications
    <Route
      key="student-applications"
      path="/student/applications"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <StudentApplications />
        </ProtectedRoute>
      }
    />,

    <Route
      key="student-application-details"
      path="/student/application/:applicationId"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <ViewApplication />
        </ProtectedRoute>
      }
    />,

    // Student Jobs
    <Route
      key="student-jobs"
      path="/student/jobs"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <Jobs />
        </ProtectedRoute>
      }
    />,

    <Route
      key="student-apply-job"
      path="/student/jobs/apply/:jobId"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <ApplyJob />
        </ProtectedRoute>
      }
    />,

    // Student Documents
    <Route
      key="student-documents"
      path="/student/documents"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <StudentDocuments />
        </ProtectedRoute>
      }
    />,
    <Route key="student-document-alias" path="/student/document" element={<Navigate to="/student/documents" replace />} />,

    // Student Search Routes
    <Route
      key="student-search-jobs"
      path="/student/search/jobs"
      element={<Navigate to="/student/jobs" replace />}
    />,

    <Route
      key="student-search-internships"
      path="/student/search/internships"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <SearchInternships />
        </ProtectedRoute>
      }
    />,

    // Student Features
    <Route
      key="student-analytics"
      path="/student/analytics"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <StudentAnalytics />
        </ProtectedRoute>
      }
    />,

    <Route
      key="student-calendar"
      path="/student/calendar"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <Calendar />
        </ProtectedRoute>
      }
    />,

    <Route
      key="student-mentorship"
      path="/student/mentorship"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <Mentorship />
        </ProtectedRoute>
      }
    />,

    <Route
      key="student-notifications"
      path="/student/notifications"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <StudentNotifications />
        </ProtectedRoute>
      }
    />,

    <Route
      key="student-friends"
      path="/student/friends"
      element={<ProtectedRoute allowedUserTypes={['student']}><FriendsNetwork /></ProtectedRoute>}
    />,

    <Route
      key="student-job-matches"
      path="/student/job-matches"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <JobMatches />
        </ProtectedRoute>
      }
    />,

    <Route
      key="student-activity"
      path="/student/activity"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <ActivityFeed />
        </ProtectedRoute>
      }
    />,

    <Route
      key="student-deadlines"
      path="/student/deadlines"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <Deadlines />
        </ProtectedRoute>
      }
    />,

    <Route
      key="student-recommendations"
      path="/student/recommendations"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <Recommendations />
        </ProtectedRoute>
      }
    />,

    <Route
      key="student-performance"
      path="/student/performance"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <PerformanceMetrics />
        </ProtectedRoute>
      }
    />,

    <Route
      key="student-quick-actions"
      path="/student/quick-actions"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <QuickActions />
        </ProtectedRoute>
      }
    />,

    // Student Courses Routes
    <Route
      key="student-courses"
      path="/student/courses"
      element={
        <ProtectedRoute allowedUserTypes={['student']}>
          <StudentCourses />
        </ProtectedRoute>
      }
    />,
  ];
};

// Default export for backward compatibility
export default getStudentRoutes;
