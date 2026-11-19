// frontend/src/pages/alumni/AlumniEvents.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaArrowLeft, FaArrowRight, FaCalendarAlt, FaCalendarCheck, FaCheckCircle,
  FaChevronLeft, FaChevronRight, FaClock, FaDownload, FaFilter, FaGlobe,
  FaInfoCircle, FaMapMarkerAlt, FaRegCalendarAlt, FaSearch, FaShareAlt,
  FaSync, FaTimes, FaUserPlus, FaUsers, FaVideo,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { alumniService } from '../../services/alumniService';
import { formatDate } from '../../utils/formatters';

const ENV = import.meta.env.VITE_APP_ENVIRONMENT || 'production';
const safeLog = (...a) => { if (ENV !== 'production') console.debug('[Events]', ...a); };
const safe = (v) => (v == null ? '' : String(v));

const EVENT_CATEGORIES = [
  { id: 'all', label: 'All events' },
  { id: 'networking', label: 'Networking' },
  { id: 'reunion', label: 'Reunions' },
  { id: 'webinar', label: 'Webinars' },
  { id: 'career', label: 'Career fairs' },
  { id: 'fundraiser', label: 'Fundraisers' },
  { id: 'workshop', label: 'Workshops' },
];

const EVENT_MODES = [
  { id: 'all', label: 'All modes' },
  { id: 'in-person', label: 'In-person' },
  { id: 'virtual', label: 'Virtual' },
  { id: 'hybrid', label: 'Hybrid' },
];

