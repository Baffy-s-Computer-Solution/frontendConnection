import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';

import ProtectedRoute from '../../components/layout/ProtectedRoute';

const MentorPage = ({ children }) => (
  <div className="mentor-theme min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
    {children}
  </div>
);

// Lazy loaded mentor components
const MentorDashboard = lazy(() => import('../../pages/mentor/MentorDashboardWorkspace'));
const MentorProfile = lazy(() => import('../../pages/mentor/MentorProfile'));
const MentorSessions = lazy(() => import('../../pages/mentor/MentorSessions'));
const MentorApplications = lazy(() => import('../../pages/mentor/MentorApplications'));
const MentorStudentDirectory = lazy(() => import('../../pages/mentor/MentorStudentDirectory'));
const MentorEarnings = lazy(() => import('../../pages/mentor/MentorEarnings'));
const MentorSettings = lazy(() => import('../../pages/mentor/MentorSettings'));
const MentorMentees = lazy(() => import('../../pages/mentor/MentorMentees'));
const MentorMessages = lazy(() => import('../../pages/mentor/MentorMessages'));
const MentorAvailability = lazy(() => import('../../pages/mentor/MentorAvailability'));
const MentorResources = lazy(() => import('../../pages/mentor/MentorResources'));
const MentorReviews = lazy(() => import('../../pages/mentor/MentorReviews'));
const FriendsNetwork = lazy(() => import('../../pages/FriendsNetwork'));

/**
 * Mentor Routes Module
 * Contains all mentor-specific routes (requires mentor authentication)
 */
export const getMentorRoutes = () => [
  <Route
    key="mentor-root"
    path="/mentor"
    element={
      <ProtectedRoute allowedUserTypes={['mentor']}>
        <Navigate to="/mentor/dashboard" replace />
      </ProtectedRoute>
    }
  />,

  // Mentor Dashboard
  <Route
    key="mentor-dashboard"
    path="/mentor/dashboard"
    element={
      <ProtectedRoute allowedUserTypes={['mentor']}>
        <MentorPage><MentorDashboard /></MentorPage>
      </ProtectedRoute>
    }
  />,

  // Mentor Profile
  <Route
    key="mentor-profile"
    path="/mentor/profile"
    element={
      <ProtectedRoute allowedUserTypes={['mentor']}>
        <MentorPage><MentorProfile /></MentorPage>
      </ProtectedRoute>
    }
  />,

  // Sessions Management
  <Route
    key="mentor-sessions"
    path="/mentor/sessions"
    element={
      <ProtectedRoute allowedUserTypes={['mentor']}>
        <MentorPage><MentorSessions /></MentorPage>
      </ProtectedRoute>
    }
  />,

  // Applications
  <Route
    key="mentor-applications"
    path="/mentor/applications"
    element={
      <ProtectedRoute allowedUserTypes={['mentor']}>
        <MentorPage><MentorApplications /></MentorPage>
      </ProtectedRoute>
    }
  />,

  <Route
    key="mentor-student-directory"
    path="/mentor/students"
    element={<ProtectedRoute allowedUserTypes={['mentor']}><MentorPage><MentorStudentDirectory /></MentorPage></ProtectedRoute>}
  />,

  // Earnings
  <Route
    key="mentor-earnings"
    path="/mentor/earnings"
    element={
      <ProtectedRoute allowedUserTypes={['mentor']}>
        <MentorPage><MentorEarnings /></MentorPage>
      </ProtectedRoute>
    }
  />,
  <Route key="mentor-mentees" path="/mentor/mentees" element={<ProtectedRoute allowedUserTypes={['mentor']}><MentorPage><MentorMentees /></MentorPage></ProtectedRoute>} />,
  <Route key="mentor-messages" path="/mentor/messages" element={<ProtectedRoute allowedUserTypes={['mentor']}><MentorPage><MentorMessages /></MentorPage></ProtectedRoute>} />,
  <Route key="mentor-message-conversation" path="/mentor/messages/:conversationId" element={<ProtectedRoute allowedUserTypes={['mentor']}><MentorPage><MentorMessages /></MentorPage></ProtectedRoute>} />,
  <Route key="mentor-schedule" path="/mentor/schedule" element={<ProtectedRoute allowedUserTypes={['mentor']}><MentorPage><MentorAvailability /></MentorPage></ProtectedRoute>} />,
  <Route key="mentor-resources" path="/mentor/resources" element={<ProtectedRoute allowedUserTypes={['mentor']}><MentorPage><MentorResources /></MentorPage></ProtectedRoute>} />,
  <Route key="mentor-reviews" path="/mentor/reviews" element={<ProtectedRoute allowedUserTypes={['mentor']}><MentorPage><MentorReviews /></MentorPage></ProtectedRoute>} />,
  <Route key="mentor-settings" path="/mentor/settings" element={<ProtectedRoute allowedUserTypes={['mentor']}><MentorPage><MentorSettings /></MentorPage></ProtectedRoute>} />,
  <Route key="mentor-friends" path="/mentor/friends" element={<ProtectedRoute allowedUserTypes={['mentor']}><MentorPage><FriendsNetwork /></MentorPage></ProtectedRoute>} />,
];

// Default export for backward compatibility
export default getMentorRoutes;
