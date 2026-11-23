import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Jobs from '../../pages/student/Jobs';
import { render } from '../utils/test-utils';

describe('Student jobs dashboard access', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires authentication before showing private saved jobs and applications', () => {
    render(<Jobs />);

    expect(screen.getByText(/please sign in to view your jobs dashboard/i)).toBeInTheDocument();
  });
});
