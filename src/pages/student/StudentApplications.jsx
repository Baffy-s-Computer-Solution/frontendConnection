import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, RotateCcw, Search, GraduationCap, Send } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { subscribeToStudentApplications, withdrawStudentApplication } from '../../services/studentServices';
import { cancelStudentMentorshipRequest, respondToMentorRequest, subscribeToStudentMentorshipData } from '../../services/studentMentorshipService';

const statusClasses = {
  pending: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30',
  under_review: 'bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/30',
  accepted: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30',
  approved: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30',
  rejected: 'bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/30',
  withdrawn: 'bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600',
  interview: 'bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-500/30',
  hired: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30',
  default: 'bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600',
};

const formatDisplayStatus = (status = '') =>
  String(status || '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getApplicationStatus = (application) => String(application?.status || 'pending').toLowerCase();

function StudentApplications() {
  const { currentUser, userProfile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mentorshipRequests, setMentorshipRequests] = useState([]);

  useEffect(() => {
    const studentId = currentUser?.uid || userProfile?.uid;

    if (!studentId) {
      setLoading(false);
      setError('Student profile is still loading. Please refresh once your account is ready.');
      return;
    }

    setLoading(true);
    setError('');
    return subscribeToStudentApplications(
      studentId,
      (records) => {
        setApplications(records);
        setLoading(false);
      },
      (loadError) => {
        const isPermissionError = loadError?.code === 'permission-denied' || /permission/i.test(loadError?.message || '');
        setError(isPermissionError
          ? 'Your account cannot read its application records yet. Check that you are signed in as a student and that student access is enabled in Firestore rules.'
          : loadError.message || 'Could not load your applications right now.');
        setLoading(false);
      }
    );
  }, [currentUser?.uid, userProfile?.uid]);

  useEffect(() => {
    const studentId = currentUser?.uid || userProfile?.uid;
    if (!studentId) return undefined;
    return subscribeToStudentMentorshipData(studentId, ({ requests }) => setMentorshipRequests(requests), (loadError) => setError(loadError.message || 'Unable to load mentorship applications.'));
  }, [currentUser?.uid, userProfile?.uid]);

  const handleWithdraw = async (application) => {
    if (!window.confirm('Withdraw this application? Its history will remain available.')) return;
    setUpdatingId(application.id);
    const result = await withdrawStudentApplication(application.id, currentUser?.uid || userProfile?.uid);
    setNotice(result.success ? 'Application withdrawn.' : result.error || 'Unable to withdraw this application.');
    setUpdatingId('');
  };

  const handleMentorshipResponse = async (request, status) => {
    const result = await respondToMentorRequest(request.id, currentUser?.uid || userProfile?.uid, status);
    setNotice(result.success ? (status === 'accepted' ? 'Mentorship invitation approved.' : 'Mentorship invitation declined.') : result.error || 'Unable to respond.');
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((app) => ['pending', 'under_review'].includes(getApplicationStatus(app))).length;
    const accepted = applications.filter((app) => ['accepted', 'approved', 'hired', 'interview'].includes(getApplicationStatus(app))).length;
    const rejected = applications.filter((app) => ['rejected', 'withdrawn'].includes(getApplicationStatus(app))).length;

    return { total, pending, accepted, rejected };
  }, [applications]);

  const visibleApplications = useMemo(() => applications
    .filter((application) => statusFilter === 'all' || getApplicationStatus(application) === statusFilter)
    .filter((application) => `${application.jobTitle || application.jobName || ''} ${application.companyName || application.company || ''} ${application.jobId || ''}`.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .sort((left, right) => new Date(right.appliedAt || right.appliedDate || 0) - new Date(left.appliedAt || left.appliedDate || 0)),
  [applications, searchTerm, statusFilter]);

  const exportApplications = () => {
    const rows = [['Job', 'Company', 'Status', 'Applied'], ...visibleApplications.map((application) => [
      application.jobTitle || application.jobName || 'Job Opportunity',
      application.companyName || application.company || '',
      getApplicationStatus(application),
      application.appliedAt?.toDate?.()?.toISOString?.() || application.appliedAt || '',
    ])];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'my-applications.csv'; link.click(); URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Loading your applications...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Applications</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">My Applications</h1>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={exportApplications} disabled={!visibleApplications.length} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Download className="h-4 w-4"/>Export</button>
            <Link to="/student/jobs" className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Find jobs</Link>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}
        {notice && <p role="status" className="mb-4 text-sm text-slate-600 dark:text-slate-300">{notice}</p>}

        <section className="mb-6 overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-sm dark:border-indigo-900 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-800"><div className="flex items-center gap-3"><GraduationCap className="h-5 w-5 text-indigo-600"/><div><h2 className="font-semibold text-slate-900 dark:text-white">Mentorship applications</h2><p className="text-sm text-slate-500">Apply to registered mentors or respond to mentor invitations.</p></div></div><Link to="/student/mentorship" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"><Send className="h-4 w-4"/>Find mentors</Link></div>
          {mentorshipRequests.length ? <ul className="divide-y divide-slate-200 dark:divide-slate-800">{mentorshipRequests.map((request) => <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-semibold text-slate-900 dark:text-white">{request.initiatedBy === 'mentor' ? request.mentorName || 'Mentor invitation' : request.mentorName || 'Mentor'}{request.topic ? ` · ${request.topic}` : ''}</p><p className="mt-1 text-sm text-slate-500">{request.initiatedBy === 'mentor' ? 'Invitation from mentor' : 'Your mentorship request'} · {formatDisplayStatus(request.status || 'pending')}</p></div><div className="flex gap-2">{request.initiatedBy === 'mentor' && request.status === 'pending' ? <><button type="button" onClick={() => handleMentorshipResponse(request, 'accepted')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Approve</button><button type="button" onClick={() => handleMentorshipResponse(request, 'rejected')} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700">Decline</button></> : request.status === 'pending' && <button type="button" onClick={async () => { const result = await cancelStudentMentorshipRequest(request.id, currentUser?.uid || userProfile?.uid); setNotice(result.success ? 'Mentorship request cancelled.' : result.error); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-700">Cancel request</button>}</div></li>)}</ul> : <p className="p-5 text-sm text-slate-500">No mentorship applications yet. Browse mentors to send a request.</p>}
        </section>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Pending', value: stats.pending },
            { label: 'Accepted', value: stats.accepted },
            { label: 'Outcomes', value: stats.rejected },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.label}</div>
              <div className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">{item.value}</div>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-700 sm:flex-row">
            <label className="relative flex-1"><span className="sr-only">Search applications</span><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400"/><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search jobs or companies" className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"/></label>
            <label className="sr-only" htmlFor="application-status-filter">Filter by status</label><select id="application-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"><option value="all">All statuses</option>{Object.keys(statusClasses).filter((status) => status !== 'default').map((status) => <option key={status} value={status}>{formatDisplayStatus(status)}</option>)}</select>
          </div>
          {applications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No applications yet</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Your submitted job applications will appear here once you start applying.
              </p>
              <Link to="/student/jobs" className="mt-4 inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">Browse jobs</Link>
            </div>
          ) : visibleApplications.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-600 dark:text-slate-300">No applications match your search and status filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/70">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Job</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Company</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Applied</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {visibleApplications.map((application) => {
                    const applicationStatus = getApplicationStatus(application);
                    const displayStatus = formatDisplayStatus(applicationStatus);
                    const appliedDate = application.appliedAt
                      ? new Date(application.appliedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A';

                    return (
                      <tr key={application.id} className="align-top hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{application.jobTitle || application.jobName || 'Job Opportunity'}</div>
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{application.jobId || 'Reference not available'}</div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-200">{application.companyName || application.company || 'Company pending'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[applicationStatus] || statusClasses.default}`}>
                            {displayStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-200">{appliedDate}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/student/application/${application.id}`}
                              aria-label="View application"
                              title="View application"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-200 text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-500/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {['pending', 'under_review'].includes(applicationStatus) && (
                              <button type="button" onClick={() => handleWithdraw(application)} disabled={updatingId === application.id} aria-label="Withdraw application" title="Withdraw application" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900 dark:hover:bg-rose-950/30">
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default StudentApplications;


