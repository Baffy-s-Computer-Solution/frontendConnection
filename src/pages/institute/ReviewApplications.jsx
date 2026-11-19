import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleAlert, FileCheck2, RefreshCw } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { institutionService } from '../../services/institutionServices';

const STATUS_LABELS = {
  pending: 'Pending',
  under_review: 'Under review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const formatDate = (value) => {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Date unavailable';
};

export default function ReviewApplications() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const role = String(userProfile?.role || userProfile?.userType || '').toLowerCase();
  const canReview = role === 'institute';
  const [institution, setInstitution] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [drafts, setDrafts] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const loadApplications = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const profile = await institutionService.getInstitutionProfile(currentUser.uid);
      const records = await institutionService.getRecentApplications(profile.id, 50);
      setInstitution(profile);
      setApplications(Array.isArray(records) ? records : []);
    } catch {
      setError('Applications could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!authLoading && canReview && currentUser) {
      loadApplications();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, canReview, currentUser, loadApplications, refreshKey]);

  const visibleApplications = useMemo(
    () => applications.filter((application) => filter === 'all' || application.status === filter),
    [applications, filter]
  );

  const updateDraft = (applicationId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [applicationId]: { ...current[applicationId], [field]: value },
    }));
  };

  const saveReview = async (application) => {
    if (!canReview || !institution?.id || updatingId) return;
    const draft = drafts[application.id] || {};
    const status = draft.status || application.status || 'pending';
    const notes = typeof draft.notes === 'string' ? draft.notes.trim() : application.reviewNotes || '';
    if (!['under_review', 'approved', 'rejected'].includes(status)) {
      setError('Choose a valid review status.');
      return;
    }

    setUpdatingId(application.id);
    setError('');
    setNotice('');
    try {
      await institutionService.updateApplicationStatus(application.id, status, notes);
      setApplications((current) =>
        current.map((item) => (item.id === application.id ? { ...item, status, reviewNotes: notes } : item))
      );
      setDrafts((current) => {
        const next = { ...current };
        delete next[application.id];
        return next;
      });
      setNotice(`Application for ${application.studentName || 'student'} updated.`);
    } catch {
      setError('The review could not be saved. Please try again.');
      setRefreshKey((key) => key + 1);
    } finally {
      setUpdatingId('');
    }
  };

  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-6xl animate-pulse space-y-5 px-4 py-8 sm:px-6 lg:px-8" aria-label="Loading applications">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="h-44 rounded-2xl bg-slate-200" />
        <div className="h-44 rounded-2xl bg-slate-200" />
      </main>
    );
  }

  if (!currentUser || !canReview) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          You do not have permission to review institution applications.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Institute workspace</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Applications</h1>
          <p className="mt-2 text-sm text-slate-600">{institution?.name || 'Review student applications and send an update.'}</p>
        </div>
        <label className="text-sm font-medium text-slate-700">
          Status
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
            <option value="pending">Pending</option>
            <option value="under_review">Under review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All applications</option>
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
      {notice && <p className="mb-5 text-sm text-emerald-700" role="status">{notice}</p>}

      {visibleApplications.length === 0 && !error ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <FileCheck2 className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No applications in this view</h2>
          <p className="mt-2 text-sm text-slate-600">Try another status or check back when new applications arrive.</p>
          <Link to="/institute/students" className="mt-5 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">
            View students
          </Link>
        </section>
      ) : visibleApplications.length > 0 ? (
        <section aria-label="Institution applications" className="space-y-4">
          {visibleApplications.map((application) => {
            const draft = drafts[application.id] || {};
            const status = draft.status ?? application.status ?? 'pending';
            const notes = draft.notes ?? application.reviewNotes ?? '';
            return (
              <article key={application.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-semibold text-slate-900">{application.studentName || 'Student applicant'}</h2>
                    <p className="mt-1 text-sm text-slate-600">{application.program || 'Program not specified'} · Submitted {formatDate(application.submittedAt || application.createdAt)}</p>
                    {application.studentEmail && <p className="mt-1 break-all text-sm text-slate-600">{application.studentEmail}</p>}
                  </div>
                  <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {STATUS_LABELS[application.status] || String(application.status || 'pending').replace(/_/g, ' ')}
                  </span>
                </div>
                {application.personalStatement ? (
                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">{application.personalStatement}</p>
                ) : null}
                <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:items-end">
                  <label className="text-sm font-medium text-slate-700">
                    Review status
                    <select value={status} onChange={(event) => updateDraft(application.id, 'status', event.target.value)} disabled={updatingId === application.id} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-60">
                      <option value="pending">Pending</option>
                      <option value="under_review">Under review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Notes for the student
                    <textarea rows={2} maxLength={1000} value={notes} onChange={(event) => updateDraft(application.id, 'notes', event.target.value)} disabled={updatingId === application.id} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-60" />
                  </label>
                  <button type="button" onClick={() => saveReview(application)} disabled={updatingId === application.id} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                    {updatingId === application.id ? 'Saving…' : 'Save review'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </main>
  );
}
