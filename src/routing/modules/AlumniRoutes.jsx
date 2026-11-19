import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';

import ProtectedRoute from '../../components/layout/ProtectedRoute';

const AlumniDashboard = lazy(() => import('../../pages/alumni/AlumniDashboard'));
const AlumniProfile = lazy(() => import('../../pages/alumni/AlumniProfile'));
const AlumniNetwork = lazy(() => import('../../pages/alumni/AlumniNetwork'));
const AlumniMentorship = lazy(() => import('../../pages/alumni/AlumniMentorship'));
const AlumniDonations = lazy(() => import('../../pages/alumni/AlumniDonations'));
const AlumniEvents = lazy(() => import('../../pages/alumni/AlumniEvents'));
const AlumniStories = lazy(() => import('../../pages/alumni/AlumniStories'));
const AlumniDirectory = lazy(() => import('../../pages/alumni/AlumniDirectory'));
const AlumniMentorshipProgram = lazy(() => import('../../pages/alumni/AlumniMentorshipProgram'));
const AlumniCareerBoard = lazy(() => import('../../pages/alumni/AlumniCareerBoard'));
const AlumniSettings = lazy(() => import('../../pages/alumni/AlumniSettings'));

export const getAlumniRoutes = () => [
  <Route
    key="alumni-root"
    path="/alumni"
    element={
      <ProtectedRoute allowedUserTypes={['alumni', 'admin']}>
        <Navigate to="/alumni/dashboard" replace />
      </ProtectedRoute>
    }
  />,
  <Route
    key="alumni-alumni-dashboard"
    path="/alumni/dashboard"
    element={
      <ProtectedRoute allowedUserTypes={['alumni', 'admin']}>
        <AlumniDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="alumni-alumni-profile"
    path="/alumni/profile"
    element={
      <ProtectedRoute allowedUserTypes={['alumni', 'admin']}>
        <AlumniProfile />
      </ProtectedRoute>
    }
  />,
  <Route
    key="alumni-alumni-network"
    path="/alumni/network"
    element={
      <ProtectedRoute allowedUserTypes={['alumni', 'admin']}>
        <AlumniNetwork />
      </ProtectedRoute>
    }
  />,
  <Route
    key="alumni-alumni-mentorship"
    path="/alumni/mentorship"
    element={
      <ProtectedRoute allowedUserTypes={['alumni', 'admin']}>
        <AlumniMentorship />
      </ProtectedRoute>
    }
  />,
  <Route
    key="alumni-alumni-donations"
    path="/alumni/donations"
    element={
      <ProtectedRoute allowedUserTypes={['alumni', 'admin']}>
        <AlumniDonations />
      </ProtectedRoute>
    }
  />,
  <Route
    key="alumni-alumni-events"
    path="/alumni/events"
    element={
      <ProtectedRoute allowedUserTypes={['alumni', 'admin']}>
        <AlumniEvents />
      </ProtectedRoute>
    }
  />,
  <Route
    key="alumni-alumni-stories"
    path="/alumni/stories"
    element={
      <ProtectedRoute allowedUserTypes={['alumni', 'admin']}>
        <AlumniStories />
      </ProtectedRoute>
    }
  />,
  <Route key="alumni-directory" path="/alumni/directory" element={<ProtectedRoute allowedUserTypes={['alumni', 'admin']}><AlumniDirectory /></ProtectedRoute>} />,
  <Route key="alumni-mentorship-program" path="/alumni/mentorship-program" element={<ProtectedRoute allowedUserTypes={['alumni', 'admin']}><AlumniMentorshipProgram /></ProtectedRoute>} />,
  <Route key="alumni-career-board" path="/alumni/careers" element={<ProtectedRoute allowedUserTypes={['alumni', 'admin']}><AlumniCareerBoard /></ProtectedRoute>} />,
  <Route key="alumni-settings" path="/alumni/settings" element={<ProtectedRoute allowedUserTypes={['alumni', 'admin']}><AlumniSettings /></ProtectedRoute>} />,
];

export default getAlumniRoutes;
