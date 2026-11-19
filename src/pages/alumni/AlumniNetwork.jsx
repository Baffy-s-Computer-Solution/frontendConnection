// frontend/src/pages/alumni/AlumniNetwork.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaCheck, FaCheckCircle, FaChevronLeft, FaChevronRight, FaClock,
  FaEnvelope, FaFilter, FaLink, FaMapPin, FaSearch, FaSync, FaTimes,
  FaTimesCircle, FaUserCheck, FaUserFriends, FaUserPlus, FaUserTimes, FaUsers,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { alumniService } from '../../services/alumniService';
import { formatDate } from '../../utils/formatters';

const ENV = import.meta.env.VITE_APP_ENVIRONMENT || 'production';
const safeLog = (...a) => { if (ENV !== 'production') console.debug('[Network]', ...a); };
const safe = (v) => (v == null ? '' : String(v));
const AVATAR = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=';

const ConnectionCard = ({ person, status, onAction, onMessage }) => {
  const [acting, setActing] = useState(false);
  const runAction = async (action) => { setActing(true); try { await onAction(person, action); } finally { setActing(false); } };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-2 flex items-start gap-3">
        <img src={person.photoURL || person.profilePhoto || `${AVATAR}${encodeURIComponent(safe(person.name || 'A'))}`} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-12 w-12 rounded-full object-cover" onError={(e) => { e.currentTarget.src = `${AVATAR}${encodeURIComponent(safe(person.name || 'A'))}`; }} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{safe(person.name)}</p>
          <p className="truncate text-xs text-slate-500">{safe(person.position)} · {safe(person.company)}</p>
          {person.location && <p className="truncate text-[11px] text-slate-400"><FaMapPin className="inline" /> {safe(person.location)}</p>}
        </div>
      </div>
      {person.mutualConnections > 0 && (
        <p className="mb-2 text-[11px] text-slate-500">{person.mutualConnections} mutual connections</p>
      )}
      <div className="flex flex-wrap gap-1">
        {status === 'connected' ? (
          <span className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700"><FaCheckCircle /> Connected</span>
        ) : status === 'pending' ? (
          <span className="flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700"><FaClock /> Pending</span>
        ) : status === 'incoming' ? (
          <>
            <button onClick={() => runAction('accept')} disabled={acting} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"><FaCheck /> Accept</button>
            <button onClick={() => runAction('decline')} disabled={acting} className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600"><FaTimes /> Decline</button>
          </>
        ) : (
          <button onClick={() => runAction('connect')} disabled={acting} className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white"><FaUserPlus /> Connect</button>
        )}
        <button onClick={() => onMessage(person)} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-700"><FaEnvelope /> Message</button>
      </div>
    </article>
  );
};

