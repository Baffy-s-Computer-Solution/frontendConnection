// frontend/src/test/integration/JobSearch.integration.test.jsx
// ============================================================
// Integration Tests: Job Search Flow
// ============================================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { render } from '../utils/test-utils';
import Jobs from '../../src/pages/student/Jobs';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:5000/api';

describe('Job Search Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render job listings', async () => {
    render(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText(/software engineer/i)).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    render(<Jobs />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should filter jobs by search query', async () => {
    const { user } = render(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText(/software engineer/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search jobs/i);
    await user.type(searchInput, 'designer');

    await waitFor(() => {
      expect(screen.queryByText(/software engineer/i)).not.toBeInTheDocument();
    });
  });

  it('should filter by location', async () => {
    const { user } = render(<Jobs />);

    await waitFor(() => screen.getByText(/software engineer/i));

    const locationFilter = screen.getByLabelText(/location/i);
    await user.selectOptions(locationFilter, 'Remote');

    await waitFor(() => {
      const jobCards = screen.getAllByTestId('job-card');
      jobCards.forEach((card) => {
        expect(within(card).getByText(/remote/i)).toBeInTheDocument();
      });
    });
  });

  it('should filter by job type', async () => {
    const { user } = render(<Jobs />);

    await waitFor(() => screen.getByText(/software engineer/i));

    const typeFilter = screen.getByLabelText(/job type/i);
    await user.selectOptions(typeFilter, 'full-time');

    await waitFor(() => {
      expect(screen.getAllByTestId('job-card').length).toBeGreaterThan(0);
    });
  });

  it('should paginate results', async () => {
    const { user } = render(<Jobs />);

    await waitFor(() => screen.getByText(/software engineer/i));

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/page 2/i)).toBeInTheDocument();
    });
  });

  it('should handle empty results', async () => {
    server.use(
      http.get(`${API_BASE}/jobs`, () => {
        return HttpResponse.json({
          success: true,
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        });
      })
    );

    render(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText(/no jobs found/i)).toBeInTheDocument();
    });
  });

  it('should handle API error', async () => {
    server.use(
      http.get(`${API_BASE}/jobs`, () => {
        return HttpResponse.json(
          { error: 'Server error' },
          { status: 500 }
        );
      })
    );

    render(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('should open job details on click', async () => {
    const { user } = render(<Jobs />);

    await waitFor(() => screen.getByText(/software engineer/i));

    const jobCard = screen.getAllByTestId('job-card')[0];
    await user.click(jobCard);

    await waitFor(() => {
      expect(screen.getByText(/job description/i)).toBeInTheDocument();
    });
  });

  it('should apply to job', async () => {
    const { user } = render(<Jobs />);

    await waitFor(() => screen.getByText(/software engineer/i));

    const applyButton = screen.getAllByRole('button', { name: /apply/i })[0];
    await user.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText(/application submitted/i)).toBeInTheDocument();
    });
  });

  it('should save job to favorites', async () => {
    const { user } = render(<Jobs />);

    await waitFor(() => screen.getByText(/software engineer/i));

    const saveButton = screen.getAllByRole('button', { name: /save/i })[0];
    await user.click(saveButton);

    await waitFor(() => {
      expect(saveButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('should sort jobs by date', async () => {
    const { user } = render(<Jobs />);

    await waitFor(() => screen.getByText(/software engineer/i));

    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.selectOptions(sortSelect, 'date');

    await waitFor(() => {
      expect(screen.getAllByTestId('job-card').length).toBeGreaterThan(0);
    });
  });
});