import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getJob: vi.fn(),
  incrementApplicantCount: vi.fn(),
  getStudentProfile: vi.fn(),
  checkExistingApplication: vi.fn(),
  uploadResume: vi.fn(),
  applyForJob: vi.fn(),
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'student-123', email: 'student@example.com' },
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ jobId: 'job-123' }),
  };
});

vi.mock('../../../services/jobService', () => ({
  default: {
    getJob: mocks.getJob,
    incrementApplicantCount: mocks.incrementApplicantCount,
  },
}));

vi.mock('../../../services/studentServices', () => ({
  applyForJob: mocks.applyForJob,
  checkExistingApplication: mocks.checkExistingApplication,
  getStudentProfile: mocks.getStudentProfile,
  uploadResume: mocks.uploadResume,
}));

import ApplyJob from '../../../pages/student/ApplyJob';

const renderApplicationPage = () =>
  render(
    <MemoryRouter initialEntries={['/student/jobs/apply/job-123']}>
      <Routes>
        <Route path="/student/jobs/apply/:jobId" element={<ApplyJob />} />
      </Routes>
    </MemoryRouter>
  );

describe('ApplyJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getJob.mockResolvedValue({
      success: true,
      data: {
        id: 'job-123',
        title: 'Frontend Developer',
        companyName: 'Career Connect',
        status: 'active',
      },
    });
    mocks.getStudentProfile.mockResolvedValue({
      success: true,
      data: {
        fullName: 'Student Example',
        email: 'student@example.com',
        educationLevel: 'University',
      },
    });
    mocks.checkExistingApplication.mockResolvedValue({ success: true, exists: false });
    mocks.uploadResume.mockResolvedValue({
      success: true,
      url: 'https://files.example/resume.pdf',
    });
    mocks.applyForJob.mockResolvedValue({ success: true, id: 'application-123' });
    mocks.incrementApplicantCount.mockResolvedValue(undefined);
  });

  it('requires a saved resume and cover letter before submitting an application', async () => {
    renderApplicationPage();

    await screen.findByRole('heading', { name: 'Frontend Developer' });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');

    fireEvent.click(screen.getByRole('button', { name: /continue to your resume/i }));
    const continueButton = await screen.findByRole('button', { name: /continue to cover letter/i });
    expect(continueButton).toBeDisabled();

    const resumeInput = screen.getByLabelText(/choose a resume file/i);
    fireEvent.change(resumeInput, {
      target: {
        files: [new File(['resume'], 'resume.pdf', { type: 'application/pdf' })],
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /upload resume/i }));

    await waitFor(() => expect(mocks.uploadResume).toHaveBeenCalled());
    await waitFor(() => expect(continueButton).toBeEnabled());
    fireEvent.click(continueButton);

    const coverLetter = await screen.findByLabelText(/cover letter/i);
    fireEvent.change(coverLetter, {
      target: { value: 'I am excited to apply and bring relevant experience to this role.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

    await waitFor(() => expect(mocks.applyForJob).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 'student-123',
        jobId: 'job-123',
        resumeUrl: 'https://files.example/resume.pdf',
        coverLetter: 'I am excited to apply and bring relevant experience to this role.',
      })
    ));
    expect(await screen.findByRole('status')).toHaveTextContent(/submitted successfully/i);
    expect(mocks.incrementApplicantCount).toHaveBeenCalledWith('job-123');
  });
});
