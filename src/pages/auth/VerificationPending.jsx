import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaClock, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import Button from '../../components/ui/Button';

/**
 * Verification Pending Page
 * Shows when a user (especially company) needs admin approval
 */
const VerificationPending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType || 'account';
  const message = location.state?.message;

  useEffect(() => {
    // If no state, redirect to home
    if (!location.state) {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const getUserTypeLabel = (type) => {
    const labels = {
      company: 'Company',
      mentor: 'Mentor',
      institute: 'Institute',
      entrepreneur: 'Entrepreneur',
      account: 'Account',
    };
    return labels[type] || 'Account';
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <section className="w-full max-w-xl rounded-2xl border bg-white p-6 text-center shadow-pop dark:bg-slate-900 sm:p-10">
                {/* Icon */}
                <div className="mb-6">
                  <FaClock className="mx-auto h-14 w-14 text-warning" aria-hidden />
                </div>

                {/* Title */}
                <h1 className="mb-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {getUserTypeLabel(userType)} Verification Pending
                </h1>

                {/* Message */}
                <p className="mb-6 text-base leading-7 text-slate-500 dark:text-slate-400">
                  {message ||
                    `Your ${getUserTypeLabel(userType).toLowerCase()} account has been created and is now awaiting admin verification.`}
                </p>

                {/* Info Cards */}
                <div className="mb-6 flex gap-3 rounded-xl border border-info/20 bg-info-light p-4 text-left text-info-dark">
                  <div className="shrink-0 pt-0.5">
                    <FaEnvelope aria-hidden />
                  </div>
                  <div className="text-sm leading-6">
                    <strong>Check your email</strong>
                    <br />
                    We've sent you a confirmation email. You'll receive another email once your
                    account is approved.
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-6 rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800/60">
                  <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">What happens next?</h2>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success text-sm font-bold text-white">
                        ✓
                      </div>
                      <div>
                        <strong className="text-sm text-slate-900 dark:text-slate-100">Account Created</strong>
                        <p className="mt-1 text-xs text-slate-500">
                          Your account details have been saved
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning text-sm font-bold text-white">
                        ⏳
                      </div>
                      <div>
                        <strong className="text-sm text-slate-900 dark:text-slate-100">Awaiting Verification</strong>
                        <p className="mt-1 text-xs text-slate-500">
                          Our admin team is reviewing your information (usually 24-48 hours)
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-300 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        3
                      </div>
                      <div>
                        <strong className="text-sm text-slate-900 dark:text-slate-100">Approved & Active</strong>
                        <p className="mt-1 text-xs text-slate-500">
                          You'll receive an approval email and can start using Career Connect
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button variant="primary" size="lg" className="w-full" disabled leadingIcon={FaClock}>
                    Pending Approval
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/')}
                    leadingIcon={FaArrowLeft}
                  >
                    Back to Home
                  </Button>
                </div>

                {/* Tips */}
                <div className="mt-6 border-t pt-5">
                  <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Questions?</h3>
                  <p className="mb-3 text-xs leading-6 text-slate-500">
                    If you don't receive a verification email within 24 hours, check your spam
                    folder or{' '}
                    <Link to="/contact" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                      contact support
                    </Link>
                    .
                  </p>
                </div>
      </section>
    </main>
  );
};

export default VerificationPending;
