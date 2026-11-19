import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/layout/ProtectedRoute';
import { normalizeUserType } from '../../utils/authRoleUtils';

// Lazy load common pages
const Notifications = React.lazy(() => import('../../pages/Notifications'));
const Settings = React.lazy(() => import('../../pages/Settings'));
const Search = React.lazy(() => import('../../pages/Search'));
const Resources = React.lazy(() => import('../../pages/Resources/Resources'));

// Dashboard redirect component
const DashboardRedirect = () => {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  const dashboardMap = {
    admin: '/admin/dashboard',
    student: '/student/dashboard',
    company: '/company/dashboard',
    institute: '/institute/dashboard',
    mentor: '/mentor/dashboard',
    youth: '/youth/dashboard',
    entrepreneur: '/entrepreneur/dashboard',
    parent: '/parent/dashboard',
    alumni: '/alumni/dashboard',
    government: '/government/dashboard',
    system: '/system/dashboard',
  };

  const normalizedUserType = normalizeUserType(userProfile?.userType || userProfile?.role || 'student');
  const redirectPath = dashboardMap[normalizedUserType] || '/student/dashboard';

  return <Navigate to={redirectPath} replace />;
};

export const getCommonRoutes = () => (
  <React.Fragment>
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardRedirect />
        </ProtectedRoute>
      }
    />
    <Route
      path="/notifications"
      element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      }
    />
    <Route
      path="/search"
      element={
        <ProtectedRoute>
          <Search />
        </ProtectedRoute>
      }
    />
    <Route
      path="/resources"
      element={
        <ProtectedRoute>
          <Resources />
        </ProtectedRoute>
      }
    />
  </React.Fragment>
);

export default getCommonRoutes;