const EventCard = ({ event, onRegister, onView, onShare }) => {
  const isRegistered = Boolean(event.isRegistered);
  const start = event.startDate?.toDate?.() || event.startDate;
  const end = event.endDate?.toDate?.() || event.endDate;
  const seatsLeft = event.capacity ? Math.max(0, (event.capacity || 0) - (event.registrationsCount || 0)) : null;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      {event.image && (
        <img src={event.image} alt={safe(event.title)} loading="lazy" referrerPolicy="no-referrer" className="h-40 w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      )}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{safe(event.title)}</h3>
          {event.mode === 'virtual' && <span className="flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700"><FaVideo /> Virtual</span>}
          {event.mode === 'hybrid' && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">Hybrid</span>}
        </div>
        <p className="flex items-center gap-1 text-xs text-slate-500"><FaCalendarAlt /> {formatDate(start, 'long')}{end && ` → ${formatDate(end, 'long')}`}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><FaMapMarkerAlt /> {safe(event.location || 'Virtual event')}</p>
        {event.description && <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{safe(event.description)}</p>}
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] text-slate-500"><FaUsers /> {event.registrationsCount || 0}{event.capacity && ` / ${event.capacity}`}{seatsLeft !== null && seatsLeft < 20 && <span className="ml-1 text-amber-600">· {seatsLeft} seats left</span>}</span>
          <div className="flex gap-1">
            <button onClick={() => onShare(event)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 dark:border-slate-700" aria-label="Share"><FaShareAlt className="h-3 w-3" /></button>
            <button onClick={() => onView(event)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 dark:border-slate-700" aria-label="Details"><FaInfoCircle className="h-3 w-3" /></button>
            <button
              onClick={() => onRegister(event)}
              disabled={isRegistered || (event.capacity && seatsLeft === 0)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${isRegistered ? 'bg-emerald-100 text-emerald-700' : seatsLeft === 0 && event.capacity ? 'bg-slate-100 text-slate-400' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
            >
              {isRegistered ? '✓ Registered' : seatsLeft === 0 && event.capacity ? 'Full' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

const AlumniEvents = () => {
  const { currentUser } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [tab, setTab] = useState('upcoming'); // upcoming | past | registered | calendar
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [mode, setMode] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const [activeEvent, setActiveEvent] = useState(null);
  const [shareEvent, setShareEvent] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await alumniService.getEvents?.();
      if (res?.success) {
        const all = Array.isArray(res.data) ? res.data : [];
        setEvents(all);
        setRegisteredIds(new Set(all.filter((e) => e.isRegistered).map((e) => e.id)));
      }
    } catch (e) {
      safeLog(e);
      addErrorNotification('Events', 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addErrorNotification]);

  useEffect(() => { load(); }, [load]);

  const refresh = () => { setRefreshing(true); load(); };

  const filtered = useMemo(() => {
    const now = Date.now();
    return events.filter((e) => {
      const start = e.startDate?.toDate?.() || (e.startDate ? new Date(e.startDate) : null);
      const t = start?.getTime() || 0;
      if (tab === 'upcoming' && t < now) return false;
      if (tab === 'past' && t >= now) return false;
      if (tab === 'registered' && !registeredIds.has(e.id)) return false;
      if (category !== 'all' && e.category !== category) return false;
      if (mode !== 'all' && e.mode !== mode) return false;
      if (fromDate && start && start < new Date(fromDate)) return false;
      if (toDate && start && start > new Date(toDate)) return false;
      const q = search.toLowerCase();
      if (q && !`${e.title || ''} ${e.description || ''} ${e.location || ''}`.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => {
      const ta = a.startDate?.toDate?.() || new Date(a.startDate || 0);
      const tb = b.startDate?.toDate?.() || new Date(b.startDate || 0);
      return tab === 'past' ? tb - ta : ta - tb;
    });
  }, [events, tab, registeredIds, category, mode, fromDate, toDate, search]);

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handleRegister = async (event) => {
    try {
      const res = await alumniService.registerForEvent?.(event.id);
      if (res?.success) {
        setRegisteredIds((prev) => new Set([...prev, event.id]));
        addSuccessNotification('Event', `Registered for ${event.title}`);
        setActiveEvent(null);
      } else {
        addErrorNotification('Event', res?.error || 'Registration failed');
      }
    } catch {
      addErrorNotification('Event', 'Registration failed');
    }
  };

  const handleUnregister = async (event) => {
    try {
      const res = await alumniService.unregisterFromEvent?.(event.id);
      if (res?.success) {
        setRegisteredIds((prev) => {
          const n = new Set(prev);
          n.delete(event.id);
          return n;
        });
        addSuccessNotification('Event', 'Registration cancelled');
        setActiveEvent(null);
      }
    } catch {
      addErrorNotification('Event', 'Failed to unregister');
    }
  };

  const handleShare = async () => {
    try {
      const url = shareEvent?.shareUrl || `${window.location.origin}/alumni/events/${shareEvent?.id}`;
      if (navigator.share) {
        await navigator.share({ title: shareEvent?.title, text: shareMessage, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        addSuccessNotification('Shared', 'Link copied to clipboard');
      }
      setShareEvent(null);
      setShareMessage('');
    } catch {
      addErrorNotification('Share', 'Could not share event');
    }
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const days = [];
    const startOffset = first.getDay();
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(year, month, d);
      const dayEvents = events.filter((e) => {
        const ed = e.startDate?.toDate?.() || new Date(e.startDate || 0);
        return ed.getFullYear() === year && ed.getMonth() === month && ed.getDate() === d;
      });
      days.push({ date, events: dayEvents });
    }
    return days;
  }, [currentMonth, events]);

  const exportIcs = (event) => {
    const dt = event.startDate?.toDate?.() || new Date(event.startDate);
    const dtEnd = event.endDate?.toDate?.() || new Date(dt.getTime() + 3600000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${event.id}\nDTSTAMP:${fmt(new Date())}\nDTSTART:${fmt(dt)}\nDTEND:${fmt(dtEnd)}\nSUMMARY:${safe(event.title)}\nDESCRIPTION:${safe(event.description)}\nLOCATION:${safe(event.location)}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${event.id}.ics`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Alumni · Events</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Events & gatherings</h1>
              <p className="mt-1 text-sm text-slate-500">Network, learn, and reconnect with alumni around the world.</p>
            </div>
            <button onClick={refresh} disabled={refreshing} className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"><FaSync className={refreshing ? 'animate-spin' : ''} /> Refresh</button>
          </div>
        </header>

        <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {[
            { id: 'upcoming', label: 'Upcoming', icon: FaRegCalendarAlt },
            { id: 'past', label: 'Past', icon: FaCalendarCheck },
            { id: 'registered', label: 'My events', icon: FaCheckCircle },
            { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt },
          ].map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setPage(1); }} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${tab === t.id ? 'bg-brand-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
              <t.icon /> {t.label}
            </button>
          ))}
        </div>

        {(tab === 'upcoming' || tab === 'past' || tab === 'registered') && (
          <>
            <div className="mb-4 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => { setSearch(e.target.value.slice(0, 100)); setPage(1); }} placeholder="Search events by title, place, keyword…" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <button onClick={() => setShowFilters((v) => !v)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700"><FaFilter /> Filters</button>
            </div>

            {showFilters && (
              <div className="mb-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-700 dark:bg-slate-900">
                <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800">{EVENT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
                <select value={mode} onChange={(e) => { setMode(e.target.value); setPage(1); }} className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800">{EVENT_MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
              </div>
            )}

            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                <FaCalendarAlt className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No events found</p>
                <p className="mt-1 text-xs text-slate-500">Try a different filter or check back later.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {paged.map((ev) => (
                    <EventCard key={ev.id} event={ev} onRegister={handleRegister} onView={setActiveEvent} onShare={setShareEvent} />
                  ))}
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
          </>
        )}

        {tab === 'calendar' && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
              <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="rounded border p-1.5 dark:border-slate-700" aria-label="Previous month"><FaArrowLeft /></button>
                <button onClick={() => setCurrentMonth(new Date())} className="rounded border px-2 py-1 text-xs dark:border-slate-700">Today</button>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="rounded border p-1.5 dark:border-slate-700" aria-label="Next month"><FaArrowRight /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => (
                <div key={i} className={`min-h-[80px] rounded-lg border border-slate-100 p-1 text-xs dark:border-slate-800 ${day ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950'}`}>
                  {day && (
                    <>
                      <p className="mb-1 font-semibold text-slate-500">{day.date.getDate()}</p>
                      {day.events.slice(0, 2).map((ev) => (
                        <button key={ev.id} onClick={() => setActiveEvent(ev)} className="mb-0.5 block w-full truncate rounded bg-brand-100 px-1 text-left text-[10px] font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">{safe(ev.title)}</button>
                      ))}
                      {day.events.length > 2 && <p className="text-[10px] text-slate-400">+{day.events.length - 2} more</p>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {activeEvent && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{safe(activeEvent.title)}</h3>
                <button onClick={() => setActiveEvent(null)} className="text-slate-400 hover:text-red-500" aria-label="Close"><FaTimes /></button>
              </div>
              {activeEvent.image && <img src={activeEvent.image} alt="" className="mb-3 h-40 w-full rounded-lg object-cover" referrerPolicy="no-referrer" />}
              <p className="flex items-center gap-1 text-xs text-slate-500"><FaCalendarAlt /> {formatDate(activeEvent.startDate?.toDate?.() || activeEvent.startDate, 'long')}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><FaMapMarkerAlt /> {safe(activeEvent.location || 'Virtual')}</p>
              {activeEvent.mode && <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><FaGlobe /> {safe(activeEvent.mode)}</p>}
              <p className="mt-3 whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300">{safe(activeEvent.description)}</p>
              {activeEvent.agenda && (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-200">Agenda</p>
                  <ul className="list-inside list-disc text-xs text-slate-600 dark:text-slate-300">
                    {(Array.isArray(activeEvent.agenda) ? activeEvent.agenda : []).map((a, i) => <li key={i}>{safe(a)}</li>)}
                  </ul>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => exportIcs(activeEvent)} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700"><FaDownload /> Add to calendar</button>
                <button onClick={() => setShareEvent(activeEvent)} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700"><FaShareAlt /> Share</button>
                {registeredIds.has(activeEvent.id) ? (
                  <button onClick={() => handleUnregister(activeEvent)} className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"><FaTimes /> Cancel registration</button>
                ) : (
                  <button onClick={() => handleRegister(activeEvent)} className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white"><FaUserPlus /> Register</button>
                )}
              </div>
            </div>
          </div>
        )}

        {shareEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <h3 className="mb-2 text-base font-semibold">Share event</h3>
              <p className="mb-3 text-xs text-slate-500">Share this event with your alumni network.</p>
              <textarea value={shareMessage} onChange={(e) => setShareMessage(e.target.value.slice(0, 500))} rows={3} placeholder="Add a personal note…" className="mb-3 w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShareEvent(null)} className="rounded-lg border px-4 py-2 text-sm dark:border-slate-700">Cancel</button>
                <button onClick={handleShare} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Share</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AlumniEvents;