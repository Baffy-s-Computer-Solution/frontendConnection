import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchApplications: vi.fn(),
  fetchRecommendedJobs: vi.fn(),
  fetchNotifications: vi.fn(),
  markAsRead: vi.fn(),
  subscribeToStudentApplications: vi.fn(),
}));

vi.mock('../../../context/StudentContext', () => ({
  useStudent: () => ({
    studentData: { id: 'student-123', firstName: 'Tashi', profileCompletion: 60 },
    loading: false,
    fetchApplications: mocks.fetchApplications,
    fetchRecommendedJobs: mocks.fetchRecommendedJobs,
  }),
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'student-123', displayName: 'Tashi' } }),
}));

vi.mock('../../../context/NotificationContext', () => ({
  useNotification: () => ({
    notifications: [],
    unreadCount: 0,
    fetchNotifications: mocks.fetchNotifications,
    markAsRead: mocks.markAsRead,
  }),
}));

vi.mock('../../../components/social/SocialDashboardSection', () => ({
  default: () => <div>Campus and Career Feed</div>,
}));

vi.mock('../../../services/studentServices', () => ({
  subscribeToStudentApplications: mocks.subscribeToStudentApplications,
}));

import StudentDashboard from '../../../pages/student/StudentDashboard';

describe('StudentDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchApplications.mockResolvedValue([]);
    mocks.fetchRecommendedJobs.mockResolvedValue([{
      id: 'job-1',
      title: 'Graduate Developer',
      location: {
        country: 'Lesotho',
        zipCode: '100',
        street: 'Kingsway',
        city: 'Maseru',
        state: '',
      },
    }]);
    mocks.fetchNotifications.mockResolvedValue([]);
    mocks.subscribeToStudentApplications.mockReturnValue(() => {});
  });

  it('renders structured recommendation addresses as text and exposes quick actions at the top', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);

    expect(await screen.findByText('Kingsway, Maseru, 100, Lesotho')).toBeInTheDocument();
    const quickActions = screen.getByRole('navigation', { name: 'Student quick actions' });
    const statsHeading = screen.getByText('Profile Completion');
    expect(quickActions.compareDocumentPosition(statsHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('lets students collapse and reopen the quick-action menu', () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);

    const toggle = screen.getByRole('button', { name: /quick actions/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: 'Student quick actions' })).not.toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.getByRole('navigation', { name: 'Student quick actions' })).toBeInTheDocument();
  });
});
