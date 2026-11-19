import { useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert, LockKeyhole, RefreshCw } from 'lucide-react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { auth } from '../../config/firebase';

const strengthClasses = { weak: 'w-1/3 bg-danger', medium: 'w-2/3 bg-warning', strong: 'w-full bg-success' };

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const oobCode = queryParams.get('oobCode');
  const mode = queryParams.get('mode');

  useEffect(() => { verifyCode(); }, [oobCode]);

  const verifyCode = async () => {
    if (!oobCode || mode !== 'resetPassword') { setError('Invalid or missing reset code'); setVerifying(false); return; }
    try { setEmail(await verifyPasswordResetCode(auth, oobCode)); } catch (verificationError) {
      if (verificationError.code === 'auth/expired-action-code') setError('The reset link has expired. Please request a new one.');
      else if (verificationError.code === 'auth/invalid-action-code') setError('The reset link is invalid. Please request a new one.');
      else if (verificationError.code === 'auth/user-disabled') setError('This account has been disabled.');
      else if (verificationError.code === 'auth/user-not-found') setError('No account found for this reset link.');
      else setError('Failed to verify reset code. Please try again.');
    } finally { setVerifying(false); }
  };

  const passwordErrors = (password) => [password.length < 8 && 'At least 8 characters', !/[A-Z]/.test(password) && 'One uppercase letter', !/[a-z]/.test(password) && 'One lowercase letter', !/[0-9]/.test(password) && 'One number', !/[!@#$%^&*]/.test(password) && 'One special character (!@#$%^&*)'].filter(Boolean);
  const calculateStrength = (password) => { if (!password) return ''; let score = 0; if (password.length >= 8) score += 1; if (password.length >= 12) score += 1; if (/[A-Z]/.test(password)) score += 1; if (/[a-z]/.test(password)) score += 1; if (/[0-9]/.test(password)) score += 1; if (/[!@#$%^&*]/.test(password)) score += 1; return score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'; };
  const handlePasswordChange = (event) => { const password = event.target.value; setNewPassword(password); setPasswordStrength(calculateStrength(password)); setFieldErrors((current) => ({ ...current, newPassword: '', confirmPassword: confirmPassword && password !== confirmPassword ? 'Passwords do not match' : '' })); };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const requirements = passwordErrors(newPassword);
    if (!newPassword) nextErrors.newPassword = 'Password is required'; else if (requirements.length) nextErrors.newPassword = requirements.join(', ');
    if (!confirmPassword) nextErrors.confirmPassword = 'Please confirm your password'; else if (newPassword !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true); setError('');
    try { await confirmPasswordReset(auth, oobCode, newPassword); setSuccess(true); } catch (resetError) {
      if (resetError.code === 'auth/expired-action-code') setError('The reset link has expired. Please request a new one.');
      else if (resetError.code === 'auth/invalid-action-code') setError('The reset link is invalid. Please request a new one.');
      else if (resetError.code === 'auth/weak-password') setError('Password is too weak. Please choose a stronger password.');
      else setError('Failed to reset password. Please try again.');
    } finally { setLoading(false); }
  };

  if (verifying) return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950"><section className="w-full max-w-lg rounded-2xl border bg-white p-10 text-center shadow-pop dark:bg-slate-900"><RefreshCw className="mx-auto h-14 w-14 animate-spin text-brand-600" aria-label="Verifying" /><h1 className="mt-6 text-xl font-semibold text-slate-900 dark:text-slate-100">Verifying reset link...</h1></section></main>;

  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950"><section className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-pop dark:bg-slate-900 sm:p-10"><div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300"><LockKeyhole className="h-7 w-7" /></div><h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{success ? 'Password Reset Complete' : 'Create New Password'}</h1></div>{error && <div className="mt-5 flex items-start gap-3 rounded-lg border border-danger/20 bg-danger-light p-4 text-sm text-danger-dark" role="alert"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><span className="flex-1">{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error">&times;</button></div>}{success ? <div className="mt-6 text-center"><div className="rounded-lg border border-success/20 bg-success-light p-4 text-sm text-success-dark"><CheckCircle2 className="mx-auto mb-2 h-6 w-6" />Your password has been successfully reset!</div><p className="mt-4 text-sm text-slate-500">You can now log in with your new password.</p><Button variant="primary" size="lg" className="mt-6" onClick={() => navigate('/login')}>Go to Login</Button></div> : <form className="mt-6 space-y-5" onSubmit={handleSubmit}>{email && <div className="rounded-lg border border-info/20 bg-info-light p-4 text-sm text-info-dark">Resetting password for: <strong>{email}</strong></div>}<Input id="newPassword" label="New Password" type="password" showPasswordToggle autoComplete="new-password" value={newPassword} onChange={handlePasswordChange} error={fieldErrors.newPassword} disabled={loading} leadingIcon={LockKeyhole} required />{newPassword && <div><div className="flex justify-between text-xs text-slate-500"><span>Password strength</span><span className="font-medium capitalize">{passwordStrength}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className={`h-full rounded-full transition-all ${strengthClasses[passwordStrength] || 'w-0'}`} /></div></div>}<Input id="confirmPassword" label="Confirm New Password" type="password" showPasswordToggle autoComplete="new-password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setFieldErrors((current) => ({ ...current, confirmPassword: '' })); }} error={fieldErrors.confirmPassword} disabled={loading} leadingIcon={LockKeyhole} required /><Button type="submit" fullWidth variant="primary" size="lg" loading={loading}>{loading ? 'Resetting...' : 'Reset Password'}</Button><div className="text-center"><button type="button" onClick={() => navigate('/login')} className="text-sm font-medium text-brand-600 hover:text-brand-700">&larr; Back to Login</button></div></form>}</section></main>;
}
