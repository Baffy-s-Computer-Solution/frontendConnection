// frontend/src/pages/parent/CommunicationHub.jsx
import { supabaseMediaService } from '../../services/supabaseMediaService';
// ============================================================================
// COMMUNICATION HUB - Production Ready
// Real-time chat threads | Firebase | Supabase | supabase | Tailwind CSS
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
  increment,
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
import {
  validateRequired,
  validateMaxLength,
  validateEmail,
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

const Field = ({ label, name, value, onChange, type = 'text', placeholder, required, error, textarea, options, rows = 3, ...rest }) => (
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
      <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder}
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
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl', full: 'max-w-7xl' };
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

const EmptyState = ({ title, description, action, icon = '💬' }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3 text-2xl">{icon}</div>
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

const CommunicationHub = () => {
  const { user, profile } = useAuth();
  const { refresh: refreshParent } = useParent();
  const { push: pushNotification } = useNotifications();
  const { upload: uploadToSupabase, uploading, progress } = useSupabaseUpload(`parents/${user?.uid ?? 'anon'}/messages`);
  const parentId = user?.uid ?? profile?.uid;

  // ---------- Realtime collections ----------
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const setSearchDebounced = useMemo(() => debounce((v) => setDebouncedSearch(v), 300), []);
  useEffect(() => { setSearchDebounced(searchQuery); }, [searchQuery, setSearchDebounced]);

  const { items: threads, loading: threadsLoading, error: threadsError } = useRealtimeCollection(
    'communication_threads',
    parentId ? [where('participants', 'array-contains', parentId), orderBy('lastMessageAt', 'desc')] : [],
    [parentId]
  );

  const { items: contacts } = useRealtimeCollection(
    'parent_contacts',
    parentId ? [where('parentId', '==', parentId), orderBy('name', 'asc')] : [],
    [parentId]
  );

  const { items: announcements } = useRealtimeCollection(
    'announcements',
    parentId ? [where('audience', 'in', ['parent', 'all']), orderBy('createdAt', 'desc'), limit(50)] : [limit(50)],
    [parentId]
  );

  const { items: notifications } = useRealtimeCollection(
    'notifications',
    parentId ? [where('recipientId', '==', parentId), orderBy('createdAt', 'desc'), limit(50)] : [limit(50)],
    [parentId]
  );

  const { items: groups } = useRealtimeCollection(
    'parent_groups',
    parentId ? [where('members', 'array-contains', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: events } = useRealtimeCollection(
    'parent_events',
    parentId ? [where('parentId', '==', parentId), orderBy('scheduledAt', 'asc')] : [],
    [parentId]
  );

  // ---------- Derived ----------
  const filteredThreads = useMemo(() => {
    if (!debouncedSearch) return threads;
    const q = debouncedSearch.toLowerCase();
    return threads.filter((t) =>
      t.subject?.toLowerCase().includes(q) ||
      t.lastMessage?.toLowerCase().includes(q) ||
      t.participantNames?.some?.((n) => n?.toLowerCase().includes(q))
    );
  }, [threads, debouncedSearch]);

  const filteredContacts = useMemo(() => {
    if (!debouncedSearch) return contacts;
    const q = debouncedSearch.toLowerCase();
    return contacts.filter((c) =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.role?.toLowerCase().includes(q)
    );
  }, [contacts, debouncedSearch]);

  const overviewStats = useMemo(() => ({
    threads: threads.length,
    unread: notifications.filter((n) => !n.read).length,
    contacts: contacts.length,
    groups: groups.length,
    upcomingEvents: events.filter((e) => e.scheduledAt?.toDate?.() > new Date()).length,
  }), [threads, notifications, contacts, groups, events]);

  // ---------- Local UI ----------
  const [activeThread, setActiveThread] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [contactModal, setContactModal] = useState({ open: false, editing: null });
  const [threadModal, setThreadModal] = useState({ open: false, editing: null });
  const [groupModal, setGroupModal] = useState({ open: false, editing: null });
  const [eventModal, setEventModal] = useState({ open: false, editing: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null, type: '' });
  const [toast, setToast] = useState(null);
  const [uploadedAttachment, setUploadedAttachment] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const messagesEndRef = useRef(null);
  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ---------- Realtime messages for active thread ----------
  const { items: activeMessages } = useRealtimeCollection(
    'communication_messages',
    activeThread ? [where('threadId', '==', activeThread.id), orderBy('createdAt', 'asc'), limit(200)] : [],
    [activeThread?.id]
  );

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages.length]);

  // Mark thread as read when opened
  useEffect(() => {
    if (!activeThread) return;
    (async () => {
      try {
        await updateDoc(doc(db, 'communication_threads', activeThread.id), {
          readBy: arrayUnion(parentId),
          unreadCount: 0,
        });
      } catch (e) { /* silent */ }
    })();
  }, [activeThread, parentId]);

  // ---------- Forms ----------
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', role: 'teacher', notes: '', avatarUrl: '' });
  const [threadForm, setThreadForm] = useState({ subject: '', participantIds: [], priority: 'normal', category: 'general' });
  const [groupForm, setGroupForm] = useState({ name: '', description: '', memberIds: [], avatarUrl: '' });
  const [eventForm, setEventForm] = useState({ title: '', description: '', scheduledAt: '', location: '', type: 'meeting' });
  const [formErrors, setFormErrors] = useState({});

  // ---------- Validation ----------
  const validateContact = () => {
    const errors = {};
    if (!validateRequired(contactForm.name)) errors.name = 'Name required';
    if (!validateRequired(contactForm.email)) errors.email = 'Email required';
    if (contactForm.email && !validateEmail(contactForm.email)) errors.email = 'Invalid email';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateThread = () => {
    const errors = {};
    if (!validateRequired(threadForm.subject)) errors.subject = 'Subject required';
    if (!threadForm.participantIds.length) errors.participantIds = 'Select at least one participant';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateGroup = () => {
    const errors = {};
    if (!validateRequired(groupForm.name)) errors.name = 'Group name required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };
  const validateEvent = () => {
    const errors = {};
    if (!validateRequired(eventForm.title)) errors.title = 'Title required';
    if (!validateRequired(eventForm.scheduledAt)) errors.scheduledAt = 'Date required';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };

  // ---------- CRUD: Contacts ----------
  const handleSaveContact = async () => {
    if (!validateContact()) return;
    try {
      const payload = { ...contactForm, parentId };
      if (contactModal.editing) {
        await updateDocument('parent_contacts', contactModal.editing.id, payload, parentId);
        await syncToSupabase('parent_contacts', payload, contactModal.editing.id);
        showToast('Contact updated');
      } else {
        const created = await createDocument('parent_contacts', payload, parentId);
        await syncToSupabase('parent_contacts', payload, created.id);
        showToast('Contact added');
      }
      setContactModal({ open: false, editing: null });
      setContactForm({ name: '', email: '', phone: '', role: 'teacher', notes: '', avatarUrl: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteContact = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_contacts', confirmDelete.target.id);
      await supabase.from('parent_contacts').delete().eq('id', confirmDelete.target.id);
      showToast('Contact deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Threads ----------
  const handleSaveThread = async () => {
    if (!validateThread()) return;
    try {
      const participants = [parentId, ...threadForm.participantIds];
      const payload = {
        ...threadForm,
        participants,
        parentId,
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        unreadCount: 0,
        readBy: [parentId],
        participantNames: [
          profile?.displayName || profile?.name || 'You',
          ...contacts.filter((c) => threadForm.participantIds.includes(c.id)).map((c) => c.name),
        ],
      };
      if (threadModal.editing) {
        await updateDocument('communication_threads', threadModal.editing.id, payload, parentId);
        await syncToSupabase('communication_threads', payload, threadModal.editing.id);
        showToast('Thread updated');
      } else {
        const created = await createDocument('communication_threads', payload, parentId);
        await syncToSupabase('communication_threads', payload, created.id);
        showToast('Thread created');
        setActiveThread({ id: created.id, ...payload });
      }
      setThreadModal({ open: false, editing: null });
      setThreadForm({ subject: '', participantIds: [], priority: 'normal', category: 'general' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteThread = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('communication_threads', confirmDelete.target.id);
      await supabase.from('communication_threads').delete().eq('id', confirmDelete.target.id);
      showToast('Thread deleted');
      if (activeThread?.id === confirmDelete.target.id) setActiveThread(null);
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Send Message ----------
  const handleSendMessage = async () => {
    if (!messageText.trim() && !uploadedAttachment) return;
    if (!activeThread) return;
    try {
      const payload = {
        threadId: activeThread.id,
        senderId: parentId,
        senderName: profile?.displayName || profile?.name || 'You',
        text: messageText.trim(),
        attachment: uploadedAttachment || null,
        replyTo: replyTo || null,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'communication_messages'), payload);
      await updateDoc(doc(db, 'communication_threads', activeThread.id), {
        lastMessage: messageText.trim() || '[attachment]',
        lastMessageAt: serverTimestamp(),
        lastSenderId: parentId,
        unreadCount: increment(1),
      });
      try {
        await supabase.from('communication_messages').insert({ ...payload, created_at: new Date().toISOString() });
      } catch (e) { /* silent */ }
      setMessageText('');
      setUploadedAttachment(null);
      setReplyTo(null);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'communication_messages', messageId));
      try { await supabase.from('communication_messages').delete().eq('id', messageId); } catch (e) {}
      showToast('Message deleted');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Groups ----------
  const handleSaveGroup = async () => {
    if (!validateGroup()) return;
    try {
      const members = [parentId, ...groupForm.memberIds];
      const payload = { ...groupForm, members, parentId };
      if (groupModal.editing) {
        await updateDocument('parent_groups', groupModal.editing.id, payload, parentId);
        await syncToSupabase('parent_groups', payload, groupModal.editing.id);
        showToast('Group updated');
      } else {
        const created = await createDocument('parent_groups', payload, parentId);
        await syncToSupabase('parent_groups', payload, created.id);
        showToast('Group created');
      }
      setGroupModal({ open: false, editing: null });
      setGroupForm({ name: '', description: '', memberIds: [], avatarUrl: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteGroup = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_groups', confirmDelete.target.id);
      await supabase.from('parent_groups').delete().eq('id', confirmDelete.target.id);
      showToast('Group deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- CRUD: Events ----------
  const handleSaveEvent = async () => {
    if (!validateEvent()) return;
    try {
      const payload = {
        ...eventForm,
        parentId,
        scheduledAt: eventForm.scheduledAt ? Timestamp.fromDate(new Date(eventForm.scheduledAt)) : null,
      };
      if (eventModal.editing) {
        await updateDocument('parent_events', eventModal.editing.id, payload, parentId);
        await syncToSupabase('parent_events', payload, eventModal.editing.id);
        showToast('Event updated');
      } else {
        const created = await createDocument('parent_events', payload, parentId);
        await syncToSupabase('parent_events', payload, created.id);
        showToast('Event created');
      }
      setEventModal({ open: false, editing: null });
      setEventForm({ title: '', description: '', scheduledAt: '', location: '', type: 'meeting' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteEvent = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_events', confirmDelete.target.id);
      await supabase.from('parent_events').delete().eq('id', confirmDelete.target.id);
      showToast('Event deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Notifications ----------
  const markNotificationRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true, readAt: serverTimestamp() });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const markAllRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.filter((n) => !n.read).forEach((n) => batch.update(doc(db, 'notifications', n.id), { read: true }));
      await batch.commit();
      showToast('All marked as read');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Uploads ----------
  const handleAttachmentUpload = async (file) => {
    try {
      const result = await uploadToSupabase(file);
      setUploadedAttachment({
        url: result?.secure_url,
        name: file.name,
        type: file.type,
        size: file.size,
      });
      showToast('Attachment ready');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleContactAvatarUpload = async (file) => {
    try {
      const result = await uploadToSupabase(file);
      setContactForm((f) => ({ ...f, avatarUrl: result?.secure_url || '' }));
      showToast('Avatar uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleGroupAvatarUpload = async (file) => {
    try {
      const result = await uploadToSupabase(file);
      setGroupForm((f) => ({ ...f, avatarUrl: result?.secure_url || '' }));
      showToast('Group avatar uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Render helpers ----------
  const renderMessage = (msg) => {
    const isMine = msg.senderId === parentId;
    return (
      <div key={msg.id} className={`group flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
        <div className={`h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-slate-200 ${isMine ? 'ring-2 ring-blue-500' : ''}`}>
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-600">
            {msg.senderName?.[0] ?? '?'}
          </div>
        </div>
        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${isMine ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 ring-1 ring-slate-200'}`}>
          {!isMine && <p className="mb-1 text-xs font-semibold opacity-80">{msg.senderName}</p>}
          {msg.replyTo && (
            <div className={`mb-2 rounded-lg border-l-2 px-2 py-1 text-xs ${isMine ? 'border-white/50 bg-white/10' : 'border-blue-400 bg-blue-50'}`}>
              <p className="font-semibold opacity-80">{msg.replyTo.senderName}</p>
              <p className="truncate opacity-70">{msg.replyTo.text}</p>
            </div>
          )}
          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
          {msg.attachment && (
            <a href={msg.attachment.url} target="_blank" rel="noreferrer"
              className={`mt-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${isMine ? 'bg-white/20' : 'bg-slate-100'}`}>
              <span>📎</span>
              <span className="truncate">{msg.attachment.name}</span>
            </a>
          )}
          <div className={`mt-1 flex items-center gap-2 text-[10px] ${isMine ? 'text-blue-100' : 'text-slate-400'}`}>
            <span>{formatRelativeTime(msg.createdAt)}</span>
            {isMine && <span>✓✓</span>}
          </div>
        </div>
        <div className="opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => setReplyTo({ senderName: msg.senderName, text: msg.text })}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Reply"
          >↩</button>
          {isMine && (
            <button
              onClick={() => handleDeleteMessage(msg.id)}
              className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              title="Delete"
            >🗑</button>
          )}
        </div>
      </div>
    );
  };

  // ---------- Render ----------
  const tabs = [
    { id: 'inbox', label: 'Inbox', count: threads.length },
    { id: 'contacts', label: 'Contacts', count: contacts.length },
    { id: 'announcements', label: 'Announcements', count: announcements.length },
    { id: 'groups', label: 'Groups', count: groups.length },
    { id: 'events', label: 'Events', count: events.length },
    { id: 'notifications', label: 'Notifications', count: overviewStats.unread },
  ];

  return (
    <PageShell
      title="Communication Hub"
      subtitle="Messages, announcements, contacts, and events — all in real time."
      loading={threadsLoading}
      error={threadsError}
      actions={
        <>
          <Btn variant="outline" onClick={refreshParent}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </Btn>
          <Btn onClick={() => setThreadModal({ open: true, editing: null })}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
            New Message
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
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard label="Threads" value={overviewStats.threads} tone="blue" icon="💬" />
        <StatsCard label="Unread" value={overviewStats.unread} tone="rose" icon="🔔" />
        <StatsCard label="Contacts" value={overviewStats.contacts} tone="emerald" icon="👥" />
        <StatsCard label="Groups" value={overviewStats.groups} tone="violet" icon="👨‍👩‍👧" />
        <StatsCard label="Upcoming Events" value={overviewStats.upcomingEvents} tone="amber" icon="📅" />
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

      {/* INBOX */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card title="Threads" pad={false}>
              {filteredThreads.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="No threads" description="Start a conversation." action={<Btn size="sm" onClick={() => setThreadModal({ open: true, editing: null })}>New Message</Btn>} />
                </div>
              ) : (
                <ul className="max-h-[600px] divide-y divide-slate-100 overflow-y-auto">
                  {filteredThreads.map((t) => (
                    <li key={t.id}
                      onClick={() => setActiveThread(t)}
                      className={`cursor-pointer px-4 py-3 transition hover:bg-slate-50 ${activeThread?.id === t.id ? 'bg-blue-50/60 ring-1 ring-inset ring-blue-200' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-center text-xs font-bold leading-9 text-white">
                          {(t.subject?.[0] || '?').toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-slate-800">{t.subject || 'Untitled'}</p>
                            {t.unreadCount > 0 && (
                              <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{t.unreadCount}</span>
                            )}
                          </div>
                          <p className="truncate text-xs text-slate-500">{t.lastMessage || 'No messages yet'}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400">{formatRelativeTime(t.lastMessageAt)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="lg:col-span-2">
            {activeThread ? (
              <Card
                title={activeThread.subject || 'Conversation'}
                subtitle={`${activeThread.participantNames?.length || 0} participants`}
                pad={false}
                action={
                  <div className="flex gap-2">
                    <Btn size="sm" variant="outline" onClick={() => {
                      setThreadForm({
                        subject: activeThread.subject || '',
                        participantIds: activeThread.participantIds || [],
                        priority: activeThread.priority || 'normal',
                        category: activeThread.category || 'general',
                      });
                      setThreadModal({ open: true, editing: activeThread });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: activeThread, type: 'thread' })}>Delete</Btn>
                  </div>
                }
              >
                <div className="flex h-[500px] flex-col">
                  <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4">
                    {activeMessages.length === 0 ? (
                      <p className="text-center text-sm text-slate-400">No messages yet. Say hello 👋</p>
                    ) : (
                      activeMessages.map(renderMessage)
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {replyTo && (
                    <div className="flex items-center justify-between border-t border-slate-100 bg-blue-50 px-4 py-2 text-xs">
                      <div className="min-w-0 flex-1 truncate">
                        <span className="font-semibold text-blue-700">Replying to {replyTo.senderName}: </span>
                        <span className="text-slate-600">{replyTo.text}</span>
                      </div>
                      <button onClick={() => setReplyTo(null)} className="ml-2 text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                  )}

                  {uploadedAttachment && (
                    <div className="flex items-center justify-between border-t border-slate-100 bg-emerald-50 px-4 py-2 text-xs">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span>📎</span>
                        <span className="truncate font-medium text-emerald-800">{uploadedAttachment.name}</span>
                      </div>
                      <button onClick={() => setUploadedAttachment(null)} className="ml-2 text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                  )}

                  <div className="border-t border-slate-100 p-3">
                    <div className="flex items-end gap-2">
                      <label className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                        <input
                          type="file"
                          hidden
                          onChange={(e) => e.target.files?.[0] && handleAttachmentUpload(e.target.files[0])}
                        />
                        📎
                      </label>
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message…"
                        rows={1}
                        className="max-h-32 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <Btn onClick={handleSendMessage} disabled={!messageText.trim() && !uploadedAttachment}>
                        Send
                      </Btn>
                    </div>
                    {uploading && (
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <EmptyState title="Select a thread" description="Choose a conversation from the list to view messages." icon="📬" />
              </Card>
            )}
          </div>
        </div>
      )}

      {/* CONTACTS */}
      {activeTab === 'contacts' && (
        <Card
          title="Contacts"
          action={<Btn size="sm" onClick={() => setContactModal({ open: true, editing: null })}>Add Contact</Btn>}
        >
          {filteredContacts.length === 0 ? (
            <EmptyState title="No contacts" description="Add teachers, counselors, or other parents." action={<Btn onClick={() => setContactModal({ open: true, editing: null })}>Add Contact</Btn>} icon="👥" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredContacts.map((c) => (
                <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-base font-semibold text-slate-500">
                          {c.name?.[0] ?? '?'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{c.name}</p>
                      <p className="truncate text-xs capitalize text-slate-500">{c.role}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    {c.email && <p className="truncate">📧 {c.email}</p>}
                    {c.phone && <p className="truncate">📞 {c.phone}</p>}
                  </div>
                  {c.notes && <p className="mt-3 line-clamp-2 text-xs text-slate-400">{c.notes}</p>}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Btn size="sm" variant="outline" onClick={() => {
                      setContactForm({ name: c.name || '', email: c.email || '', phone: c.phone || '', role: c.role || 'teacher', notes: c.notes || '', avatarUrl: c.avatarUrl || '' });
                      setContactModal({ open: true, editing: c });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: c, type: 'contact' })}>Delete</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <Card title="Announcements" subtitle="School and community updates">
          {announcements.length === 0 ? (
            <EmptyState title="No announcements" description="Announcements will appear here." icon="📢" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {announcements.map((a) => (
                <li key={a.id} className="flex items-start gap-4 py-4">
                  <span className="rounded-xl bg-blue-50 p-3 text-blue-600">📢</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">{a.title || 'Announcement'}</p>
                      {a.priority === 'high' && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">HIGH</span>}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{truncate(a.body || a.description || '', 160)}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(a.createdAt)} · {a.author || 'Admin'}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* GROUPS */}
      {activeTab === 'groups' && (
        <Card title="Parent Groups" action={<Btn size="sm" onClick={() => setGroupModal({ open: true, editing: null })}>Create Group</Btn>}>
          {groups.length === 0 ? (
            <EmptyState title="No groups" description="Create a group to chat with other parents." action={<Btn onClick={() => setGroupModal({ open: true, editing: null })}>Create Group</Btn>} icon="👨‍👩‍👧" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((g) => (
                <div key={g.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                      {g.avatarUrl ? (
                        <img src={g.avatarUrl} alt={g.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-base font-semibold text-slate-500">
                          {g.name?.[0] ?? 'G'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{g.name}</p>
                      <p className="text-xs text-slate-500">{g.members?.length || 0} members</p>
                    </div>
                  </div>
                  {g.description && <p className="mt-3 line-clamp-2 text-xs text-slate-500">{g.description}</p>}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Btn size="sm" variant="outline" onClick={() => {
                      setGroupForm({ name: g.name || '', description: g.description || '', memberIds: g.memberIds || [], avatarUrl: g.avatarUrl || '' });
                      setGroupModal({ open: true, editing: g });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: g, type: 'group' })}>Delete</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* EVENTS */}
      {activeTab === 'events' && (
        <Card title="Events" action={<Btn size="sm" onClick={() => setEventModal({ open: true, editing: null })}>Add Event</Btn>}>
          {events.length === 0 ? (
            <EmptyState title="No events" description="Schedule meetings or school events." action={<Btn onClick={() => setEventModal({ open: true, editing: null })}>Add Event</Btn>} icon="📅" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {events.map((e) => (
                <li key={e.id} className="flex items-start gap-4 py-4">
                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600">📅</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{e.title}</p>
                    <p className="text-xs text-slate-500">
                      {e.scheduledAt?.toDate?.()?.toLocaleString?.() ?? 'TBD'}
                      {e.location ? ` · ${e.location}` : ''}
                    </p>
                    {e.description && <p className="truncate text-xs text-slate-400">{e.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn size="sm" variant="outline" onClick={() => {
                      setEventForm({
                        title: e.title || '',
                        description: e.description || '',
                        scheduledAt: e.scheduledAt?.toDate?.()?.toISOString?.()?.slice(0, 16) || '',
                        location: e.location || '',
                        type: e.type || 'meeting',
                      });
                      setEventModal({ open: true, editing: e });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: e, type: 'event' })}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <Card
          title="Notifications"
          action={overviewStats.unread > 0 ? <Btn size="sm" variant="ghost" onClick={markAllRead}>Mark all read</Btn> : null}
        >
          {notifications.length === 0 ? (
            <EmptyState title="No notifications" description="You're all caught up." icon="🔔" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`flex cursor-pointer items-start gap-3 py-3 transition hover:bg-slate-50 ${n.read ? 'opacity-60' : ''}`}
                >
                  <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${n.read ? 'bg-slate-300' : 'bg-blue-500'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{n.title || 'Notification'}</p>
                    <p className="truncate text-xs text-slate-500">{n.body || ''}</p>
                  </div>
                  <span className="text-xs text-slate-400">{formatRelativeTime(n.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* CONTACT MODAL */}
      <Modal
        open={contactModal.open}
        onClose={() => setContactModal({ open: false, editing: null })}
        title={contactModal.editing ? 'Edit Contact' : 'Add Contact'}
        footer={<><Btn variant="ghost" onClick={() => setContactModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveContact}>Save</Btn></>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required error={formErrors.name} />
          <Field label="Email" name="email" type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required error={formErrors.email} />
          <Field label="Phone" name="phone" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
          <Field label="Role" name="role" options={[
            { value: 'teacher', label: 'Teacher' },
            { value: 'counselor', label: 'Counselor' },
            { value: 'admin', label: 'Admin' },
            { value: 'parent', label: 'Parent' },
            { value: 'other', label: 'Other' },
          ]} value={contactForm.role} onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Avatar</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleContactAvatarUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
            {contactForm.avatarUrl && <img src={contactForm.avatarUrl} alt="avatar" className="mt-2 h-16 w-16 rounded-full object-cover" />}
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes" name="notes" textarea value={contactForm.notes} onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* THREAD MODAL */}
      <Modal
        open={threadModal.open}
        onClose={() => setThreadModal({ open: false, editing: null })}
        title={threadModal.editing ? 'Edit Thread' : 'New Message'}
        footer={<><Btn variant="ghost" onClick={() => setThreadModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveThread}>Save</Btn></>}
      >
        <div className="grid grid-cols-1 gap-4">
          <Field label="Subject" name="subject" value={threadForm.subject} onChange={(e) => setThreadForm({ ...threadForm, subject: e.target.value })} required error={formErrors.subject} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Participants <span className="text-red-500">*</span></label>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-300 bg-white p-2">
              {contacts.length === 0 ? (
                <p className="p-2 text-xs text-slate-500">No contacts yet. Add contacts first.</p>
              ) : contacts.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={threadForm.participantIds.includes(c.id)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...threadForm.participantIds, c.id]
                        : threadForm.participantIds.filter((id) => id !== c.id);
                      setThreadForm({ ...threadForm, participantIds: next });
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{c.name} <span className="text-xs text-slate-400">· {c.role}</span></span>
                </label>
              ))}
            </div>
            {formErrors.participantIds && <p className="mt-1 text-xs font-medium text-red-600">{formErrors.participantIds}</p>}
          </div>
          <Field label="Priority" name="priority" options={[
            { value: 'low', label: 'Low' },
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ]} value={threadForm.priority} onChange={(e) => setThreadForm({ ...threadForm, priority: e.target.value })} />
          <Field label="Category" name="category" options={[
            { value: 'general', label: 'General' },
            { value: 'academic', label: 'Academic' },
            { value: 'behavior', label: 'Behavior' },
            { value: 'health', label: 'Health' },
            { value: 'finance', label: 'Finance' },
          ]} value={threadForm.category} onChange={(e) => setThreadForm({ ...threadForm, category: e.target.value })} />
        </div>
      </Modal>

      {/* GROUP MODAL */}
      <Modal
        open={groupModal.open}
        onClose={() => setGroupModal({ open: false, editing: null })}
        title={groupModal.editing ? 'Edit Group' : 'Create Group'}
        footer={<><Btn variant="ghost" onClick={() => setGroupModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveGroup}>Save</Btn></>}
      >
        <div className="grid grid-cols-1 gap-4">
          <Field label="Group Name" name="name" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} required error={formErrors.name} />
          <Field label="Description" name="description" textarea value={groupForm.description} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Members</label>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-300 bg-white p-2">
              {contacts.length === 0 ? (
                <p className="p-2 text-xs text-slate-500">No contacts yet.</p>
              ) : contacts.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={groupForm.memberIds.includes(c.id)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...groupForm.memberIds, c.id]
                        : groupForm.memberIds.filter((id) => id !== c.id);
                      setGroupForm({ ...groupForm, memberIds: next });
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{c.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Group Avatar</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleGroupAvatarUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
            {groupForm.avatarUrl && <img src={groupForm.avatarUrl} alt="avatar" className="mt-2 h-16 w-16 rounded-full object-cover" />}
          </div>
        </div>
      </Modal>

      {/* EVENT MODAL */}
      <Modal
        open={eventModal.open}
        onClose={() => setEventModal({ open: false, editing: null })}
        title={eventModal.editing ? 'Edit Event' : 'Add Event'}
        footer={<><Btn variant="ghost" onClick={() => setEventModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveEvent}>Save</Btn></>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" name="title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required error={formErrors.title} />
          <Field label="Type" name="type" options={[
            { value: 'meeting', label: 'Meeting' },
            { value: 'workshop', label: 'Workshop' },
            { value: 'conference', label: 'Conference' },
            { value: 'social', label: 'Social' },
          ]} value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })} />
          <Field label="Scheduled At" name="scheduledAt" type="datetime-local" value={eventForm.scheduledAt} onChange={(e) => setEventForm({ ...eventForm, scheduledAt: e.target.value })} required error={formErrors.scheduledAt} />
          <Field label="Location" name="location" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
          <div className="sm:col-span-2">
            <Field label="Description" name="description" textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE */}
      <Modal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, target: null, type: '' })}
        title="Confirm Delete"
        size="sm"
        footer={<><Btn variant="ghost" onClick={() => setConfirmDelete({ open: false, target: null, type: '' })}>Cancel</Btn><Btn variant="danger" onClick={() => {
          if (confirmDelete.type === 'contact') handleDeleteContact();
          if (confirmDelete.type === 'thread') handleDeleteThread();
          if (confirmDelete.type === 'group') handleDeleteGroup();
          if (confirmDelete.type === 'event') handleDeleteEvent();
        }}>Delete</Btn></>}
      >
        <p className="text-sm text-slate-600">Are you sure? This action cannot be undone.</p>
      </Modal>
    </PageShell>
  );
};

export default memo(CommunicationHub);
