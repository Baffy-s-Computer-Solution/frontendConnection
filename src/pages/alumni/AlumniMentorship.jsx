// frontend/src/pages/alumni/AlumniMentorship.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaArrowRight, FaCalendarCheck, FaChalkboardTeacher, FaCheckCircle, FaClock,
  FaFilter, FaHandHoldingHeart, FaLightbulb, FaRegCalendarAlt, FaSearch,
  FaStar, FaSync, FaTimes, FaUserGraduate, FaUsers, FaVideo,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { alumniService } from '../../services/alumniService';
import { formatDate } from '../../utils/formatters';

const ENV = import.meta.env.VITE_APP_ENVIRONMENT || 'production';
const safeLog = (...a) => { if (ENV !== 'production') console.debug('[Mentorship]', ...a); };
const safe = (v) => (v == null ? '' : String(v));
const AVATAR = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=';

const MentorCard = ({ mentor, onRequest, onView }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
    <div className="mb-3 flex items-start gap-3">
      <img src={mentor.photoURL || mentor.profilePhoto || `${AVATAR}${encodeURIComponent(safe(mentor.name || 'M'))}`} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-14 w-14 rounded-full object-cover" onError={(e) => { e.currentTarget.src = `${AVATAR}${encodeURIComponent(safe(mentor.name || 'M'))}`; }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{safe(mentor.name)}</p>{mentor.verified && <FaCheckCircle className="text-brand-500" />}</div>
        <p className="truncate text-xs text-slate-500">{safe(mentor.position)} · {safe(mentor.company)}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-amber-600"><FaStar /> {Number(mentor.rating || 0).toFixed(1)} · {mentor.reviewsCount || 0} reviews</p>
      </div>
    </div>
    <div className="mb-2 flex flex-wrap gap-1">
      {(mentor.expertise || []).slice(0, 4).map((e, i) => <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{safe(e)}</span>)}
    </div>
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1 text-[11px] text-slate-500"><FaClock /> {safe(mentor.availability || 'Flexible')}</span>
      <div className="flex gap-1">
        <button onClick={() => onView(mentor)} className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold dark:border-slate-700">Details</button>
        <button onClick={() => onRequest(mentor)} className="rounded-lg bg-brand-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-brand-700">Request</button>
      </div>
    </div>
  </article>
);

