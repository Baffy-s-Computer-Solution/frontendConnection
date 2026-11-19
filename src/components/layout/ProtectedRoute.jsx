import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { RefreshCw, WifiOff, MailCheck, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPathByUserType, normalizeUserType } from '../../utils/authRoleUtils';
import Layout from './Layout';

/**
 * Protected Route Component
 * Handles authentication, authorization, and route protection
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string[]} [props.allowedUserTypes=[]] - Allowed user types for this route
 * @param {string} [props.redirectPath='/login'] - Custom redirect path
 * @param {boolean} [props.requireEmailVerification=true] - Require email verification
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({
  children,
  allowedUserTypes = [],
  redirectPath = '/login',
  requireEmailVerification = true,
}) => {
  const {
    currentUser,
    userProfile,
    loading,
    isAuthenticated,
    isOffline,
    needsEmailVerification,
    resendVerificationEmail,
  } = useAuth();
  const location = useLocation();

  /** @type {Object.<string, string>} */
  const DASHBOARD_MAP = {
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

  // Loading state with better UX
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-600" aria-label="Loading" />
          <p className="mt-3 text-sm text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Offline state with retry option
  if (isOffline) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-lg rounded-xl border border-warning/30 bg-warning-light p-6 text-center text-warning-dark shadow-card">
          <WifiOff className="mx-auto h-8 w-8" aria-hidden />
          <h1 className="mt-3 text-lg font-semibold">You're Offline</h1>
          <p className="mt-2 text-sm">Please check your internet connection and try again.</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-2"
            leadingIcon={RefreshCw}
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !currentUser) {
    return (
      <Navigate
        to={redirectPath}
        state={{
          from: location,
          message: 'Please log in to access this page',
        }}
        replace
      />
    );
  }

  // Email verification check
  if (requireEmailVerification && needsEmailVerification && needsEmailVerification()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-lg rounded-xl border border-warning/30 bg-warning-light p-6 text-center text-warning-dark shadow-card">
          <MailCheck className="mx-auto h-8 w-8" aria-hidden />
          <h1 className="mt-3 text-lg font-semibold">Email Verification Required</h1>
          <p className="mt-2 text-sm">Please verify your email address to access this page.</p>
          <p className="mb-3 text-xs opacity-80">
              Check your inbox for the verification link. Didn't receive it? Check your spam folder.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const result = await resendVerificationEmail();
              if (result?.success) {
                alert('Verification email sent. Please check your inbox.');
              }
            }}
          >
            Resend Verification Email
          </Button>
        </div>
      </div>
    );
  }

  // Wait for profile to load
  if (!userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-600" aria-label="Loading" />
          <p className="mt-3 text-sm text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Check allowed user types with admin override
  if (allowedUserTypes.length > 0) {
    const userType = normalizeUserType(userProfile.userType || userProfile.role || '');
    const normalizedAllowed = allowedUserTypes.map((type) => normalizeUserType(type));
    const isAdmin = userProfile.isAdmin || userType === 'admin';
    const isAllowed = normalizedAllowed.includes(userType) || isAdmin;

    if (!isAllowed) {
      // Get appropriate dashboard for user type
      const targetPath = getDashboardPathByUserType(userType);

      return (
        <Navigate
          to={targetPath}
          state={{
            from: location,
            message: `Access denied. ${userType} users cannot access this page.`,
          }}
          replace
        />
      );
    }
  }

  // All checks passed - render children inside the shared app shell
  return <Layout>{children}</Layout>;
};

// Export both as default and as CommonRouteGuard for backward compatibility
export default ProtectedRoute;
export { ProtectedRoute as CommonRouteGuard };
