// frontend/src/pages/parent/ParentMeetings.jsx
import { supabaseMediaService } from '../../services/supabaseMediaService';
// ============================================================================
// PARENT MEETINGS - Production Ready
// Teacher meeting scheduler | Calendar | Attendees | Minutes | Follow-ups
// Firebase | Supabase | supabase | Tailwind CSS
// ============================================================================

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useParent } from '../../hooks/useParent';
import { useNotifications } from '../../hooks/useNotifications';
import {
  formatRelativeTime,
  formatDate,
  truncate,
  debounce,
} from '../../utils/formatters';
import {
  validateRequired,
  validateEmail,
  validateMaxLength,
} from '../../utils/validators';

// ============================================================================
// TAILWIND UI PRIMITIVES
// ============================================================================

const PageShell = ({ title, subtitle, actions, children, loading, error }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/parent" className="hover:text-indigo-600">Parent</Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-slate-700">{title}</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </header>

      {error && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white/60" />
          ))}
        </div>
      ) : children}
    </div>
  </div>
);

const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, loading, type = 'button', className = '', icon, ...rest }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  const variants = {
    primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    warn: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
        </svg>
      ) : icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </button>
  );
};

const Card = ({ title, subtitle, action, children, className = '', pad = true }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}>
    {(title || action) && (
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>
    )}
    <div className={pad ? 'p-5' : ''}>{children}</div>
  </section>
);

const StatsCard = ({ label, value, delta, icon, tone = 'indigo', onClick }) => {
  const tones = {
    indigo: 'from-indigo-500/10 to-indigo-500/0 text-indigo-700 ring-indigo-200',
    blue: 'from-blue-500/10 to-blue-500/0 text-blue-700 ring-blue-200',
    emerald: 'from-emerald-500/10 to-emerald-500/0 text-emerald-700 ring-emerald-200',
    amber: 'from-amber-500/10 to-amber-500/0 text-amber-700 ring-amber-200',
    rose: 'from-rose-500/10 to-rose-500/0 text-rose-700 ring-rose-200',
    violet: 'from-violet-500/10 to-violet-500/0 text-violet-700 ring-violet-200',
  };
  return (
    <div onClick={onClick} className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value ?? '—'}</p>
          {delta != null && (
            <p className="mt-1 text-xs font-medium text-slate-500">
              {typeof delta === 'number' && delta !== 0 && (
                <span className={delta > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}%
                </span>
              )}
            </p>
          )}
        </div>
        {icon && <span className={`rounded-xl bg-gradient-to-b p-2 ring-1 ${tones[tone]}`}><span aria-hidden="true">{icon}</span></span>}
      </div>
    </div>
  );
};

const Field = ({ label, name, value, onChange, type = 'text', placeholder, required, error, textarea, options, rows = 3, min, max, step, ...rest }) => (
  <div className="w-full">
    {label && <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label>}
    {textarea ? (
      <textarea id={name} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={rows}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    ) : options ? (
      <select id={name} name={name} value={value ?? ''} onChange={onChange}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} min={min} max={max} step={step}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    )}
    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center">
      <div role="dialog" aria-modal="true" className={`w-full ${sizes[size]} overflow-hidden rounded-2xl bg-white shadow-2xl`}>
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
};

