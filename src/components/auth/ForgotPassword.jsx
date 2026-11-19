import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { auth } from '../../config/firebase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim()) { setFieldError('Email is required'); return false; }
    if (!/^[^.@]+@[^.@]+\.[^.@]+$/.test(email)) { setFieldError('Please enter a valid email address'); return false; }
    setFieldError('');
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSubmittedEmail(email);
      setSuccess(true);
    } catch (submitError) {
      if (submitError.code === 'auth/user-not-found') setError('No account found with this email address.');
      else if (submitError.code === 'auth/too-many-requests') setError('Too many requests. Please try again later.');
      else if (submitError.code === 'auth/invalid-email') setError('Invalid email address format.');
      else if (submitError.code === 'auth/network-request-failed') setError('Network error. Please check your connection.');
      else setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950"><section className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-pop dark:bg-slate-900 sm:p-10"><div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300"><Mail className="h-7 w-7" /></div><h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Reset Password</h1><p className="mt-3 text-sm leading-6 text-slate-500">Enter your email address and we'll send you instructions to reset your password.</p></div>{error && <div className="mt-5 rounded-lg border border-danger/20 bg-danger-light p-4 text-sm text-danger-dark" role="alert">{error}</div>}{success ? <div className="mt-6 text-center"><div className="rounded-lg border border-success/20 bg-success-light p-4 text-sm text-success-dark"><CheckCircle2 className="mx-auto mb-2 h-6 w-6" />Password reset email sent successfully!</div><p className="mt-4 text-sm text-slate-600 dark:text-slate-300">We've sent an email to <strong>{submittedEmail}</strong> with instructions to reset your password.</p><p className="mt-4 text-sm text-slate-500">Didn't receive the email? Check your spam folder or <button type="button" onClick={() => { setSuccess(false); setEmail(submittedEmail); }} disabled={loading} className="font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50">click here to resend</button></p><div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center"><Button variant="outline" leadingIcon={ArrowLeft} onClick={() => navigate('/login')}>Back to Login</Button><Link to="/login" className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">Continue to Login</Link></div></div> : <form className="mt-6" onSubmit={handleSubmit}><Input id="email" label="Email Address" type="email" autoComplete="email" autoFocus value={email} onChange={(event) => { setEmail(event.target.value); setFieldError(''); }} error={fieldError} disabled={loading} leadingIcon={Mail} required /><Button type="submit" fullWidth variant="primary" size="lg" className="mt-5" loading={loading} trailingIcon={Send}>{loading ? 'Sending...' : 'Send Reset Instructions'}</Button><div className="mt-5 text-center"><button type="button" onClick={() => navigate('/login')} className="text-sm font-medium text-brand-600 hover:text-brand-700">&larr; Back to Login</button></div></form>}<p className="mt-8 border-t pt-5 text-center text-xs text-slate-500">For security reasons, password reset links expire after 1 hour.</p></section></main>;
}
