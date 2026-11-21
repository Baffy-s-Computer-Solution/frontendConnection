import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Layout from './Layout';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useTheme: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({ useAuth: mocks.useAuth }));
vi.mock('../../context/ThemeContext', () => ({ useTheme: mocks.useTheme }));
vi.mock('../../config/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  onSnapshot: vi.fn(() => vi.fn()),
}));
vi.mock('react-router-dom', async (importOriginal) => await importOriginal());

describe('Layout', () => {
  beforeEach(() => {
    mocks.useAuth.mockReturnValue({
      userProfile: { userType: 'student', displayName: 'Test Student' },
      currentUser: { email: 'student@example.com' },
      logout: vi.fn(),
    });
    mocks.useTheme.mockReturnValue({ isDark: false, setTheme: vi.fn() });
  });

  it('renders the dashboard with a normalized role attribute', () => {
    render(
      <MemoryRouter>
        <Layout>
          <h1>Student dashboard</h1>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByRole('main')).toHaveAttribute('data-user-role', 'student');
    expect(screen.getByRole('heading', { name: 'Student dashboard' })).toBeInTheDocument();
  });

  it('groups student links and expands the group containing the current page', () => {
    render(
      <MemoryRouter initialEntries={['/student/jobs']}>
        <Layout>
          <h1>Student dashboard</h1>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /Career/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /Internships/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Progress/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('groups mentor links and expands the group containing the current page', () => {
    mocks.useAuth.mockReturnValue({
      userProfile: { userType: 'mentor', displayName: 'Test Mentor' },
      currentUser: { email: 'mentor@example.com' },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/mentor/reviews']}>
        <Layout>
          <h1>Mentor dashboard</h1>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /Community/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /Reviews/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Mentoring/ }));
    expect(screen.getByRole('button', { name: /Mentoring/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('groups admin tools and exposes Admin Management inside People & access', () => {
    mocks.useAuth.mockReturnValue({
      userProfile: { userType: 'admin', displayName: 'Test Admin' },
      currentUser: { email: 'admin@example.com' },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/admins']}>
        <Layout><h1>Admin workspace</h1></Layout>
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /People & access/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /Admin Management/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Platform/ })).toHaveAttribute('aria-expanded', 'false');
  });
});
