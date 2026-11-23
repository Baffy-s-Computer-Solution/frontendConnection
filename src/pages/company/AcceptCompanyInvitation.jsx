import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, LoaderCircle, Mail, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../services/apiConfig';
import { apiRequest } from '../../services/apiClient';

const AcceptCompanyInvitation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { currentUser, logout, resendVerificationEmail } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    let active = true;
    const loadInvitation = async () => {
      if (!token) {
        setError('This invitation link is missing its security token.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/company/team-invitations/${encodeURIComponent(token)}`,
          { headers: { Accept: 'application/json' } }
        );
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(result?.error || 'This invitation is unavailable or has expired.');
        }
        if (active) setInvitation(result?.data);
      } catch (loadError) {
        if (active) setError(loadError.message || 'This invitation could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadInvitation();
    return () => { active = false; };
  }, [token]);

  const handleAccept = async () => {
    setError('');
    if (!currentUser) {
      setError('Sign in with the invited email address before accepting this invitation.');
      return;
    }
    if (!currentUser.emailVerified) {
      setError('Verify your email address, then return to this invitation link.');
      return;
    }

    setAccepting(true);
    try {
      await apiRequest(`/api/company/team-invitations/${encodeURIComponent(token)}/accept`, {
        method: 'POST',
        body: {},
      });
      await logout();
      setAccepted(true);
    } catch (acceptError) {
      setError(acceptError.message || 'The invitation could not be accepted.');
    } finally {
      setAccepting(false);
    }
  };

  const handleResendVerification = async () => {
    setSendingVerification(true);
    setError('');
    try {
      const result = await resendVerificationEmail();
      if (result?.success === false) throw new Error(result.error || 'Verification email could not be sent.');
      setError('A verification email has been sent. Verify your address, then reopen this invitation.');
    } catch (verificationError) {
      setError(verificationError.message || 'Verification email could not be sent.');
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <Building2 aria-hidden="true" />
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300" role="status">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading invitation…
          </div>
        ) : accepted ? (
          <>
            <CheckCircle2 className="mb-4 h-10 w-10 text-green-600" aria-hidden="true" />
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Invitation accepted</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Your company staff access is ready. Sign in again to open your team workspace.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
            >
              Sign in
            </Link>
          </>
        ) : invitation ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Company invitation</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Join {invitation.companyName}
            </h1>
            <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> Invited account: {invitation.maskedEmail}</p>
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> {invitation.role}</p>
            </div>
            {error && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200" role="alert">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              {currentUser ? (
                <>
                  {!currentUser.emailVerified && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={sendingVerification}
                      className="rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {sendingVerification ? 'Sending…' : 'Resend verification email'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={accepting || !currentUser.emailVerified}
                    className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {accepting ? 'Accepting…' : 'Accept invitation'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
                  >
                    Sign in to accept
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
            {!currentUser && (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Use the invited email address. If you need an account, create one with that email, set your own password, verify it, then return here.
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Invitation unavailable</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {error || 'This invitation could not be found.'}
            </p>
            <Link to="/login" className="mt-6 inline-block font-medium text-blue-700 hover:underline dark:text-blue-300">
              Go to sign in
            </Link>
          </>
        )}
      </section>
    </main>
  );
};

export default AcceptCompanyInvitation;