const AlumniMentorship = () => {
  const { currentUser, userProfile } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [tab, setTab] = useState('discover'); // discover | requests | sessions | become
  const [search, setSearch] = useState('');
  const [expertise, setExpertise] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [requestModal, setRequestModal] = useState(null);
  const [requestForm, setRequestForm] = useState({ topic: '', message: '', preferredDate: '', preferredTime: '' });
  const [requesting, setRequesting] = useState(false);
  const [viewMentor, setViewMentor] = useState(null);
  const [becomeForm, setBecomeForm] = useState({ headline: '', expertise: '', bio: '', sessionLength: 30, availability: 'weekly', maxMentees: 3 });
  const [submittingBecome, setSubmittingBecome] = useState(false);
  const [stats, setStats] = useState({ totalMentors: 0, activeSessions: 0, completedSessions: 0, avgRating: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, rRes, sRes] = await Promise.allSettled([
        alumniService.listMentors?.(),
        alumniService.getMyMentorshipRequests?.(),
        alumniService.getMentorshipSessions?.(),
      ]);
      if (mRes.status === 'fulfilled' && mRes.value?.success) {
        const list = Array.isArray(mRes.value.data) ? mRes.value.data : [];
        setMentors(list);
        setStats((prev) => ({ ...prev, totalMentors: list.length, avgRating: list.reduce((s, m) => s + (m.rating || 0), 0) / (list.length || 1) }));
      }
      if (rRes.status === 'fulfilled' && rRes.value?.success) setRequests(Array.isArray(rRes.value.data) ? rRes.value.data : []);
      if (sRes.status === 'fulfilled' && sRes.value?.success) {
        const list = Array.isArray(sRes.value.data) ? sRes.value.data : [];
        setSessions(list);
        setStats((prev) => ({ ...prev, activeSessions: list.filter((s) => s.status === 'scheduled').length, completedSessions: list.filter((s) => s.status === 'completed').length }));
      }
    } catch (e) {
      safeLog(e);
      addErrorNotification('Mentorship', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addErrorNotification]);

  useEffect(() => { load(); }, [load]);

  const filteredMentors = useMemo(() => {
    const q = search.toLowerCase();
    return mentors.filter((m) => {
      if (expertise && !(m.expertise || []).includes(expertise)) return false;
      if (q && !`${m.name || ''} ${m.company || ''} ${(m.expertise || []).join(' ')}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [mentors, search, expertise]);

  const submitRequest = async () => {
    if (!requestModal) return;
    if (requestForm.message.trim().length < 20) {
      addErrorNotification('Mentorship', 'Please write at least 20 characters explaining what you need');
      return;
    }
    setRequesting(true);
    try {
      const res = await alumniService.requestMentorship?.({
        mentorId: requestModal.id,
        topic: requestForm.topic.slice(0, 120),
        message: requestForm.message.slice(0, 1000),
        preferredDate: requestForm.preferredDate,
        preferredTime: requestForm.preferredTime,
      });
      if (res?.success) {
        addSuccessNotification('Mentorship', 'Request sent to mentor');
        setRequestModal(null);
        setRequestForm({ topic: '', message: '', preferredDate: '', preferredTime: '' });
        load();
      } else {
        addErrorNotification('Mentorship', res?.error || 'Failed to send');
      }
    } finally {
      setRequesting(false);
    }
  };

  const submitBecome = async () => {
    if (becomeForm.bio.trim().length < 50) {
      addErrorNotification('Mentor signup', 'Bio must be at least 50 characters');
      return;
    }
    if (!becomeForm.headline.trim()) {
      addErrorNotification('Mentor signup', 'Add a headline');
      return;
    }
    setSubmittingBecome(true);
    try {
      const res = await alumniService.becomeMentor?.({
        headline: becomeForm.headline.slice(0, 120),
        expertise: becomeForm.expertise.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10),
        bio: becomeForm.bio.slice(0, 1000),
        sessionLength: parseInt(becomeForm.sessionLength, 10) || 30,
        availability: becomeForm.availability,
        maxMentees: parseInt(becomeForm.maxMentees, 10) || 3,
      });
      if (res?.success) {
        addSuccessNotification('Mentor signup', 'Your mentor profile is pending review');
        setBecomeForm({ headline: '', expertise: '', bio: '', sessionLength: 30, availability: 'weekly', maxMentees: 3 });
      } else {
        addErrorNotification('Mentor signup', res?.error || 'Failed to submit');
      }
    } finally {
      setSubmittingBecome(false);
    }
  };

  const updateSessionStatus = async (session, status) => {
    const res = await alumniService.updateMentorshipSession?.(session.id, { status });
    if (res?.success) { addSuccessNotification('Session', `Marked ${status}`); load(); }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Alumni · Mentorship</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Mentorship hub</h1>
              <p className="mt-1 text-sm text-slate-500">Find mentors, manage sessions, or give back by becoming a mentor.</p>
            </div>
            <button onClick={() => { setRefreshing(true); load(); }} disabled={refreshing} className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white"><FaSync className={refreshing ? 'animate-spin' : ''} /> Refresh</button>
          </div>
        </header>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Available mentors', value: stats.totalMentors, icon: FaChalkboardTeacher, bg: 'bg-brand-100', accent: 'text-brand-600' },
            { label: 'Active sessions', value: stats.activeSessions, icon: FaRegCalendarAlt, bg: 'bg-emerald-100', accent: 'text-emerald-600' },
            { label: 'Completed', value: stats.completedSessions, icon: FaCheckCircle, bg: 'bg-violet-100', accent: 'text-violet-600' },
            { label: 'Avg rating', value: Number(stats.avgRating || 0).toFixed(1), icon: FaStar, bg: 'bg-amber-100', accent: 'text-amber-600' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div><p className="text-xs text-slate-500">{s.label}</p><p className="mt-1 text-2xl font-bold">{s.value}</p></div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}><s.icon className={`h-4 w-4 ${s.accent}`} /></span>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {[
            { id: 'discover', label: 'Discover', icon: FaSearch },
            { id: 'requests', label: 'My requests', icon: FaHandHoldingHeart },
            { id: 'sessions', label: 'Sessions', icon: FaCalendarCheck },
            { id: 'become', label: 'Become a mentor', icon: FaChalkboardTeacher },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${tab === t.id ? 'bg-brand-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
              <t.icon /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'discover' && (
          <>
            <div className="mb-3 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row">
              <div className="relative flex-1">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value.slice(0, 100))} placeholder="Search mentors…" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <button onClick={() => setShowFilters((v) => !v)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700"><FaFilter /> Filter</button>
            </div>
            {showFilters && (
              <div className="mb-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <select value={expertise} onChange={(e) => setExpertise(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800">
                  <option value="">All expertise</option>
                  {['Career coaching', 'Entrepreneurship', 'Finance', 'Technology', 'Marketing', 'Leadership', 'Research', 'Public speaking'].map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            )}
            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>
            ) : filteredMentors.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                <FaChalkboardTeacher className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No mentors matched</p>
                <p className="mt-1 text-xs text-slate-500">Try a different search or expertise filter.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMentors.map((m) => <MentorCard key={m.id} mentor={m} onRequest={setRequestModal} onView={setViewMentor} />)}
              </div>
            )}
          </>
        )}

        {tab === 'requests' && (
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {requests.length === 0 ? (
              <div className="p-10 text-center">
                <FaHandHoldingHeart className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm text-slate-600 dark:text-slate-300">You haven't requested a mentorship yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((r) => (
                  <li key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{safe(r.mentorName || 'Mentor')}</p>
                      <p className="truncate text-xs text-slate-500">{safe(r.topic)}</p>
                      <p className="text-[11px] text-slate-400">Requested {formatDate(r.createdAt?.toDate?.() || r.createdAt)}</p>
                    </div>
                    <span className={`self-start rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${r.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : r.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{safe(r.status || 'pending')}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'sessions' && (
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {sessions.length === 0 ? (
              <div className="p-10 text-center">
                <FaCalendarCheck className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm text-slate-600 dark:text-slate-300">No sessions scheduled yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {sessions.map((s) => (
                  <li key={s.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{safe(s.mentorName || 'Mentor')}</p>
                      <p className="truncate text-xs text-slate-500">{safe(s.topic)}</p>
                      <p className="text-[11px] text-slate-400"><FaClock className="inline" /> {formatDate(s.scheduledAt?.toDate?.() || s.scheduledAt)} {s.duration && `· ${s.duration} min`}</p>
                    </div>
                    <div className="flex gap-2 self-start">
                      {s.status === 'scheduled' && (
                        <>
                          <button onClick={() => updateSessionStatus(s, 'completed')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white">Complete</button>
                          <button onClick={() => updateSessionStatus(s, 'cancelled')} className="rounded-lg border border-red-200 px-3 py-1.5 text-[11px] font-semibold text-red-600">Cancel</button>
                        </>
                      )}
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${s.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : s.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{safe(s.status)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'become' && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">Become a mentor</h3>
            <p className="mb-4 text-xs text-slate-500">Share your expertise and give back to the alumni community. Your profile will be reviewed before going live.</p>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-slate-600 dark:text-slate-300">Headline</label><input value={becomeForm.headline} onChange={(e) => setBecomeForm((p) => ({ ...p, headline: e.target.value.slice(0, 120) }))} placeholder="e.g. Senior Engineering Manager at Google" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" /></div>
              <div><label className="text-xs font-medium text-slate-600 dark:text-slate-300">Expertise (comma separated)</label><input value={becomeForm.expertise} onChange={(e) => setBecomeForm((p) => ({ ...p, expertise: e.target.value.slice(0, 200) }))} placeholder="Career coaching, Product management, Leadership" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" /></div>
              <div><label className="text-xs font-medium text-slate-600 dark:text-slate-300">Bio (min 50 chars)</label><textarea value={becomeForm.bio} onChange={(e) => setBecomeForm((p) => ({ ...p, bio: e.target.value.slice(0, 1000) }))} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" /></div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div><label className="text-xs font-medium text-slate-600 dark:text-slate-300">Session length (min)</label><input type="number" min={15} max={120} value={becomeForm.sessionLength} onChange={(e) => setBecomeForm((p) => ({ ...p, sessionLength: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" /></div>
                <div><label className="text-xs font-medium text-slate-600 dark:text-slate-300">Availability</label><select value={becomeForm.availability} onChange={(e) => setBecomeForm((p) => ({ ...p, availability: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="weekly">Weekly</option><option value="biweekly">Bi-weekly</option><option value="monthly">Monthly</option><option value="flexible">Flexible</option></select></div>
                <div><label className="text-xs font-medium text-slate-600 dark:text-slate-300">Max mentees</label><input type="number" min={1} max={20} value={becomeForm.maxMentees} onChange={(e) => setBecomeForm((p) => ({ ...p, maxMentees: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" /></div>
              </div>
              <button onClick={submitBecome} disabled={submittingBecome} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"><FaLightbulb /> {submittingBecome ? 'Submitting…' : 'Submit mentor profile'}</button>
            </div>
          </section>
        )}

        {viewMentor && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">{safe(viewMentor.name)}</h3>
                <button onClick={() => setViewMentor(null)} className="text-slate-400 hover:text-red-500" aria-label="Close"><FaTimes /></button>
              </div>
              <p className="text-xs text-slate-500">{safe(viewMentor.position)} · {safe(viewMentor.company)}</p>
              {viewMentor.bio && <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">{safe(viewMentor.bio)}</p>}
              {(viewMentor.expertise || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {viewMentor.expertise.map((e, i) => <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-slate-800">{safe(e)}</span>)}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button onClick={() => { setRequestModal(viewMentor); setViewMentor(null); }} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Request mentorship</button>
              </div>
            </div>
          </div>
        )}

        {requestModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-base font-semibold">Request mentorship</h3>
                <button onClick={() => setRequestModal(null)} className="text-slate-400 hover:text-red-500" aria-label="Close"><FaTimes /></button>
              </div>
              <p className="mb-3 text-xs text-slate-500">Mentor: <strong>{safe(requestModal.name)}</strong></p>
              <input value={requestForm.topic} onChange={(e) => setRequestForm((p) => ({ ...p, topic: e.target.value.slice(0, 120) }))} placeholder="Topic (e.g. career switch)" className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <textarea value={requestForm.message} onChange={(e) => setRequestForm((p) => ({ ...p, message: e.target.value.slice(0, 1000) }))} rows={4} placeholder="Describe what you'd like help with (min 20 chars)…" className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <div className="mb-3 grid grid-cols-2 gap-2">
                <input type="date" value={requestForm.preferredDate} onChange={(e) => setRequestForm((p) => ({ ...p, preferredDate: e.target.value }))} className="rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <input type="time" value={requestForm.preferredTime} onChange={(e) => setRequestForm((p) => ({ ...p, preferredTime: e.target.value }))} className="rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setRequestModal(null)} className="rounded-lg border px-4 py-2 text-sm dark:border-slate-700">Cancel</button>
                <button onClick={submitRequest} disabled={requesting || requestForm.message.trim().length < 20} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{requesting ? 'Sending…' : 'Send request'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AlumniMentorship;