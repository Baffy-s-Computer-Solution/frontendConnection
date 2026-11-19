// frontend/src/pages/alumni/AlumniMentorshipProgram.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarCheck, FaCheckCircle, FaChalkboardTeacher, FaClock, FaFilter,
  FaHandHoldingHeart, FaSearch, FaStar, FaSync, FaTimes, FaUserGraduate,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { alumniService } from '../../services/alumniService';

const safe = (v) => (v == null ? '' : String(v));
const AVATAR = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=';

const MentorshipCard = ({ mentor, onRequest }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <img
          src={mentor.photoURL || mentor.profilePhoto || `${AVATAR}${encodeURIComponent(safe(mentor.name || 'M'))}`}
          alt="" loading="lazy" referrerPolicy="no-referrer"
          className="h-14 w-14 rounded-full object-cover"
          onError={(e) => { e.currentTarget.src = `${AVATAR}${encodeURIComponent(safe(mentor.name || 'M'))}`; }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{safe(mentor.name)}</p>
            {mentor.verified && <FaCheckCircle className="text-brand-500" title="Verified mentor" />}
          </div>
          <p className="truncate text-xs text-slate-500">{safe(mentor.position)} · {safe(mentor.company)}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
            <FaStar /> {Number(mentor.rating || 0).toFixed(1)} · {mentor.reviewsCount || 0} reviews
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {(mentor.expertise || []).slice(0, expanded ? 10 : 3).map((e, i) => (
          <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{safe(e)}</span>
        ))}
        {(mentor.expertise || []).length > 3 && (
          <button onClick={() => setExpanded((v) => !v)} className="text-[11px] font-semibold text-brand-600">
            {expanded ? 'Show less' : `+${mentor.expertise.length - 3} more`}
          </button>
        )}
      </div>
      {mentor.bio && <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{safe(mentor.bio)}</p>}
      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px] text-slate-500">
          <FaClock /> {mentor.availability || 'Flexible'} · {mentor.sessionLength || 30} min
        </span>
        <button
          onClick={() => onRequest(mentor)}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
        >
          Request
        </button>
      </div>
    </div>
  );
};

const AlumniMentorshipProgram = () => {
  const { currentUser } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [tab, setTab] = useState('discover'); // discover | requests
  const [search, setSearch] = useState('');
  const [expertise, setExpertise] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestTopic, setRequestTopic] = useState('');
  const [requesting, setRequesting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [mRes, rRes] = await Promise.allSettled([
        alumniService.listMentors?.({ search, expertise: expertise || undefined }),
        alumniService.getMyMentorshipRequests?.(),
      ]);
      if (mRes.status === 'fulfilled' && mRes.value?.success) setMentors(mRes.value.data || []);
      if (rRes.status === 'fulfilled' && rRes.value?.success) setMyRequests(rRes.value.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const filteredMentors = useMemo(() => {
    const q = search.toLowerCase();
    return mentors.filter((m) =>
      !q || (m.name || '').toLowerCase().includes(q) || (m.company || '').toLowerCase().includes(q) || (m.expertise || []).some((e) => (e || '').toLowerCase().includes(q))
    );
  }, [mentors, search]);

  const submitRequest = async () => {
    if (!selectedMentor?.id) return;
    if (requestMessage.trim().length < 20) {
      addErrorNotification('Mentorship', 'Please write at least 20 characters');
      return;
    }
    setRequesting(true);
    try {
      const res = await alumniService.requestMentorship?.({
        mentorId: selectedMentor.id,
        topic: requestTopic.slice(0, 120),
        message: requestMessage.slice(0, 1000),
      });
      if (res?.success) {
        addSuccessNotification('Mentorship', 'Request sent');
        setShowModal(false);
        setRequestMessage('');
        setRequestTopic('');
        setSelectedMentor(null);
        load();
      } else {
        addErrorNotification('Mentorship', res?.error || 'Failed to send request');
      }
    } finally {
      setRequesting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Mentorship</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Alumni mentorship program</h1>
              <p className="mt-1 text-sm text-slate-500">Find a mentor, grow your career, or give back by mentoring students and fellow alumni.</p>
            </div>
            <button onClick={load} className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">
              <FaSync /> Refresh
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value.slice(0, 100))}
                placeholder="Search mentors by name, company, skill…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <select value={expertise} onChange={(e) => setExpertise(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
              <option value="">All expertise</option>
              {['Career coaching', 'Entrepreneurship', 'Finance', 'Technology', 'Marketing', 'Leadership', 'Research', 'Public speaking'].map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </header>

        <div className="mb-4 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {[
            { id: 'discover', label: 'Discover mentors', icon: FaChalkboardTeacher },
            { id: 'requests', label: 'My requests', icon: FaHandHoldingHeart },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            >
              <t.icon /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'discover' && (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))
            ) : filteredMentors.length === 0 ? (
              <div className="col-span-full rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                <FaChalkboardTeacher className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm text-slate-600 dark:text-slate-300">No mentors matched your search.</p>
              </div>
            ) : (
              filteredMentors.map((m) => (
                <MentorshipCard
                  key={m.id}
                  mentor={m}
                  onRequest={(mentor) => { setSelectedMentor(mentor); setShowModal(true); }}
                />
              ))
            )}
          </section>
        )}

        {tab === 'requests' && (
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {myRequests.length === 0 ? (
              <div className="p-10 text-center">
                <FaCalendarCheck className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm text-slate-600 dark:text-slate-300">You haven't requested any mentorships yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {myRequests.map((r) => (
                  <li key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{safe(r.mentorName || 'Mentor')}</p>
                      <p className="truncate text-xs text-slate-500">{safe(r.topic)}</p>
                    </div>
                    <span className={`self-start rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${r.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : r.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {r.status || 'pending'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {showModal && selectedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">Request mentorship</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500" aria-label="Close"><FaTimes /></button>
              </div>
              <p className="mb-2 text-xs text-slate-500">Mentor: <strong>{safe(selectedMentor.name)}</strong></p>
              <input
                value={requestTopic}
                onChange={(e) => setRequestTopic(e.target.value.slice(0, 120))}
                placeholder="Topic (e.g. career switch into fintech)"
                className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value.slice(0, 1000))}
                rows={5}
                placeholder="Tell the mentor about yourself and what you're looking for (at least 20 chars)…"
                className="mb-3 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                <button onClick={submitRequest} disabled={requesting || requestMessage.trim().length < 20} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {requesting ? 'Sending…' : 'Send request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AlumniMentorshipProgram;