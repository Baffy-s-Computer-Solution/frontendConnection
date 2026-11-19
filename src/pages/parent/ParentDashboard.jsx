// frontend/src/pages/parent/ParentDashboard.jsx
// ============================================================================
// PARENT DASHBOARD - Production Ready
// Full CRUD | Firebase | Supabase | Cloudinary | Real-time | Tailwind CSS
// ============================================================================

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  getDocs,
  getDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  signInAnonymously,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { db, storage, auth } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useParent } from '../../hooks/useParent';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import {
  formatDate,
  formatRelativeTime,
  formatCurrency,
  truncate,
  debounce,
} from '../../utils/formatters';
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateMaxLength,
} from '../../utils/validators';

// ============================================================================
// TAILWIND-BASED UI PRIMITIVES
// ============================================================================

const PageShell = ({ title, subtitle, actions, children, loading, error }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/parent" className="hover:text-blue-600">Parent</Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-slate-700">{title}</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white/60"
            />
          ))}
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

const Btn = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  loading,
  type = 'button',
  className = '',
  icon,
  ...rest
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };
  const variants = {
    primary:
      'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300',
    outline:
      'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            fill="currentColor"
            className="opacity-75"
          />
        </svg>
      ) : icon ? (
        <span aria-hidden="true">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

const Card = ({ title, subtitle, action, children, className = '', pad = true }) => (
  <section
    className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}
  >
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

const StatsCard = ({ label, value, delta, icon, tone = 'blue', onClick }) => {
  const tones = {
    blue: 'from-blue-500/10 to-blue-500/0 text-blue-700 ring-blue-200',
    emerald: 'from-emerald-500/10 to-emerald-500/0 text-emerald-700 ring-emerald-200',
    amber: 'from-amber-500/10 to-amber-500/0 text-amber-700 ring-amber-200',
    rose: 'from-rose-500/10 to-rose-500/0 text-rose-700 ring-rose-200',
    violet: 'from-violet-500/10 to-violet-500/0 text-violet-700 ring-violet-200',
  };
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
    >
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
        {icon && (
          <span className={`rounded-xl bg-gradient-to-b p-2 ring-1 ${tones[tone]}`}>
            <span aria-hidden="true">{icon}</span>
          </span>
        )}
      </div>
    </div>
  );
};

