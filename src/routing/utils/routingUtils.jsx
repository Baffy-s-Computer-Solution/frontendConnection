import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

import { ROLE_BASED_REDIRECTS } from './routeConstants';

// Import Layout for LoadingFallback

export const LoadingFallback = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
    <Loader2 className="h-12 w-12 animate-spin text-brand-600" aria-label="Loading" />
    <span className="mt-3 text-sm text-slate-500">Loading Career Connect...</span>
  </div>
);

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-label="Loading" />
    <span className="ml-2 text-sm text-slate-500">Loading...</span>
  </div>
);

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const FirebaseLoader = () => {
  const { currentUser, userProfile, loading, refreshUserProfile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (currentUser && !userProfile && !loading && refreshUserProfile) {
      refreshUserProfile();
    }
  }, [location.pathname, currentUser, userProfile, loading, refreshUserProfile]);

  if (loading) {
    return <LoadingFallback />;
  }

  return <Outlet />;
};

export const EnhancedDashboardRedirect = () => {
  const { userProfile, currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!userProfile) {
    return <LoadingFallback />;
  }

  const userType = userProfile?.userType || 'student';
  const route = ROLE_BASED_REDIRECTS[userType] || '/student';

  return <Navigate to={route} replace />;
};
