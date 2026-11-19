import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, Mail, MailCheck, RefreshCw } from 'lucide-react';
import { sendEmailVerification, applyActionCode, checkActionCode } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../config/firebase';
import Button from '../ui/Button';

const steps = [
  ['Check your inbox', 'Look for an email from us in your inbox. It might take a few minutes to arrive.'],
  ['Click the verification link', 'Click the link in the email to verify your email address. This link expires in 24 hours.'],
  ['Return to this page', 'After clicking the link, return here and click "I\'ve Verified" to continue.'],
];

export default function EmailVerification() {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get('oobCode');
    const mode = queryParams.get('mode');
    if (oobCode && mode === 'verifyEmail') {
      handleVerification(oobCode);
    } else {
      const user = auth.currentUser;
      if (user) {
        setUserEmail(user.email || '');
        if (user.emailVerified) setSuccess(true);
      }
    }
  }, [location]);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerification = async (oobCode) => {
    setVerifying(true);
    setError('');
    try {
      await applyActionCode(auth, oobCode);
      await auth.currentUser.reload();
      setSuccess(true);
    } catch (verificationError) {
      try {
        await checkActionCode(auth, oobCode);
        setError('Failed to verify email. Please try again.');
      } catch (checkError) {
        if (checkError.code === 'auth/expired-action-code') setError('The verification link has expired. Please request a new one.');
        else if (checkError.code === 'auth/invalid-action-code') setError('The verification link is invalid. Please request a new one.');
        else setError('Failed to verify email. Please request a new verification link.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleSendVerification = async () => {
    const user = auth.currentUser;
    if (!user) { setError('No user logged in'); return; }
    if (user.emailVerified) { setSuccess(true); return; }
    setLoading(true);
    setError('');
    try {
      await sendEmailVerification(user, { url: `${window.location.origin}/email-verified`, handleCodeInApp: true });
      setEmailSent(true);
      setCountdown(60);
    } catch (sendError) {
      if (sendError.code === 'auth/too-many-requests') setError('Too many requests. Please try again later.');
      else if (sendError.code === 'auth/network-request-failed') setError('Network error. Please check your connection.');
      else setError('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setLoading(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) setSuccess(true);
    } catch {
      setError('Failed to refresh status');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  if (verifying) return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950"><section className="w-full max-w-lg rounded-2xl border bg-white p-10 text-center shadow-pop dark:bg-slate-900"><RefreshCw className="mx-auto h-14 w-14 animate-spin text-brand-600" aria-label="Verifying" /><h1 className="mt-6 text-xl font-semibold text-slate-900 dark:text-slate-100">Verifying your email...</h1></section></main>;

  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950"><section className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-pop dark:bg-slate-900 sm:p-10">
    <div className="text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">{success ? <MailCheck className="h-8 w-8" /> : <Mail className="h-8 w-8" />}</div><h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{success ? 'Email Verified!' : 'Verify Your Email'}</h1>{userEmail && !success && <p className="mt-3 text-sm text-slate-500">We've sent a verification email to <strong className="text-slate-700 dark:text-slate-300">{userEmail}</strong></p>}</div>
    {error && <div className="mt-5 flex items-start gap-3 rounded-lg border border-danger/20 bg-danger-light p-4 text-sm text-danger-dark" role="alert"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><span className="flex-1">{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error">&times;</button></div>}
    {success ? <div className="mt-6 text-center"><div className="rounded-lg border border-success/20 bg-success-light p-4 text-sm text-success-dark"><CheckCircle2 className="mx-auto mb-2 h-6 w-6" />Your email has been successfully verified!</div><p className="mt-4 text-sm text-slate-600 dark:text-slate-300">You now have full access to all features of your account.</p><div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center"><Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button><Button variant="outline" onClick={() => navigate('/profile')}>Complete Profile</Button></div></div> : <><ol className="mt-8 space-y-5">{steps.map(([title, description], index) => <li key={title} className="flex gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${emailSent && index === 0 ? 'bg-success text-white' : index === 0 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{emailSent && index === 0 ? <CheckCircle2 className="h-4 w-4" /> : index + 1}</span><div><h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></li>)}</ol><div className="mt-8">{!emailSent ? <Button fullWidth variant="primary" size="lg" onClick={handleSendVerification} loading={loading}>Send Verification Email</Button> : <Button fullWidth variant="primary" size="lg" onClick={handleRefreshStatus} disabled={loading || countdown > 0} loading={loading} leadingIcon={RefreshCw}>I've Verified My Email</Button>}{countdown > 0 && <p className="mt-2 text-center text-xs text-slate-500">You can request another email in {countdown} seconds</p>}</div><div className="mt-6 flex justify-between border-t pt-5 text-sm"><button type="button" onClick={() => navigate(-1)} className="text-brand-600 hover:text-brand-700">&larr; Go Back</button><button type="button" onClick={handleLogout} className="text-brand-600 hover:text-brand-700">Logout</button></div>{emailSent && <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800/60"><h2 className="font-semibold text-slate-900 dark:text-slate-100">Didn't receive the email?</h2><ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500"><li>Check your spam or junk folder</li><li>Make sure {userEmail} is the correct email address</li><li><button type="button" onClick={handleSendVerification} disabled={countdown > 0} className="font-medium text-brand-600 disabled:opacity-50">Click here to resend verification email</button></li></ul></div>}</>}
  </section></main>;
}