const Field = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  error,
  textarea,
  options,
  rows = 3,
  ...rest
}) => (
  <div className="w-full">
    {label && (
      <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    {textarea ? (
      <textarea
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
          error ? 'border-red-400' : 'border-slate-300'
        }`}
        {...rest}
      />
    ) : options ? (
      <select
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
          error ? 'border-red-400' : 'border-slate-300'
        }`}
        {...rest}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
          error ? 'border-red-400' : 'border-slate-300'
        }`}
        {...rest}
      />
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
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${sizes[size]} overflow-hidden rounded-2xl bg-white shadow-2xl`}
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
          active === t.id
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {t.label}
        {t.count != null && (
          <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">
            {t.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
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

  useEffect(() => {
    constraintsRef.current = constraints;
  });

  useEffect(() => {
    setLoading(true);
    let unsub = () => {};
    try {
      const q = query(collection(db, collectionName), ...constraintsRef.current);
      unsub = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setItems(list);
          setLoading(false);
        },
        (err) => {
          console.error(`[useRealtimeCollection:${collectionName}]`, err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, ...deps]);

  return { items, loading, error };
}

function useRealtimeDoc(collectionName, docId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, collectionName, docId),
      (snap) => {
        setData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [collectionName, docId]);

  return { data, loading, error };
}

function useCloudinaryUpload(folder = 'parent-uploads') {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = useCallback(
    async (file, onComplete) => {
      if (!file) return null;
      setUploading(true);
      setError(null);
      setProgress(0);
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
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(`Cloudinary upload failed: ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error('Network error during upload'));
          xhr.send(form);
        });

        onComplete?.(result);
        setUploading(false);
        return result;
      } catch (err) {
        setError(err.message);
        setUploading(false);
        throw err;
      }
    },
    [folder]
  );

  return { upload, uploading, progress, error };
}

// ============================================================================
// CRUD HELPERS
// ============================================================================

async function createDocument(collectionName, data, authorId) {
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: authorId ?? null,
    updatedBy: authorId ?? null,
  };
  const ref = await addDoc(collection(db, collectionName), payload);
  return { id: ref.id, ...payload };
}

async function updateDocument(collectionName, id, data, authorId) {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: authorId ?? null,
  });
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
  } catch (err) {
    console.warn(`[supabase sync:${table}]`, err.message);
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { refresh: refreshParent } = useParent();
  const { push: pushNotification } = useNotifications();
  const { upload: uploadToCloudinary, uploading, progress } = useCloudinaryUpload(
    `parents/${user?.uid ?? 'anon'}`
  );

  const parentId = user?.uid ?? profile?.uid;

  // ---------- Realtime collections ----------
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const setSearchDebounced = useMemo(
    () =>
      debounce((v) => setDebouncedSearch(v), 300),
    []
  );

  useEffect(() => {
    setSearchDebounced(searchQuery);
  }, [searchQuery, setSearchDebounced]);

  const { items: children, loading: childrenLoading, error: childrenError } =
    useRealtimeCollection(
      'parent_children',
      parentId
        ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')]
        : [],
      [parentId]
    );

  const { items: insights } = useRealtimeCollection(
    'ai_insights',
    parentId ? [where('audience', '==', 'parent'), limit(50)] : [limit(50)],
    [parentId]
  );

  const { items: notifications } = useRealtimeCollection(
    'notifications',
    parentId
      ? [where('recipientId', '==', parentId), orderBy('createdAt', 'desc'), limit(30)]
      : [limit(30)],
    [parentId]
  );

  const { items: meetings } = useRealtimeCollection(
    'parent_meetings',
    parentId
      ? [where('parentId', '==', parentId), orderBy('scheduledAt', 'desc')]
      : [],
    [parentId]
  );

  const { items: expenses } = useRealtimeCollection(
    'parent_expenses',
    parentId ? [where('parentId', '==', parentId), orderBy('date', 'desc')] : [],
    [parentId]
  );

  const { items: wellbeing } = useRealtimeCollection(
    'wellbeing_records',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: activities } = useRealtimeCollection(
    'parent_activity_log',
    parentId
      ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc'), limit(40)]
      : [limit(40)],
    [parentId]
  );

  // ---------- Derived ----------
  const filteredChildren = useMemo(() => {
    if (!debouncedSearch) return children;
    const q = debouncedSearch.toLowerCase();
    return children.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(q) ||
        c.school?.toLowerCase().includes(q) ||
        c.grade?.toLowerCase().includes(q)
    );
  }, [children, debouncedSearch]);

  const overviewStats = useMemo(() => {
    const totalExpense = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const avgWellbeing =
      wellbeing.length > 0
        ? Math.round(
            wellbeing.reduce((s, w) => s + (Number(w.score) || 0), 0) / wellbeing.length
          )
        : null;
    return {
      children: children.length,
      upcomingMeetings: meetings.filter(
        (m) => m.scheduledAt?.toDate?.() > new Date()
      ).length,
      totalExpense,
      avgWellbeing,
      unreadNotifications: notifications.filter((n) => !n.read).length,
    };
  }, [children, meetings, expenses, wellbeing, notifications]);

  // ---------- Local UI state ----------
  const [childModal, setChildModal] = useState({ open: false, editing: null });
  const [meetingModal, setMeetingModal] = useState({ open: false, editing: null });
  const [expenseModal, setExpenseModal] = useState({ open: false, editing: null });
  const [wellbeingModal, setWellbeingModal] = useState({ open: false, editing: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null, type: '' });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ---------- Forms ----------
  const [childForm, setChildForm] = useState({
    fullName: '',
    grade: '',
    school: '',
    dateOfBirth: '',
    avatarUrl: '',
    notes: '',
    status: 'active',
  });

  const [meetingForm, setMeetingForm] = useState({
    teacherName: '',
    subject: '',
    scheduledAt: '',
    location: '',
    notes: '',
    status: 'scheduled',
    childId: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'tuition',
    amount: '',
    date: '',
    description: '',
    childId: '',
    receiptUrl: '',
  });

  const [wellbeingForm, setWellbeingForm] = useState({
    childId: '',
    score: 7,
    mood: 'neutral',
    notes: '',
    date: '',
  });

  // ---------- Validation ----------
  const [formErrors, setFormErrors] = useState({});

  const validateChild = () => {
    const errors = {};
    if (!validateRequired(childForm.fullName)) errors.fullName = 'Name is required';
    if (childForm.fullName && !validateMaxLength(childForm.fullName, 80))
      errors.fullName = 'Too long';
    if (!validateRequired(childForm.grade)) errors.grade = 'Grade is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateMeeting = () => {
    const errors = {};
    if (!validateRequired(meetingForm.teacherName))
      errors.teacherName = 'Teacher is required';
    if (!validateRequired(meetingForm.scheduledAt))
      errors.scheduledAt = 'Date & time required';
    if (!validateRequired(meetingForm.childId)) errors.childId = 'Select child';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateExpense = () => {
    const errors = {};
    if (!validateRequired(expenseForm.title)) errors.title = 'Title required';
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0)
      errors.amount = 'Valid amount required';
    if (!validateRequired(expenseForm.date)) errors.date = 'Date required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateWellbeing = () => {
    const errors = {};
    if (!validateRequired(wellbeingForm.childId)) errors.childId = 'Select child';
    if (wellbeingForm.score < 1 || wellbeingForm.score > 10)
      errors.score = 'Score 1-10';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---------- CRUD: Children ----------
  const handleSaveChild = async () => {
    if (!validateChild()) return;
    try {
      if (childModal.editing) {
        await updateDocument('parent_children', childModal.editing.id, childForm, parentId);
        await syncToSupabase('parent_children', childForm, childModal.editing.id);
        showToast('Child updated successfully');
      } else {
        const created = await createDocument(
          'parent_children',
          { ...childForm, parentId },
          parentId
        );
        await syncToSupabase('parent_children', { ...childForm, parentId }, created.id);
        showToast('Child added successfully');
      }
      pushNotification?.({
        title: childModal.editing ? 'Child updated' : 'Child added',
        body: childForm.fullName,
        audience: 'parent',
      });
      setChildModal({ open: false, editing: null });
      setChildForm({
        fullName: '',
        grade: '',
        school: '',
        dateOfBirth: '',
        avatarUrl: '',
        notes: '',
        status: 'active',
      });
      refreshParent?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteChild = async () => {
    const target = confirmDelete.target;
    if (!target) return;
    try {
      await deleteDocument('parent_children', target.id);
      try {
        await supabase.from('parent_children').delete().eq('id', target.id);
      } catch (e) {
        console.warn('supabase delete failed', e);
      }
      showToast('Child removed', 'success');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openEditChild = (child) => {
    setChildForm({
      fullName: child.fullName || '',
      grade: child.grade || '',
      school: child.school || '',
      dateOfBirth: child.dateOfBirth || '',
      avatarUrl: child.avatarUrl || '',
      notes: child.notes || '',
      status: child.status || 'active',
    });
    setChildModal({ open: true, editing: child });
  };

  // ---------- CRUD: Meetings ----------
  const handleSaveMeeting = async () => {
    if (!validateMeeting()) return;
    try {
      const payload = {
        ...meetingForm,
        parentId,
        scheduledAt: meetingForm.scheduledAt
          ? Timestamp.fromDate(new Date(meetingForm.scheduledAt))
          : null,
      };
      if (meetingModal.editing) {
        await updateDocument('parent_meetings', meetingModal.editing.id, payload, parentId);
        await syncToSupabase('parent_meetings', payload, meetingModal.editing.id);
        showToast('Meeting updated');
      } else {
        const created = await createDocument('parent_meetings', payload, parentId);
        await syncToSupabase('parent_meetings', payload, created.id);
        showToast('Meeting scheduled');
      }
      setMeetingModal({ open: false, editing: null });
      setMeetingForm({
        teacherName: '',
        subject: '',
        scheduledAt: '',
        location: '',
        notes: '',
        status: 'scheduled',
        childId: '',
      });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteMeeting = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_meetings', confirmDelete.target.id);
      await supabase.from('parent_meetings').delete().eq('id', confirmDelete.target.id);
      showToast('Meeting deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ---------- CRUD: Expenses ----------
  const handleSaveExpense = async () => {
    if (!validateExpense()) return;
    try {
      const payload = {
        ...expenseForm,
        amount: Number(expenseForm.amount),
        parentId,
      };
      if (expenseModal.editing) {
        await updateDocument('parent_expenses', expenseModal.editing.id, payload, parentId);
        await syncToSupabase('parent_expenses', payload, expenseModal.editing.id);
        showToast('Expense updated');
      } else {
        const created = await createDocument('parent_expenses', payload, parentId);
        await syncToSupabase('parent_expenses', payload, created.id);
        showToast('Expense recorded');
      }
      setExpenseModal({ open: false, editing: null });
      setExpenseForm({
        title: '',
        category: 'tuition',
        amount: '',
        date: '',
        description: '',
        childId: '',
        receiptUrl: '',
      });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteExpense = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_expenses', confirmDelete.target.id);
      await supabase.from('parent_expenses').delete().eq('id', confirmDelete.target.id);
      showToast('Expense deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ---------- CRUD: Wellbeing ----------
  const handleSaveWellbeing = async () => {
    if (!validateWellbeing()) return;
    try {
      const payload = {
        ...wellbeingForm,
        score: Number(wellbeingForm.score),
        parentId,
      };
      if (wellbeingModal.editing) {
        await updateDocument('wellbeing_records', wellbeingModal.editing.id, payload, parentId);
        await syncToSupabase('wellbeing_records', payload, wellbeingModal.editing.id);
        showToast('Wellbeing updated');
      } else {
        const created = await createDocument('wellbeing_records', payload, parentId);
        await syncToSupabase('wellbeing_records', payload, created.id);
        showToast('Wellbeing recorded');
      }
      setWellbeingModal({ open: false, editing: null });
      setWellbeingForm({ childId: '', score: 7, mood: 'neutral', notes: '', date: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ---------- File uploads ----------
  const handleChildAvatarUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      setChildForm((f) => ({ ...f, avatarUrl: result?.secure_url || '' }));
      showToast('Avatar uploaded');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleExpenseReceiptUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      setExpenseForm((f) => ({ ...f, receiptUrl: result?.secure_url || '' }));
      showToast('Receipt uploaded');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ---------- Realtime activity log ----------
  const logActivity = useCallback(
    async (action, entity, entityId, meta = {}) => {
      try {
        await addDoc(collection(db, 'parent_activity_log'), {
          parentId,
          action,
          entity,
          entityId,
          meta,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn('activity log failed', e);
      }
    },
    [parentId]
  );

  // ---------- Realtime mark notification read ----------
  const markNotificationRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), {
        read: true,
        readAt: serverTimestamp(),
      });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications
        .filter((n) => !n.read)
        .forEach((n) => batch.update(doc(db, 'notifications', n.id), { read: true }));
      await batch.commit();
      showToast('All marked as read');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ---------- Export CSV ----------
  const exportExpensesCSV = () => {
    const header = ['Title', 'Category', 'Amount', 'Date', 'Description'];
    const rows = expenses.map((e) => [
      `"${e.title ?? ''}"`,
      `"${e.category ?? ''}"`,
      e.amount ?? 0,
      e.date ?? '',
      `"${(e.description ?? '').replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parent-expenses-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Render ----------
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'children', label: 'Children', count: children.length },
    { id: 'meetings', label: 'Meetings', count: meetings.length },
    { id: 'expenses', label: 'Expenses', count: expenses.length },
    { id: 'wellbeing', label: 'Wellbeing', count: wellbeing.length },
    { id: 'activity', label: 'Activity', count: activities.length },
  ];

  return (
    <PageShell
      title="Parent Dashboard"
      subtitle="Manage children, meetings, expenses, and wellbeing signals in real time."
      loading={childrenLoading}
      error={childrenError}
      actions={
        <>
          <Btn variant="outline" onClick={refreshParent}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Refresh
          </Btn>
          <Btn onClick={() => setChildModal({ open: true, editing: null })}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            Add Child
          </Btn>
        </>
      }
    >
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition ${
            toast.tone === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard label="Children" value={overviewStats.children} tone="blue" icon="👨‍👩‍👧" />
        <StatsCard label="Upcoming Meetings" value={overviewStats.upcomingMeetings} tone="emerald" icon="📅" />
        <StatsCard
          label="Total Expenses"
          value={formatCurrency(overviewStats.totalExpense)}
          tone="amber"
          icon="💰"
        />
        <StatsCard
          label="Wellbeing Avg"
          value={overviewStats.avgWellbeing ?? '—'}
          tone="violet"
          icon="💚"
        />
        <StatsCard
          label="Unread"
          value={overviewStats.unreadNotifications}
          tone="rose"
          icon="🔔"
          onClick={() => setActiveTab('overview')}
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <div className="flex items-center gap-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search children…"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:w-64"
          />
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Latest AI Insights" subtitle="From ai_insights collection">
            {insights.length === 0 ? (
              <p className="text-sm text-slate-500">No insights available yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {insights.slice(0, 6).map((i) => (
                  <li key={i.id} className="flex items-start gap-3 py-3">
                    <span className="mt-1 rounded-lg bg-blue-50 p-2 text-blue-600">✨</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {i.title || i.modelId || 'Insight'}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {i.summary || i.description || i.status || 'No description'}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatRelativeTime(i.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="Recent Notifications"
            subtitle="Real-time updates"
            action={
              overviewStats.unreadNotifications > 0 ? (
                <Btn size="sm" variant="ghost" onClick={markAllNotificationsRead}>
                  Mark all read
                </Btn>
              ) : null
            }
          >
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500">No notifications.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.slice(0, 8).map((n) => (
                  <li
                    key={n.id}
                    className={`flex cursor-pointer items-start gap-3 py-3 transition ${
                      n.read ? 'opacity-60' : ''
                    }`}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    <span
                      className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                        n.read ? 'bg-slate-300' : 'bg-blue-500'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {n.title || 'Notification'}
                      </p>
                      <p className="truncate text-xs text-slate-500">{n.body || ''}</p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'children' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredChildren.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState
                title="No children yet"
                description="Add your first child to start tracking progress."
                action={
                  <Btn onClick={() => setChildModal({ open: true, editing: null })}>
                    Add Child
                  </Btn>
                }
              />
            </div>
          ) : (
            filteredChildren.map((c) => (
              <Card key={c.id} className="relative">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-full bg-slate-100 ring-2 ring-white">
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-500">
                        {c.fullName?.[0] ?? '?'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{c.fullName}</p>
                    <p className="truncate text-xs text-slate-500">
                      {c.grade} · {c.school || 'No school'}
                    </p>
                  </div>
                </div>
                {c.notes && (
                  <p className="mt-3 line-clamp-2 text-xs text-slate-500">{c.notes}</p>
                )}
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Btn size="sm" variant="outline" onClick={() => openEditChild(c)}>
                    Edit
                  </Btn>
                  <Btn
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      setConfirmDelete({ open: true, target: c, type: 'child' })
                    }
                  >
                    Delete
                  </Btn>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'meetings' && (
        <Card
          title="Meetings"
          action={
            <Btn
              size="sm"
              onClick={() => setMeetingModal({ open: true, editing: null })}
            >
              Schedule Meeting
            </Btn>
          }
        >
          {meetings.length === 0 ? (
            <p className="text-sm text-slate-500">No meetings scheduled.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {meetings.map((m) => (
                <li key={m.id} className="flex items-start gap-4 py-4">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">📅</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {m.subject || m.teacherName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {m.teacherName} ·{' '}
                      {m.scheduledAt?.toDate?.()?.toLocaleString?.() ?? 'TBD'}
                    </p>
                    {m.location && (
                      <p className="text-xs text-slate-400">Location: {m.location}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setMeetingForm({
                          teacherName: m.teacherName || '',
                          subject: m.subject || '',
                          scheduledAt:
                            m.scheduledAt?.toDate?.()?.toISOString?.()?.slice(0, 16) || '',
                          location: m.location || '',
                          notes: m.notes || '',
                          status: m.status || 'scheduled',
                          childId: m.childId || '',
                        });
                        setMeetingModal({ open: true, editing: m });
                      }}
                    >
                      Edit
                    </Btn>
                    <Btn
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        setConfirmDelete({ open: true, target: m, type: 'meeting' })
                      }
                    >
                      Delete
                    </Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'expenses' && (
        <Card
          title="Expenses"
          action={
            <div className="flex gap-2">
              <Btn size="sm" variant="outline" onClick={exportExpensesCSV}>
                Export CSV
              </Btn>
              <Btn size="sm" onClick={() => setExpenseModal({ open: true, editing: null })}>
                Add Expense
              </Btn>
            </div>
          }
        >
          {expenses.length === 0 ? (
            <p className="text-sm text-slate-500">No expenses recorded.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {expenses.map((e) => (
                <li key={e.id} className="flex items-start gap-4 py-4">
                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600">💰</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{e.title}</p>
                    <p className="text-xs text-slate-500">
                      {e.category} · {formatCurrency(e.amount)}
                    </p>
                    {e.description && (
                      <p className="truncate text-xs text-slate-400">{e.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setExpenseForm({
                          title: e.title || '',
                          category: e.category || 'tuition',
                          amount: e.amount ?? '',
                          date: e.date || '',
                          description: e.description || '',
                          childId: e.childId || '',
                          receiptUrl: e.receiptUrl || '',
                        });
                        setExpenseModal({ open: true, editing: e });
                      }}
                    >
                      Edit
                    </Btn>
                    <Btn
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        setConfirmDelete({ open: true, target: e, type: 'expense' })
                      }
                    >
                      Delete
                    </Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'wellbeing' && (
        <Card
          title="Wellbeing Records"
          action={
            <Btn size="sm" onClick={() => setWellbeingModal({ open: true, editing: null })}>
              Add Record
            </Btn>
          }
        >
          {wellbeing.length === 0 ? (
            <p className="text-sm text-slate-500">No wellbeing records yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {wellbeing.map((w) => (
                <li key={w.id} className="flex items-start gap-4 py-4">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">💚</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      Score: {w.score}/10 · Mood: {w.mood}
                    </p>
                    {w.notes && <p className="text-xs text-slate-500">{w.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setWellbeingForm({
                          childId: w.childId || '',
                          score: w.score ?? 7,
                          mood: w.mood || 'neutral',
                          notes: w.notes || '',
                          date: w.date || '',
                        });
                        setWellbeingModal({ open: true, editing: w });
                      }}
                    >
                      Edit
                    </Btn>
                    <Btn
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        setConfirmDelete({ open: true, target: w, type: 'wellbeing' })
                      }
                    >
                      Delete
                    </Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card title="Activity Log" subtitle="Real-time audit trail">
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activities.map((a) => (
                <li key={a.id} className="flex items-start gap-3 py-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">{a.action}</span> · {a.entity}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatRelativeTime(a.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Child Modal */}
      <Modal
        open={childModal.open}
        onClose={() => setChildModal({ open: false, editing: null })}
        title={childModal.editing ? 'Edit Child' : 'Add Child'}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setChildModal({ open: false, editing: null })}>
              Cancel
            </Btn>
            <Btn onClick={handleSaveChild}>Save</Btn>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Full Name"
            name="fullName"
            value={childForm.fullName}
            onChange={(e) => setChildForm({ ...childForm, fullName: e.target.value })}
            required
            error={formErrors.fullName}
          />
          <Field
            label="Grade"
            name="grade"
            value={childForm.grade}
            onChange={(e) => setChildForm({ ...childForm, grade: e.target.value })}
            required
            error={formErrors.grade}
          />
          <Field
            label="School"
            name="school"
            value={childForm.school}
            onChange={(e) => setChildForm({ ...childForm, school: e.target.value })}
          />
          <Field
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={childForm.dateOfBirth}
            onChange={(e) => setChildForm({ ...childForm, dateOfBirth: e.target.value })}
          />
          <Field
            label="Status"
            name="status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            value={childForm.status}
            onChange={(e) => setChildForm({ ...childForm, status: e.target.value })}
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Avatar
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleChildAvatarUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            {childForm.avatarUrl && (
              <img
                src={childForm.avatarUrl}
                alt="preview"
                className="mt-2 h-16 w-16 rounded-full object-cover"
              />
            )}
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Notes"
              name="notes"
              textarea
              value={childForm.notes}
              onChange={(e) => setChildForm({ ...childForm, notes: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Meeting Modal */}
      <Modal
        open={meetingModal.open}
        onClose={() => setMeetingModal({ open: false, editing: null })}
        title={meetingModal.editing ? 'Edit Meeting' : 'Schedule Meeting'}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setMeetingModal({ open: false, editing: null })}>
              Cancel
            </Btn>
            <Btn onClick={handleSaveMeeting}>Save</Btn>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Teacher"
            name="teacherName"
            value={meetingForm.teacherName}
            onChange={(e) => setMeetingForm({ ...meetingForm, teacherName: e.target.value })}
            required
            error={formErrors.teacherName}
          />
          <Field
            label="Subject"
            name="subject"
            value={meetingForm.subject}
            onChange={(e) => setMeetingForm({ ...meetingForm, subject: e.target.value })}
          />
          <Field
            label="Scheduled At"
            name="scheduledAt"
            type="datetime-local"
            value={meetingForm.scheduledAt}
            onChange={(e) => setMeetingForm({ ...meetingForm, scheduledAt: e.target.value })}
            required
            error={formErrors.scheduledAt}
          />
          <Field
            label="Location"
            name="location"
            value={meetingForm.location}
            onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
          />
          <Field
            label="Child"
            name="childId"
            options={children.map((c) => ({ value: c.id, label: c.fullName }))}
            value={meetingForm.childId}
            onChange={(e) => setMeetingForm({ ...meetingForm, childId: e.target.value })}
            required
            error={formErrors.childId}
          />
          <Field
            label="Status"
            name="status"
            options={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            value={meetingForm.status}
            onChange={(e) => setMeetingForm({ ...meetingForm, status: e.target.value })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Notes"
              name="notes"
              textarea
              value={meetingForm.notes}
              onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Expense Modal */}
      <Modal
        open={expenseModal.open}
        onClose={() => setExpenseModal({ open: false, editing: null })}
        title={expenseModal.editing ? 'Edit Expense' : 'Add Expense'}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setExpenseModal({ open: false, editing: null })}>
              Cancel
            </Btn>
            <Btn onClick={handleSaveExpense}>Save</Btn>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Title"
            name="title"
            value={expenseForm.title}
            onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
            required
            error={formErrors.title}
          />
          <Field
            label="Amount"
            name="amount"
            type="number"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            required
            error={formErrors.amount}
          />
          <Field
            label="Category"
            name="category"
            options={[
              { value: 'tuition', label: 'Tuition' },
              { value: 'books', label: 'Books' },
              { value: 'transport', label: 'Transport' },
              { value: 'uniform', label: 'Uniform' },
              { value: 'other', label: 'Other' },
            ]}
            value={expenseForm.category}
            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
          />
          <Field
            label="Date"
            name="date"
            type="date"
            value={expenseForm.date}
            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
            required
            error={formErrors.date}
          />
          <Field
            label="Child"
            name="childId"
            options={children.map((c) => ({ value: c.id, label: c.fullName }))}
            value={expenseForm.childId}
            onChange={(e) => setExpenseForm({ ...expenseForm, childId: e.target.value })}
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Receipt
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => e.target.files?.[0] && handleExpenseReceiptUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            {expenseForm.receiptUrl && (
              <a
                href={expenseForm.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline"
              >
                View uploaded receipt
              </a>
            )}
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Description"
              name="description"
              textarea
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Wellbeing Modal */}
      <Modal
        open={wellbeingModal.open}
        onClose={() => setWellbeingModal({ open: false, editing: null })}
        title={wellbeingModal.editing ? 'Edit Wellbeing' : 'Add Wellbeing'}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setWellbeingModal({ open: false, editing: null })}>
              Cancel
            </Btn>
            <Btn onClick={handleSaveWellbeing}>Save</Btn>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Child"
            name="childId"
            options={children.map((c) => ({ value: c.id, label: c.fullName }))}
            value={wellbeingForm.childId}
            onChange={(e) => setWellbeingForm({ ...wellbeingForm, childId: e.target.value })}
            required
            error={formErrors.childId}
          />
          <Field
            label="Score (1-10)"
            name="score"
            type="number"
            min={1}
            max={10}
            value={wellbeingForm.score}
            onChange={(e) => setWellbeingForm({ ...wellbeingForm, score: e.target.value })}
            error={formErrors.score}
          />
          <Field
            label="Mood"
            name="mood"
            options={[
              { value: 'happy', label: 'Happy' },
              { value: 'neutral', label: 'Neutral' },
              { value: 'sad', label: 'Sad' },
              { value: 'anxious', label: 'Anxious' },
            ]}
            value={wellbeingForm.mood}
            onChange={(e) => setWellbeingForm({ ...wellbeingForm, mood: e.target.value })}
          />
          <Field
            label="Date"
            name="date"
            type="date"
            value={wellbeingForm.date}
            onChange={(e) => setWellbeingForm({ ...wellbeingForm, date: e.target.value })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Notes"
              name="notes"
              textarea
              value={wellbeingForm.notes}
              onChange={(e) => setWellbeingForm({ ...wellbeingForm, notes: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <Modal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, target: null, type: '' })}
        title="Confirm Delete"
        size="sm"
        footer={
          <>
            <Btn
              variant="ghost"
              onClick={() => setConfirmDelete({ open: false, target: null, type: '' })}
            >
              Cancel
            </Btn>
            <Btn
              variant="danger"
              onClick={() => {
                if (confirmDelete.type === 'child') handleDeleteChild();
                if (confirmDelete.type === 'meeting') handleDeleteMeeting();
                if (confirmDelete.type === 'expense') handleDeleteExpense();
                if (confirmDelete.type === 'wellbeing') {
                  deleteDocument('wellbeing_records', confirmDelete.target.id).then(() => {
                    showToast('Wellbeing record deleted');
                    setConfirmDelete({ open: false, target: null, type: '' });
                  });
                }
              }}
            >
              Delete
            </Btn>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this item? This action cannot be undone.
        </p>
      </Modal>
    </PageShell>
  );
};

export default memo(ParentDashboard);