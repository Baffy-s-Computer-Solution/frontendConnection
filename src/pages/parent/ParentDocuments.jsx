// frontend/src/pages/parent/ParentDocuments.jsx
import { supabaseMediaService } from '../../services/supabaseMediaService';
// ============================================================================
// PARENT DOCUMENTS - Production Ready
// Secure document vault | Categories | Expiry reminders | Versions | Sharing
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
  validateMaxLength,
} from '../../utils/validators';

// ============================================================================
// TAILWIND UI PRIMITIVES
// ============================================================================

const PageShell = ({ title, subtitle, actions, children, loading, error }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/20">
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/parent" className="hover:text-cyan-600">Parent</Link>
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
    primary: 'bg-cyan-600 text-white shadow-sm hover:bg-cyan-700 focus:ring-cyan-500',
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

const StatsCard = ({ label, value, delta, icon, tone = 'cyan', onClick }) => {
  const tones = {
    cyan: 'from-cyan-500/10 to-cyan-500/0 text-cyan-700 ring-cyan-200',
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
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    ) : options ? (
      <select id={name} name={name} value={value ?? ''} onChange={onChange}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} min={min} max={max} step={step}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
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

const EmptyState = ({ title, description, action, icon = '📁' }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3 text-2xl">{icon}</div>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

const CategoryIcon = ({ category }) => {
  const map = {
    academic: '🎓', financial: '💰', medical: '🏥', legal: '⚖️', identification: '🆔',
    certificates: '🏆', receipts: '🧾', reports: '📊', contracts: '📝', other: '📁',
  };
  return <span aria-hidden="true">{map[category] || '📁'}</span>;
};

const CategoryBadge = ({ category }) => {
  const map = {
    academic: 'bg-blue-100 text-blue-700',
    financial: 'bg-emerald-100 text-emerald-700',
    medical: 'bg-rose-100 text-rose-700',
    legal: 'bg-slate-100 text-slate-700',
    identification: 'bg-indigo-100 text-indigo-700',
    certificates: 'bg-amber-100 text-amber-700',
    receipts: 'bg-violet-100 text-violet-700',
    reports: 'bg-cyan-100 text-cyan-700',
    contracts: 'bg-orange-100 text-orange-700',
    other: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${map[category] || 'bg-slate-100 text-slate-700'}`}>
      {category || 'other'}
    </span>
  );
};

const FileIcon = ({ fileType }) => {
  if (!fileType) return <span className="text-3xl">📄</span>;
  if (fileType.includes('pdf')) return <span className="text-3xl">📕</span>;
  if (fileType.includes('image')) return <span className="text-3xl">🖼️</span>;
  if (fileType.includes('word') || fileType.includes('document')) return <span className="text-3xl">📘</span>;
  if (fileType.includes('sheet') || fileType.includes('excel')) return <span className="text-3xl">📗</span>;
  return <span className="text-3xl">📄</span>;
};

const ExpiryBadge = ({ expiryDate }) => {
  if (!expiryDate) return null;
  const d = new Date(expiryDate);
  const now = new Date();
  const days = Math.round((d - now) / (1000 * 60 * 60 * 24));
  if (days < 0) return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">EXPIRED</span>;
  if (days <= 30) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">EXPIRES IN {days}D</span>;
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">EXPIRES {d.toLocaleDateString()}</span>;
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

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ParentDocuments = () => {
  const { user, profile } = useAuth();
  const { refresh: refreshParent } = useParent();
  const { push: pushNotification } = useNotifications();
  const { upload: uploadToSupabase, uploading, progress } = useSupabaseUpload(`parents/${user?.uid ?? 'anon'}/documents`);
  const parentId = user?.uid ?? profile?.uid;

  // ---------- Realtime ----------
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const setSearchDebounced = useMemo(() => debounce((v) => setDebouncedSearch(v), 300), []);
  useEffect(() => { setSearchDebounced(searchQuery); }, [searchQuery, setSearchDebounced]);

  const { items: children, loading: childrenLoading, error: childrenError } = useRealtimeCollection(
    'parent_children',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: documents, loading: docsLoading, error: docsError } = useRealtimeCollection(
    'parent_documents',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: folders } = useRealtimeCollection(
    'parent_document_folders',
    parentId ? [where('parentId', '==', parentId), orderBy('name', 'asc')] : [],
    [parentId]
  );

  const { items: versions } = useRealtimeCollection(
    'parent_document_versions',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: shares } = useRealtimeCollection(
    'parent_document_shares',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: reminders } = useRealtimeCollection(
    'parent_document_reminders',
    parentId ? [where('parentId', '==', parentId), orderBy('remindAt', 'asc')] : [],
    [parentId]
  );

  // ---------- Derived ----------
  const filteredDocs = useMemo(() => {
    let list = documents;
    if (activeTab === 'starred') list = list.filter((d) => d.starred);
    else if (activeTab === 'expiring') {
      const now = Date.now();
      list = list.filter((d) => {
        if (!d.expiryDate) return false;
        const diff = new Date(d.expiryDate).getTime() - now;
        return diff > 0 && diff < 60 * 24 * 60 * 60 * 1000;
      });
    } else if (activeTab === 'expired') {
      const now = Date.now();
      list = list.filter((d) => d.expiryDate && new Date(d.expiryDate).getTime() < now);
    } else if (activeTab === 'archived') {
      list = list.filter((d) => d.archived);
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((d) =>
        d.name?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q) ||
        d.tags?.some?.((t) => t?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [documents, activeTab, debouncedSearch]);

  const overviewStats = useMemo(() => {
    const now = Date.now();
    const expiring = documents.filter((d) => {
      if (!d.expiryDate) return false;
      const diff = new Date(d.expiryDate).getTime() - now;
      return diff > 0 && diff < 60 * 24 * 60 * 60 * 1000;
    }).length;
    const expired = documents.filter((d) => d.expiryDate && new Date(d.expiryDate).getTime() < now).length;
    const totalSize = documents.reduce((s, d) => s + (Number(d.size) || 0), 0);
    return {
      total: documents.length,
      starred: documents.filter((d) => d.starred).length,
      expiring,
      expired,
      totalSize,
    };
  }, [documents]);

  const categoryStats = useMemo(() => {
    const map = {};
    documents.forEach((d) => {
      const c = d.category || 'other';
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
  }, [documents]);

  // ---------- Local UI ----------
  const [docModal, setDocModal] = useState({ open: false, editing: null });
  const [folderModal, setFolderModal] = useState({ open: false, editing: null });
  const [shareModal, setShareModal] = useState({ open: false, document: null });
  const [reminderModal, setReminderModal] = useState({ open: false, document: null, editing: null });
  const [versionsModal, setVersionsModal] = useState({ open: false, document: null });
  const [previewModal, setPreviewModal] = useState({ open: false, document: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null, type: '' });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ---------- Forms ----------
  const [docForm, setDocForm] = useState({
    name: '', description: '', category: 'academic', folderId: '', childId: '', childName: '',
    fileUrl: '', fileType: '', size: 0, expiryDate: '', tags: [], starred: false, archived: false, notes: '',
  });
  const [folderForm, setFolderForm] = useState({ name: '', description: '', color: '#06b6d4' });
  const [shareForm, setShareForm] = useState({ email: '', permission: 'view', expiresAt: '', message: '' });
  const [reminderForm, setReminderForm] = useState({ remindAt: '', note: '', channel: 'in-app' });
  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // ---------- Validation ----------
  const validateDoc = () => {
    const errors = {};
    if (!validateRequired(docForm.name)) errors.name = 'Name required';
    if (!validateRequired(docForm.fileUrl)) errors.fileUrl = 'File required — upload one';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateFolder = () => {
    const errors = {};
    if (!validateRequired(folderForm.name)) errors.name = 'Name required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateShare = () => {
    const errors = {};
    if (!shareForm.email) errors.email = 'Email required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateReminder = () => {
    const errors = {};
    if (!validateRequired(reminderForm.remindAt)) errors.remindAt = 'Date required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };

  // ---------- CRUD: Documents ----------
  const handleSaveDoc = async () => {
    if (!validateDoc()) return;
    try {
      const payload = { ...docForm, parentId, size: Number(docForm.size) || 0 };
      if (docModal.editing) {
        // Save version snapshot
        if (docModal.editing.fileUrl && docModal.editing.fileUrl !== docForm.fileUrl) {
          await createDocument('parent_document_versions', {
            documentId: docModal.editing.id,
            parentId,
            fileUrl: docModal.editing.fileUrl,
            fileType: docModal.editing.fileType || '',
            size: docModal.editing.size || 0,
            note: 'Previous version before update',
          }, parentId);
        }
        await updateDocument('parent_documents', docModal.editing.id, payload, parentId);
        await syncToSupabase('parent_documents', payload, docModal.editing.id);
        showToast('Document updated');
      } else {
        const created = await createDocument('parent_documents', payload, parentId);
        await syncToSupabase('parent_documents', payload, created.id);
        showToast('Document uploaded');
        pushNotification?.({ title: 'Document uploaded', body: payload.name, audience: 'parent', category: 'system' });
      }
      setDocModal({ open: false, editing: null });
      setDocForm({
        name: '', description: '', category: 'academic', folderId: '', childId: '', childName: '',
        fileUrl: '', fileType: '', size: 0, expiryDate: '', tags: [], starred: false, archived: false, notes: '',
      });
      setTagInput('');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteDoc = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_documents', confirmDelete.target.id);
      await supabase.from('parent_documents').delete().eq('id', confirmDelete.target.id);
      showToast('Document deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const toggleStar = async (doc) => {
    try {
      await updateDocument('parent_documents', doc.id, { starred: !doc.starred }, parentId);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const toggleArchive = async (doc) => {
    try {
      await updateDocument('parent_documents', doc.id, { archived: !doc.archived, archivedAt: !doc.archived ? serverTimestamp() : null }, parentId);
      showToast(doc.archived ? 'Unarchived' : 'Archived');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Folders ----------
  const handleSaveFolder = async () => {
    if (!validateFolder()) return;
    try {
      const payload = { ...folderForm, parentId };
      if (folderModal.editing) {
        await updateDocument('parent_document_folders', folderModal.editing.id, payload, parentId);
        await syncToSupabase('parent_document_folders', payload, folderModal.editing.id);
        showToast('Folder updated');
      } else {
        const created = await createDocument('parent_document_folders', payload, parentId);
        await syncToSupabase('parent_document_folders', payload, created.id);
        showToast('Folder created');
      }
      setFolderModal({ open: false, editing: null });
      setFolderForm({ name: '', description: '', color: '#06b6d4' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteFolder = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_document_folders', confirmDelete.target.id);
      await supabase.from('parent_document_folders').delete().eq('id', confirmDelete.target.id);
      showToast('Folder deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Shares ----------
  const handleCreateShare = async () => {
    if (!validateShare()) return;
    if (!shareModal.document) return;
    try {
      const payload = {
        ...shareForm,
        documentId: shareModal.document.id,
        documentName: shareModal.document.name,
        parentId,
        shareUrl: `${window.location.origin}/shared/${shareModal.document.id}/${Date.now()}`,
      };
      const created = await createDocument('parent_document_shares', payload, parentId);
      await syncToSupabase('parent_document_shares', payload, created.id);
      showToast('Share link created');
      setShareModal({ open: false, document: null });
      setShareForm({ email: '', permission: 'view', expiresAt: '', message: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleRevokeShare = async (share) => {
    try {
      await deleteDocument('parent_document_shares', share.id);
      await supabase.from('parent_document_shares').delete().eq('id', share.id);
      showToast('Share revoked');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Reminders ----------
  const handleSaveReminder = async () => {
    if (!validateReminder()) return;
    try {
      const payload = {
        ...reminderForm,
        documentId: reminderModal.document?.id || reminderModal.editing?.documentId || '',
        parentId,
        remindAt: reminderForm.remindAt ? Timestamp.fromDate(new Date(reminderForm.remindAt)) : null,
      };
      if (reminderModal.editing) {
        await updateDocument('parent_document_reminders', reminderModal.editing.id, payload, parentId);
        await syncToSupabase('parent_document_reminders', payload, reminderModal.editing.id);
        showToast('Reminder updated');
      } else {
        const created = await createDocument('parent_document_reminders', payload, parentId);
        await syncToSupabase('parent_document_reminders', payload, created.id);
        showToast('Reminder set');
      }
      setReminderModal({ open: false, document: null, editing: null });
      setReminderForm({ remindAt: '', note: '', channel: 'in-app' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteReminder = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_document_reminders', confirmDelete.target.id);
      await supabase.from('parent_document_reminders').delete().eq('id', confirmDelete.target.id);
      showToast('Reminder deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Uploads ----------
  const handleFileUpload = async (file) => {
    try {
      const result = await uploadToSupabase(file);
      setDocForm((f) => ({
        ...f,
        fileUrl: result?.secure_url || '',
        fileType: file.type || result?.format || '',
        size: file.size || result?.bytes || 0,
        name: f.name || file.name.replace(/\.[^/.]+$/, ''),
      }));
      showToast('File uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Tags ----------
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (docForm.tags.includes(t)) return;
    setDocForm({ ...docForm, tags: [...docForm.tags, t] });
    setTagInput('');
  };

  const removeTag = (t) => setDocForm({ ...docForm, tags: docForm.tags.filter((x) => x !== t) });

  // ---------- Export CSV ----------
  const exportDocsCSV = () => {
    const header = ['Name', 'Category', 'Child', 'Expiry', 'Size', 'Uploaded'];
    const rows = documents.map((d) => [
      `"${d.name ?? ''}"`,
      `"${d.category ?? ''}"`,
      `"${d.childName ?? ''}"`,
      d.expiryDate ?? '',
      formatBytes(d.size),
      d.createdAt?.toDate?.()?.toISOString?.() ?? '',
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `parent-documents-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Render ----------
  const tabs = [
    { id: 'all', label: 'All', count: documents.length },
    { id: 'starred', label: 'Starred', count: overviewStats.starred },
    { id: 'expiring', label: 'Expiring', count: overviewStats.expiring },
    { id: 'expired', label: 'Expired', count: overviewStats.expired },
    { id: 'folders', label: 'Folders', count: folders.length },
    { id: 'shares', label: 'Shared', count: shares.length },
    { id: 'reminders', label: 'Reminders', count: reminders.length },
    { id: 'archived', label: 'Archived' },
  ];

  return (
    <PageShell
      title="Document Vault"
      subtitle="Securely store, organize, and track expiry of all your child's documents."
      loading={childrenLoading || docsLoading}
      error={childrenError || docsError}
      actions={
        <>
          <Btn variant="outline" onClick={refreshParent}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </Btn>
          <Btn size="sm" variant="outline" onClick={exportDocsCSV}>Export CSV</Btn>
          <Btn size="sm" variant="outline" onClick={() => setFolderModal({ open: true, editing: null })}>+ Folder</Btn>
          <Btn onClick={() => setDocModal({ open: true, editing: null })}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            Upload Document
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
        <StatsCard label="Documents" value={overviewStats.total} tone="cyan" icon="📁" />
        <StatsCard label="Starred" value={overviewStats.starred} tone="amber" icon="⭐" />
        <StatsCard label="Expiring Soon" value={overviewStats.expiring} tone="rose" icon="⏰" />
        <StatsCard label="Total Size" value={formatBytes(overviewStats.totalSize)} tone="violet" icon="💾" />
      </div>

      {/* Tabs + Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 sm:w-64"
        />
      </div>

      {/* Document list / grid */}
      {(activeTab === 'all' || activeTab === 'starred' || activeTab === 'expiring' || activeTab === 'expired' || activeTab === 'archived') && (
        <Card>
          {filteredDocs.length === 0 ? (
            <EmptyState
              title="No documents"
              description="Upload your first document to get started."
              action={<Btn onClick={() => setDocModal({ open: true, editing: null })}>Upload Document</Btn>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocs.map((d) => (
                <div key={d.id} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <button onClick={() => setPreviewModal({ open: true, document: d })} className="flex items-start gap-3 text-left">
                      <FileIcon fileType={d.fileType} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{d.name}</p>
                        <p className="text-xs text-slate-500">{formatBytes(d.size)}</p>
                      </div>
                    </button>
                    <button onClick={() => toggleStar(d)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-500">
                      {d.starred ? '⭐' : '☆'}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <CategoryBadge category={d.category} />
                    <ExpiryBadge expiryDate={d.expiryDate} />
                    {d.archived && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">ARCHIVED</span>}
                  </div>
                  {d.description && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{d.description}</p>}
                  {d.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {d.tags.map((t, i) => (
                        <span key={i} className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] text-cyan-700">#{t}</span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-slate-400">{formatRelativeTime(d.createdAt)}</p>

                  <div className="mt-4 flex flex-wrap items-center justify-end gap-1.5">
                    <Btn size="sm" variant="outline" onClick={() => setPreviewModal({ open: true, document: d })}>Preview</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => setShareModal({ open: true, document: d })} title="Share">🔗</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => setReminderModal({ open: true, document: d, editing: null })} title="Remind">⏰</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => setVersionsModal({ open: true, document: d })} title="Versions">🕓</Btn>
                    <Btn size="sm" variant="outline" onClick={() => {
                      setDocForm({
                        name: d.name || '', description: d.description || '', category: d.category || 'academic',
                        folderId: d.folderId || '', childId: d.childId || '', childName: d.childName || '',
                        fileUrl: d.fileUrl || '', fileType: d.fileType || '', size: d.size || 0,
                        expiryDate: d.expiryDate || '', tags: d.tags || [], starred: !!d.starred,
                        archived: !!d.archived, notes: d.notes || '',
                      });
                      setDocModal({ open: true, editing: d });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: d, type: 'doc' })}>Delete</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Category breakdown (all view) */}
      {activeTab === 'all' && categoryStats.length > 0 && (
        <div className="mt-5">
          <Card title="By Category">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {categoryStats.map((c) => (
                <div key={c.category} className="rounded-xl border border-slate-200 p-3 text-center">
                  <div className="mb-1 text-xl"><CategoryIcon category={c.category} /></div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{c.category}</p>
                  <p className="mt-0.5 text-lg font-bold text-slate-900">{c.count}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* FOLDERS */}
      {activeTab === 'folders' && (
        <Card title="Folders" action={<Btn size="sm" onClick={() => setFolderModal({ open: true, editing: null })}>New Folder</Btn>}>
          {folders.length === 0 ? (
            <EmptyState title="No folders" description="Create folders to organize documents." icon="📂" action={<Btn onClick={() => setFolderModal({ open: true, editing: null })}>New Folder</Btn>} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {folders.map((f) => {
                const docCount = documents.filter((d) => d.folderId === f.id).length;
                return (
                  <div key={f.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: (f.color || '#06b6d4') + '20' }}>
                        <span className="text-2xl">📂</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{f.name}</p>
                        <p className="text-xs text-slate-500">{docCount} document(s)</p>
                      </div>
                    </div>
                    {f.description && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{f.description}</p>}
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <Btn size="sm" variant="outline" onClick={() => {
                        setFolderForm({ name: f.name || '', description: f.description || '', color: f.color || '#06b6d4' });
                        setFolderModal({ open: true, editing: f });
                      }}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: f, type: 'folder' })}>Delete</Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* SHARES */}
      {activeTab === 'shares' && (
        <Card title="Shared Documents" subtitle="Manage who has access to your documents">
          {shares.length === 0 ? (
            <EmptyState title="No shared documents" description="Share a document to collaborate." icon="🔗" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {shares.map((s) => (
                <li key={s.id} className="flex items-start gap-4 py-4">
                  <span className="rounded-xl bg-cyan-50 p-3 text-cyan-600">🔗</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">{s.documentName}</p>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">{s.permission}</span>
                    </div>
                    <p className="text-xs text-slate-500">Shared with {s.email} · {formatRelativeTime(s.createdAt)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        readOnly
                        value={s.shareUrl || ''}
                        className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600"
                      />
                      <button
                        onClick={() => {
                          if (s.shareUrl) {
                            navigator.clipboard.writeText(s.shareUrl);
                            showToast('Link copied');
                          }
                        }}
                        className="rounded-lg bg-cyan-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-cyan-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <Btn size="sm" variant="danger" onClick={() => handleRevokeShare(s)}>Revoke</Btn>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* REMINDERS */}
      {activeTab === 'reminders' && (
        <Card title="Expiry Reminders" action={<Btn size="sm" onClick={() => setReminderModal({ open: true, document: null, editing: null })}>Add Reminder</Btn>}>
          {reminders.length === 0 ? (
            <EmptyState title="No reminders" description="Set reminders for document expiry." icon="⏰" action={<Btn onClick={() => setReminderModal({ open: true, document: null, editing: null })}>Add Reminder</Btn>} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {reminders.map((r) => {
                const doc = documents.find((d) => d.id === r.documentId);
                const when = r.remindAt?.toDate?.();
                const overdue = when && when < new Date();
                return (
                  <li key={r.id} className="flex items-start gap-4 py-4">
                    <span className={`rounded-xl p-3 ${overdue ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                      ⏰
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{doc?.name || 'Document'}</p>
                      <p className="text-xs text-slate-500">{when ? when.toLocaleString() : '—'} · {r.channel}</p>
                      {r.note && <p className="truncate text-xs text-slate-400">{r.note}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Btn size="sm" variant="outline" onClick={() => {
                        setReminderForm({ remindAt: when ? when.toISOString().slice(0, 16) : '', note: r.note || '', channel: r.channel || 'in-app' });
                        setReminderModal({ open: true, document: doc, editing: r });
                      }}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: r, type: 'reminder' })}>Delete</Btn>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {/* DOC MODAL */}
      <Modal
        open={docModal.open}
        onClose={() => setDocModal({ open: false, editing: null })}
        title={docModal.editing ? 'Edit Document' : 'Upload Document'}
        size="lg"
        footer={<><Btn variant="ghost" onClick={() => setDocModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveDoc}>Save</Btn></>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Document Name" name="name" value={docForm.name} onChange={(e) => setDocForm({ ...docForm, name: e.target.value })} required error={formErrors.name} />
          <Field label="Category" name="category" options={[
            { value: 'academic', label: 'Academic 🎓' },
            { value: 'financial', label: 'Financial 💰' },
            { value: 'medical', label: 'Medical 🏥' },
            { value: 'legal', label: 'Legal ⚖️' },
            { value: 'identification', label: 'Identification 🆔' },
            { value: 'certificates', label: 'Certificates 🏆' },
            { value: 'receipts', label: 'Receipts 🧾' },
            { value: 'reports', label: 'Reports 📊' },
            { value: 'contracts', label: 'Contracts 📝' },
            { value: 'other', label: 'Other 📁' },
          ]} value={docForm.category} onChange={(e) => setDocForm({ ...docForm, category: e.target.value })} />
          <Field label="Child" name="childId" options={children.map((c) => ({ value: c.id, label: c.fullName }))} value={docForm.childId} onChange={(e) => {
            const c = children.find((x) => x.id === e.target.value);
            setDocForm({ ...docForm, childId: e.target.value, childName: c?.fullName || '' });
          }} />
          <Field label="Folder" name="folderId" options={folders.map((f) => ({ value: f.id, label: f.name }))} value={docForm.folderId} onChange={(e) => setDocForm({ ...docForm, folderId: e.target.value })} />
          <Field label="Expiry Date" name="expiryDate" type="date" value={docForm.expiryDate} onChange={(e) => setDocForm({ ...docForm, expiryDate: e.target.value })} />

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              File <span className="text-red-500">*</span>
            </label>
            <input type="file" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-cyan-700 hover:file:bg-cyan-100" />
            {uploading && <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-cyan-600 transition-all" style={{ width: `${progress}%` }} /></div>}
            {formErrors.fileUrl && <p className="mt-1 text-xs font-medium text-red-600">{formErrors.fileUrl}</p>}
            {docForm.fileUrl && (
              <a href={docForm.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-cyan-600 hover:underline">
                View uploaded file ({formatBytes(docForm.size)})
              </a>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {docForm.tags.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-xs text-cyan-700">
                  #{t}
                  <button onClick={() => removeTag(t)} className="ml-0.5 text-cyan-600 hover:text-cyan-800">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag and press Enter"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
              <Btn size="sm" variant="outline" onClick={addTag}>Add</Btn>
            </div>
          </div>

          <div className="sm:col-span-2">
            <Field label="Description" name="description" textarea value={docForm.description} onChange={(e) => setDocForm({ ...docForm, description: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes" name="notes" textarea rows={2} value={docForm.notes} onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input type="checkbox" checked={docForm.starred} onChange={(e) => setDocForm({ ...docForm, starred: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
            Star this document
          </label>
        </div>
      </Modal>

      {/* FOLDER MODAL */}
      <Modal
        open={folderModal.open}
        onClose={() => setFolderModal({ open: false, editing: null })}
        title={folderModal.editing ? 'Edit Folder' : 'New Folder'}
        footer={<><Btn variant="ghost" onClick={() => setFolderModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveFolder}>Save</Btn></>}
      >
        <div className="space-y-4">
          <Field label="Folder Name" name="name" value={folderForm.name} onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })} required error={formErrors.name} />
          <Field label="Description" name="description" textarea value={folderForm.description} onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Color</label>
            <input type="color" value={folderForm.color} onChange={(e) => setFolderForm({ ...folderForm, color: e.target.value })} className="h-10 w-20 cursor-pointer rounded-lg border border-slate-300" />
          </div>
        </div>
      </Modal>

      {/* SHARE MODAL */}
      <Modal
        open={shareModal.open}
        onClose={() => setShareModal({ open: false, document: null })}
        title="Share Document"
        footer={<><Btn variant="ghost" onClick={() => setShareModal({ open: false, document: null })}>Cancel</Btn><Btn onClick={handleCreateShare}>Create Share Link</Btn></>}
      >
        <div className="space-y-4">
          {shareModal.document && (
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-800">{shareModal.document.name}</p>
            </div>
          )}
          <Field label="Recipient Email" name="email" type="email" value={shareForm.email} onChange={(e) => setShareForm({ ...shareForm, email: e.target.value })} required error={formErrors.email} />
          <Field label="Permission" name="permission" options={[
            { value: 'view', label: 'View only' },
            { value: 'comment', label: 'Comment' },
            { value: 'edit', label: 'Edit' },
          ]} value={shareForm.permission} onChange={(e) => setShareForm({ ...shareForm, permission: e.target.value })} />
          <Field label="Expires At" name="expiresAt" type="date" value={shareForm.expiresAt} onChange={(e) => setShareForm({ ...shareForm, expiresAt: e.target.value })} />
          <Field label="Message" name="message" textarea rows={3} value={shareForm.message} onChange={(e) => setShareForm({ ...shareForm, message: e.target.value })} placeholder="Optional message…" />
        </div>
      </Modal>

      {/* REMINDER MODAL */}
      <Modal
        open={reminderModal.open}
        onClose={() => setReminderModal({ open: false, document: null, editing: null })}
        title={reminderModal.editing ? 'Edit Reminder' : 'Add Expiry Reminder'}
        footer={<><Btn variant="ghost" onClick={() => setReminderModal({ open: false, document: null, editing: null })}>Cancel</Btn><Btn onClick={handleSaveReminder}>Save</Btn></>}
      >
        <div className="space-y-4">
          <Field label="Remind At" name="remindAt" type="datetime-local" value={reminderForm.remindAt} onChange={(e) => setReminderForm({ ...reminderForm, remindAt: e.target.value })} required error={formErrors.remindAt} />
          <Field label="Channel" name="channel" options={[
            { value: 'in-app', label: 'In-App' },
            { value: 'email', label: 'Email' },
            { value: 'push', label: 'Push' },
            { value: 'sms', label: 'SMS' },
          ]} value={reminderForm.channel} onChange={(e) => setReminderForm({ ...reminderForm, channel: e.target.value })} />
          <Field label="Note" name="note" textarea rows={3} value={reminderForm.note} onChange={(e) => setReminderForm({ ...reminderForm, note: e.target.value })} />
        </div>
      </Modal>

      {/* VERSIONS MODAL */}
      <Modal
        open={versionsModal.open}
        onClose={() => setVersionsModal({ open: false, document: null })}
        title="Version History"
        size="lg"
        footer={<Btn onClick={() => setVersionsModal({ open: false, document: null })}>Close</Btn>}
      >
        {versionsModal.document && (
          <div className="space-y-3">
            <div className="rounded-xl bg-cyan-50 p-3">
              <p className="text-xs text-cyan-800">Current version</p>
              <a href={versionsModal.document.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-cyan-700 hover:underline">
                {versionsModal.document.name}
              </a>
              <p className="text-xs text-slate-500">{formatRelativeTime(versionsModal.document.createdAt)} · {formatBytes(versionsModal.document.size)}</p>
            </div>
            {versions.filter((v) => v.documentId === versionsModal.document.id).length === 0 ? (
              <p className="text-sm text-slate-500">No previous versions.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {versions.filter((v) => v.documentId === versionsModal.document.id).map((v) => (
                  <li key={v.id} className="py-3">
                    <a href={v.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-cyan-700 hover:underline">
                      Version · {formatBytes(v.size)}
                    </a>
                    <p className="text-xs text-slate-500">{formatRelativeTime(v.createdAt)} · {v.note || 'Version'}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>

      {/* PREVIEW MODAL */}
      <Modal
        open={previewModal.open}
        onClose={() => setPreviewModal({ open: false, document: null })}
        title={previewModal.document?.name || 'Preview'}
        size="xl"
        footer={<>
          {previewModal.document?.fileUrl && (
            <a href={previewModal.document.fileUrl} download className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Download
            </a>
          )}
          <Btn onClick={() => setPreviewModal({ open: false, document: null })}>Close</Btn>
        </>}
      >
        {previewModal.document && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={previewModal.document.category} />
              <ExpiryBadge expiryDate={previewModal.document.expiryDate} />
              {previewModal.document.starred && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">⭐ STARRED</span>}
            </div>
            {previewModal.document.fileType?.includes('image') ? (
              <img src={previewModal.document.fileUrl} alt={previewModal.document.name} className="max-h-[60vh] w-full rounded-xl object-contain" />
            ) : previewModal.document.fileType?.includes('pdf') ? (
              <iframe title={previewModal.document.name} src={previewModal.document.fileUrl} className="h-[60vh] w-full rounded-xl" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 py-14">
                <FileIcon fileType={previewModal.document.fileType} />
                <p className="text-sm text-slate-600">Preview not available</p>
                <a href={previewModal.document.fileUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">
                  Open in new tab
                </a>
              </div>
            )}
            {previewModal.document.description && (
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-700">Description</p>
                <p className="text-sm text-slate-600">{previewModal.document.description}</p>
              </div>
            )}
            {previewModal.document.notes && (
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-700">Notes</p>
                <p className="text-sm text-slate-600">{previewModal.document.notes}</p>
              </div>
            )}
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
          if (confirmDelete.type === 'doc') handleDeleteDoc();
          if (confirmDelete.type === 'folder') handleDeleteFolder();
          if (confirmDelete.type === 'reminder') handleDeleteReminder();
        }}>Delete</Btn></>}
      >
        <p className="text-sm text-slate-600">Are you sure? This action cannot be undone.</p>
      </Modal>
    </PageShell>
  );
};

export default memo(ParentDocuments);
