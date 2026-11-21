// frontend/src/test/unit/pages/Home.test.jsx
// ============================================================
// Unit tests for Home page — sections, CTAs, accessibility.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home, { getLegacyPublicPath } from '../../../pages/Home';

vi.mock('../../../config/firebase', () => ({
  app: {},
  auth: {},
  db: {},
  database: {},
  storage: {},
  collection: vi.fn((_, name) => ({ name })),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_, name, id) => ({ name, id })),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn((reference) => reference),
  serverTimestamp: vi.fn(() => 'server-timestamp'),
  setDoc: vi.fn(),
  where: vi.fn(),
}));

vi.mock('../../../config/supabase', () => ({
  supabase: { from: vi.fn() },
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => <>{children}</>,
}));

vi.mock('../../../utils/dashboardConstants', () => ({
  getUserDashboardPath: vi.fn((role) => `/dashboard/${role || 'guest'}`),
}));

import { useAuth } from '../../../context/AuthContext';
import { onSnapshot, setDoc } from 'firebase/firestore';
import { supabase } from '../../../config/supabase';

const renderHome = (ui) => render(ui, { wrapper: MemoryRouter });

describe('Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: null, userProfile: null });
    const snapshots = {
      companies: { docs: [{ data: () => ({}) }, { data: () => ({}) }], size: 2 },
      jobs: {
        docs: [
          { data: () => ({ status: 'active' }) },
          { data: () => ({ status: 'active' }) },
          { data: () => ({ status: 'closed' }) },
        ],
        size: 3,
      },
      opportunities: {
        docs: [
          { data: () => ({ published: true }) },
          { data: () => ({ published: true }) },
          { data: () => ({ published: false }) },
        ],
        size: 3,
      },
      testimonials: {
        docs: [
          {
            id: 'approved-student',
            data: () => ({
              approved: true,
              userType: 'student',
              name: 'Registered Student',
              content: 'Career Connect helped me find useful opportunities.',
            }),
          },
          {
            id: 'pending-mentor',
            data: () => ({
              approved: false,
              userType: 'mentor',
              name: 'Pending Mentor',
              content: 'This testimonial must remain private until approved.',
            }),
          },
          {
            id: 'approved-admin',
            data: () => ({
              approved: true,
              userType: 'admin',
              name: 'Unregistered Role',
              content: 'This role is not permitted to publish a testimonial.',
            }),
          },
        ],
      },
    };
    onSnapshot.mockImplementation((reference, onNext) => {
      onNext(snapshots[reference.name]);
      return vi.fn();
    });
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ count: 2, error: null }),
    }));
  });

  it('loads live platform metrics from Supabase and Firestore', async () => {
    renderHome(<Home />);

    expect(supabase.from).toHaveBeenCalledTimes(4);
    expect(onSnapshot).toHaveBeenCalledTimes(4);
    expect(await screen.findByText(/students ready/i)).toBeInTheDocument();
    expect(screen.getAllByText(/active opportunities/i).length).toBeGreaterThan(0);
  });

  it('renders hero headline and subheadline', () => {
    renderHome(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/ambition|opportunity/i);
    expect(screen.getByText(/brings students, youth, employers, mentors/i)).toBeInTheDocument();
  });

  it('renders nav links', () => {
    renderHome(<Home />);
    const nav = screen.getByRole('navigation', { name: /primary navigation/i });
    ['Platform', 'Pathways', 'Testimonials', 'Impact', 'FAQ', 'Contact'].forEach((label) => {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument();
    });
  });

  it('shows Sign up / Sign in when logged out', () => {
    renderHome(<Home />);
    expect(screen.getAllByRole('link', { name: /sign up/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /sign in/i }).length).toBeGreaterThan(0);
  });

  it('shows Dashboard link when logged in', () => {
    useAuth.mockReturnValue({ currentUser: { uid: '1' }, userProfile: { userType: 'student' } });
    renderHome(<Home />);
    const links = screen.getAllByRole('link', { name: /dashboard/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href', '/dashboard/student');
  });

  it('renders trust bar partners', () => {
    renderHome(<Home />);
    const trust = screen.getByRole('region', { name: /connected across the career ecosystem/i });
    expect(within(trust).getByText('Students')).toBeInTheDocument();
    expect(within(trust).getByText('Employers')).toBeInTheDocument();
  });

  it('renders every public role with its matching registration link', () => {
    renderHome(<Home />);
    const roles = [
      ['Students', 'student'],
      ['Youth', 'youth'],
      ['Companies & employers', 'company'],
      ['Mentors', 'mentor'],
      ['Educational institutions', 'institute'],
      ['Government & agencies', 'government'],
      ['Parents & guardians', 'parent'],
      ['Alumni', 'alumni'],
      ['Entrepreneurs', 'entrepreneur'],
    ];

    roles.forEach(([title, role]) => {
      const card = screen.getByRole('heading', { name: title }).closest('article');
      expect(within(card).getByRole('link', { name: /get started/i })).toHaveAttribute(
        'href',
        `/register?role=${role}`
      );
    });
    expect(screen.getAllByText(/administrator accounts are provisioned/i)).toHaveLength(2);
  });

  it('renders FAQ items as <details>', () => {
    renderHome(<Home />);
    const faqSection = screen.getByRole('region', { name: /everything you need to know/i });
    const details = faqSection.querySelectorAll('details');
    expect(details.length).toBeGreaterThanOrEqual(4);
  });

  it('does not render placeholder testimonial data', () => {
    renderHome(<Home />);
    expect(screen.queryByText(/Palesa M\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Thabo K\./)).not.toBeInTheDocument();
  });

  it('renders only approved testimonials from supported registered roles', () => {
    renderHome(<Home />);
    expect(screen.getByText('Career Connect helped me find useful opportunities.')).toBeInTheDocument();
    expect(screen.queryByText(/must remain private until approved/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/not permitted to publish/i)).not.toBeInTheDocument();
  });

  it('lets public visitors read testimonials and directs members to dashboard submission', () => {
    renderHome(<Home />);

    expect(screen.getByText('Career Connect helped me find useful opportunities.')).toBeInTheDocument();
    expect(screen.queryByLabelText(/your testimonial/i)).not.toBeInTheDocument();
    expect(screen.getByText(/share their experience from their dashboard/i)).toBeInTheDocument();
  });

  it('does not show testimonial submission controls on landing page for signed-in members', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: 'student-1', displayName: 'Test Student' },
      userProfile: { userType: 'student', fullName: 'Test Student' },
    });
    renderHome(<Home />);

    expect(screen.getByText('Career Connect helped me find useful opportunities.')).toBeInTheDocument();
    expect(screen.queryByLabelText(/your testimonial/i)).not.toBeInTheDocument();
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('renders impact stats with product-ready messaging', () => {
    renderHome(<Home />);
    expect(screen.getAllByText(/registered students/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/active opportunities/i).length).toBeGreaterThan(0);
  });

  it('renders footer columns', () => {
    renderHome(<Home />);
    const footer = screen.getByRole('contentinfo');
    ['Resources', 'Company', 'Legal'].forEach((title) => {
      expect(within(footer).getByRole('heading', { name: title })).toBeInTheDocument();
    });
    expect(within(footer).queryByRole('heading', { name: 'Platform' })).not.toBeInTheDocument();
  });

  it('keeps contact actions on the Contact page and the developer attribution in the footer', () => {
    renderHome(<Home />);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getAllByRole('link', { name: 'Contact' })).toHaveLength(2);
    within(footer).getAllByRole('link', { name: 'Contact' }).forEach((link) => expect(link).toHaveAttribute('href', '/contact'));
    expect(within(footer).getByRole('link', { name: /baffy's computer solutions/i })).toHaveAttribute(
      'href',
      'https://baffy.vercel.app/'
    );
    expect(within(footer).queryByRole('link', { name: /whatsapp/i })).not.toBeInTheDocument();
  });

  it('redirects the legacy #contact bookmark to the dedicated Contact route', async () => {
    expect(getLegacyPublicPath('#contact')).toBe('/contact');
    expect(getLegacyPublicPath('#stories')).toBeNull();
  });

  it('renders skip link', () => {
    renderHome(<Home />);
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
  });

  it('CTA clicks dispatch analytics events', async () => {
    const listener = vi.fn();
    window.addEventListener('cc:analytics', listener);
    const user = userEvent.setup();
    renderHome(<Home />);
    const signup = screen.getAllByRole('link', { name: /sign up/i })[0];
    await user.click(signup);
    expect(listener).toHaveBeenCalled();
    window.removeEventListener('cc:analytics', listener);
  });
});
