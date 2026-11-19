import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { CheckCircle2, Clock3, MessageCircle, Search, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { mentorService } from '../../services/mentorService';

const statuses = ['all', 'pending', 'accepted', 'rejected', 'cancelled'];

const statusClass = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
  accepted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
  cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  completed: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200',
};

const toDate = (value) => value?.toDate?.() || (value ? new Date(value) : null);
const formatDate = (value) => {
  const date = toDate(value);
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Date not available';
};

export default function MentorApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setError('Sign in as a mentor to view mentorship applications.');
      return undefined;
    }

    setLoading(true);
    setError('');
    return onSnapshot(
      query(collection(db, 'mentorship_requests'), where('mentorId', '==', user.uid)),
      (snapshot) => {
        const records = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((left, right) => (toDate(right.createdAt)?.getTime() || 0) - (toDate(left.createdAt)?.getTime() || 0));
        setApplications(records);
        setSelected((current) => current ? records.find((item) => item.id === current.id) || null : null);
        setLoading(false);
      },
      (loadError) => {
        setError(loadError?.code === 'permission-denied'
          ? 'You do not have permission to read mentorship requests. Ask an administrator to enable mentor access to requests assigned to your mentor ID.'
          : loadError?.code === 'failed-precondition'
            ? `Firestore could not run the mentorship request query: ${loadError.message}`
            : loadError?.message || 'Unable to load mentorship applications.');
        setLoading(false);
      }
    );
  }, [user?.uid]);

  const filteredApplications = useMemo(() => applications.filter((application) => {
    const matchesStatus = filter === 'all' || String(application.status || 'pending').toLowerCase() === filter;
    const haystack = [
      application.studentName,
      application.studentEmail,
      application.topic,
      application.message,
    ].join(' ').toLowerCase();
    return matchesStatus && haystack.includes(search.trim().toLowerCase());
  }), [applications, filter, search]);

  const updateStatus = async (application, status) => {
    setUpdatingId(application.id);
    setError('');
    setNotice('');
    try {
      const result = await mentorService.updateMentorshipRequest(application.id, status, user?.uid);
      if (!result.success) throw new Error(result.error || 'Unable to update this request.');
      setNotice(status === 'accepted'
        ? 'Request accepted. The student can now see the mentorship in their account.'
        : 'Request declined.');
      setSelected((current) => current?.id === application.id ? { ...current, status } : current);
    } catch (updateError) {
      setError(updateError?.code === 'permission-denied'
        ? 'You do not have permission to update this request. Check mentor request-update and mentorship-create Firestore rules.'
        : updateError?.message || 'Unable to update this request.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Mentor workspace</p>
            <h1 className="mt-2 text-3xl font-bold">Mentorship applications</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Review requests from students and manage your mentoring relationships.</p>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"><span className="font-bold">{applications.length}</span><span className="ml-2 text-slate-500 dark:text-slate-400">Total</span></div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"><span className="font-bold">{applications.filter((item) => item.status === 'pending').length}</span><span className="ml-2 text-slate-500 dark:text-slate-400">Pending</span></div>
          </div>
        </header>

        {error && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}
        {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{notice}</div>}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search mentorship applications</span>
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students, topics, or messages" className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
            </label>
            <label className="sr-only" htmlFor="mentor-app-status">Filter by status</label>
            <select id="mentor-app-status" value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950">
              {statuses.map((status) => <option key={status} value={status}>{status === 'all' ? 'All statuses' : status[0].toUpperCase() + status.slice(1)}</option>)}
            </select>
          </div>

          {loading ? (
            <div role="status" className="p-12 text-center text-sm text-slate-600 dark:text-slate-300">Loading mentorship requests...</div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <h2 className="font-semibold">{applications.length ? 'No matching requests' : 'No mentorship requests yet'}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{applications.length ? 'Change your search or status filter.' : 'New requests from students will appear here.'}</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredApplications.map((application) => (
                <li key={application.id} className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${selected?.id === application.id ? 'bg-indigo-50/60 dark:bg-indigo-500/5' : ''}`}>
                  <button type="button" onClick={() => setSelected(selected?.id === application.id ? null : application)} className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{application.studentName || application.alumniName || 'Student'}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[application.status] || statusClass.pending}`}>{application.status || 'pending'}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{application.topic || 'Mentorship request'} · Submitted {formatDate(application.createdAt)}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{application.message || 'No message provided.'}</p>
                  </button>
                  {application.status === 'pending' && (
                    <div className="flex shrink-0 gap-2">
                      <button type="button" disabled={!!updatingId} onClick={() => updateStatus(application, 'accepted')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                        <CheckCircle2 className="h-4 w-4" />{updatingId === application.id ? 'Saving…' : 'Accept'}
                      </button>
                      <button type="button" disabled={!!updatingId} onClick={() => updateStatus(application, 'rejected')} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30">
                        <XCircle className="h-4 w-4" />Decline
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {selected && (
          <section aria-label="Selected application details" className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <h2 className="text-lg font-semibold">{selected.studentName || selected.alumniName || 'Student'}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{selected.studentEmail || 'Email not provided'}</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Clock3 className="h-4 w-4" />Received {formatDate(selected.createdAt)}</p>
              </div>
              <div className="flex flex-wrap items-start gap-2">
                {selected.status === 'accepted' && selected.studentId && <button type="button" onClick={() => navigate(`/mentor/messages?mentee=${encodeURIComponent(selected.studentId)}&mentorship=${encodeURIComponent(selected.id)}`)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><MessageCircle className="h-4 w-4" />Message student</button>}
                <button type="button" onClick={() => setSelected(null)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Close</button>
              </div>
            </div>
            {selected.topic && <p className="mt-4"><span className="font-medium">Topic: </span>{selected.topic}</p>}
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{selected.message || 'No message provided.'}</p>
          </section>
        )}
      </div>
    </main>
  );
}
