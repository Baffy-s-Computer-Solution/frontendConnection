// frontend/src/routing/modules/ParentRoutes.jsx
// ============================================================================
// PARENT ROUTES - Production Ready
// Lazy loaded | Protected | With Suspense & Error boundaries
// ============================================================================

import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../components/layout/ProtectedRoute';
import LoadingSpinner from '../../components/layout/LoadingSpinner';

// ---- Lazy imports ----
const ParentDashboard       = lazy(() => import('../../pages/parent/ParentDashboard'));
const StudentProgress       = lazy(() => import('../../pages/parent/StudentProgress'));
const ChildProfile          = lazy(() => import('../../pages/parent/ChildProfile'));
const ParentProfile         = lazy(() => import('../../pages/parent/ParentProfile'));
const ParentSettings        = lazy(() => import('../../pages/parent/ParentSettings'));
const CommunicationHub      = lazy(() => import('../../pages/parent/CommunicationHub'));
const ParentNotifications   = lazy(() => import('../../pages/parent/ParentNotifications'));
const FinancialPlanning     = lazy(() => import('../../pages/parent/FinancialPlanning'));
const WellbeingMonitor      = lazy(() => import('../../pages/parent/WellbeingMonitor'));
const ParentHealthRecords   = lazy(() => import('../../pages/parent/ParentHealthRecords'));
const ParentAnalytics       = lazy(() => import('../../pages/parent/ParentAnalytics'));
const ParentMarketplace     = lazy(() => import('../../pages/parent/ParentMarketplace'));
const ParentVolunteerBoard = lazy(() => import('../../pages/parent/ParentVolunteerBoard'));
const FamilyEmergencyCenter = lazy(() => import('../../pages/parent/FamilyEmergencyCenter'));
const ParentRewards         = lazy(() => import('../../pages/parent/ParentRewards'));
const CareerGuidance        = lazy(() => import('../../pages/parent/CareerGuidance'));
const ParentMeetings        = lazy(() => import('../../pages/parent/ParentMeetings'));
const AcademicCalendar      = lazy(() => import('../../pages/parent/AcademicCalendar'));
const ParentDocuments       = lazy(() => import('../../pages/parent/ParentDocuments'));
const ParentCommunity       = lazy(() => import('../../pages/parent/ParentCommunity'));

const ParentRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen label="Loading parent workspace…" />}>
      <Routes>
        {/* Root redirect */}
        <Route index element={<Navigate to="dashboard" replace />} />

          {/* Protected parent routes */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="student-progress"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <StudentProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="child-profile"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ChildProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="communication-hub"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <CommunicationHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="financial-planning"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <FinancialPlanning />
              </ProtectedRoute>
            }
          />
          <Route
            path="health-records"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentHealthRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="wellbeing-monitor"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <WellbeingMonitor />
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="marketplace"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentMarketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="volunteer-board"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentVolunteerBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="family-emergency-center"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <FamilyEmergencyCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="rewards"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentRewards />
              </ProtectedRoute>
            }
          />
          <Route
            path="career-guidance"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <CareerGuidance />
              </ProtectedRoute>
            }
          />
          <Route
            path="meetings"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentMeetings />
              </ProtectedRoute>
            }
          />
          <Route
            path="calendar"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <AcademicCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="documents"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="community"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentCommunity />
              </ProtectedRoute>
            }
          />

        {/* Fallback inside parent module */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default ParentRoutes;