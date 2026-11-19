// frontend/src/App.jsx
import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/layout/LoadingSpinner';
import {
  AuthProvider,
  useAuth,
  StudentProvider,
  ThemeProvider,
  NotificationProvider,
  YouthProvider,
  AlumniProvider,
  GovernmentProvider,
  ParentProvider,
  SystemProvider,
  CollaborationProvider,
  CompanyProvider,
  InstituteProvider,
  EntrepreneurProvider,
} from './context';
import { MentorProvider } from './context/MentorContext';
import { AIProvider } from './context/AIContext';
import getAdminRoutes from './routing/modules/AdminRoutes';
import getAIRoutes from './routing/modules/AIRoutes';
import getAlumniRoutes from './routing/modules/AlumniRoutes';
import getCommonRoutes from './routing/modules/CommonRoutes';
import getCompanyRoutes from './routing/modules/CompanyRoutes';
import getEntrepreneurRoutes from './routing/modules/EntrepreneurRoutes';
import getInstituteRoutes from './routing/modules/InstituteRoutes';
import getMentorRoutes from './routing/modules/MentorRoutes';
import ParentRoutes from './routing/modules/ParentRoutes';
import getPublicRoutes from './routing/modules/PublicRoutes';
import getStudentRoutes from './routing/modules/StudentRoutes';
import getYouthRoutes from './routing/modules/YouthRoutes';

// Loading fallback component with a branded, animated progress reveal
const LoadingFallback = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 5000;

    const frame = () => {
      const elapsed = Date.now() - start;
      const nextProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(nextProgress);

      if (nextProgress < 100) {
        requestAnimationFrame(frame);
      }
    };

    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md text-center" aria-live="polite" aria-busy="true">
        <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-card dark:bg-slate-900">
          <img
            src="/career connect lesotho logo.jpeg"
            alt="Career Connect Lesotho logo"
            className="h-full w-full object-cover"
          />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-slate-900 dark:text-slate-100">Career Connect Lesotho</h1>
        <p className="mt-2 text-sm text-slate-500">Preparing your workspace...</p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <span className="block h-full rounded-full bg-brand-600 transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 text-xs font-medium text-slate-500">{Math.round(progress)}%</div>
      </div>
    </div>
  );
};

// Error fallback component
const ErrorFallback = ({ error }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
    <div className="w-full max-w-lg rounded-xl border bg-white p-8 text-center shadow-card dark:bg-slate-900">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-500">We're sorry, but something went wrong. Please try refreshing the page.</p>
      {error && <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-slate-100 p-3 text-left text-xs text-danger-dark dark:bg-slate-950">{error.message}</pre>}
      <button onClick={() => window.location.reload()} className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700">
        Reload app
      </button>
    </div>
  </div>
);

// Main app content with routes
const AppContent = () => {
  const { loading, error } = useAuth();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  // Show loading state
  if (loading || booting) {
    return <LoadingFallback />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-lg rounded-xl border bg-white p-8 text-center shadow-card dark:bg-slate-900">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Authentication Error</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes - No authentication required */}
        {getPublicRoutes()}

        {/* Common Routes - Authentication required */}
        {getCommonRoutes()}

        {/* Protected Routes by User Type */}
        {getAdminRoutes()}
        {getStudentRoutes()}
        {getCompanyRoutes()}
        {getInstituteRoutes()}
        {getMentorRoutes()}
        {getYouthRoutes()}
        {getEntrepreneurRoutes()}
        <Route path="/parent/*" element={<ParentRoutes />} />
        {getAlumniRoutes()}
        {getAIRoutes()}

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

// Main App component
function App() {
  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online');
      // Optional: Trigger a refresh or reconnection
      if (window.location.pathname !== '/') {
        window.location.reload();
      }
    };

    const handleOffline = () => {
      console.warn('App is offline - some features may be limited');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <StudentProvider>
                <CompanyProvider>
                <InstituteProvider>
                  <EntrepreneurProvider>
                    <MentorProvider>
                      <YouthProvider>
                        <AlumniProvider>
                          <GovernmentProvider>
                            <ParentProvider>
                              <SystemProvider>
                                  <CollaborationProvider>
                                    <AIProvider>
                                      <AppContent />
                                    </AIProvider>
                                  </CollaborationProvider>
                                </SystemProvider>
                              </ParentProvider>
                            </GovernmentProvider>
                          </AlumniProvider>
                        </YouthProvider>
                      </MentorProvider>
                    </EntrepreneurProvider>
                  </InstituteProvider>
                </CompanyProvider>
              </StudentProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
