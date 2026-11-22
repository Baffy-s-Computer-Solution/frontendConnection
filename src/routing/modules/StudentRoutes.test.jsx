import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../components/layout/ProtectedRoute', () => ({
  default: ({ children }) => <>{children}</>,
}));

vi.mock('../../pages/Settings', () => ({
  default: () => <div>settings</div>,
}));

vi.mock('../../pages/student/StudentDashboard', () => ({ default: () => <div>student-dashboard</div> }));
vi.mock('../../pages/student/StudentApplications', () => ({ default: () => <div>student-applications</div> }));
vi.mock('../../pages/student/StudentDocuments', () => ({ default: () => <div>student-documents</div> }));
vi.mock('../../pages/student/Documents', () => ({ default: () => <div>student-documents</div> }));
vi.mock('../../pages/student/StudentProfile', () => ({ default: () => <div>student-profile</div> }));
vi.mock('../../pages/student/StudentSettings', () => ({ default: () => <div>student-settings</div> }));
vi.mock('../../pages/student/ApplyJob', () => ({ default: () => <div>apply-job</div> }));
vi.mock('../../pages/student/Jobs', () => ({ default: () => <div>jobs</div> }));
vi.mock('../../pages/student/Notifications', () => ({ default: () => <div>notifications</div> }));
vi.mock('../../pages/student/ViewApplication', () => ({ default: () => <div>view-application</div> }));
vi.mock('../../pages/student/JobMatches', () => ({ default: () => <div>job-matches</div> }));
vi.mock('../../pages/student/analytics/StudentAnalytics', () => ({ default: () => <div>analytics</div> }));
vi.mock('../../pages/student/ActivityFeed', () => ({ default: () => <div>activity</div> }));
vi.mock('../../pages/student/Deadlines', () => ({ default: () => <div>deadlines</div> }));
vi.mock('../../pages/student/Recommendations', () => ({ default: () => <div>recommendations</div> }));
vi.mock('../../pages/student/PerformanceMetrics', () => ({ default: () => <div>performance</div> }));
vi.mock('../../pages/student/QuickActions', () => ({ default: () => <div>quick-actions</div> }));
vi.mock('../../pages/student/Calendar', () => ({ default: () => <div>calendar</div> }));
vi.mock('../../pages/student/Mentorship', () => ({ default: () => <div>mentorship</div> }));
vi.mock('../../pages/student/StudentMentorship', () => ({ default: () => <div>mentorship</div> }));
vi.mock('../../pages/student/DocumentsUpload', () => ({ default: () => <div>documents-upload</div> }));
vi.mock('../../pages/student/StudentDocumentUpload', () => ({ default: () => <div>documents-upload</div> }));
vi.mock('../../pages/student/SearchJobs', () => ({ default: () => <div>search-jobs</div> }));
vi.mock('../../pages/student/SearchInternships', () => ({ default: () => <div>search-internships</div> }));
vi.mock('../../pages/student/StudentCourses', () => ({ default: () => <div>student-courses</div> }));
vi.mock('../../pages/student/StudentJobs', () => ({ default: () => <div>student-jobs</div> }));
vi.mock('../../pages/student/StudentCoursesLive', () => ({ default: () => <div>student-courses-live</div> }));
vi.mock('../../pages/FriendsNetwork', () => ({ default: () => <div>friends-network</div> }));
vi.mock('../../pages/student/StudentAssessments', () => ({ default: () => <div>student-assessments</div> }));

import { getStudentRoutes } from './StudentRoutes';
import StudentSettings from '../../pages/student/StudentSettings';

describe('Student routes', () => {
  it('includes a root student redirect to the dashboard', () => {
    const routes = getStudentRoutes();
    expect(routes.some((route) => route.props?.path === '/student')).toBe(true);
    const rootRoute = routes.find((route) => route.props?.path === '/student');
    expect(rootRoute.props.element.props.children.props.to).toBe('/student/dashboard');
  });

  it('opens student settings on its own student route', () => {
    const routes = getStudentRoutes();
    const settingsRoute = routes.find((route) => route.props?.path === '/student/settings');

    expect(settingsRoute).toBeDefined();
    expect(settingsRoute.props.element.props.allowedUserTypes).toEqual(['student']);
    expect(settingsRoute.props.element.props.children.type).toBe(StudentSettings);
  });
});
