// frontend/src/pages/parent/FinancialPlanning.jsx
// ============================================================================
// FINANCIAL PLANNING - Production Ready
// Budgets | Invoices | Payments | Firebase | Supabase | Cloudinary | Tailwind
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
} from 'firebase/firestore';
import { db, storage } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useParent } from '../../hooks/useParent';
import { useNotifications } from '../../hooks/useNotifications';
import {
  formatDate,
  formatRelativeTime,
  formatCurrency,
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
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/parent" className="hover:text-blue-600">Parent</Link>
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
    primary: 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500',
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

const StatsCard = ({ label, value, delta, icon, tone = 'blue', onClick }) => {
  const tones = {
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
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    ) : options ? (
      <select id={name} name={name} value={value ?? ''} onChange={onChange}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} min={min} max={max} step={step}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
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

const EmptyState = ({ title, description, action, icon = '💰' }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3 text-2xl">{icon}</div>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// Simple inline SVG bar chart
const BarChart = ({ data = [], height = 180 }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  const width = 100;
  const barWidth = data.length ? width / data.length : width;
  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${width} 100`} preserveAspectRatio="none" className="h-full w-full">
        {data.map((d, i) => {
          const h = (d.value / max) * 90;
          return (
            <rect
              key={i}
              x={i * barWidth + barWidth * 0.15}
              y={100 - h}
              width={barWidth * 0.7}
              height={h}
              fill="url(#barGradient)"
              rx="1"
            />
          );
        })}
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-slate-400">
        {data.map((d, i) => <span key={i}>{d.label}</span>)}
      </div>
    </div>
  );
};

// Donut chart
const DonutChart = ({ segments = [], size = 160 }) => {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * circumference;
          const el = (
            <circle
              key={i}
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-acc}
              transform="rotate(-90 50 50)"
            />
          );
          acc += dash;
          return el;
        })}
      </svg>
      <div className="space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="font-medium text-slate-700">{s.label}</span>
            <span className="text-slate-500">{formatCurrency(s.value)}</span>
          </div>
        ))}
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

const FinancialPlanning = () => {
  const { user, profile } = useAuth();
  const { refresh: refreshParent } = useParent();
  const { push: pushNotification } = useNotifications();
  const { upload: uploadToCloudinary, uploading, progress } = useCloudinaryUpload(`parents/${user?.uid ?? 'anon'}/finance`);
  const parentId = user?.uid ?? profile?.uid;

  // ---------- Realtime collections ----------
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

  const { items: budgets } = useRealtimeCollection(
    'parent_budgets',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: expenses } = useRealtimeCollection(
    'parent_expenses',
    parentId ? [where('parentId', '==', parentId), orderBy('date', 'desc')] : [],
    [parentId]
  );

  const { items: invoices } = useRealtimeCollection(
    'parent_invoices',
    parentId ? [where('parentId', '==', parentId), orderBy('dueDate', 'desc')] : [],
    [parentId]
  );

  const { items: payments } = useRealtimeCollection(
    'parent_payments',
    parentId ? [where('parentId', '==', parentId), orderBy('paidAt', 'desc')] : [],
    [parentId]
  );

  const { items: goals } = useRealtimeCollection(
    'parent_savings_goals',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: scholarships } = useRealtimeCollection(
    'scholarship_opportunities',
    [where('active', '==', true), limit(50)],
    []
  );

  // ---------- Derived ----------
  const filteredExpenses = useMemo(() => {
    if (!debouncedSearch) return expenses;
    const q = debouncedSearch.toLowerCase();
    return expenses.filter((e) =>
      e.title?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q)
    );
  }, [expenses, debouncedSearch]);

  const overviewStats = useMemo(() => {
    const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const totalBudget = budgets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
    const totalPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const outstanding = invoices
      .filter((i) => i.status !== 'paid')
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);
    return {
      totalBudget,
      totalExpenses,
      totalPaid,
      outstanding,
      remaining: totalBudget - totalExpenses,
      children: children.length,
    };
  }, [budgets, expenses, payments, invoices, children]);

  const monthlyExpenseData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const map = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      map[`${d.getFullYear()}-${d.getMonth()}`] = { label: months[d.getMonth()], value: 0 };
    }
    expenses.forEach((e) => {
      const d = e.date ? new Date(e.date) : null;
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (map[key]) map[key].value += Number(e.amount) || 0;
    });
    return Object.values(map);
  }, [expenses]);

  const categoryData = useMemo(() => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const map = {};
    expenses.forEach((e) => {
      const c = e.category || 'other';
      map[c] = (map[c] || 0) + (Number(e.amount) || 0);
    });
    return Object.entries(map).map(([label, value], i) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value,
      color: colors[i % colors.length],
    }));
  }, [expenses]);

  // ---------- Local UI ----------
  const [budgetModal, setBudgetModal] = useState({ open: false, editing: null });
  const [expenseModal, setExpenseModal] = useState({ open: false, editing: null });
  const [invoiceModal, setInvoiceModal] = useState({ open: false, editing: null });
  const [paymentModal, setPaymentModal] = useState({ open: false, editing: null });
  const [goalModal, setGoalModal] = useState({ open: false, editing: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null, type: '' });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ---------- Forms ----------
  const [budgetForm, setBudgetForm] = useState({ category: 'tuition', amount: '', period: 'monthly', notes: '', childId: '' });
  const [expenseForm, setExpenseForm] = useState({ title: '', category: 'tuition', amount: '', date: '', description: '', childId: '', receiptUrl: '' });
  const [invoiceForm, setInvoiceForm] = useState({ number: '', vendor: '', amount: '', issueDate: '', dueDate: '', status: 'unpaid', description: '', fileUrl: '' });
  const [paymentForm, setPaymentForm] = useState({ invoiceId: '', amount: '', method: 'card', paidAt: '', reference: '', notes: '', receiptUrl: '' });
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', currentAmount: '', deadline: '', priority: 'medium', description: '', childId: '' });

  const [formErrors, setFormErrors] = useState({});

  // ---------- Validation ----------
  const validateBudget = () => {
    const errors = {};
    if (!validateRequired(budgetForm.category)) errors.category = 'Category required';
    if (!validateNumberRange(budgetForm.amount, 1, 1e9)) errors.amount = 'Valid amount required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateExpense = () => {
    const errors = {};
    if (!validateRequired(expenseForm.title)) errors.title = 'Title required';
    if (!validateNumberRange(expenseForm.amount, 1, 1e9)) errors.amount = 'Valid amount required';
    if (!validateRequired(expenseForm.date)) errors.date = 'Date required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateInvoice = () => {
    const errors = {};
    if (!validateRequired(invoiceForm.number)) errors.number = 'Invoice # required';
    if (!validateRequired(invoiceForm.vendor)) errors.vendor = 'Vendor required';
    if (!validateNumberRange(invoiceForm.amount, 1, 1e9)) errors.amount = 'Valid amount required';
    if (!validateRequired(invoiceForm.dueDate)) errors.dueDate = 'Due date required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validatePayment = () => {
    const errors = {};
    if (!validateRequired(paymentForm.invoiceId)) errors.invoiceId = 'Select invoice';
    if (!validateNumberRange(paymentForm.amount, 1, 1e9)) errors.amount = 'Valid amount required';
    if (!validateRequired(paymentForm.paidAt)) errors.paidAt = 'Payment date required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateGoal = () => {
    const errors = {};
    if (!validateRequired(goalForm.name)) errors.name = 'Name required';
    if (!validateNumberRange(goalForm.targetAmount, 1, 1e9)) errors.targetAmount = 'Valid target';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };

  // ---------- CRUD: Budgets ----------
  const handleSaveBudget = async () => {
    if (!validateBudget()) return;
    try {
      const payload = { ...budgetForm, amount: Number(budgetForm.amount), parentId };
      if (budgetModal.editing) {
        await updateDocument('parent_budgets', budgetModal.editing.id, payload, parentId);
        await syncToSupabase('parent_budgets', payload, budgetModal.editing.id);
        showToast('Budget updated');
      } else {
        const created = await createDocument('parent_budgets', payload, parentId);
        await syncToSupabase('parent_budgets', payload, created.id);
        showToast('Budget created');
      }
      setBudgetModal({ open: false, editing: null });
      setBudgetForm({ category: 'tuition', amount: '', period: 'monthly', notes: '', childId: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteBudget = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_budgets', confirmDelete.target.id);
      await supabase.from('parent_budgets').delete().eq('id', confirmDelete.target.id);
      showToast('Budget deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Expenses ----------
  const handleSaveExpense = async () => {
    if (!validateExpense()) return;
    try {
      const payload = { ...expenseForm, amount: Number(expenseForm.amount), parentId };
      if (expenseModal.editing) {
        await updateDocument('parent_expenses', expenseModal.editing.id, payload, parentId);
        await syncToSupabase('parent_expenses', payload, expenseModal.editing.id);
        showToast('Expense updated');
      } else {
        const created = await createDocument('parent_expenses', payload, parentId);
        await syncToSupabase('parent_expenses', payload, created.id);
        showToast('Expense added');
      }
      setExpenseModal({ open: false, editing: null });
      setExpenseForm({ title: '', category: 'tuition', amount: '', date: '', description: '', childId: '', receiptUrl: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteExpense = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_expenses', confirmDelete.target.id);
      await supabase.from('parent_expenses').delete().eq('id', confirmDelete.target.id);
      showToast('Expense deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Invoices ----------
  const handleSaveInvoice = async () => {
    if (!validateInvoice()) return;
    try {
      const payload = { ...invoiceForm, amount: Number(invoiceForm.amount), parentId };
      if (invoiceModal.editing) {
        await updateDocument('parent_invoices', invoiceModal.editing.id, payload, parentId);
        await syncToSupabase('parent_invoices', payload, invoiceModal.editing.id);
        showToast('Invoice updated');
      } else {
        const created = await createDocument('parent_invoices', payload, parentId);
        await syncToSupabase('parent_invoices', payload, created.id);
        showToast('Invoice added');
      }
      setInvoiceModal({ open: false, editing: null });
      setInvoiceForm({ number: '', vendor: '', amount: '', issueDate: '', dueDate: '', status: 'unpaid', description: '', fileUrl: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteInvoice = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_invoices', confirmDelete.target.id);
      await supabase.from('parent_invoices').delete().eq('id', confirmDelete.target.id);
      showToast('Invoice deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleMarkInvoicePaid = async (invoice) => {
    try {
      await updateDocument('parent_invoices', invoice.id, { status: 'paid', paidAt: serverTimestamp() }, parentId);
      await createDocument('parent_payments', {
        parentId,
        invoiceId: invoice.id,
        amount: Number(invoice.amount),
        method: 'other',
        paidAt: new Date().toISOString(),
        reference: invoice.number,
        notes: 'Auto-recorded payment',
      }, parentId);
      showToast('Invoice marked paid');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Payments ----------
  const handleSavePayment = async () => {
    if (!validatePayment()) return;
    try {
      const payload = { ...paymentForm, amount: Number(paymentForm.amount), parentId };
      if (paymentModal.editing) {
        await updateDocument('parent_payments', paymentModal.editing.id, payload, parentId);
        await syncToSupabase('parent_payments', payload, paymentModal.editing.id);
        showToast('Payment updated');
      } else {
        const created = await createDocument('parent_payments', payload, parentId);
        await syncToSupabase('parent_payments', payload, created.id);
        // mark invoice paid if full
        const inv = invoices.find((i) => i.id === paymentForm.invoiceId);
        if (inv && Number(paymentForm.amount) >= Number(inv.amount)) {
          await updateDocument('parent_invoices', inv.id, { status: 'paid', paidAt: serverTimestamp() }, parentId);
        }
        showToast('Payment recorded');
      }
      setPaymentModal({ open: false, editing: null });
      setPaymentForm({ invoiceId: '', amount: '', method: 'card', paidAt: '', reference: '', notes: '', receiptUrl: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeletePayment = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_payments', confirmDelete.target.id);
      await supabase.from('parent_payments').delete().eq('id', confirmDelete.target.id);
      showToast('Payment deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Goals ----------
  const handleSaveGoal = async () => {
    if (!validateGoal()) return;
    try {
      const payload = {
        ...goalForm,
        targetAmount: Number(goalForm.targetAmount),
        currentAmount: Number(goalForm.currentAmount) || 0,
        parentId,
      };
      if (goalModal.editing) {
        await updateDocument('parent_savings_goals', goalModal.editing.id, payload, parentId);
        await syncToSupabase('parent_savings_goals', payload, goalModal.editing.id);
        showToast('Goal updated');
      } else {
        const created = await createDocument('parent_savings_goals', payload, parentId);
        await syncToSupabase('parent_savings_goals', payload, created.id);
        showToast('Goal created');
      }
      setGoalModal({ open: false, editing: null });
      setGoalForm({ name: '', targetAmount: '', currentAmount: '', deadline: '', priority: 'medium', description: '', childId: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteGoal = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_savings_goals', confirmDelete.target.id);
      await supabase.from('parent_savings_goals').delete().eq('id', confirmDelete.target.id);
      showToast('Goal deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleAddToGoal = async (goal, amount) => {
    try {
      const next = Number(goal.currentAmount || 0) + Number(amount);
      await updateDocument('parent_savings_goals', goal.id, { currentAmount: next }, parentId);
      await syncToSupabase('parent_savings_goals', { currentAmount: next }, goal.id);
      showToast('Goal updated');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Uploads ----------
  const handleReceiptUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      setExpenseForm((f) => ({ ...f, receiptUrl: result?.secure_url || '' }));
      showToast('Receipt uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleInvoiceFileUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      setInvoiceForm((f) => ({ ...f, fileUrl: result?.secure_url || '' }));
      showToast('Invoice file uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handlePaymentReceiptUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      setPaymentForm((f) => ({ ...f, receiptUrl: result?.secure_url || '' }));
      showToast('Receipt uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Export CSV ----------
  const exportExpensesCSV = () => {
    const header = ['Title', 'Category', 'Amount', 'Date', 'Description', 'Child'];
    const rows = expenses.map((e) => [
      `"${e.title ?? ''}"`,
      `"${e.category ?? ''}"`,
      e.amount ?? 0,
      e.date ?? '',
      `"${(e.description ?? '').replace(/"/g, '""')}"`,
      `"${e.childId ?? ''}"`,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `parent-expenses-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportInvoicesCSV = () => {
    const header = ['Number', 'Vendor', 'Amount', 'Issue Date', 'Due Date', 'Status'];
    const rows = invoices.map((i) => [
      `"${i.number ?? ''}"`,
      `"${i.vendor ?? ''}"`,
      i.amount ?? 0,
      i.issueDate ?? '',
      i.dueDate ?? '',
      i.status ?? '',
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `parent-invoices-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Render ----------
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'budgets', label: 'Budgets', count: budgets.length },
    { id: 'expenses', label: 'Expenses', count: expenses.length },
    { id: 'invoices', label: 'Invoices', count: invoices.length },
    { id: 'payments', label: 'Payments', count: payments.length },
    { id: 'goals', label: 'Savings Goals', count: goals.length },
    { id: 'scholarships', label: 'Scholarships', count: scholarships.length },
  ];

  return (
    <PageShell
      title="Financial Planning"
      subtitle="Budgets, expenses, invoices, payments, and savings goals — all synced in real time."
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
          <Btn onClick={() => setExpenseModal({ open: true, editing: null })}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            Add Expense
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
        <StatsCard label="Total Budget" value={formatCurrency(overviewStats.totalBudget)} tone="blue" icon="🎯" />
        <StatsCard label="Total Expenses" value={formatCurrency(overviewStats.totalExpenses)} tone="rose" icon="💸" />
        <StatsCard label="Total Paid" value={formatCurrency(overviewStats.totalPaid)} tone="emerald" icon="✅" />
        <StatsCard label="Outstanding" value={formatCurrency(overviewStats.outstanding)} tone="amber" icon="⏳" />
      </div>

      {/* Tabs + Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:w-64"
        />
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Monthly Expenses" subtitle="Last 6 months">
            <BarChart data={monthlyExpenseData} />
          </Card>
          <Card title="Category Breakdown" subtitle="Where money goes">
            {categoryData.length === 0 ? (
              <p className="text-sm text-slate-500">No expense data yet.</p>
            ) : (
              <DonutChart segments={categoryData} />
            )}
          </Card>
        </div>
      )}

      {activeTab === 'budgets' && (
        <Card title="Budgets" action={<Btn size="sm" onClick={() => setBudgetModal({ open: true, editing: null })}>Add Budget</Btn>}>
          {budgets.length === 0 ? (
            <EmptyState title="No budgets" description="Create budgets to plan your spending." action={<Btn onClick={() => setBudgetModal({ open: true, editing: null })}>Add Budget</Btn>} icon="🎯" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {budgets.map((b) => {
                const spent = expenses
                  .filter((e) => e.category === b.category)
                  .reduce((s, e) => s + (Number(e.amount) || 0), 0);
                const pct = b.amount ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
                return (
                  <li key={b.id} className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold capitalize text-slate-800">{b.category}</p>
                        <p className="text-xs text-slate-500">{b.period} · {formatCurrency(b.amount)}</p>
                        {b.notes && <p className="truncate text-xs text-slate-400">{b.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Btn size="sm" variant="outline" onClick={() => {
                          setBudgetForm({ category: b.category || 'tuition', amount: b.amount ?? '', period: b.period || 'monthly', notes: b.notes || '', childId: b.childId || '' });
                          setBudgetModal({ open: true, editing: b });
                        }}>Edit</Btn>
                        <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: b, type: 'budget' })}>Delete</Btn>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{formatCurrency(spent)} spent</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className={`h-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'expenses' && (
        <Card title="Expenses" action={<div className="flex gap-2"><Btn size="sm" variant="outline" onClick={exportExpensesCSV}>Export CSV</Btn><Btn size="sm" onClick={() => setExpenseModal({ open: true, editing: null })}>Add Expense</Btn></div>}>
          {filteredExpenses.length === 0 ? (
            <EmptyState title="No expenses" description="Track spending by adding your first expense." action={<Btn onClick={() => setExpenseModal({ open: true, editing: null })}>Add Expense</Btn>} icon="💸" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-3">Title</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Receipt</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((e) => (
                    <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-3 py-3 font-medium text-slate-800">{e.title}</td>
                      <td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs capitalize text-slate-700">{e.category}</span></td>
                      <td className="px-3 py-3 font-semibold text-slate-800">{formatCurrency(e.amount)}</td>
                      <td className="px-3 py-3 text-slate-500">{e.date}</td>
                      <td className="px-3 py-3">
                        {e.receiptUrl ? <a href={e.receiptUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 hover:underline">View</a> : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Btn size="sm" variant="outline" onClick={() => {
                            setExpenseForm({ title: e.title || '', category: e.category || 'tuition', amount: e.amount ?? '', date: e.date || '', description: e.description || '', childId: e.childId || '', receiptUrl: e.receiptUrl || '' });
                            setExpenseModal({ open: true, editing: e });
                          }}>Edit</Btn>
                          <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: e, type: 'expense' })}>Delete</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'invoices' && (
        <Card title="Invoices" action={<div className="flex gap-2"><Btn size="sm" variant="outline" onClick={exportInvoicesCSV}>Export CSV</Btn><Btn size="sm" onClick={() => setInvoiceModal({ open: true, editing: null })}>Add Invoice</Btn></div>}>
          {invoices.length === 0 ? (
            <EmptyState title="No invoices" description="Add invoices to track bills." action={<Btn onClick={() => setInvoiceModal({ open: true, editing: null })}>Add Invoice</Btn>} icon="🧾" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {invoices.map((i) => {
                const isOverdue = i.status !== 'paid' && i.dueDate && new Date(i.dueDate) < new Date();
                return (
                  <li key={i.id} className="flex items-start gap-4 py-4">
                    <span className={`rounded-xl p-3 ${i.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : isOverdue ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                      {i.status === 'paid' ? '✅' : isOverdue ? '⚠️' : '⏳'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800">#{i.number} · {i.vendor}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${i.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {i.status?.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatCurrency(i.amount)} · Due {i.dueDate}
                      </p>
                      {i.description && <p className="truncate text-xs text-slate-400">{i.description}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {i.fileUrl && <a href={i.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 hover:underline">File</a>}
                      {i.status !== 'paid' && <Btn size="sm" variant="success" onClick={() => handleMarkInvoicePaid(i)}>Mark Paid</Btn>}
                      <Btn size="sm" variant="outline" onClick={() => {
                        setInvoiceForm({ number: i.number || '', vendor: i.vendor || '', amount: i.amount ?? '', issueDate: i.issueDate || '', dueDate: i.dueDate || '', status: i.status || 'unpaid', description: i.description || '', fileUrl: i.fileUrl || '' });
                        setInvoiceModal({ open: true, editing: i });
                      }}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: i, type: 'invoice' })}>Delete</Btn>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card title="Payments" action={<Btn size="sm" onClick={() => setPaymentModal({ open: true, editing: null })}>Record Payment</Btn>}>
          {payments.length === 0 ? (
            <EmptyState title="No payments" description="Record payments to track your history." action={<Btn onClick={() => setPaymentModal({ open: true, editing: null })}>Record Payment</Btn>} icon="💳" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {payments.map((p) => (
                <li key={p.id} className="flex items-start gap-4 py-4">
                  <span className="rounded-xl bg-blue-50 p-3 text-blue-600">💳</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{formatCurrency(p.amount)} · {p.method}</p>
                    <p className="text-xs text-slate-500">Ref {p.reference || '—'} · {p.paidAt}</p>
                    {p.notes && <p className="truncate text-xs text-slate-400">{p.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {p.receiptUrl && <a href={p.receiptUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 hover:underline">Receipt</a>}
                    <Btn size="sm" variant="outline" onClick={() => {
                      setPaymentForm({ invoiceId: p.invoiceId || '', amount: p.amount ?? '', method: p.method || 'card', paidAt: p.paidAt || '', reference: p.reference || '', notes: p.notes || '', receiptUrl: p.receiptUrl || '' });
                      setPaymentModal({ open: true, editing: p });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: p, type: 'payment' })}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {activeTab === 'goals' && (
        <Card title="Savings Goals" action={<Btn size="sm" onClick={() => setGoalModal({ open: true, editing: null })}>Add Goal</Btn>}>
          {goals.length === 0 ? (
            <EmptyState title="No savings goals" description="Set goals to stay motivated." action={<Btn onClick={() => setGoalModal({ open: true, editing: null })}>Add Goal</Btn>} icon="🏦" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {goals.map((g) => {
                const pct = g.targetAmount ? Math.min(100, Math.round(((g.currentAmount || 0) / g.targetAmount) * 100)) : 0;
                return (
                  <div key={g.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{g.name}</p>
                        <p className="text-xs text-slate-500">{formatCurrency(g.currentAmount || 0)} of {formatCurrency(g.targetAmount)}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${g.priority === 'high' ? 'bg-red-100 text-red-700' : g.priority === 'low' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>
                        {g.priority?.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-right text-xs font-semibold text-slate-600">{pct}%</p>
                    </div>
                    {g.description && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{g.description}</p>}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex gap-1.5">
                        {[50, 100, 500].map((amt) => (
                          <button key={amt} onClick={() => handleAddToGoal(g, amt)} className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100">+{amt}</button>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <Btn size="sm" variant="outline" onClick={() => {
                          setGoalForm({ name: g.name || '', targetAmount: g.targetAmount ?? '', currentAmount: g.currentAmount ?? '', deadline: g.deadline || '', priority: g.priority || 'medium', description: g.description || '', childId: g.childId || '' });
                          setGoalModal({ open: true, editing: g });
                        }}>Edit</Btn>
                        <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: g, type: 'goal' })}>Delete</Btn>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'scholarships' && (
        <Card title="Scholarship Opportunities" subtitle="Active funding opportunities for students">
          {scholarships.length === 0 ? (
            <EmptyState title="No scholarships" description="New opportunities will appear here." icon="🎓" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {scholarships.map((s) => (
                <li key={s.id} className="flex items-start gap-4 py-4">
                  <span className="rounded-xl bg-violet-50 p-3 text-violet-600">🎓</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{s.name || s.title}</p>
                    <p className="text-xs text-slate-500">
                      {s.amount ? formatCurrency(s.amount) : 'Varies'} · {s.deadline || 'Rolling'}
                    </p>
                    {s.description && <p className="truncate text-xs text-slate-400">{s.description}</p>}
                  </div>
                  {s.url && (
                    <a href={s.url} target="_blank" rel="noreferrer" className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700">Apply</a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* BUDGET MODAL */}
      <Modal open={budgetModal.open} onClose={() => setBudgetModal({ open: false, editing: null })} title={budgetModal.editing ? 'Edit Budget' : 'Add Budget'}
        footer={<><Btn variant="ghost" onClick={() => setBudgetModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveBudget}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Category" name="category" options={[
            { value: 'tuition', label: 'Tuition' },
            { value: 'books', label: 'Books' },
            { value: 'transport', label: 'Transport' },
            { value: 'uniform', label: 'Uniform' },
            { value: 'meals', label: 'Meals' },
            { value: 'activities', label: 'Activities' },
            { value: 'other', label: 'Other' },
          ]} value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })} required error={formErrors.category} />
          <Field label="Amount" name="amount" type="number" min="1" step="0.01" value={budgetForm.amount} onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })} required error={formErrors.amount} />
          <Field label="Period" name="period" options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'yearly', label: 'Yearly' },
          ]} value={budgetForm.period} onChange={(e) => setBudgetForm({ ...budgetForm, period: e.target.value })} />
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={budgetForm.childId} onChange={(e) => setBudgetForm({ ...budgetForm, childId: e.target.value })} />
          <div className="sm:col-span-2"><Field label="Notes" name="notes" textarea value={budgetForm.notes} onChange={(e) => setBudgetForm({ ...budgetForm, notes: e.target.value })} /></div>
        </div>
      </Modal>

      {/* EXPENSE MODAL */}
      <Modal open={expenseModal.open} onClose={() => setExpenseModal({ open: false, editing: null })} title={expenseModal.editing ? 'Edit Expense' : 'Add Expense'}
        footer={<><Btn variant="ghost" onClick={() => setExpenseModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveExpense}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" name="title" value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} required error={formErrors.title} />
          <Field label="Category" name="category" options={[
            { value: 'tuition', label: 'Tuition' },
            { value: 'books', label: 'Books' },
            { value: 'transport', label: 'Transport' },
            { value: 'uniform', label: 'Uniform' },
            { value: 'meals', label: 'Meals' },
            { value: 'activities', label: 'Activities' },
            { value: 'other', label: 'Other' },
          ]} value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} />
          <Field label="Amount" name="amount" type="number" min="0" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required error={formErrors.amount} />
          <Field label="Date" name="date" type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} required error={formErrors.date} />
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={expenseForm.childId} onChange={(e) => setExpenseForm({ ...expenseForm, childId: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Receipt</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handleReceiptUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
            {uploading && <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>}
            {expenseForm.receiptUrl && <a href={expenseForm.receiptUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline">View receipt</a>}
          </div>
          <div className="sm:col-span-2"><Field label="Description" name="description" textarea value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} /></div>
        </div>
      </Modal>

      {/* INVOICE MODAL */}
      <Modal open={invoiceModal.open} onClose={() => setInvoiceModal({ open: false, editing: null })} title={invoiceModal.editing ? 'Edit Invoice' : 'Add Invoice'}
        footer={<><Btn variant="ghost" onClick={() => setInvoiceModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveInvoice}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Invoice #" name="number" value={invoiceForm.number} onChange={(e) => setInvoiceForm({ ...invoiceForm, number: e.target.value })} required error={formErrors.number} />
          <Field label="Vendor" name="vendor" value={invoiceForm.vendor} onChange={(e) => setInvoiceForm({ ...invoiceForm, vendor: e.target.value })} required error={formErrors.vendor} />
          <Field label="Amount" name="amount" type="number" min="0" step="0.01" value={invoiceForm.amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} required error={formErrors.amount} />
          <Field label="Status" name="status" options={[
            { value: 'unpaid', label: 'Unpaid' },
            { value: 'paid', label: 'Paid' },
            { value: 'overdue', label: 'Overdue' },
          ]} value={invoiceForm.status} onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value })} />
          <Field label="Issue Date" name="issueDate" type="date" value={invoiceForm.issueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })} />
          <Field label="Due Date" name="dueDate" type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} required error={formErrors.dueDate} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Invoice File</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handleInvoiceFileUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
            {invoiceForm.fileUrl && <a href={invoiceForm.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline">View file</a>}
          </div>
          <div className="sm:col-span-2"><Field label="Description" name="description" textarea value={invoiceForm.description} onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })} /></div>
        </div>
      </Modal>

      {/* PAYMENT MODAL */}
      <Modal open={paymentModal.open} onClose={() => setPaymentModal({ open: false, editing: null })} title={paymentModal.editing ? 'Edit Payment' : 'Record Payment'}
        footer={<><Btn variant="ghost" onClick={() => setPaymentModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSavePayment}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Invoice" name="invoiceId" options={invoices.map((i) => ({ value: i.id, label: `#${i.number} · ${formatCurrency(i.amount)}` }))} value={paymentForm.invoiceId} onChange={(e) => {
            const inv = invoices.find((x) => x.id === e.target.value);
            setPaymentForm({ ...paymentForm, invoiceId: e.target.value, amount: inv?.amount ?? paymentForm.amount });
          }} required error={formErrors.invoiceId} />
          <Field label="Amount" name="amount" type="number" min="0" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} required error={formErrors.amount} />
          <Field label="Method" name="method" options={[
            { value: 'card', label: 'Card' },
            { value: 'bank', label: 'Bank Transfer' },
            { value: 'cash', label: 'Cash' },
            { value: 'mobile', label: 'Mobile Money' },
            { value: 'other', label: 'Other' },
          ]} value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} />
          <Field label="Paid At" name="paidAt" type="date" value={paymentForm.paidAt} onChange={(e) => setPaymentForm({ ...paymentForm, paidAt: e.target.value })} required error={formErrors.paidAt} />
          <Field label="Reference" name="reference" value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Receipt</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handlePaymentReceiptUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
            {paymentForm.receiptUrl && <a href={paymentForm.receiptUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline">View receipt</a>}
          </div>
          <div className="sm:col-span-2"><Field label="Notes" name="notes" textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} /></div>
        </div>
      </Modal>

      {/* GOAL MODAL */}
      <Modal open={goalModal.open} onClose={() => setGoalModal({ open: false, editing: null })} title={goalModal.editing ? 'Edit Goal' : 'Add Savings Goal'}
        footer={<><Btn variant="ghost" onClick={() => setGoalModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveGoal}>Save</Btn></>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" value={goalForm.name} onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })} required error={formErrors.name} />
          <Field label="Priority" name="priority" options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]} value={goalForm.priority} onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value })} />
          <Field label="Target Amount" name="targetAmount" type="number" min="1" step="0.01" value={goalForm.targetAmount} onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })} required error={formErrors.targetAmount} />
          <Field label="Current Amount" name="currentAmount" type="number" min="0" step="0.01" value={goalForm.currentAmount} onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })} />
          <Field label="Deadline" name="deadline" type="date" value={goalForm.deadline} onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })} />
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={goalForm.childId} onChange={(e) => setGoalForm({ ...goalForm, childId: e.target.value })} />
          <div className="sm:col-span-2"><Field label="Description" name="description" textarea value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} /></div>
        </div>
      </Modal>

      {/* CONFIRM DELETE */}
      <Modal open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, target: null, type: '' })} title="Confirm Delete" size="sm"
        footer={<><Btn variant="ghost" onClick={() => setConfirmDelete({ open: false, target: null, type: '' })}>Cancel</Btn><Btn variant="danger" onClick={() => {
          if (confirmDelete.type === 'budget') handleDeleteBudget();
          if (confirmDelete.type === 'expense') handleDeleteExpense();
          if (confirmDelete.type === 'invoice') handleDeleteInvoice();
          if (confirmDelete.type === 'payment') handleDeletePayment();
          if (confirmDelete.type === 'goal') handleDeleteGoal();
        }}>Delete</Btn></>}>
        <p className="text-sm text-slate-600">Are you sure? This action cannot be undone.</p>
      </Modal>
    </PageShell>
  );
};

export default memo(FinancialPlanning);