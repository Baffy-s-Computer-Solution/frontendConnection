import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentSettings from './StudentSettings';

vi.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      uid: 'u123',
      email: 'student@example.com',
      displayName: 'Test Student',
    },
    userProfile: {
      userType: 'student',
      fullName: 'Test Student',
      email: 'student@example.com',
      notifications: {
        email: true,
        push: true,
        marketing: false,
      },
      privacy: {
        showProfile: true,
      },
    },
    refreshUserProfile: vi.fn().mockResolvedValue({ success: true }),
  }),
  AuthProvider: ({ children }) => <>{children}</>,
}));

vi.mock('../../context/NotificationContext', () => ({
  useNotification: () => ({
    addSuccessNotification: vi.fn(),
    addErrorNotification: vi.fn(),
  }),
}));

vi.mock('../../context/ThemeContext', () => ({
  THEMES: { LIGHT: 'light', DARK: 'dark', SYSTEM: 'system' },
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

vi.mock('../../services/supabaseMediaService', () => ({
  supabaseMediaService: {
    uploadImage: vi.fn(),
  },
}));

describe('StudentSettings', () => {
  it('renders the settings layout and profile tab title', () => {
    render(
      <MemoryRouter>
        <StudentSettings />
      </MemoryRouter>
    );

    expect(screen.getByText(/student settings/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^profile$/i })
    ).toBeInTheDocument();
  });
});