const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
    {tabs.map((t) => (
      <button key={t.id} onClick={() => onChange(t.id)}
        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${active === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
        {t.label}
        {t.count != null && <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">{t.count}</span>}
      </button>
    ))}
  </div>
);

const EmptyState = ({ title, description, action, icon = '📅' }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3 text-2xl">{icon}</div>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    rescheduled: 'bg-amber-100 text-amber-700',
    'in-progress': 'bg-indigo-100 text-indigo-700',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${map[status] || 'bg-slate-100 text-slate-700'}`}>
      {status || 'scheduled'}
    </span>
  );
};

// Simple month calendar grid
const MonthCalendar = ({ events = [], month, onSelectDay }) => {
  const y = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(y, m, d));

  const byDate = {};
  events.forEach((e) => {
    const d = e.scheduledAt?.toDate?.() || (e.date ? new Date(e.date) : null);
    if (!d) return;
    const key = d.toISOString().slice(0, 10);
    (byDate[key] = byDate[key] || []).push(e);
  });

  const today = new Date().toISOString().slice(0, 10);
  const monthName = month.toLocaleString('default', { month: 'long', year: 'numeric' });
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="w-full">
      <div className="mb-3 text-center text-sm font-semibold text-slate-700">{monthName}</div>
      <div className="grid grid-cols-7 gap-1">
        {dayLabels.map((l, i) => (
          <div key={i} className="py-1 text-center text-[10px] font-bold uppercase text-slate-400">{l}</div>
        ))}
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = d.toISOString().slice(0, 10);
          const dayEvents = byDate[key] || [];
          const isToday = key === today;
          return (
            <button
              key={i}
              onClick={() => onSelectDay?.(d, dayEvents)}
              className={`relative flex h-12 flex-col items-center justify-start rounded-lg p-1 text-xs transition hover:bg-indigo-50 ${isToday ? 'ring-2 ring-indigo-400' : ''}`}
            >
              <span className={`font-semibold ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>{d.getDate()}</span>
              {dayEvents.length > 0 && (
                <span className="mt-0.5 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((_, j) => (
                    <span key={j} className="h-1 w-1 rounded-full bg-indigo-500" />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// REALTIME HOOKS
// ============================================================================

function useRealtimeCollection(collectionName, constraints = [], deps = []) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const constraintsRef = useRef(constraints);
  useEffect(() => { constraintsRef.current = constraints; });

  useEffect(() => {
    setLoading(true);
    let unsub = () => {};
    try {
      const q = query(collection(db, collectionName), ...constraintsRef.current);
      unsub = onSnapshot(q,
        (snap) => { setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
        (err) => { console.error(`[${collectionName}]`, err); setError(err.message); setLoading(false); }
      );
    } catch (err) { setError(err.message); setLoading(false); }
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, ...deps]);

  return { items, loading, error };
}

function useSupabaseUpload(folder = 'parent-uploads') {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const upload = useCallback(async (file, onComplete) => {
    if (!file) return null;
    setUploading(true); setError(null); setProgress(0);
    try {
      const result = await supabaseMediaService.uploadToSupabase(file, folder);
      setProgress(100); onComplete?.(result); return result;
    } catch (uploadError) { setError(uploadError.message); throw uploadError; }
    finally { setUploading(false); }
  }, [folder]);
  return { upload, uploading, progress, error };
}

// ============================================================================
// CRUD HELPERS
// ============================================================================

async function createDocument(collectionName, data, authorId) {
  const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), createdBy: authorId ?? null, updatedBy: authorId ?? null };
  const ref = await addDoc(collection(db, collectionName), payload);
  return { id: ref.id, ...payload };
}

async function updateDocument(collectionName, id, data, authorId) {
  await updateDoc(doc(db, collectionName, id), { ...data, updatedAt: serverTimestamp(), updatedBy: authorId ?? null });
}

async function deleteDocument(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
}

async function syncToSupabase(table, payload, id) {
  try {
    if (id) {
      const { error } = await supabase.from(table).upsert({ id, ...payload });
      if (error) throw error;
    } else {
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
    }
  } catch (err) { console.warn(`[supabase sync:${table}]`, err.message); }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ParentMeetings = () => {
  const { user, profile } = useAuth();
  const { refresh: refreshParent } = useParent();
  const { push: pushNotification } = useNotifications();
  const { upload: uploadToSupabase, uploading, progress } = useSupabaseUpload(`parents/${user?.uid ?? 'anon'}/meetings`);
  const parentId = user?.uid ?? profile?.uid;

  // ---------- Realtime ----------
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const setSearchDebounced = useMemo(() => debounce((v) => setDebouncedSearch(v), 300), []);
  useEffect(() => { setSearchDebounced(searchQuery); }, [searchQuery, setSearchDebounced]);

  const { items: children, loading: childrenLoading, error: childrenError } = useRealtimeCollection(
    'parent_children',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: meetings } = useRealtimeCollection(
    'parent_meetings',
    parentId ? [where('parentId', '==', parentId), orderBy('scheduledAt', 'desc')] : [],
    [parentId]
  );

  const { items: attendees } = useRealtimeCollection(
    'parent_meeting_attendees',
    parentId ? [where('parentId', '==', parentId)] : [],
    [parentId]
  );

  const { items: minutes } = useRealtimeCollection(
    'parent_meeting_minutes',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: followUps } = useRealtimeCollection(
    'parent_meeting_followups',
    parentId ? [where('parentId', '==', parentId), orderBy('dueDate', 'asc')] : [],
    [parentId]
  );

  const { items: contacts } = useRealtimeCollection(
    'parent_contacts',
    parentId ? [where('parentId', '==', parentId), orderBy('name', 'asc')] : [],
    [parentId]
  );

  // ---------- Derived ----------
  const now = new Date();

  const filteredMeetings = useMemo(() => {
    if (!debouncedSearch) return meetings;
    const q = debouncedSearch.toLowerCase();
    return meetings.filter((m) =>
      m.title?.toLowerCase().includes(q) ||
      m.teacherName?.toLowerCase().includes(q) ||
      m.location?.toLowerCase().includes(q)
    );
  }, [meetings, debouncedSearch]);

  const upcoming = useMemo(
    () => filteredMeetings.filter((m) => {
      const d = m.scheduledAt?.toDate?.() || (m.date ? new Date(m.date) : null);
      return d && d > now && m.status !== 'cancelled';
    }).sort((a, b) => {
      const da = a.scheduledAt?.toDate?.() || new Date(a.date);
      const db = b.scheduledAt?.toDate?.() || new Date(b.date);
      return da - db;
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredMeetings]
  );

  const past = useMemo(
    () => filteredMeetings.filter((m) => {
      const d = m.scheduledAt?.toDate?.() || (m.date ? new Date(m.date) : null);
      return d && d <= now;
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredMeetings]
  );

  const cancelled = useMemo(() => filteredMeetings.filter((m) => m.status === 'cancelled'), [filteredMeetings]);

  const overviewStats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const todays = meetings.filter((m) => {
      const d = m.scheduledAt?.toDate?.() || (m.date ? new Date(m.date) : null);
      return d && d.toISOString().slice(0, 10) === todayStr;
    });
    const week = meetings.filter((m) => {
      const d = m.scheduledAt?.toDate?.() || (m.date ? new Date(m.date) : null);
      if (!d) return false;
      const diff = (d - today) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    });
    const openFollowUps = followUps.filter((f) => f.status !== 'completed');
    return {
      upcoming: upcoming.length,
      today: todays.length,
      week: week.length,
      followUps: openFollowUps.length,
    };
  }, [meetings, upcoming, followUps]);

  // ---------- Local UI ----------
  const [meetingModal, setMeetingModal] = useState({ open: false, editing: null });
  const [minutesModal, setMinutesModal] = useState({ open: false, meeting: null });
  const [followUpModal, setFollowUpModal] = useState({ open: false, meeting: null, editing: null });
  const [detailModal, setDetailModal] = useState({ open: false, meeting: null });
  const [selectedDay, setSelectedDay] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null, type: '' });
  const [toast, setToast] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ---------- Forms ----------
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    teacherName: '',
    teacherEmail: '',
    subject: '',
    childId: '',
    childName: '',
    scheduledAt: '',
    duration: 30,
    location: 'online',
    meetingUrl: '',
    agenda: '',
    priority: 'normal',
    status: 'scheduled',
    attendeeIds: [],
  });

  const [minutesForm, setMinutesForm] = useState({ summary: '', decisions: '', actionItems: '', attachmentUrl: '' });
  const [followUpForm, setFollowUpForm] = useState({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'medium', status: 'pending' });
  const [formErrors, setFormErrors] = useState({});

  // ---------- Validation ----------
  const validateMeeting = () => {
    const errors = {};
    if (!validateRequired(meetingForm.title)) errors.title = 'Title required';
    if (!validateRequired(meetingForm.teacherName)) errors.teacherName = 'Teacher name required';
    if (!validateRequired(meetingForm.scheduledAt)) errors.scheduledAt = 'Date & time required';
    if (!validateRequired(meetingForm.childId)) errors.childId = 'Select child';
    if (meetingForm.teacherEmail && !validateEmail(meetingForm.teacherEmail)) errors.teacherEmail = 'Invalid email';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateMinutes = () => {
    const errors = {};
    if (!validateRequired(minutesForm.summary)) errors.summary = 'Summary required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateFollowUp = () => {
    const errors = {};
    if (!validateRequired(followUpForm.title)) errors.title = 'Title required';
    if (!validateRequired(followUpForm.dueDate)) errors.dueDate = 'Due date required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };

  // ---------- CRUD: Meetings ----------
  const handleSaveMeeting = async () => {
    if (!validateMeeting()) return;
    try {
      const scheduledTs = meetingForm.scheduledAt ? Timestamp.fromDate(new Date(meetingForm.scheduledAt)) : null;
      const payload = {
        ...meetingForm,
        duration: Number(meetingForm.duration) || 30,
        scheduledAt: scheduledTs,
        parentId,
      };
      if (meetingModal.editing) {
        await updateDocument('parent_meetings', meetingModal.editing.id, payload, parentId);
        await syncToSupabase('parent_meetings', payload, meetingModal.editing.id);
        showToast('Meeting updated');
      } else {
        const created = await createDocument('parent_meetings', payload, parentId);
        await syncToSupabase('parent_meetings', payload, created.id);
        pushNotification?.({ title: 'Meeting scheduled', body: `${payload.title} on ${new Date(meetingForm.scheduledAt).toLocaleString()}`, audience: 'parent' });
        showToast('Meeting scheduled');
      }
      setMeetingModal({ open: false, editing: null });
      setMeetingForm({
        title: '', teacherName: '', teacherEmail: '', subject: '', childId: '', childName: '',
        scheduledAt: '', duration: 30, location: 'online', meetingUrl: '', agenda: '',
        priority: 'normal', status: 'scheduled', attendeeIds: [],
      });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteMeeting = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_meetings', confirmDelete.target.id);
      await supabase.from('parent_meetings').delete().eq('id', confirmDelete.target.id);
      showToast('Meeting deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleCompleteMeeting = async (meeting) => {
    try {
      await updateDocument('parent_meetings', meeting.id, { status: 'completed', completedAt: serverTimestamp() }, parentId);
      await syncToSupabase('parent_meetings', { status: 'completed' }, meeting.id);
      showToast('Meeting marked complete');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleCancelMeeting = async (meeting) => {
    try {
      await updateDocument('parent_meetings', meeting.id, { status: 'cancelled', cancelledAt: serverTimestamp() }, parentId);
      await syncToSupabase('parent_meetings', { status: 'cancelled' }, meeting.id);
      showToast('Meeting cancelled');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Minutes ----------
  const handleSaveMinutes = async () => {
    if (!validateMinutes()) return;
    if (!minutesModal.meeting) return;
    try {
      const payload = { ...minutesForm, meetingId: minutesModal.meeting.id, parentId };
      const created = await createDocument('parent_meeting_minutes', payload, parentId);
      await syncToSupabase('parent_meeting_minutes', payload, created.id);
      showToast('Minutes saved');
      setMinutesModal({ open: false, meeting: null });
      setMinutesForm({ summary: '', decisions: '', actionItems: '', attachmentUrl: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteMinutes = async (min) => {
    try {
      await deleteDocument('parent_meeting_minutes', min.id);
      await supabase.from('parent_meeting_minutes').delete().eq('id', min.id);
      showToast('Minutes deleted');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Follow-ups ----------
  const handleSaveFollowUp = async () => {
    if (!validateFollowUp()) return;
    try {
      const payload = {
        ...followUpForm,
        meetingId: followUpModal.meeting?.id || followUpModal.editing?.meetingId || '',
        parentId,
      };
      if (followUpModal.editing) {
        await updateDocument('parent_meeting_followups', followUpModal.editing.id, payload, parentId);
        await syncToSupabase('parent_meeting_followups', payload, followUpModal.editing.id);
        showToast('Follow-up updated');
      } else {
        const created = await createDocument('parent_meeting_followups', payload, parentId);
        await syncToSupabase('parent_meeting_followups', payload, created.id);
        showToast('Follow-up added');
      }
      setFollowUpModal({ open: false, meeting: null, editing: null });
      setFollowUpForm({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'medium', status: 'pending' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleCompleteFollowUp = async (f) => {
    try {
      await updateDocument('parent_meeting_followups', f.id, { status: 'completed', completedAt: serverTimestamp() }, parentId);
      await syncToSupabase('parent_meeting_followups', { status: 'completed' }, f.id);
      showToast('Follow-up complete');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteFollowUp = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_meeting_followups', confirmDelete.target.id);
      await supabase.from('parent_meeting_followups').delete().eq('id', confirmDelete.target.id);
      showToast('Follow-up deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Uploads ----------
  const handleMinutesAttachment = async (file) => {
    try {
      const result = await uploadToSupabase(file);
      setMinutesForm((f) => ({ ...f, attachmentUrl: result?.secure_url || '' }));
      showToast('Attachment uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Export CSV ----------
  const exportMeetingsCSV = () => {
    const header = ['Title', 'Teacher', 'Subject', 'Child', 'Scheduled', 'Location', 'Status'];
    const rows = meetings.map((m) => {
      const d = m.scheduledAt?.toDate?.()?.toISOString?.() || m.date || '';
      return [
        `"${m.title ?? ''}"`,
        `"${m.teacherName ?? ''}"`,
        `"${m.subject ?? ''}"`,
        `"${m.childName ?? ''}"`,
        d,
        `"${m.location ?? ''}"`,
        m.status ?? '',
      ];
    });
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `parent-meetings-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- ICS export ----------
  const exportMeetingICS = (meeting) => {
    const d = meeting.scheduledAt?.toDate?.() || new Date(meeting.date);
    const dtStart = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dtEnd = new Date(d.getTime() + (meeting.duration || 30) * 60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CareerConnect//ParentMeetings//EN',
      'BEGIN:VEVENT',
      `UID:${meeting.id}@careerconnect`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${meeting.title || 'Meeting'}`,
      `DESCRIPTION:${(meeting.agenda || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${meeting.location || ''}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${meeting.title || 'meeting'}.ics`; a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Render ----------
  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { id: 'calendar', label: 'Calendar' },
    { id: 'past', label: 'Past', count: past.length },
    { id: 'minutes', label: 'Minutes', count: minutes.length },
    { id: 'followups', label: 'Follow-ups', count: followUps.length },
    { id: 'cancelled', label: 'Cancelled', count: cancelled.length },
  ];

  return (
    <PageShell
      title="Meetings"
      subtitle="Schedule, track, and follow up on parent-teacher meetings."
      loading={childrenLoading}
      error={childrenError}
      actions={
        <>
          <Btn variant="outline" onClick={refreshParent}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </Btn>
          <Btn size="sm" variant="outline" onClick={exportMeetingsCSV}>Export CSV</Btn>
          <Btn onClick={() => setMeetingModal({ open: true, editing: null })}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            Schedule Meeting
          </Btn>
        </>
      }
    >
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition ${toast.tone === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Upcoming" value={overviewStats.upcoming} tone="indigo" icon="📅" />
        <StatsCard label="Today" value={overviewStats.today} tone="rose" icon="⏰" />
        <StatsCard label="This Week" value={overviewStats.week} tone="amber" icon="🗓️" />
        <StatsCard label="Open Follow-ups" value={overviewStats.followUps} tone="emerald" icon="✅" />
      </div>

      {/* Tabs + Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search meetings…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:w-64"
        />
      </div>

      {/* UPCOMING */}
      {activeTab === 'upcoming' && (
        <Card title="Upcoming Meetings">
          {upcoming.length === 0 ? (
            <EmptyState title="No upcoming meetings" description="Schedule one to get started." action={<Btn onClick={() => setMeetingModal({ open: true, editing: null })}>Schedule Meeting</Btn>} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((m) => {
                const d = m.scheduledAt?.toDate?.();
                return (
                  <li key={m.id} className="flex items-start gap-4 py-4">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                      <span className="text-[10px] font-bold uppercase">{d ? d.toLocaleString('default', { month: 'short' }) : '—'}</span>
                      <span className="text-lg font-bold leading-none">{d ? d.getDate() : '—'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800">{m.title}</p>
                        <StatusBadge status={m.status} />
                        {m.priority === 'high' && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">HIGH</span>}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {m.teacherName} · {d ? d.toLocaleString() : 'TBD'} · {m.duration || 30} min · {m.location}
                      </p>
                      {m.agenda && <p className="truncate text-xs text-slate-400">{m.agenda}</p>}
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Btn size="sm" variant="outline" onClick={() => setDetailModal({ open: true, meeting: m })}>Details</Btn>
                      <Btn size="sm" variant="success" onClick={() => handleCompleteMeeting(m)}>Complete</Btn>
                      <Btn size="sm" variant="warn" onClick={() => handleCancelMeeting(m)}>Cancel</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => exportMeetingICS(m)}>ICS</Btn>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {/* CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card
              title="Calendar"
              action={
                <div className="flex gap-2">
                  <Btn size="sm" variant="ghost" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>←</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setCalendarMonth(new Date())}>Today</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>→</Btn>
                </div>
              }
            >
              <MonthCalendar
                events={meetings}
                month={calendarMonth}
                onSelectDay={(d, evts) => setSelectedDay({ date: d, events: evts })}
              />
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card title={selectedDay ? selectedDay.date.toDateString() : 'Select a day'} subtitle={selectedDay ? `${selectedDay.events.length} meeting(s)` : 'Click any day to view meetings'}>
              {!selectedDay ? (
                <p className="text-sm text-slate-500">Pick a day from the calendar.</p>
              ) : selectedDay.events.length === 0 ? (
                <p className="text-sm text-slate-500">No meetings on this day.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {selectedDay.events.map((m) => {
                    const d = m.scheduledAt?.toDate?.();
                    return (
                      <li key={m.id} className="py-3">
                        <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                        <p className="text-xs text-slate-500">{d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} · {m.teacherName}</p>
                        <div className="mt-2 flex gap-2">
                          <Btn size="sm" variant="outline" onClick={() => setDetailModal({ open: true, meeting: m })}>Details</Btn>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* PAST */}
      {activeTab === 'past' && (
        <Card title="Past Meetings">
          {past.length === 0 ? (
            <EmptyState title="No past meetings" description="Completed meetings appear here." icon="⏳" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {past.map((m) => {
                const d = m.scheduledAt?.toDate?.();
                const mins = minutes.filter((x) => x.meetingId === m.id);
                return (
                  <li key={m.id} className="flex items-start gap-4 py-4">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <span className="text-[10px] font-bold uppercase">{d ? d.toLocaleString('default', { month: 'short' }) : '—'}</span>
                      <span className="text-lg font-bold leading-none">{d ? d.getDate() : '—'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800">{m.title}</p>
                        <StatusBadge status={m.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {m.teacherName} · {d ? d.toLocaleString() : ''}
                      </p>
                      {mins.length > 0 && <p className="text-xs text-emerald-600">✓ {mins.length} minutes recorded</p>}
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Btn size="sm" variant="outline" onClick={() => setDetailModal({ open: true, meeting: m })}>Details</Btn>
                      <Btn size="sm" onClick={() => setMinutesModal({ open: true, meeting: m })}>Add Minutes</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => setFollowUpModal({ open: true, meeting: m, editing: null })}>Add Follow-up</Btn>
                      <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: m, type: 'meeting' })}>Delete</Btn>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {/* MINUTES */}
      {activeTab === 'minutes' && (
        <Card title="Meeting Minutes">
          {minutes.length === 0 ? (
            <EmptyState title="No minutes recorded" description="Add minutes after meetings to track decisions." icon="📝" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {minutes.map((min) => {
                const meeting = meetings.find((m) => m.id === min.meetingId);
                return (
                  <li key={min.id} className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{meeting?.title || 'Meeting'}</p>
                      <span className="text-xs text-slate-400">{formatRelativeTime(min.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{min.summary}</p>
                    {min.decisions && <p className="mt-1 text-xs text-slate-600"><span className="font-semibold">Decisions:</span> {min.decisions}</p>}
                    {min.actionItems && <p className="mt-1 text-xs text-slate-600"><span className="font-semibold">Action items:</span> {min.actionItems}</p>}
                    {min.attachmentUrl && <a href={min.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:underline">View attachment</a>}
                    <div className="mt-3 flex justify-end">
                      <Btn size="sm" variant="danger" onClick={() => handleDeleteMinutes(min)}>Delete</Btn>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {/* FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <Card title="Follow-ups" action={<Btn size="sm" onClick={() => setFollowUpModal({ open: true, meeting: null, editing: null })}>Add Follow-up</Btn>}>
          {followUps.length === 0 ? (
            <EmptyState title="No follow-ups" description="Track action items from meetings." action={<Btn onClick={() => setFollowUpModal({ open: true, meeting: null, editing: null })}>Add Follow-up</Btn>} icon="✅" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {followUps.map((f) => (
                <li key={f.id} className="flex items-start gap-4 py-4">
                  <span className={`rounded-xl p-3 ${f.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : f.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                    {f.status === 'completed' ? '✅' : '📌'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">{f.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${f.priority === 'high' ? 'bg-red-100 text-red-700' : f.priority === 'low' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>{f.priority?.toUpperCase()}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">Assigned to {f.assignedTo || 'me'} · Due {f.dueDate}</p>
                    {f.description && <p className="truncate text-xs text-slate-400">{f.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {f.status !== 'completed' && <Btn size="sm" variant="success" onClick={() => handleCompleteFollowUp(f)}>Complete</Btn>}
                    <Btn size="sm" variant="outline" onClick={() => {
                      setFollowUpForm({ title: f.title || '', description: f.description || '', assignedTo: f.assignedTo || '', dueDate: f.dueDate || '', priority: f.priority || 'medium', status: f.status || 'pending' });
                      setFollowUpModal({ open: true, meeting: null, editing: f });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: f, type: 'followup' })}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* CANCELLED */}
      {activeTab === 'cancelled' && (
        <Card title="Cancelled Meetings">
          {cancelled.length === 0 ? (
            <EmptyState title="No cancelled meetings" description="Cancellations will appear here." icon="🚫" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {cancelled.map((m) => {
                const d = m.scheduledAt?.toDate?.();
                return (
                  <li key={m.id} className="flex items-start gap-4 py-4 opacity-75">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-600">🚫</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{m.title}</p>
                      <p className="text-xs text-slate-500">{m.teacherName} · {d ? d.toLocaleString() : ''}</p>
                    </div>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: m, type: 'meeting' })}>Delete</Btn>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {/* MEETING MODAL */}
      <Modal
        open={meetingModal.open}
        onClose={() => setMeetingModal({ open: false, editing: null })}
        title={meetingModal.editing ? 'Edit Meeting' : 'Schedule Meeting'}
        size="lg"
        footer={<><Btn variant="ghost" onClick={() => setMeetingModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveMeeting}>Save</Btn></>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" name="title" value={meetingForm.title} onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} required error={formErrors.title} />
          <Field label="Subject" name="subject" value={meetingForm.subject} onChange={(e) => setMeetingForm({ ...meetingForm, subject: e.target.value })} />
          <Field label="Teacher" name="teacherName" value={meetingForm.teacherName} onChange={(e) => setMeetingForm({ ...meetingForm, teacherName: e.target.value })} required error={formErrors.teacherName} />
          <Field label="Teacher Email" name="teacherEmail" type="email" value={meetingForm.teacherEmail} onChange={(e) => setMeetingForm({ ...meetingForm, teacherEmail: e.target.value })} error={formErrors.teacherEmail} />
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={meetingForm.childId} onChange={(e) => {
            const c = children.find((x) => x.id === e.target.value);
            setMeetingForm({ ...meetingForm, childId: e.target.value, childName: c?.fullName || '' });
          }} required error={formErrors.childId} />
          <Field label="Scheduled At" name="scheduledAt" type="datetime-local" value={meetingForm.scheduledAt} onChange={(e) => setMeetingForm({ ...meetingForm, scheduledAt: e.target.value })} required error={formErrors.scheduledAt} />
          <Field label="Duration (min)" name="duration" type="number" min={5} step={5} value={meetingForm.duration} onChange={(e) => setMeetingForm({ ...meetingForm, duration: e.target.value })} />
          <Field label="Location" name="location" options={[
            { value: 'online', label: 'Online' },
            { value: 'in-person', label: 'In Person' },
            { value: 'phone', label: 'Phone' },
            { value: 'other', label: 'Other' },
          ]} value={meetingForm.location} onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })} />
          <Field label="Meeting URL" name="meetingUrl" value={meetingForm.meetingUrl} onChange={(e) => setMeetingForm({ ...meetingForm, meetingUrl: e.target.value })} placeholder="https://meet…" />
          <Field label="Priority" name="priority" options={[
            { value: 'low', label: 'Low' },
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'High' },
          ]} value={meetingForm.priority} onChange={(e) => setMeetingForm({ ...meetingForm, priority: e.target.value })} />
          <div className="sm:col-span-2">
            <Field label="Agenda" name="agenda" textarea rows={4} value={meetingForm.agenda} onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })} placeholder="Topics to discuss…" />
          </div>
        </div>
      </Modal>

      {/* MINUTES MODAL */}
      <Modal
        open={minutesModal.open}
        onClose={() => setMinutesModal({ open: false, meeting: null })}
        title="Add Meeting Minutes"
        footer={<><Btn variant="ghost" onClick={() => setMinutesModal({ open: false, meeting: null })}>Cancel</Btn><Btn onClick={handleSaveMinutes}>Save</Btn></>}
      >
        <div className="space-y-4">
          {minutesModal.meeting && (
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-800">{minutesModal.meeting.title}</p>
              <p className="text-xs text-slate-500">{minutesModal.meeting.teacherName}</p>
            </div>
          )}
          <Field label="Summary" name="summary" textarea rows={4} value={minutesForm.summary} onChange={(e) => setMinutesForm({ ...minutesForm, summary: e.target.value })} required error={formErrors.summary} />
          <Field label="Decisions" name="decisions" textarea rows={3} value={minutesForm.decisions} onChange={(e) => setMinutesForm({ ...minutesForm, decisions: e.target.value })} />
          <Field label="Action Items" name="actionItems" textarea rows={3} value={minutesForm.actionItems} onChange={(e) => setMinutesForm({ ...minutesForm, actionItems: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Attachment</label>
            <input type="file" onChange={(e) => e.target.files?.[0] && handleMinutesAttachment(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100" />
            {uploading && <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} /></div>}
            {minutesForm.attachmentUrl && <a href={minutesForm.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:underline">View attachment</a>}
          </div>
        </div>
      </Modal>

      {/* FOLLOW-UP MODAL */}
      <Modal
        open={followUpModal.open}
        onClose={() => setFollowUpModal({ open: false, meeting: null, editing: null })}
        title={followUpModal.editing ? 'Edit Follow-up' : 'Add Follow-up'}
        footer={<><Btn variant="ghost" onClick={() => setFollowUpModal({ open: false, meeting: null, editing: null })}>Cancel</Btn><Btn onClick={handleSaveFollowUp}>Save</Btn></>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" name="title" value={followUpForm.title} onChange={(e) => setFollowUpForm({ ...followUpForm, title: e.target.value })} required error={formErrors.title} />
          <Field label="Due Date" name="dueDate" type="date" value={followUpForm.dueDate} onChange={(e) => setFollowUpForm({ ...followUpForm, dueDate: e.target.value })} required error={formErrors.dueDate} />
          <Field label="Assigned To" name="assignedTo" value={followUpForm.assignedTo} onChange={(e) => setFollowUpForm({ ...followUpForm, assignedTo: e.target.value })} placeholder="e.g., Me, Teacher, Child" />
          <Field label="Priority" name="priority" options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]} value={followUpForm.priority} onChange={(e) => setFollowUpForm({ ...followUpForm, priority: e.target.value })} />
          <div className="sm:col-span-2"><Field label="Description" name="description" textarea value={followUpForm.description} onChange={(e) => setFollowUpForm({ ...followUpForm, description: e.target.value })} /></div>
        </div>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, meeting: null })}
        title={detailModal.meeting?.title || 'Meeting Details'}
        size="lg"
        footer={<>
          {detailModal.meeting && <Btn variant="ghost" onClick={() => exportMeetingICS(detailModal.meeting)}>Add to Calendar</Btn>}
          <Btn onClick={() => setDetailModal({ open: false, meeting: null })}>Close</Btn>
        </>}
      >
        {detailModal.meeting && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={detailModal.meeting.status} />
              {detailModal.meeting.priority === 'high' && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">HIGH</span>}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><p className="text-xs text-slate-500">Teacher</p><p className="text-sm font-medium text-slate-800">{detailModal.meeting.teacherName}</p></div>
              <div><p className="text-xs text-slate-500">Subject</p><p className="text-sm font-medium text-slate-800">{detailModal.meeting.subject || '—'}</p></div>
              <div><p className="text-xs text-slate-500">Child</p><p className="text-sm font-medium text-slate-800">{detailModal.meeting.childName || '—'}</p></div>
              <div><p className="text-xs text-slate-500">Scheduled</p><p className="text-sm font-medium text-slate-800">{detailModal.meeting.scheduledAt?.toDate?.()?.toLocaleString?.() ?? '—'}</p></div>
              <div><p className="text-xs text-slate-500">Duration</p><p className="text-sm font-medium text-slate-800">{detailModal.meeting.duration || 30} min</p></div>
              <div><p className="text-xs text-slate-500">Location</p><p className="text-sm font-medium text-slate-800 capitalize">{detailModal.meeting.location || '—'}</p></div>
            </div>
            {detailModal.meeting.meetingUrl && (
              <a href={detailModal.meeting.meetingUrl} target="_blank" rel="noreferrer" className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Join Meeting
              </a>
            )}
            {detailModal.meeting.agenda && (
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-700">Agenda</p>
                <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{detailModal.meeting.agenda}</p>
              </div>
            )}
            {(() => {
              const mins = minutes.filter((x) => x.meetingId === detailModal.meeting.id);
              if (!mins.length) return null;
              return (
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-700">Minutes</p>
                  <ul className="space-y-2">
                    {mins.map((min) => (
                      <li key={min.id} className="rounded-xl bg-slate-50 p-3">
                        <p className="text-sm text-slate-700">{min.summary}</p>
                        {min.decisions && <p className="mt-1 text-xs text-slate-600"><span className="font-semibold">Decisions:</span> {min.decisions}</p>}
                        {min.actionItems && <p className="mt-1 text-xs text-slate-600"><span className="font-semibold">Actions:</span> {min.actionItems}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* CONFIRM DELETE */}
      <Modal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, target: null, type: '' })}
        title="Confirm Delete"
        size="sm"
        footer={<><Btn variant="ghost" onClick={() => setConfirmDelete({ open: false, target: null, type: '' })}>Cancel</Btn><Btn variant="danger" onClick={() => {
          if (confirmDelete.type === 'meeting') handleDeleteMeeting();
          if (confirmDelete.type === 'followup') handleDeleteFollowUp();
        }}>Delete</Btn></>}
      >
        <p className="text-sm text-slate-600">Are you sure? This action cannot be undone.</p>
      </Modal>
    </PageShell>
  );
};

export default memo(ParentMeetings);
