import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, CircleAlert, FileCheck2, RefreshCw } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getFundingApplications } from '../../services/youthServices';

const STATUS_LABELS = {
  pending: 'Pending review',
  submitted: 'Submitted',
  under_review: 'Under review',
  approved: 'Approved',
  rejected: 'Not approved',
  funded: 'Funded',
  completed: 'Completed',
};

const formatDate = (value) => {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Date unavailable';
};

const formatAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? `M${amount.toLocaleString()}` : 'Not specified';
};

export default function ReviewApplications() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const role = String(userProfile?.role || userProfile?.userType || '').toLowerCase();
  const canView = role === 'entrepreneur';
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadApplications = useCallback(async () => {
    if (!currentUser?.uid) {
      setApplications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    const result = await getFundingApplications(currentUser.uid);
    if (result.success) {
      setApplications(Array.isArray(result.data) ? result.data : []);
    } else {
      setApplications([]);
      setError('Your funding applications could not be loaded. Please try again.');
    }
    setLoading(false);
  }, [currentUser?.uid]);

  useEffect(() => {
    if (authLoading) return;
    if (canView && currentUser) {
      loadApplications();
    } else {
      setLoading(false);
    }
  }, [authLoading, canView, currentUser, loadApplications, refreshKey]);

  const filteredApplications = useMemo(
    () =>
      applications.filter(
        (application) => statusFilter === 'all' || application.status === statusFilter
      ),
    [applications, statusFilter]
  );

  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-6xl animate-pulse space-y-5 px-4 py-8 sm:px-6 lg:px-8" aria-label="Loading applications">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="h-28 rounded-2xl bg-slate-200" />
        <div className="h-44 rounded-2xl bg-slate-200" />
      </main>
    );
  }

  if (!currentUser || !canView) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          You do not have permission to view these applications.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Entrepreneur workspace</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">My funding applications</h1>
          <p className="mt-2 text-sm text-slate-600">Track review progress for funding requests you submitted.</p>
        </div>
        <label className="text-sm font-medium text-slate-700">
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
            <option value="all">All applications</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </header>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="ml-auto inline-flex items-center gap-1 font-semibold underline focus-visible:outline focus-visible:outline-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {filteredApplications.length === 0 && !error ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          {applications.length === 0 ? (
            <>
              <BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">No funding applications yet</h2>
              <p className="mt-2 text-sm text-slate-600">Applications you submit will appear here with their latest status.</p>
              <Link to="/entrepreneur-hub/funding" className="mt-5 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">
                Explore funding programs
              </Link>
            </>
          ) : filteredApplications.length > 0 ? (
            <>
              <FileCheck2 className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">No applications match this status</h2>
              <p className="mt-2 text-sm text-slate-600">Choose another status to see your submissions.</p>
            </>
          ) : null}
        </section>
      ) : (
        <section aria-label="Your funding applications" className="space-y-4">
          {filteredApplications.map((application) => {
            const status = String(application.status || 'pending').toLowerCase();
            return (
              <article key={application.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-semibold text-slate-900">
                      {application.programName || application.startupName || 'Funding application'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Submitted {formatDate(application.submittedAt || application.createdAt)}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {STATUS_LABELS[status] || status.replace(/_/g, ' ')}
                  </span>
                </div>
                <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Business</dt>
                    <dd className="mt-1 text-sm text-slate-900">{application.businessName || application.startupName || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Amount requested</dt>
                    <dd className="mt-1 text-sm text-slate-900">{formatAmount(application.fundingAmount ?? application.amountRequested)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last updated</dt>
                    <dd className="mt-1 text-sm text-slate-900">{formatDate(application.updatedAt || application.reviewedAt || application.submittedAt || application.createdAt)}</dd>
                  </div>
                </dl>
                {application.businessDescription && (
                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">{application.businessDescription}</p>
                )}
                {application.reviewNotes && (
                  <div className="mt-4 rounded-lg bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-800">Reviewer notes</h3>
                    <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{application.reviewNotes}</p>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
