import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { useAuth } from '../../context/AuthContext';
import { getDashboardPathByUserType } from '../../utils/authRoleUtils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

/**
 * Professional Login Component
 * Features:
 * - Clean, modern UI
 * - Mobile-friendly design
 * - Proper error handling
 * - Google Sign-in with fallback
 * - Security features (session detection, rate limiting)
 */
const LoginPro = () => {
  const { login, loginWithGoogle, isOffline } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Security State
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    // Handle redirect messages
    const { message, type } = location.state || {};
    if (message) {
      if (type === 'success') {
        setSuccess(message);
      } else {
        setError(message);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.message, location.state?.type]);

  useEffect(() => {
    // Load remembered email
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  // ==================== LOCKOUT TIMER ====================
  useEffect(() => {
    if (!isLocked || lockTimeRemaining <= 0) return;

    const timer = setTimeout(() => {
      setLockTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setLoginAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLocked, lockTimeRemaining]);

  // ==================== VALIDATION ====================
  const validateEmail = useCallback((email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return pattern.test(email);
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    return errors;
  }, [email, password, validateEmail]);

  // ==================== HANDLERS ====================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading || googleLoading) return;
    if (isLocked) return;

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please correct the errors below');
      return;
    }

    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      if (isOffline) {
        throw new Error('You are offline. Please check your internet connection.');
      }

      // Call login API
      const result = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!result.success) {
        // Handle specific error cases
        const message = result.error || 'Login failed. Please try again.';

        if (
          message.includes('not found') ||
          message.includes('not registered') ||
          message.includes('Kindly register')
        ) {
          setError('No account found with this email. Please sign up first.');
          setFieldErrors({ email: 'Email not registered' });
        } else if (message.includes('wrong password') || message.includes('credentials')) {
          setError('Incorrect email or password. Please try again.');
          setFieldErrors({ password: 'Invalid password' });

          // Rate limiting
          const attempts = loginAttempts + 1;
          setLoginAttempts(attempts);

          if (attempts >= 5) {
            setIsLocked(true);
            setLockTimeRemaining(900); // 15 minutes
            setError(
              'Too many failed login attempts. Please try again in 15 minutes or reset your password.'
            );
          }
        } else if (message.includes('pending')) {
          setError(
            '⏳ Your account is pending admin verification. You will receive an email once approved.'
          );
        } else if (message.includes('suspended')) {
          setError('Your account has been suspended. Please contact support.');
        } else if (message.includes('verify')) {
          setError('Please verify your email address before logging in.');
        } else {
          setError(message);
        }

        return;
      }

      // Success!
      setSuccess('✓ Logged in successfully!');
      setLoginAttempts(0);

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Determine redirect path
      const dashboardPath = getDashboardPathByUserType(
        result.userType || result.profile?.userType || 'student'
      );

      // Navigate after brief delay
      setTimeout(() => {
        navigate(dashboardPath, { replace: true });
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading || loading) return;

    setGoogleLoading(true);
    setError('');

    try {
      const result = await loginWithGoogle();

      if (!result.success) {
        // Better error messages for Google sign-in
        let message = result.error || 'Google sign-in failed';

        if (
          message.includes('cancelled') ||
          message.includes('popup-closed') ||
          message.includes('user cancelled')
        ) {
          setError('Google sign-in was cancelled. Please try again or use email/password.');
        } else if (message.includes('popup-blocked')) {
          setError('Popup blocked. Please allow popups for this site and try again.');
        } else if (message.includes('not authorized') || message.includes('unauthorized')) {
          setError('This domain is not authorized for Google sign-in. Contact support.');
        } else if (message.includes('pending')) {
          setError('Your company account is pending admin verification. Please wait for approval.');
        } else {
          setError(message);
        }
        return;
      }

      // Check if account needs verification
      if (result.profile?.status === 'pending_approval') {
        setSuccess('✓ Account verified! Redirecting...');
        setError('');
      } else {
        setSuccess('✓ Signed in successfully!');
        setError('');
      }

      // Navigate
      const dashboardPath = getDashboardPathByUserType(result.userType || result.profile?.userType);
      setTimeout(() => {
        navigate(dashboardPath, { replace: true });
      }, 500);
    } catch (err) {
      console.error('Google login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // ==================== RENDER ====================
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <section className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-pop dark:bg-slate-900 sm:p-10">
                <div className="mb-5 flex justify-start">
                  <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <span aria-hidden="true">🏠</span>
                    Home
                  </Link>
                </div>

                {/* Header */}
                <div className="mb-6 text-center">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Welcome Back</h1>
                  <p className="mt-2 text-sm text-slate-500">Sign in to your Career Connect account</p>
                </div>

                {/* Success Alert */}
                {success && (
                  <div className="mb-4 flex items-center gap-3 rounded-lg border border-success/20 bg-success-light p-4 text-sm text-success-dark">
                    <FaCheckCircle aria-hidden />
                    <div>{success}</div>
                  </div>
                )}

                {/* Error Alert */}
                {error && (
                  <div className="mb-4 flex items-center gap-3 rounded-lg border border-danger/20 bg-danger-light p-4 text-sm text-danger-dark">
                    <FaExclamationTriangle aria-hidden />
                    <div>{error}</div>
                  </div>
                )}

                {/* Offline Alert */}
                {isOffline && (
                  <div className="mb-4 flex items-center gap-3 rounded-lg border border-info/20 bg-info-light p-4 text-sm text-info-dark">
                    <FaInfoCircle aria-hidden />
                    <div>You are offline. Some features may not be available.</div>
                  </div>
                )}

                {/* Google Login */}
                <Button
                  variant="outline"
                  size="lg"
                  className="mb-4 w-full"
                  leadingIcon={FaGoogle}
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || loading || isLocked}
                >
                  {googleLoading ? 'Connecting with Google...' : 'Sign in with Google'}
                </Button>

                <div className="mb-6 flex items-center gap-3 text-center text-xs text-slate-400">
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span>or continue with email</span>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>

                {/* Login Form */}
                <form noValidate onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <Input
                    id="login-email"
                    label="Email Address"
                    type="email"
                    size="large"
                    placeholder="you@example.com"
                    value={email}
                    leadingIcon={FaEnvelope}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({ ...prev, email: '' }));
                        }
                      }}
                    error={fieldErrors.email}
                      disabled={loading || googleLoading || isLocked}
                  />

                  {/* Password */}
                  <Input
                    id="login-password"
                    label="Password"
                    type="password"
                    size="large"
                    placeholder="••••••••"
                    value={password}
                    leadingIcon={FaLock}
                    showPasswordToggle
                    onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) {
                            setFieldErrors((prev) => ({ ...prev, password: '' }));
                          }
                        }}
                    error={fieldErrors.password}
                    disabled={loading || googleLoading || isLocked}
                  />

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading || googleLoading || isLocked}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      Remember me
                    </label>
                    <Link to="/forgot-password" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Lockout Warning */}
                  {isLocked && (
                    <div className="rounded-lg border border-danger/20 bg-danger-light p-4 text-sm text-danger-dark">
                      <div className="flex items-center gap-2">
                        <FaExclamationTriangle aria-hidden />
                        Too many attempts. Try again in {Math.ceil(lockTimeRemaining / 60)} minutes
                      </div>
                    </div>
                  )}

                  {/* Login Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={loading || googleLoading || isLocked}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-6 border-t pt-5 text-center">
                  <p className="text-sm text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                      Sign up here
                    </Link>
                  </p>
                </div>

                {/* Additional Links */}
                <div className="mt-4 flex justify-center gap-4 text-xs">
                  <Link to="/" className="text-slate-500 hover:text-brand-600">
                    Home
                  </Link>
                  <Link to="/contact" className="text-slate-500 hover:text-brand-600">
                    Support
                  </Link>
                </div>
      </section>
    </main>
  );
};

export default LoginPro;
