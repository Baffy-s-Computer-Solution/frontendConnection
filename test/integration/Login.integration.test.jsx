// frontend/src/test/integration/Login.integration.test.jsx
// ============================================================
// Integration Tests: Login Flow
// ============================================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../utils/test-utils';
import Login from '../../src/pages/auth/Login';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:5000/api';

describe('Login Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render login form', () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const { user } = render(<Login />);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should show error for invalid email format', async () => {
    const { user } = render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should successfully login with valid credentials', async () => {
    const { user } = render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeTruthy();
    });
  });

  it('should show error for invalid credentials', async () => {
    server.use(
      http.post(`${API_BASE}/auth/login`, () => {
        return HttpResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      })
    );

    const { user } = render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    server.use(
      http.post(`${API_BASE}/auth/login`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({
          success: true,
          data: { user: { id: 1 }, token: 'token' },
        });
      })
    );

    const { user } = render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    const { user } = render(<Login />);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('should navigate to forgot password', async () => {
    const { user } = render(<Login />);
    const forgotLink = screen.getByText(/forgot password/i);
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('forgot')
    );
  });

  it('should navigate to register', () => {
    render(<Login />);
    const registerLink = screen.getByText(/create an account/i);
    expect(registerLink.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('register')
    );
  });
});