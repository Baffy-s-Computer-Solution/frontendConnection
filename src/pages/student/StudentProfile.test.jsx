import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import StudentProfile from './StudentProfile';
import settingsService from '../../services/settingsService';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'u123', email: 'student@example.com', displayName: 'Jane Student' },
    userProfile: {
      fullName: 'Jane Student',
      email: 'student@example.com',
      phone: '+266 5900 1234',
      studentId: 'ST-2026-001',
      institution: 'National University of Lesotho',
      program: 'Computer Science',
      yearOfStudy: 'Year 3',
      bio: 'Driven student with interest in software engineering.',
      skills: ['React', 'JavaScript'],
    },
    refreshUserProfile: vi.fn().mockResolvedValue({ success: true }),
  }),
}));

vi.mock('../../services/settingsService', () => ({
  __esModule: true,
  default: {
    getUserSettings: vi.fn().mockResolvedValue({
      success: true,
      data: {
        fullName: 'Jane Student',
        email: 'student@example.com',
        phone: '+266 5900 1234',
        studentId: 'ST-2026-001',
        institution: 'National University of Lesotho',
        program: 'Computer Science',
        yearOfStudy: 'Year 3',
        bio: 'Driven student with interest in software engineering.',
        skills: ['React', 'JavaScript'],
      },
    }),
    saveUserSettings: vi.fn().mockResolvedValue({ success: true, data: {} }),
    watchUserSettings: vi.fn(() => () => {}),
  },
}));

vi.mock('../../services/studentServices', () => ({
  updateStudentProfile: vi.fn().mockResolvedValue({ success: true }),
}));

describe('StudentProfile', () => {
  it('saves updated student profile data in real time', async () => {
    render(<StudentProfile />);

    const programInput = await screen.findByDisplayValue('Computer Science');
    fireEvent.change(programInput, { target: { value: 'Software Engineering' } });

    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(settingsService.saveUserSettings).toHaveBeenCalledWith(
        'u123',
        'student',
        expect.objectContaining({
          fullName: 'Jane Student',
          program: 'Software Engineering',
          skills: expect.arrayContaining(['React', 'JavaScript']),
        }),
      );
    });
  });
});
