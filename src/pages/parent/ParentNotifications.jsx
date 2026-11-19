// frontend/src/pages/parent/ParentNotifications.jsx
// ============================================================================
// PARENT NOTIFICATIONS - Production Ready
// Notification center | Preferences | Digest | Filters | Realtime
// Firebase | Supabase | Tailwind CSS
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
  writeBatch,
  getDocs,
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
import { validateRequired } from '../../utils/validators';

// ============================================================================
// TAILWIND UI PRIMITIVES
// ============================================================================

const PageShell = ({ title, subtitle, actions, children, loading, error }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20">
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/parent" className="hover:text-rose-600">Parent</Link>
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
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white/60" />
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
    primary: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus:ring-rose-500',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
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

const StatsCard = ({ label, value, delta, icon, tone = 'rose', onClick }) => {
  const tones = {
    rose: 'from-rose-500/10 to-rose-500/0 text-rose-700 ring-rose-200',
    blue: 'from-blue-500/10 to-blue-500/0 text-blue-700 ring-blue-200',
    emerald: 'from-emerald-500/10 to-emerald-500/0 text-emerald-700 ring-emerald-200',
    amber: 'from-amber-500/10 to-amber-500/0 text-amber-700 ring-amber-200',
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

const Field = ({ label, name, value, onChange, type = 'text', placeholder, required, error, textarea, options, rows = 3, ...rest }) => (
  <div className="w-full">
    {label && <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label>}
    {textarea ? (
      <textarea id={name} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={rows}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    ) : options ? (
      <select id={name} name={name} value={value ?? ''} onChange={onChange}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
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

const EmptyState = ({ title, description, action, icon = '🔔' }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3 text-2xl">{icon}</div>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

const CategoryIcon = ({ category }) => {
  const map = {
    academic: '📚', financial: '💰', wellbeing: '💚', meeting: '📅', career: '🎓',
    system: '⚙️', social: '💬', alert: '🚨', reminder: '⏰', announcement: '📢',
  };
  return <span aria-hidden="true">{map[category] || '🔔'}</span>;
};

const CategoryBadge = ({ category }) => {
  const map = {
    academic: 'bg-blue-100 text-blue-700',
    financial: 'bg-emerald-100 text-emerald-700',
    wellbeing: 'bg-pink-100 text-pink-700',
    meeting: 'bg-indigo-100 text-indigo-700',
    career: 'bg-violet-100 text-violet-700',
    system: 'bg-slate-100 text-slate-700',
    social: 'bg-cyan-100 text-cyan-700',
    alert: 'bg-red-100 text-red-700',
    reminder: 'bg-amber-100 text-amber-700',
    announcement: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${map[category] || 'bg-slate-100 text-slate-700'}`}>
      {category || 'general'}
    </span>
  );
};

// Toggle switch
const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition ${checked ? 'bg-rose-600' : 'bg-slate-300'}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`} />
    </button>
  </div>
);

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

// ============================================================================
// CRUD HELPERS
// ============================================================================

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

const ParentNotifications = () => {
  const { user, profile } = useAuth();
  const { refresh: refreshParent } = useParent();
  const { push: pushNotification } = useNotifications();
  const parentId = user?.uid ?? profile?.uid;

  // ---------- Realtime ----------
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const setSearchDebounced = useMemo(() => debounce((v) => setDebouncedSearch(v), 300), []);
  useEffect(() => { setSearchDebounced(searchQuery); }, [searchQuery, setSearchDebounced]);

  const { items: notifications, loading, error } = useRealtimeCollection(
    'notifications',
    parentId ? [where('recipientId', '==', parentId), orderBy('createdAt', 'desc'), limit(200)] : [limit(200)],
    [parentId]
  );

  const { items: preferences, loading: prefLoading } = useRealtimeCollection(
    'notification_preferences',
    parentId ? [where('parentId', '==', parentId)] : [],
    [parentId]
  );

  const { items: digests } = useRealtimeCollection(
    'notification_digests',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc'), limit(30)] : [limit(30)],
    [parentId]
  );

  const { items: subscriptions } = useRealtimeCollection(
    'push_subscriptions',
    parentId ? [where('parentId', '==', parentId)] : [],
    [parentId]
  );

  // ---------- Derived ----------
  const filtered = useMemo(() => {
    let list = notifications;
    if (activeTab === 'unread') list = list.filter((n) => !n.read);
    else if (activeTab === 'archived') list = list.filter((n) => n.archived);
    else if (activeTab === 'read') list = list.filter((n) => n.read);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((n) =>
        n.title?.toLowerCase().includes(q) ||
        n.body?.toLowerCase().includes(q) ||
        n.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [notifications, activeTab, debouncedSearch]);

  const overviewStats = useMemo(() => {
    const unread = notifications.filter((n) => !n.read).length;
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = notifications.filter((n) => {
      const d = n.createdAt?.toDate?.();
      return d && d.toISOString().slice(0, 10) === today;
    }).length;
    const urgent = notifications.filter((n) => n.priority === 'urgent' || n.severity === 'critical').length;
    const archived = notifications.filter((n) => n.archived).length;
    return { unread, today: todayCount, urgent, archived, total: notifications.length };
  }, [notifications]);

  const categoryStats = useMemo(() => {
    const map = {};
    notifications.forEach((n) => {
      const c = n.category || 'general';
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
  }, [notifications]);

  // ---------- Local UI ----------
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null, type: '' });
  const [toast, setToast] = useState(null);
  const [prefsState, setPrefsState] = useState({
    email: true, push: true, sms: false, inApp: true,
    academic: true, financial: true, wellbeing: true, meeting: true, career: true, system: true, social: true,
    digestDaily: true, digestWeekly: false, digestTime: '08:00',
    quietHours: false, quietStart: '22:00', quietEnd: '07:00',
  });

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // Sync prefs from Firestore
  useEffect(() => {
    if (preferences?.[0]) {
      setPrefsState((s) => ({ ...s, ...preferences[0] }));
    }
  }, [preferences]);

  // ---------- Actions ----------
  const markRead = async (id) => {
    try {
      await updateDocument('notifications', id, { read: true, readAt: serverTimestamp() }, parentId);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const markUnread = async (id) => {
    try {
      await updateDocument('notifications', id, { read: false, readAt: null }, parentId);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const markAllRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.filter((n) => !n.read).forEach((n) => batch.update(doc(db, 'notifications', n.id), { read: true, readAt: serverTimestamp() }));
      await batch.commit();
      showToast('All notifications marked read');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const archiveNotification = async (id) => {
    try {
      await updateDocument('notifications', id, { archived: true, archivedAt: serverTimestamp() }, parentId);
      showToast('Archived');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const unarchiveNotification = async (id) => {
    try {
      await updateDocument('notifications', id, { archived: false }, parentId);
      showToast('Unarchived');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const deleteNotification = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('notifications', confirmDelete.target.id);
      await supabase.from('notifications').delete().eq('id', confirmDelete.target.id);
      showToast('Notification deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const clearAllRead = async () => {
    if (!window.confirm('Delete all read notifications?')) return;
    try {
      const batch = writeBatch(db);
      notifications.filter((n) => n.read).forEach((n) => batch.delete(doc(db, 'notifications', n.id)));
      await batch.commit();
      showToast('Read notifications cleared');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const savePreferences = async () => {
    try {
      const payload = { ...prefsState, parentId, updatedAt: serverTimestamp() };
      if (preferences?.[0]) {
        await updateDocument('notification_preferences', preferences[0].id, payload, parentId);
        await syncToSupabase('notification_preferences', payload, preferences[0].id);
      } else {
        const ref = await addDoc(collection(db, 'notification_preferences'), { ...payload, createdAt: serverTimestamp() });
        await syncToSupabase('notification_preferences', payload, ref.id);
      }
      showToast('Preferences saved');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const sendTestNotification = async () => {
    try {
      pushNotification?.({
        title: 'Test Notification',
        body: 'This is a test from your notification center.',
        audience: 'parent',
        category: 'system',
      });
      showToast('Test notification sent');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Render ----------
  const tabs = [
    { id: 'all', label: 'All', count: overviewStats.total },
    { id: 'unread', label: 'Unread', count: overviewStats.unread },
    { id: 'read', label: 'Read' },
    { id: 'archived', label: 'Archived', count: overviewStats.archived },
    { id: 'preferences', label: 'Preferences' },
    { id: 'digests', label: 'Digests', count: digests.length },
  ];

  return (
    <PageShell
      title="Notifications"
      subtitle="Stay on top of updates — from academics to wellbeing."
      loading={loading}
      error={error}
      actions={
        <>
          <Btn variant="outline" onClick={refreshParent}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </Btn>
          {overviewStats.unread > 0 && <Btn size="sm" variant="outline" onClick={markAllRead}>Mark all read</Btn>}
          <Btn size="sm" variant="ghost" onClick={clearAllRead}>Clear read</Btn>
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
        <StatsCard label="Total" value={overviewStats.total} tone="rose" icon="🔔" />
        <StatsCard label="Unread" value={overviewStats.unread} tone="blue" icon="📬" />
        <StatsCard label="Today" value={overviewStats.today} tone="amber" icon="🗓️" />
        <StatsCard label="Urgent" value={overviewStats.urgent} tone="rose" icon="🚨" />
      </div>

      {/* Tabs + Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notifications…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 sm:w-64"
        />
      </div>

      {/* Notification list */}
      {(activeTab === 'all' || activeTab === 'unread' || activeTab === 'read' || activeTab === 'archived') && (
        <Card>
          {filtered.length === 0 ? (
            <EmptyState
              title={activeTab === 'unread' ? 'No unread notifications' : activeTab === 'archived' ? 'No archived notifications' : 'No notifications'}
              description="You're all caught up."
              icon="🔔"
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((n) => (
                <li key={n.id} className={`group flex items-start gap-3 py-4 transition ${n.read ? 'opacity-75' : ''}`}>
                  <div className="flex flex-col items-center gap-2">
                    <span className={`rounded-xl p-2.5 ${n.priority === 'urgent' || n.severity === 'critical' ? 'bg-red-50 text-red-600' : 'bg-rose-50 text-rose-600'}`}>
                      <CategoryIcon category={n.category} />
                    </span>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">{n.title || 'Notification'}</p>
                      <CategoryBadge category={n.category} />
                      {(n.priority === 'urgent' || n.severity === 'critical') && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">URGENT</span>
                      )}
                      {n.archived && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">ARCHIVED</span>}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 opacity-0 transition group-hover:opacity-100">
                    {!n.read ? (
                      <Btn size="sm" variant="ghost" onClick={() => markRead(n.id)} title="Mark read">✓</Btn>
                    ) : (
                      <Btn size="sm" variant="ghost" onClick={() => markUnread(n.id)} title="Mark unread">↩</Btn>
                    )}
                    {n.archived ? (
                      <Btn size="sm" variant="ghost" onClick={() => unarchiveNotification(n.id)} title="Unarchive">📤</Btn>
                    ) : (
                      <Btn size="sm" variant="ghost" onClick={() => archiveNotification(n.id)} title="Archive">📥</Btn>
                    )}
                    <Btn size="sm" variant="ghost" onClick={() => setConfirmDelete({ open: true, target: n, type: 'notification' })} title="Delete">🗑</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Categories card on sidebar for 'all' view */}
      {activeTab === 'all' && categoryStats.length > 0 && (
        <div className="mt-5">
          <Card title="By Category" subtitle="Notification distribution">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categoryStats.map((c) => (
                <div key={c.category} className="rounded-xl border border-slate-200 p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{c.category}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{c.count}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Channels" subtitle="How you receive notifications">
            <Toggle checked={prefsState.email} onChange={(v) => setPrefsState({ ...prefsState, email: v })} label="Email" description="Receive notifications by email" />
            <Toggle checked={prefsState.push} onChange={(v) => setPrefsState({ ...prefsState, push: v })} label="Push" description="Browser push notifications" />
            <Toggle checked={prefsState.sms} onChange={(v) => setPrefsState({ ...prefsState, sms: v })} label="SMS" description="Text message alerts" />
            <Toggle checked={prefsState.inApp} onChange={(v) => setPrefsState({ ...prefsState, inApp: v })} label="In-App" description="Show in the notification center" />
          </Card>

          <Card title="Categories" subtitle="What to be notified about">
            <Toggle checked={prefsState.academic} onChange={(v) => setPrefsState({ ...prefsState, academic: v })} label="Academic" />
            <Toggle checked={prefsState.financial} onChange={(v) => setPrefsState({ ...prefsState, financial: v })} label="Financial" />
            <Toggle checked={prefsState.wellbeing} onChange={(v) => setPrefsState({ ...prefsState, wellbeing: v })} label="Wellbeing" />
            <Toggle checked={prefsState.meeting} onChange={(v) => setPrefsState({ ...prefsState, meeting: v })} label="Meetings" />
            <Toggle checked={prefsState.career} onChange={(v) => setPrefsState({ ...prefsState, career: v })} label="Career" />
            <Toggle checked={prefsState.system} onChange={(v) => setPrefsState({ ...prefsState, system: v })} label="System" />
            <Toggle checked={prefsState.social} onChange={(v) => setPrefsState({ ...prefsState, social: v })} label="Social" />
          </Card>

          <Card title="Digest" subtitle="Batched summary emails">
            <Toggle checked={prefsState.digestDaily} onChange={(v) => setPrefsState({ ...prefsState, digestDaily: v })} label="Daily digest" description="Receive a daily summary" />
            <Toggle checked={prefsState.digestWeekly} onChange={(v) => setPrefsState({ ...prefsState, digestWeekly: v })} label="Weekly digest" description="Receive a weekly summary" />
            <div className="mt-3">
              <Field label="Preferred time" name="digestTime" type="time" value={prefsState.digestTime} onChange={(e) => setPrefsState({ ...prefsState, digestTime: e.target.value })} />
            </div>
          </Card>

          <Card title="Quiet Hours" subtitle="Mute notifications during these hours">
            <Toggle checked={prefsState.quietHours} onChange={(v) => setPrefsState({ ...prefsState, quietHours: v })} label="Enable quiet hours" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Start" name="quietStart" type="time" value={prefsState.quietStart} onChange={(e) => setPrefsState({ ...prefsState, quietStart: e.target.value })} />
              <Field label="End" name="quietEnd" type="time" value={prefsState.quietEnd} onChange={(e) => setPrefsState({ ...prefsState, quietEnd: e.target.value })} />
            </div>
          </Card>

          <div className="lg:col-span-2 flex justify-end gap-2">
            <Btn variant="outline" onClick={sendTestNotification}>Send Test</Btn>
            <Btn onClick={savePreferences} loading={prefLoading}>Save Preferences</Btn>
          </div>
        </div>
      )}

      {/* DIGESTS */}
      {activeTab === 'digests' && (
        <Card title="Notification Digests" subtitle="Past daily and weekly summaries">
          {digests.length === 0 ? (
            <EmptyState title="No digests" description="Digests are generated when enabled in preferences." icon="📬" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {digests.map((d) => (
                <li key={d.id} className="py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">{d.type || 'daily'}</span>
                    <p className="text-sm font-semibold text-slate-800">{d.title || 'Digest'}</p>
                    <span className="text-xs text-slate-400">{formatRelativeTime(d.createdAt)}</span>
                  </div>
                  {d.summary && <p className="mt-1 text-sm text-slate-600">{d.summary}</p>}
                  {d.highlights?.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-slate-600">
                      {d.highlights.map((h, i) => <li key={i}>• {h}</li>)}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* SUBSCRIPTIONS */}
      {subscriptions?.length > 0 && activeTab === 'preferences' && (
        <div className="mt-5">
          <Card title="Push Subscriptions" subtitle="Active devices">
            <ul className="divide-y divide-slate-100">
              {subscriptions.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{s.deviceLabel || 'Device'}</p>
                    <p className="text-xs text-slate-500">{s.userAgent ? truncate(s.userAgent, 60) : 'Unknown'}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">ACTIVE</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* CONFIRM DELETE */}
      <Modal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, target: null, type: '' })}
        title="Confirm Delete"
        size="sm"
        footer={<><Btn variant="ghost" onClick={() => setConfirmDelete({ open: false, target: null, type: '' })}>Cancel</Btn><Btn variant="danger" onClick={deleteNotification}>Delete</Btn></>}
      >
        <p className="text-sm text-slate-600">Delete this notification? This action cannot be undone.</p>
      </Modal>
    </PageShell>
  );
};

export default memo(ParentNotifications);