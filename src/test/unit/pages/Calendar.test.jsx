import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deleteStudentCalendarEvent: vi.fn(),
  saveStudentCalendarEvent: vi.fn(),
  subscribeToStudentApplications: vi.fn(),
  subscribeToStudentCalendarEvents: vi.fn(),
  subscribeToActiveJobs: vi.fn(),
  subscribeToStudentMentorshipData: vi.fn(),
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'student-123' } }),
}));

vi.mock('../../../services/studentServices', () => ({
  deleteStudentCalendarEvent: mocks.deleteStudentCalendarEvent,
  saveStudentCalendarEvent: mocks.saveStudentCalendarEvent,
  subscribeToStudentApplications: mocks.subscribeToStudentApplications,
  subscribeToStudentCalendarEvents: mocks.subscribeToStudentCalendarEvents,
  subscribeToActiveJobs: mocks.subscribeToActiveJobs,
}));

vi.mock('../../../services/studentMentorshipService', () => ({
  subscribeToStudentMentorshipData: mocks.subscribeToStudentMentorshipData,
}));

import Calendar from '../../../pages/student/Calendar';

describe('Calendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteStudentCalendarEvent.mockResolvedValue({ success: true });
    mocks.saveStudentCalendarEvent.mockResolvedValue({ success: true });
    mocks.subscribeToStudentApplications.mockImplementation((uid, onData) => { onData([]); return () => {}; });
    mocks.subscribeToStudentCalendarEvents.mockImplementation((uid, onData) => { onData([]); return () => {}; });
    mocks.subscribeToActiveJobs.mockImplementation((onData) => { onData([]); return () => {}; });
    mocks.subscribeToStudentMentorshipData.mockImplementation((uid, onData) => { onData({ sessions: [] }); return () => {}; });
  });

  it('creates a personal event through the student-owned calendar service', async () => {
    render(<MemoryRouter><Calendar /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: /add event/i }));
    fireEvent.change(screen.getByLabelText('Event title'), { target: { value: 'Portfolio review' } });
    fireEvent.change(screen.getByLabelText('Date and time'), { target: { value: '2026-02-14T10:30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }));

    await waitFor(() => expect(mocks.saveStudentCalendarEvent).toHaveBeenCalledWith(
      'student-123',
      expect.objectContaining({ title: 'Portfolio review' }),
      null
    ));
    expect(await screen.findByRole('status')).toHaveTextContent('Calendar event created.');
  });
});
