import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from './Settings';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'u123', email: 'admin@example.com', displayName: 'Admin User' },
    userProfile: { userType: 'admin', fullName: 'Admin User', email: 'admin@example.com' },
    refreshUserProfile: vi.fn().mockResolvedValue({ success: true }),
  }),
}));

vi.mock('../pages/admin/SystemSettings', () => ({
  default: () => <div>Admin system settings</div>,
}));

vi.mock('../pages/student/StudentSettings', () => ({
  default: () => <div>Student settings</div>,
}));

vi.mock('../pages/company/CompanySettings', () => ({
  default: () => <div>Company settings</div>,
}));

vi.mock('../pages/institute/Settings', () => ({
  default: () => <div>Institute settings</div>,
}));

describe('Settings dispatcher', () => {
  it('renders the admin system settings for admin users', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    expect(screen.getByText(/admin system settings/i)).toBeInTheDocument();
  });
});
