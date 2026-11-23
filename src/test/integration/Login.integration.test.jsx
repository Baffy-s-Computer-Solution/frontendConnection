import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithRouter, userEvent } from '../utils/test-utils';
import Login from '../../pages/auth/Login';

const authMocks = vi.hoisted(() => ({
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ ...authMocks, isOffline: false }),
}));

describe('Login integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authMocks.login.mockResolvedValue({ success: true, userType: 'student' });
    authMocks.loginWithGoogle.mockResolvedValue({ success: true, userType: 'student' });
  });

  it('renders accessible email and password fields', () => {
    renderWithRouter(<Login />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('rejects missing credentials before calling the authentication service', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(authMocks.login).not.toHaveBeenCalled();
  });

  it('rejects malformed email addresses before authentication', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);
    await user.type(screen.getByLabelText(/email address/i), 'invalid-email');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(authMocks.login).not.toHaveBeenCalled();
  });

  it('sends normalized credentials and remembers the email only when requested', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    fireEvent.change(emailInput, { target: { value: 'PERSON@example.org' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass9!' } });
    expect(emailInput).toHaveValue('PERSON@example.org');
    expect(passwordInput).toHaveValue('StrongPass9!');
    await user.click(screen.getByLabelText(/remember me/i));
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => expect(authMocks.login).toHaveBeenCalledWith({
      email: 'person@example.org',
      password: 'StrongPass9!',
    }));
    expect(localStorage.getItem('rememberedEmail')).toBe('PERSON@example.org');
  });

  it('shows the authentication error and exposes a working password visibility toggle', async () => {
    authMocks.login.mockResolvedValue({ success: false, error: 'wrong credentials' });
    const user = userEvent.setup();
    renderWithRouter(<Login />);
    const password = screen.getByLabelText(/^password$/i);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'person@example.org' } });
    fireEvent.change(password, { target: { value: 'wrong-password' } });
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(password).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toHaveAttribute('aria-pressed', 'true');
  });
});