const AlumniNetwork = () => {
  const { currentUser } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('all'); // all | connected | pending | suggestions
  const [people, setPeople] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [messageModal, setMessageModal] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({ total: 0, connected: 0, pending: 0, suggestions: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, connRes, pendRes, suggRes] = await Promise.allSettled([
        alumniService.listAlumni?.({ page, pageSize, search, industry: industry || undefined }),
        alumniService.getConnections?.(),
        alumniService.getPendingConnections?.(),
        alumniService.getNetworkSuggestions?.(),
      ]);
      const all = [];
      if (listRes.status === 'fulfilled' && listRes.value?.success) all.push(...(listRes.value.data?.items || []));
      if (connRes.status === 'fulfilled' && connRes.value?.success) all.push(...(connRes.value.data || []));
      if (pendRes.status === 'fulfilled' && pendRes.value?.success) all.push(...(pendRes.value.data || []));
      if (suggRes.status === 'fulfilled' && suggRes.value?.success) all.push(...(suggRes.value.data || []));
      const unique = Array.from(new Map(all.map((p) => [p.id, p])).values());
      setPeople(unique);
      const s = {};
      unique.forEach((p) => { s[p.id] = p.connectionStatus || p.status || 'none'; });
      setStatuses(s);
      setStats({
        total: unique.length,
        connected: Object.values(s).filter((x) => x === 'connected').length,
        pending: Object.values(s).filter((x) => x === 'pending' || x === 'incoming').length,
        suggestions: unique.filter((p) => s[p.id] === 'none').length,
      });
    } catch (e) {
      safeLog(e);
      addErrorNotification('Network', 'Failed to load network');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, industry, addErrorNotification]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return people.filter((p) => {
      const s = statuses[p.id];
      if (tab === 'connected' && s !== 'connected') return false;
      if (tab === 'pending' && s !== 'pending' && s !== 'incoming') return false;
      if (tab === 'suggestions' && s !== 'none') return false;
      return true;
    });
  }, [people, statuses, tab]);

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handleAction = async (person, action) => {
    try {
      const res = await alumniService[action === 'connect' ? 'sendConnectionRequest' : action === 'accept' ? 'acceptConnection' : 'declineConnection']?.(person.id);
      if (res?.success) {
        setStatuses((prev) => ({ ...prev, [person.id]: action === 'connect' ? 'pending' : action === 'accept' ? 'connected' : 'none' }));
        addSuccessNotification('Network', action === 'connect' ? 'Request sent' : action === 'accept' ? 'Connection accepted' : 'Declined');
      }
    } catch {
      addErrorNotification('Network', 'Action failed');
    }
  };

  const sendMessage = async () => {
    if (!messageModal || !messageText.trim()) return;
    setSending(true);
    try {
      const res = await alumniService.sendMessage?.(messageModal.id, messageText.trim().slice(0, 1000));
      if (res?.success) {
        addSuccessNotification('Message', 'Message sent');
        setMessageModal(null);
        setMessageText('');
      } else {
        addErrorNotification('Message', res?.error || 'Failed to send');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Alumni · Network</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Your alumni network</h1>
              <p className="mt-1 text-sm text-slate-500">Grow connections, accept requests, and discover alumni near you.</p>
            </div>
            <button onClick={() => { setRefreshing(true); load(); }} disabled={refreshing} className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white"><FaSync className={refreshing ? 'animate-spin' : ''} /> Refresh</button>
          </div>
        </header>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total in network', value: stats.total, icon: FaUsers, bg: 'bg-brand-100', accent: 'text-brand-600' },
            { label: 'Connected', value: stats.connected, icon: FaUserCheck, bg: 'bg-emerald-100', accent: 'text-emerald-600' },
            { label: 'Pending', value: stats.pending, icon: FaClock, bg: 'bg-amber-100', accent: 'text-amber-600' },
            { label: 'Suggestions', value: stats.suggestions, icon: FaUserFriends, bg: 'bg-violet-100', accent: 'text-violet-600' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between"><div><p className="text-xs text-slate-500">{s.label}</p><p className="mt-1 text-2xl font-bold">{s.value}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}><s.icon className={`h-4 w-4 ${s.accent}`} /></span></div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {[
            { id: 'all', label: 'All' }, { id: 'connected', label: 'Connected' },
            { id: 'pending', label: 'Pending' }, { id: 'suggestions', label: 'Suggestions' },
          ].map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setPage(1); }} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${tab === t.id ? 'bg-brand-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{t.label}</button>
          ))}
        </div>

        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row">
          <div className="relative flex-1">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value.slice(0, 100)); setPage(1); }} placeholder="Search people…" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <button onClick={() => setShowFilters((v) => !v)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700"><FaFilter /> Filters</button>
        </div>

        {showFilters && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <select value={industry} onChange={(e) => { setIndustry(e.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800">
              <option value="">All industries</option>
              {['Technology', 'Finance', 'Education', 'Healthcare', 'Government', 'NGO', 'Retail', 'Manufacturing'].map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <FaUsers className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No one here yet</p>
            <p className="mt-1 text-xs text-slate-500">Adjust your filters or search query.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paged.map((p) => <ConnectionCard key={p.id} person={p} status={statuses[p.id]} onAction={handleAction} onMessage={setMessageModal} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900">
                <span className="text-slate-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded border p-1.5 disabled:opacity-50 dark:border-slate-700"><FaChevronLeft /></button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded border p-1.5 disabled:opacity-50 dark:border-slate-700"><FaChevronRight /></button>
                </div>
              </div>
            )}
          </>
        )}

        {messageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-base font-semibold">Message {safe(messageModal.name)}</h3>
                <button onClick={() => setMessageModal(null)} className="text-slate-400 hover:text-red-500" aria-label="Close"><FaTimes /></button>
              </div>
              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value.slice(0, 1000))} rows={5} placeholder="Write a message…" className="mb-3 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setMessageModal(null)} className="rounded-lg border px-4 py-2 text-sm dark:border-slate-700">Cancel</button>
                <button onClick={sendMessage} disabled={sending || !messageText.trim()} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{sending ? 'Sending…' : 'Send'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AlumniNetwork;