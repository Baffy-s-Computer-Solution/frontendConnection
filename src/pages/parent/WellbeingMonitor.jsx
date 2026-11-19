// frontend/src/pages/parent/WellbeingMonitor.jsx
// ============================================================================
// WELLBEING MONITOR - Production Ready
// Mood tracking | Risk alerts | Counselor notes | Interventions | Realtime
// Firebase | Supabase | Cloudinary | Tailwind CSS
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
  increment,
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
  validateNumberRange,
  validateMaxLength,
} from '../../utils/validators';

// ============================================================================
// TAILWIND UI PRIMITIVES
// ============================================================================

const PageShell = ({ title, subtitle, actions, children, loading, error }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/parent" className="hover:text-emerald-600">Parent</Link>
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
    primary: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus:ring-emerald-500',
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

const StatsCard = ({ label, value, delta, icon, tone = 'emerald', onClick }) => {
  const tones = {
    emerald: 'from-emerald-500/10 to-emerald-500/0 text-emerald-700 ring-emerald-200',
    blue: 'from-blue-500/10 to-blue-500/0 text-blue-700 ring-blue-200',
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
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    ) : options ? (
      <select id={name} name={name} value={value ?? ''} onChange={onChange}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} min={min} max={max} step={step}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
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

const EmptyState = ({ title, description, action, icon = '💚' }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3 text-2xl">{icon}</div>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

const MoodEmoji = ({ mood, score }) => {
  if (score != null && score <= 3) return <span aria-label="very sad">😢</span>;
  if (score != null && score <= 5) return <span aria-label="sad">🙁</span>;
  if (score != null && score <= 7) return <span aria-label="neutral">😐</span>;
  if (score != null && score <= 9) return <span aria-label="happy">🙂</span>;
  if (score != null) return <span aria-label="very happy">😄</span>;
  const map = { happy: '😄', good: '🙂', neutral: '😐', sad: '🙁', anxious: '😰', angry: '😠' };
  return <span>{map[mood] || '😐'}</span>;
};

// Simple Line Chart (SVG)
const LineChart = ({ data = [], height = 200, tone = '#10b981' }) => {
  const max = Math.max(10, ...data.map((d) => d.value));
  const min = 0;
  const w = 100;
  const h = 100;
  const stepX = data.length > 1 ? w / (data.length - 1) : w;
  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = h - ((d.value - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
        <polygon points={areaPoints} fill={`${tone}33`} />
        <polyline points={points} fill="none" stroke={tone} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {data.map((d, i) => {
          const x = i * stepX;
          const y = h - ((d.value - min) / (max - min || 1)) * h;
          return <circle key={i} cx={x} cy={y} r="1.5" fill={tone} vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-slate-400">
        {data.map((d, i) => <span key={i}>{d.label}</span>)}
      </div>
    </div>
  );
};

// Risk Badge
const RiskBadge = ({ level }) => {
  const map = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${map[level] || map.low}`}>
      {level || 'low'}
    </span>
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

function useCloudinaryUpload(folder = 'parent-uploads') {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = useCallback(async (file, onComplete) => {
    if (!file) return null;
    setUploading(true); setError(null); setProgress(0);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !preset) throw new Error('Cloudinary env missing');

      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', preset);
      form.append('folder', folder);

      const xhr = new XMLHttpRequest();
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      const result = await new Promise((resolve, reject) => {
        xhr.open('POST', url);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else reject(new Error(`Cloudinary upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(form);
      });

      onComplete?.(result);
      setUploading(false);
      return result;
    } catch (err) { setError(err.message); setUploading(false); throw err; }
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

const WellbeingMonitor = () => {
  const { user, profile } = useAuth();
  const { refresh: refreshParent } = useParent();
  const { push: pushNotification } = useNotifications();
  const { upload: uploadToCloudinary, uploading, progress } = useCloudinaryUpload(`parents/${user?.uid ?? 'anon'}/wellbeing`);
  const parentId = user?.uid ?? profile?.uid;

  // ---------- Realtime ----------
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const setSearchDebounced = useMemo(() => debounce((v) => setDebouncedSearch(v), 300), []);
  useEffect(() => { setSearchDebounced(searchQuery); }, [searchQuery, setSearchDebounced]);

  const { items: children, loading: childrenLoading, error: childrenError } = useRealtimeCollection(
    'parent_children',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: moodLogs } = useRealtimeCollection(
    'wellbeing_records',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: alerts } = useRealtimeCollection(
    'wellbeing_alerts',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: counselorNotes } = useRealtimeCollection(
    'wellbeing_counselor_notes',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: interventions } = useRealtimeCollection(
    'wellbeing_interventions',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: checkIns } = useRealtimeCollection(
    'wellbeing_checkins',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: resources } = useRealtimeCollection(
    'wellbeing_resources',
    [orderBy('createdAt', 'desc'), limit(50)],
    []
  );

  // ---------- Derived ----------
  const filteredMoodLogs = useMemo(() => {
    if (!debouncedSearch) return moodLogs;
    const q = debouncedSearch.toLowerCase();
    return moodLogs.filter((m) =>
      m.mood?.toLowerCase().includes(q) ||
      m.notes?.toLowerCase().includes(q) ||
      m.childName?.toLowerCase().includes(q)
    );
  }, [moodLogs, debouncedSearch]);

  const overviewStats = useMemo(() => {
    const avg = moodLogs.length
      ? Math.round(moodLogs.reduce((s, m) => s + (Number(m.score) || 0), 0) / moodLogs.length * 10) / 10
      : null;
    const last7 = moodLogs.filter((m) => {
      const d = m.createdAt?.toDate?.();
      if (!d) return false;
      return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
    });
    const avg7 = last7.length
      ? Math.round(last7.reduce((s, m) => s + (Number(m.score) || 0), 0) / last7.length * 10) / 10
      : null;
    const openAlerts = alerts.filter((a) => a.status !== 'resolved');
    const activeInterventions = interventions.filter((i) => i.status === 'active');
    return { avg, avg7, openAlerts: openAlerts.length, activeInterventions: activeInterventions.length };
  }, [moodLogs, alerts, interventions]);

  const trendData = useMemo(() => {
    const days = 14;
    const map = {};
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key] = { label: `${d.getMonth() + 1}/${d.getDate()}`, value: 0, count: 0 };
    }
    moodLogs.forEach((m) => {
      const d = m.createdAt?.toDate?.() || (m.date ? new Date(m.date) : null);
      if (!d) return;
      const key = d.toISOString().slice(0, 10);
      if (map[key]) { map[key].value += Number(m.score) || 0; map[key].count += 1; }
    });
    return Object.values(map).map((x) => ({ label: x.label, value: x.count ? Math.round((x.value / x.count) * 10) / 10 : 0 }));
  }, [moodLogs]);

  // ---------- Local UI ----------
  const [moodModal, setMoodModal] = useState({ open: false, editing: null });
  const [alertModal, setAlertModal] = useState({ open: false, editing: null });
  const [noteModal, setNoteModal] = useState({ open: false, editing: null });
  const [interventionModal, setInterventionModal] = useState({ open: false, editing: null });
  const [checkInModal, setCheckInModal] = useState({ open: false, editing: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null, type: '' });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ---------- Forms ----------
  const [moodForm, setMoodForm] = useState({ childId: '', childName: '', score: 7, mood: 'neutral', notes: '', date: '', photoUrl: '' });
  const [alertForm, setAlertForm] = useState({ childId: '', childName: '', title: '', description: '', severity: 'medium', status: 'open', trigger: 'manual' });
  const [noteForm, setNoteForm] = useState({ childId: '', childName: '', counselor: '', note: '', date: '', confidential: false, attachmentUrl: '' });
  const [interventionForm, setInterventionForm] = useState({ childId: '', childName: '', title: '', description: '', startDate: '', endDate: '', status: 'active', owner: '', attachmentUrl: '' });
  const [checkInForm, setCheckInForm] = useState({ childId: '', childName: '', question: 'How are you feeling today?', answer: '', mood: 'neutral', date: '' });

  const [formErrors, setFormErrors] = useState({});

  // ---------- Validation ----------
  const validateMood = () => {
    const errors = {};
    if (!validateRequired(moodForm.childId)) errors.childId = 'Select child';
    if (!validateNumberRange(moodForm.score, 1, 10)) errors.score = 'Score 1-10';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateAlert = () => {
    const errors = {};
    if (!validateRequired(alertForm.title)) errors.title = 'Title required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateNote = () => {
    const errors = {};
    if (!validateRequired(noteForm.note)) errors.note = 'Note required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateIntervention = () => {
    const errors = {};
    if (!validateRequired(interventionForm.title)) errors.title = 'Title required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateCheckIn = () => {
    const errors = {};
    if (!validateRequired(checkInForm.childId)) errors.childId = 'Select child';
    if (!validateRequired(checkInForm.answer)) errors.answer = 'Answer required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };

  // ---------- CRUD: Mood ----------
  const handleSaveMood = async () => {
    if (!validateMood()) return;
    try {
      const payload = { ...moodForm, score: Number(moodForm.score), parentId };
      if (moodModal.editing) {
        await updateDocument('wellbeing_records', moodModal.editing.id, payload, parentId);
        await syncToSupabase('wellbeing_records', payload, moodModal.editing.id);
        showToast('Mood log updated');
      } else {
        const created = await createDocument('wellbeing_records', payload, parentId);
        await syncToSupabase('wellbeing_records', payload, created.id);
        showToast('Mood log added');
        // Auto-alert if very low
        if (Number(payload.score) <= 3) {
          const alertPayload = {
            parentId,
            childId: payload.childId,
            childName: payload.childName,
            title: `Low mood detected: ${payload.childName || 'child'}`,
            description: `Score ${payload.score}/10 logged on ${payload.date || new Date().toISOString().slice(0, 10)}.`,
            severity: payload.score <= 2 ? 'critical' : 'high',
            status: 'open',
            trigger: 'auto',
          };
          await createDocument('wellbeing_alerts', alertPayload, parentId);
          await syncToSupabase('wellbeing_alerts', alertPayload);
          pushNotification?.({ title: alertPayload.title, body: alertPayload.description, audience: 'parent', severity: alertPayload.severity });
          showToast('Low mood detected — alert created', 'error');
        }
      }
      setMoodModal({ open: false, editing: null });
      setMoodForm({ childId: '', childName: '', score: 7, mood: 'neutral', notes: '', date: '', photoUrl: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteMood = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('wellbeing_records', confirmDelete.target.id);
      await supabase.from('wellbeing_records').delete().eq('id', confirmDelete.target.id);
      showToast('Mood log deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Alerts ----------
  const handleSaveAlert = async () => {
    if (!validateAlert()) return;
    try {
      const payload = { ...alertForm, parentId };
      if (alertModal.editing) {
        await updateDocument('wellbeing_alerts', alertModal.editing.id, payload, parentId);
        await syncToSupabase('wellbeing_alerts', payload, alertModal.editing.id);
        showToast('Alert updated');
      } else {
        const created = await createDocument('wellbeing_alerts', payload, parentId);
        await syncToSupabase('wellbeing_alerts', payload, created.id);
        showToast('Alert created');
      }
      setAlertModal({ open: false, editing: null });
      setAlertForm({ childId: '', childName: '', title: '', description: '', severity: 'medium', status: 'open', trigger: 'manual' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleResolveAlert = async (alert) => {
    try {
      await updateDocument('wellbeing_alerts', alert.id, { status: 'resolved', resolvedAt: serverTimestamp() }, parentId);
      await syncToSupabase('wellbeing_alerts', { status: 'resolved' }, alert.id);
      showToast('Alert resolved');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteAlert = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('wellbeing_alerts', confirmDelete.target.id);
      await supabase.from('wellbeing_alerts').delete().eq('id', confirmDelete.target.id);
      showToast('Alert deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Counselor Notes ----------
  const handleSaveNote = async () => {
    if (!validateNote()) return;
    try {
      const payload = { ...noteForm, parentId };
      if (noteModal.editing) {
        await updateDocument('wellbeing_counselor_notes', noteModal.editing.id, payload, parentId);
        await syncToSupabase('wellbeing_counselor_notes', payload, noteModal.editing.id);
        showToast('Note updated');
      } else {
        const created = await createDocument('wellbeing_counselor_notes', payload, parentId);
        await syncToSupabase('wellbeing_counselor_notes', payload, created.id);
        showToast('Note added');
      }
      setNoteModal({ open: false, editing: null });
      setNoteForm({ childId: '', childName: '', counselor: '', note: '', date: '', confidential: false, attachmentUrl: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteNote = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('wellbeing_counselor_notes', confirmDelete.target.id);
      await supabase.from('wellbeing_counselor_notes').delete().eq('id', confirmDelete.target.id);
      showToast('Note deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Interventions ----------
  const handleSaveIntervention = async () => {
    if (!validateIntervention()) return;
    try {
      const payload = { ...interventionForm, parentId };
      if (interventionModal.editing) {
        await updateDocument('wellbeing_interventions', interventionModal.editing.id, payload, parentId);
        await syncToSupabase('wellbeing_interventions', payload, interventionModal.editing.id);
        showToast('Intervention updated');
      } else {
        const created = await createDocument('wellbeing_interventions', payload, parentId);
        await syncToSupabase('wellbeing_interventions', payload, created.id);
        showToast('Intervention created');
      }
      setInterventionModal({ open: false, editing: null });
      setInterventionForm({ childId: '', childName: '', title: '', description: '', startDate: '', endDate: '', status: 'active', owner: '', attachmentUrl: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteIntervention = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('wellbeing_interventions', confirmDelete.target.id);
      await supabase.from('wellbeing_interventions').delete().eq('id', confirmDelete.target.id);
      showToast('Intervention deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Check-ins ----------
  const handleSaveCheckIn = async () => {
    if (!validateCheckIn()) return;
    try {
      const payload = { ...checkInForm, parentId };
      if (checkInModal.editing) {
        await updateDocument('wellbeing_checkins', checkInModal.editing.id, payload, parentId);
        await syncToSupabase('wellbeing_checkins', payload, checkInModal.editing.id);
        showToast('Check-in updated');
      } else {
        const created = await createDocument('wellbeing_checkins', payload, parentId);
        await syncToSupabase('wellbeing_checkins', payload, created.id);
        showToast('Check-in saved');
      }
      setCheckInModal({ open: false, editing: null });
      setCheckInForm({ childId: '', childName: '', question: 'How are you feeling today?', answer: '', mood: 'neutral', date: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteCheckIn = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('wellbeing_checkins', confirmDelete.target.id);
      await supabase.from('wellbeing_checkins').delete().eq('id', confirmDelete.target.id);
      showToast('Check-in deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Uploads ----------
  const handleMoodPhotoUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      setMoodForm((f) => ({ ...f, photoUrl: result?.secure_url || '' }));
      showToast('Photo uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleNoteAttachmentUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      setNoteForm((f) => ({ ...f, attachmentUrl: result?.secure_url || '' }));
      showToast('Attachment uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleInterventionAttachmentUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      setInterventionForm((f) => ({ ...f, attachmentUrl: result?.secure_url || '' }));
      showToast('Attachment uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Export ----------
  const exportMoodCSV = () => {
    const header = ['Child', 'Score', 'Mood', 'Date', 'Notes'];
    const rows = moodLogs.map((m) => [
      `"${m.childName ?? ''}"`,
      m.score ?? 0,
      `"${m.mood ?? ''}"`,
      m.date ?? '',
      `"${(m.notes ?? '').replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `wellbeing-mood-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Render ----------
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'mood', label: 'Mood Log', count: moodLogs.length },
    { id: 'alerts', label: 'Alerts', count: alerts.length },
    { id: 'notes', label: 'Counselor Notes', count: counselorNotes.length },
    { id: 'interventions', label: 'Interventions', count: interventions.length },
    { id: 'checkins', label: 'Check-ins', count: checkIns.length },
    { id: 'resources', label: 'Resources', count: resources.length },
  ];

  return (
    <PageShell
      title="Wellbeing Monitor"
      subtitle="Track mood, respond to alerts, and coordinate interventions in real time."
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
          <Btn onClick={() => setMoodModal({ open: true, editing: null })}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            Log Mood
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
        <StatsCard label="Avg Mood (all)" value={overviewStats.avg ?? '—'} tone="emerald" icon="💚" />
        <StatsCard label="Avg Mood (7d)" value={overviewStats.avg7 ?? '—'} tone="blue" icon="📈" />
        <StatsCard label="Open Alerts" value={overviewStats.openAlerts} tone="rose" icon="🚨" />
        <StatsCard label="Active Interventions" value={overviewStats.activeInterventions} tone="violet" icon="🎯" />
      </div>

      {/* Tabs + Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search mood logs…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 sm:w-64"
        />
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Mood Trend" subtitle="Last 14 days average">
            {trendData.every((d) => d.value === 0) ? (
              <p className="text-sm text-slate-500">No mood data yet.</p>
            ) : (
              <LineChart data={trendData} tone="#10b981" />
            )}
          </Card>
          <Card title="Recent Alerts" subtitle="Open and resolved">
            {alerts.length === 0 ? (
              <p className="text-sm text-slate-500">No alerts — great news! 🎉</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {alerts.slice(0, 6).map((a) => (
                  <li key={a.id} className="flex items-start gap-3 py-3">
                    <span className={`rounded-xl p-2 ${a.severity === 'critical' ? 'bg-red-50 text-red-600' : a.severity === 'high' ? 'bg-orange-50 text-orange-600' : a.severity === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {a.severity === 'critical' ? '🚨' : a.severity === 'high' ? '⚠️' : '📌'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{a.title}</p>
                      <p className="truncate text-xs text-slate-500">{a.description}</p>
                    </div>
                    <RiskBadge level={a.severity} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'mood' && (
        <Card title="Mood Log" action={<div className="flex gap-2"><Btn size="sm" variant="outline" onClick={exportMoodCSV}>Export CSV</Btn><Btn size="sm" onClick={() => setMoodModal({ open: true, editing: null })}>Log Mood</Btn></div>}>
          {filteredMoodLogs.length === 0 ? (
            <EmptyState title="No mood logs" description="Start logging daily moods to track wellbeing over time." action={<Btn onClick={() => setMoodModal({ open: true, editing: null })}>Log Mood</Btn>} icon="💚" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredMoodLogs.map((m) => (
                <li key={m.id} className="flex items-start gap-4 py-4">
                  <span className="rounded-xl bg-emerald-50 p-3 text-2xl">
                    <MoodEmoji mood={m.mood} score={m.score} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {m.childName} · <span className="capitalize">{m.mood}</span> · {m.score}/10
                    </p>
                    <p className="text-xs text-slate-500">{m.date || formatRelativeTime(m.createdAt)}</p>
                    {m.notes && <p className="truncate text-xs text-slate-400">{m.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {m.photoUrl && <a href={m.photoUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-emerald-600 hover:underline">Photo</a>}
                    <Btn size="sm" variant="outline" onClick={() => {
                      setMoodForm({ childId: m.childId || '', childName: m.childName || '', score: m.score ?? 7, mood: m.mood || 'neutral', notes: m.notes || '', date: m.date || '', photoUrl: m.photoUrl || '' });
                      setMoodModal({ open: true, editing: m });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: m, type: 'mood' })}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'alerts' && (
        <Card title="Alerts" action={<Btn size="sm" onClick={() => setAlertModal({ open: true, editing: null })}>Create Alert</Btn>}>
          {alerts.length === 0 ? (
            <EmptyState title="No alerts" description="You're all clear." action={<Btn onClick={() => setAlertModal({ open: true, editing: null })}>Create Alert</Btn>} icon="🚨" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {alerts.map((a) => (
                <li key={a.id} className="flex items-start gap-4 py-4">
                  <span className={`rounded-xl p-3 ${a.severity === 'critical' ? 'bg-red-50 text-red-600' : a.severity === 'high' ? 'bg-orange-50 text-orange-600' : a.severity === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {a.severity === 'critical' ? '🚨' : a.severity === 'high' ? '⚠️' : '📌'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">{a.title}</p>
                      <RiskBadge level={a.severity} />
                      {a.status === 'resolved' && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">RESOLVED</span>}
                      {a.trigger === 'auto' && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">AUTO</span>}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{a.description}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(a.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {a.status !== 'resolved' && <Btn size="sm" variant="success" onClick={() => handleResolveAlert(a)}>Resolve</Btn>}
                    <Btn size="sm" variant="outline" onClick={() => {
                      setAlertForm({ childId: a.childId || '', childName: a.childName || '', title: a.title || '', description: a.description || '', severity: a.severity || 'medium', status: a.status || 'open', trigger: a.trigger || 'manual' });
                      setAlertModal({ open: true, editing: a });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: a, type: 'alert' })}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'notes' && (
        <Card title="Counselor Notes" action={<Btn size="sm" onClick={() => setNoteModal({ open: true, editing: null })}>Add Note</Btn>}>
          {counselorNotes.length === 0 ? (
            <EmptyState title="No notes" description="Record counselor observations." action={<Btn onClick={() => setNoteModal({ open: true, editing: null })}>Add Note</Btn>} icon="📝" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {counselorNotes.map((n) => (
                <li key={n.id} className="flex items-start gap-4 py-4">
                  <span className="rounded-xl bg-blue-50 p-3 text-blue-600">📝</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{n.counselor || 'Counselor'}</p>
                      {n.confidential && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">CONFIDENTIAL</span>}
                    </div>
                    <p className="text-xs text-slate-500">{n.childName} · {n.date || formatRelativeTime(n.createdAt)}</p>
                    <p className="mt-1 text-sm text-slate-600">{n.note}</p>
                    {n.attachmentUrl && <a href={n.attachmentUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-medium text-blue-600 hover:underline">View attachment</a>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn size="sm" variant="outline" onClick={() => {
                      setNoteForm({ childId: n.childId || '', childName: n.childName || '', counselor: n.counselor || '', note: n.note || '', date: n.date || '', confidential: !!n.confidential, attachmentUrl: n.attachmentUrl || '' });
                      setNoteModal({ open: true, editing: n });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: n, type: 'note' })}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'interventions' && (
        <Card title="Intervention Plans" action={<Btn size="sm" onClick={() => setInterventionModal({ open: true, editing: null })}>New Plan</Btn>}>
          {interventions.length === 0 ? (
            <EmptyState title="No interventions" description="Create a plan to support your child." action={<Btn onClick={() => setInterventionModal({ open: true, editing: null })}>New Plan</Btn>} icon="🎯" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {interventions.map((i) => (
                <div key={i.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{i.title}</p>
                      <p className="text-xs text-slate-500">{i.childName || 'Child'} · {i.owner || 'Unassigned'}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${i.status === 'active' ? 'bg-emerald-100 text-emerald-700' : i.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {i.status?.toUpperCase()}
                    </span>
                  </div>
                  {i.description && <p className="mt-3 line-clamp-3 text-xs text-slate-500">{i.description}</p>}
                  <p className="mt-2 text-xs text-slate-400">
                    {i.startDate || '—'} → {i.endDate || '—'}
                  </p>
                  {i.attachmentUrl && <a href={i.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-emerald-600 hover:underline">View plan</a>}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Btn size="sm" variant="outline" onClick={() => {
                      setInterventionForm({ childId: i.childId || '', childName: i.childName || '', title: i.title || '', description: i.description || '', startDate: i.startDate || '', endDate: i.endDate || '', status: i.status || 'active', owner: i.owner || '', attachmentUrl: i.attachmentUrl || '' });
                      setInterventionModal({ open: true, editing: i });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: i, type: 'intervention' })}>Delete</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'checkins' && (
        <Card title="Check-ins" action={<Btn size="sm" onClick={() => setCheckInModal({ open: true, editing: null })}>New Check-in</Btn>}>
          {checkIns.length === 0 ? (
            <EmptyState title="No check-ins" description="Ask your child quick check-in questions." action={<Btn onClick={() => setCheckInModal({ open: true, editing: null })}>New Check-in</Btn>} icon="💬" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {checkIns.map((c) => (
                <li key={c.id} className="flex items-start gap-4 py-4">
                  <span className="rounded-xl bg-violet-50 p-3 text-xl">
                    <MoodEmoji mood={c.mood} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{c.childName} · {c.date || formatRelativeTime(c.createdAt)}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">Q: {c.question}</p>
                    <p className="text-sm text-slate-700">A: {c.answer}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn size="sm" variant="outline" onClick={() => {
                      setCheckInForm({ childId: c.childId || '', childName: c.childName || '', question: c.question || '', answer: c.answer || '', mood: c.mood || 'neutral', date: c.date || '' });
                      setCheckInModal({ open: true, editing: c });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: c, type: 'checkin' })}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'resources' && (
        <Card title="Wellbeing Resources" subtitle="Curated support materials">
          {resources.length === 0 ? (
            <EmptyState title="No resources" description="Resources will appear here." icon="📚" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((r) => (
                <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">📚</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{r.title}</p>
                      <p className="text-xs capitalize text-slate-500">{r.category || 'general'}</p>
                    </div>
                  </div>
                  {r.description && <p className="mt-3 line-clamp-3 text-xs text-slate-500">{r.description}</p>}
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                      Open Resource
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* MOOD MODAL */}
      <Modal open={moodModal.open} onClose={() => setMoodModal({ open: false, editing: null })} title={moodModal.editing ? 'Edit Mood Log' : 'Log Mood'}
        footer={<><Btn variant="ghost" onClick={() => setMoodModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveMood}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={moodForm.childId} onChange={(e) => {
            const c = children.find((x) => x.id === e.target.value);
            setMoodForm({ ...moodForm, childId: e.target.value, childName: c?.fullName || '' });
          }} required error={formErrors.childId} />
          <Field label="Score (1-10)" name="score" type="number" min={1} max={10} value={moodForm.score} onChange={(e) => setMoodForm({ ...moodForm, score: e.target.value })} required error={formErrors.score} />
          <Field label="Mood" name="mood" options={[
            { value: 'happy', label: 'Happy 😄' },
            { value: 'good', label: 'Good 🙂' },
            { value: 'neutral', label: 'Neutral 😐' },
            { value: 'sad', label: 'Sad 🙁' },
            { value: 'anxious', label: 'Anxious 😰' },
            { value: 'angry', label: 'Angry 😠' },
          ]} value={moodForm.mood} onChange={(e) => setMoodForm({ ...moodForm, mood: e.target.value })} />
          <Field label="Date" name="date" type="date" value={moodForm.date} onChange={(e) => setMoodForm({ ...moodForm, date: e.target.value })} />
          <div className="sm:col-span-2 flex items-center gap-3">
            <span className="text-3xl"><MoodEmoji mood={moodForm.mood} score={moodForm.score} /></span>
            <input type="range" min="1" max="10" value={moodForm.score} onChange={(e) => setMoodForm({ ...moodForm, score: e.target.value })} className="flex-1 accent-emerald-600" />
            <span className="text-sm font-bold text-slate-700">{moodForm.score}/10</span>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Photo</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleMoodPhotoUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" />
            {uploading && <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} /></div>}
            {moodForm.photoUrl && <img src={moodForm.photoUrl} alt="mood" className="mt-2 h-16 w-16 rounded-xl object-cover" />}
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes" name="notes" textarea value={moodForm.notes} onChange={(e) => setMoodForm({ ...moodForm, notes: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* ALERT MODAL */}
      <Modal open={alertModal.open} onClose={() => setAlertModal({ open: false, editing: null })} title={alertModal.editing ? 'Edit Alert' : 'Create Alert'}
        footer={<><Btn variant="ghost" onClick={() => setAlertModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveAlert}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" name="title" value={alertForm.title} onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} required error={formErrors.title} />
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={alertForm.childId} onChange={(e) => {
            const c = children.find((x) => x.id === e.target.value);
            setAlertForm({ ...alertForm, childId: e.target.value, childName: c?.fullName || '' });
          }} />
          <Field label="Severity" name="severity" options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'critical', label: 'Critical' },
          ]} value={alertForm.severity} onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })} />
          <Field label="Status" name="status" options={[
            { value: 'open', label: 'Open' },
            { value: 'acknowledged', label: 'Acknowledged' },
            { value: 'resolved', label: 'Resolved' },
          ]} value={alertForm.status} onChange={(e) => setAlertForm({ ...alertForm, status: e.target.value })} />
          <div className="sm:col-span-2"><Field label="Description" name="description" textarea value={alertForm.description} onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })} /></div>
        </div>
      </Modal>

      {/* NOTE MODAL */}
      <Modal open={noteModal.open} onClose={() => setNoteModal({ open: false, editing: null })} title={noteModal.editing ? 'Edit Note' : 'Add Counselor Note'}
        footer={<><Btn variant="ghost" onClick={() => setNoteModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveNote}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={noteForm.childId} onChange={(e) => {
            const c = children.find((x) => x.id === e.target.value);
            setNoteForm({ ...noteForm, childId: e.target.value, childName: c?.fullName || '' });
          }} />
          <Field label="Counselor" name="counselor" value={noteForm.counselor} onChange={(e) => setNoteForm({ ...noteForm, counselor: e.target.value })} />
          <Field label="Date" name="date" type="date" value={noteForm.date} onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })} />
          <label className="flex items-center gap-2 pt-5 text-xs font-semibold text-slate-700">
            <input type="checkbox" checked={noteForm.confidential} onChange={(e) => setNoteForm({ ...noteForm, confidential: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
            Mark as confidential
          </label>
          <div className="sm:col-span-2"><Field label="Note" name="note" textarea rows={5} value={noteForm.note} onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })} required error={formErrors.note} /></div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Attachment</label>
            <input type="file" onChange={(e) => e.target.files?.[0] && handleNoteAttachmentUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" />
            {noteForm.attachmentUrl && <a href={noteForm.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-emerald-600 hover:underline">View attachment</a>}
          </div>
        </div>
      </Modal>

      {/* INTERVENTION MODAL */}
      <Modal open={interventionModal.open} onClose={() => setInterventionModal({ open: false, editing: null })} title={interventionModal.editing ? 'Edit Plan' : 'New Intervention Plan'}
        footer={<><Btn variant="ghost" onClick={() => setInterventionModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveIntervention}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" name="title" value={interventionForm.title} onChange={(e) => setInterventionForm({ ...interventionForm, title: e.target.value })} required error={formErrors.title} />
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={interventionForm.childId} onChange={(e) => {
            const c = children.find((x) => x.id === e.target.value);
            setInterventionForm({ ...interventionForm, childId: e.target.value, childName: c?.fullName || '' });
          }} />
          <Field label="Owner" name="owner" value={interventionForm.owner} onChange={(e) => setInterventionForm({ ...interventionForm, owner: e.target.value })} placeholder="e.g., Counselor, Parent" />
          <Field label="Status" name="status" options={[
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'paused', label: 'Paused' },
            { value: 'cancelled', label: 'Cancelled' },
          ]} value={interventionForm.status} onChange={(e) => setInterventionForm({ ...interventionForm, status: e.target.value })} />
          <Field label="Start Date" name="startDate" type="date" value={interventionForm.startDate} onChange={(e) => setInterventionForm({ ...interventionForm, startDate: e.target.value })} />
          <Field label="End Date" name="endDate" type="date" value={interventionForm.endDate} onChange={(e) => setInterventionForm({ ...interventionForm, endDate: e.target.value })} />
          <div className="sm:col-span-2"><Field label="Description" name="description" textarea rows={4} value={interventionForm.description} onChange={(e) => setInterventionForm({ ...interventionForm, description: e.target.value })} /></div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Plan Attachment</label>
            <input type="file" onChange={(e) => e.target.files?.[0] && handleInterventionAttachmentUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" />
            {interventionForm.attachmentUrl && <a href={interventionForm.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-emerald-600 hover:underline">View plan file</a>}
          </div>
        </div>
      </Modal>

      {/* CHECK-IN MODAL */}
      <Modal open={checkInModal.open} onClose={() => setCheckInModal({ open: false, editing: null })} title={checkInModal.editing ? 'Edit Check-in' : 'New Check-in'}
        footer={<><Btn variant="ghost" onClick={() => setCheckInModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveCheckIn}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={checkInForm.childId} onChange={(e) => {
            const c = children.find((x) => x.id === e.target.value);
            setCheckInForm({ ...checkInForm, childId: e.target.value, childName: c?.fullName || '' });
          }} required error={formErrors.childId} />
          <Field label="Date" name="date" type="date" value={checkInForm.date} onChange={(e) => setCheckInForm({ ...checkInForm, date: e.target.value })} />
          <div className="sm:col-span-2">
            <Field label="Question" name="question" value={checkInForm.question} onChange={(e) => setCheckInForm({ ...checkInForm, question: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Answer" name="answer" textarea value={checkInForm.answer} onChange={(e) => setCheckInForm({ ...checkInForm, answer: e.target.value })} required error={formErrors.answer} />
          </div>
          <Field label="Mood" name="mood" options={[
            { value: 'happy', label: 'Happy 😄' },
            { value: 'good', label: 'Good 🙂' },
            { value: 'neutral', label: 'Neutral 😐' },
            { value: 'sad', label: 'Sad 🙁' },
            { value: 'anxious', label: 'Anxious 😰' },
          ]} value={checkInForm.mood} onChange={(e) => setCheckInForm({ ...checkInForm, mood: e.target.value })} />
        </div>
      </Modal>

      {/* CONFIRM DELETE */}
      <Modal open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, target: null, type: '' })} title="Confirm Delete" size="sm"
        footer={<><Btn variant="ghost" onClick={() => setConfirmDelete({ open: false, target: null, type: '' })}>Cancel</Btn><Btn variant="danger" onClick={() => {
          if (confirmDelete.type === 'mood') handleDeleteMood();
          if (confirmDelete.type === 'alert') handleDeleteAlert();
          if (confirmDelete.type === 'note') handleDeleteNote();
          if (confirmDelete.type === 'intervention') handleDeleteIntervention();
          if (confirmDelete.type === 'checkin') handleDeleteCheckIn();
        }}>Delete</Btn></>}>
        <p className="text-sm text-slate-600">Are you sure? This action cannot be undone.</p>
      </Modal>
    </PageShell>
  );
};

export default memo(WellbeingMonitor);