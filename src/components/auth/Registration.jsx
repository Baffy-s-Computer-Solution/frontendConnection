import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { authAPI, testConnection } from '../../services/api';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { CheckCircle2, CircleAlert, Loader2, Server, UserRound, Building2, Mail, LockKeyhole } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    userType: 'student',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  const navigate = useNavigate();

  // Check server connection on component mount
  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      const result = await testConnection();
      setServerStatus(result.connected ? 'connected' : 'disconnected');

      if (!result.connected) {
        setErrors({ server: result.message });
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.server;
          return newErrors;
        });
      }
    } catch (error) {
      setServerStatus('disconnected');
      setErrors({
        server: 'Failed to check server connection. Make sure backend is running on port 5000.',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^.@]+@[^.@]+.[^.@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await authAPI.register({
        userType: formData.userType,
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
      });

      if (result.success) {
        setSuccessMessage(result.message || 'Registration successful!');

        // Reset form
        setFormData({
          userType: 'student',
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
        });

        // Redirect to appropriate dashboard after 2 seconds
        setTimeout(() => {
          const dashboardPath =
            result.data.user.userType === 'student'
              ? '/student'
              : result.data.user.userType === 'company'
                ? '/company'
                : '/';
          navigate(dashboardPath);
        }, 2000);
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);

      // Enhanced error handling
      let errorMessage = error.message || 'Registration failed. Please try again.';

      if (errorMessage.includes('HTML instead of JSON')) {
        errorMessage =
          'Backend server error. Please ensure the backend is running correctly on port 5000.';
      } else if (
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Failed to fetch')
      ) {
        errorMessage =
          'Cannot connect to server. Please ensure the backend is running on http://localhost:5000';
      } else if (errorMessage.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused. Please start the backend server on port 5000.';
      }

      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <section className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-pop dark:bg-slate-900 sm:p-10">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300"><UserRound className="h-7 w-7" /></div>
          <h1 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-slate-100">Career Connect Lesotho</h1>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Create Your Account</h2>
          <p className="mt-2 text-sm text-slate-500">Join Career Connect Lesotho today</p>

          {/* Server Status Indicator */}
          <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${serverStatus === 'connected' ? 'bg-success-light text-success-dark' : serverStatus === 'checking' ? 'bg-warning-light text-warning-dark' : 'bg-danger-light text-danger-dark'}`}>
            {serverStatus === 'connected' && <CheckCircle2 className="h-4 w-4" />}
            {serverStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
            {serverStatus === 'disconnected' && <CircleAlert className="h-4 w-4" />}
            {serverStatus === 'connected' ? 'Server Connected' : serverStatus === 'checking' ? 'Checking Server...' : 'Server Disconnected'}
          </div>
        </div>

        {successMessage && <div className="mt-6 rounded-lg border border-success/20 bg-success-light p-4 text-sm text-success-dark">{successMessage}</div>}

        {errors.server && (
          <div className="mt-6 rounded-lg border border-danger/20 bg-danger-light p-4 text-sm text-danger-dark">
            <p>{errors.server}</p>
            <button type="button" onClick={checkServerConnection} className="mt-3 font-medium underline underline-offset-2">
              Retry Connection
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* User Type Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">I am a:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${formData.userType === 'student' ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                onClick={() => setFormData((prev) => ({ ...prev, userType: 'student' }))}
              >
                <><UserRound className="h-4 w-4" />Student</>
              </button>
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${formData.userType === 'company' ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                onClick={() => setFormData((prev) => ({ ...prev, userType: 'company' }))}
              >
                <><Building2 className="h-4 w-4" />Company</>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <Input
              id="fullName"
              label="Full Name"
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={isLoading}
              error={errors.fullName}
              leadingIcon={UserRound}
            />

          {/* Email */}
          <Input
              id="email"
              label="Email Address"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              disabled={isLoading}
              error={errors.email}
              leadingIcon={Mail}
            />

          {/* Password */}
          <Input
              id="password"
              label="Password"
              type="password"
              showPasswordToggle
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min. 6 characters)"
              disabled={isLoading}
              error={errors.password}
              leadingIcon={LockKeyhole}
            />

          {/* Confirm Password */}
          <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              showPasswordToggle
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isLoading}
              error={errors.confirmPassword}
              leadingIcon={LockKeyhole}
            />

          {/* Submit Error */}
          {errors.submit && <div className="rounded-lg border border-danger/20 bg-danger-light p-4 text-sm text-danger-dark">{errors.submit}</div>}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={isLoading || serverStatus !== 'connected'}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 border-t pt-5 text-center text-sm text-slate-500">
          <p>
            Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
          </p>
        </div>

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 rounded-lg bg-slate-100 p-3 text-xs text-slate-500 dark:bg-slate-800">
            <details>
              <summary>Debug Info</summary>
              <p>API Base URL: {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}</p>
              <p>Server Status: {serverStatus}</p>
              <p>Backend URL: http://localhost:5000</p>
            </details>
          </div>
        )}
      </section>
    </main>
  );
};

export default Register;
