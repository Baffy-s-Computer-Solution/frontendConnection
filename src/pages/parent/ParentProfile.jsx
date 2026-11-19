// frontend/src/pages/parent/ParentProfile.jsx
// ============================================================================
// PARENT PROFILE - Production Ready
// Personal info | Avatar | Linked children | Emergency contacts | Accounts
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
  serverTimestamp,
  getDoc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  updateProfile as updateFirebaseAuthProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { db, auth } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useParent } from '../../hooks/useParent';
import { useNotifications } from '../../hooks/useNotifications';
import {
  formatRelativeTime,
  formatDate,
} from '../../utils/formatters';
import {
  validateRequired,
  validateEmail,
  validatePhone,
  validateMaxLength,
} from '../../utils/validators';

// ============================================================================
// TAILWIND UI PRIMITIVES
// ============================================================================

const PageShell = ({ title, subtitle, actions, children, loading, error }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/30">
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/parent" className="hover:text-sky-600">Parent</Link>
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
    primary: 'bg-sky-600 text-white shadow-sm hover:bg-sky-700 focus:ring-sky-500',
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

const Field = ({ label, name, value, onChange, type = 'text', placeholder, required, error, textarea, options, rows = 3, min, max, step, disabled, ...rest }) => (
  <div className="w-full">
    {label && <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label>}
    {textarea ? (
      <textarea id={name} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={rows} disabled={disabled}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    ) : options ? (
      <select id={name} name={name} value={value ?? ''} onChange={onChange} disabled={disabled}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} disabled={disabled} min={min} max={max} step={step}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
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

const Avatar = ({ src, name, size = 'xl' }) => {
  const sizes = { sm: 'h-10 w-10 text-sm', md: 'h-16 w-16 text-lg', lg: 'h-24 w-24 text-2xl', xl: 'h-32 w-32 text-4xl' };
  return (
    <div className={`${sizes[size]} overflow-hidden rounded-full bg-gradient-to-br from-sky-500 to-blue-500 ring-4 ring-white shadow-lg`}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-bold text-white">
          {(name?.[0] || '?').toUpperCase()}
        </div>
      )}
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

function useRealtimeDoc(collectionName, docId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) { setLoading(false); return; }
    setLoading(true);
    const unsub = onSnapshot(doc(db, collectionName, docId),
      (snap) => { setData(snap.exists() ? { id: snap.id, ...snap.data() } : null); setLoading(false); },
      (err) => { setError(err.message); setLoading(false); }
    );
    return () => unsub();
  }, [collectionName, docId]);

  return { data, loading, error };
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

async function updateDocument(collectionName, id, data, authorId) {
  await updateDoc(doc(db, collectionName, id), { ...data, updatedAt: serverTimestamp(), updatedBy: authorId ?? null });
}

async function createDocument(collectionName, data, authorId) {
  const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), createdBy: authorId ?? null, updatedBy: authorId ?? null };
  const ref = await addDoc(collection(db, collectionName), payload);
  return { id: ref.id, ...payload };
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

const ParentProfile = () => {
  const { user, profile, refresh: refreshAuth } = useAuth();
  const { refresh: refreshParent } = useParent();
  const { push: pushNotification } = useNotifications();
  const { upload: uploadToCloudinary, uploading, progress } = useCloudinaryUpload(`parents/${user?.uid ?? 'anon'}/profile`);
  const parentId = user?.uid ?? profile?.uid;

  // ---------- Realtime ----------
  const [activeTab, setActiveTab] = useState('personal');
  const { data: parentDoc, loading: parentLoading, error: parentError } = useRealtimeDoc('parents', parentId);

  const { items: children } = useRealtimeCollection(
    'parent_children',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: emergencyContacts } = useRealtimeCollection(
    'parent_emergency_contacts',
    parentId ? [where('parentId', '==', parentId), orderBy('isPrimary', 'desc')] : [],
    [parentId]
  );

  const { items: connectedAccounts } = useRealtimeCollection(
    'parent_connected_accounts',
    parentId ? [where('parentId', '==', parentId)] : [],
    [parentId]
  );

  const { items: activityLog } = useRealtimeCollection(
    'parent_profile_activity',
    parentId ? [where('parentId', '==', parentId), orderBy('createdAt', 'desc')] : [],
    [parentId]
  );

  const { items: addresses } = useRealtimeCollection(
    'parent_addresses',
    parentId ? [where('parentId', '==', parentId), orderBy('isPrimary', 'desc')] : [],
    [parentId]
  );

  const { items: identifications } = useRealtimeCollection(
    'parent_identifications',
    parentId ? [where('parentId', '==', parentId)] : [],
    [parentId]
  );

  // ---------- Derived ----------
  const merged = useMemo(() => ({
    displayName: parentDoc?.displayName || profile?.displayName || '',
    email: parentDoc?.email || user?.email || '',
    phone: parentDoc?.phone || '',
    phoneAlt: parentDoc?.phoneAlt || '',
    gender: parentDoc?.gender || '',
    dateOfBirth: parentDoc?.dateOfBirth || '',
    occupation: parentDoc?.occupation || '',
    employer: parentDoc?.employer || '',
    bio: parentDoc?.bio || '',
    avatarUrl: parentDoc?.avatarUrl || profile?.photoURL || '',
    coverUrl: parentDoc?.coverUrl || '',
    language: parentDoc?.language || 'en',
    timezone: parentDoc?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    maritalStatus: parentDoc?.maritalStatus || '',
    relationType: parentDoc?.relationType || 'parent',
    linkedChildrenCount: children.length,
    preferredContactMethod: parentDoc?.preferredContactMethod || 'email',
    profileCompleteness: parentDoc?.profileCompleteness || 0,
  }), [parentDoc, profile, user, children]);

  const stats = useMemo(() => {
    const checks = [
      merged.displayName, merged.email, merged.phone, merged.dateOfBirth,
      merged.gender, merged.occupation, merged.avatarUrl, merged.bio,
      children.length > 0, emergencyContacts.length > 0, addresses.length > 0,
    ];
    const filled = checks.filter(Boolean).length;
    return { filled, total: checks.length, pct: Math.round((filled / checks.length) * 100) };
  }, [merged, children, emergencyContacts, addresses]);

  // ---------- Local UI ----------
  const [contactModal, setContactModal] = useState({ open: false, editing: null });
  const [addressModal, setAddressModal] = useState({ open: false, editing: null });
  const [idModal, setIdModal] = useState({ open: false, editing: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, target: null, type: '' });
  const [toast, setToast] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ---------- Personal form (auto-save) ----------
  const [personalForm, setPersonalForm] = useState({
    displayName: '', phone: '', phoneAlt: '', gender: '', dateOfBirth: '',
    occupation: '', employer: '', bio: '', language: 'en', timezone: '',
    maritalStatus: '', relationType: 'parent', preferredContactMethod: 'email',
  });

  useEffect(() => {
    if (parentDoc) {
      setPersonalForm({
        displayName: parentDoc.displayName || profile?.displayName || '',
        phone: parentDoc.phone || '',
        phoneAlt: parentDoc.phoneAlt || '',
        gender: parentDoc.gender || '',
        dateOfBirth: parentDoc.dateOfBirth || '',
        occupation: parentDoc.occupation || '',
        employer: parentDoc.employer || '',
        bio: parentDoc.bio || '',
        language: parentDoc.language || 'en',
        timezone: parentDoc.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        maritalStatus: parentDoc.maritalStatus || '',
        relationType: parentDoc.relationType || 'parent',
        preferredContactMethod: parentDoc.preferredContactMethod || 'email',
      });
    } else if (profile) {
      setPersonalForm((f) => ({
        ...f,
        displayName: profile.displayName || profile.name || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }));
    }
  }, [parentDoc, profile]);

  const [formErrors, setFormErrors] = useState({});

  // ---------- Validation ----------
  const validatePersonal = () => {
    const errors = {};
    if (!validateRequired(personalForm.displayName)) errors.displayName = 'Name is required';
    if (personalForm.phone && !validatePhone(personalForm.phone)) errors.phone = 'Invalid phone';
    if (personalForm.phoneAlt && !validatePhone(personalForm.phoneAlt)) errors.phoneAlt = 'Invalid phone';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };

  const validateContact = () => {
    const errors = {};
    if (!validateRequired(contactForm.name)) errors.name = 'Name required';
    if (!validateRequired(contactForm.phone)) errors.phone = 'Phone required';
    if (contactForm.phone && !validatePhone(contactForm.phone)) errors.phone = 'Invalid phone';
    if (contactForm.email && !validateEmail(contactForm.email)) errors.email = 'Invalid email';
    setFormErrors(errors); return Object.keys(errors).length === 0;
  };

  // ---------- Save handlers ----------
  const handleSavePersonal = async () => {
    if (!validatePersonal()) return;
    try {
      setSaveStatus('saving');
      const payload = { ...personalForm, parentId, email: user?.email || '', profileCompleteness: stats.pct };
      if (parentDoc) {
        await updateDocument('parents', parentId, payload, parentId);
      } else {
        await setDoc(doc(db, 'parents', parentId), { ...payload, createdAt: serverTimestamp() }, { merge: true });
      }
      await syncToSupabase('parents', payload, parentId);
      // Update Firebase Auth profile
      try {
        if (auth.currentUser) {
          await updateFirebaseAuthProfile(auth.currentUser, { displayName: personalForm.displayName });
        }
      } catch (e) { /* silent */ }
      await logActivity('profile_updated', 'Personal details updated');
      setSaveStatus('saved');
      showToast('Profile updated');
      refreshAuth?.();
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('idle');
      showToast(err.message, 'error');
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      const url = result?.secure_url || '';
      await updateDocument('parents', parentId, { avatarUrl: url }, parentId);
      await syncToSupabase('parents', { avatarUrl: url }, parentId);
      try { if (auth.currentUser) await updateFirebaseAuthProfile(auth.currentUser, { photoURL: url }); } catch (e) {}
      await logActivity('avatar_updated', 'Profile photo updated');
      showToast('Avatar updated');
      refreshAuth?.();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleCoverUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      const url = result?.secure_url || '';
      await updateDocument('parents', parentId, { coverUrl: url }, parentId);
      await syncToSupabase('parents', { coverUrl: url }, parentId);
      await logActivity('cover_updated', 'Cover photo updated');
      showToast('Cover updated');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Emergency contacts CRUD ----------
  const [contactForm, setContactForm] = useState({
    name: '', relationship: '', phone: '', email: '', address: '',
    isPrimary: false, notes: '', priority: 1,
  });

  const handleSaveContact = async () => {
    if (!validateContact()) return;
    try {
      const payload = { ...contactForm, parentId };
      if (contactModal.editing) {
        await updateDocument('parent_emergency_contacts', contactModal.editing.id, payload, parentId);
        await syncToSupabase('parent_emergency_contacts', payload, contactModal.editing.id);
        showToast('Contact updated');
      } else {
        const created = await createDocument('parent_emergency_contacts', payload, parentId);
        await syncToSupabase('parent_emergency_contacts', payload, created.id);
        showToast('Contact added');
      }
      await logActivity('emergency_contact_changed', contactModal.editing ? 'Contact updated' : 'Contact added');
      setContactModal({ open: false, editing: null });
      setContactForm({ name: '', relationship: '', phone: '', email: '', address: '', isPrimary: false, notes: '', priority: 1 });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteContact = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_emergency_contacts', confirmDelete.target.id);
      await supabase.from('parent_emergency_contacts').delete().eq('id', confirmDelete.target.id);
      await logActivity('emergency_contact_deleted', 'Contact deleted');
      showToast('Contact deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Addresses CRUD ----------
  const [addressForm, setAddressForm] = useState({
    label: 'Home', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', isPrimary: false,
  });

  const handleSaveAddress = async () => {
    const errors = {};
    if (!addressForm.line1) errors.line1 = 'Address required';
    if (!addressForm.city) errors.city = 'City required';
    if (!addressForm.country) errors.country = 'Country required';
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    try {
      const payload = { ...addressForm, parentId };
      if (addressModal.editing) {
        await updateDocument('parent_addresses', addressModal.editing.id, payload, parentId);
        await syncToSupabase('parent_addresses', payload, addressModal.editing.id);
        showToast('Address updated');
      } else {
        const created = await createDocument('parent_addresses', payload, parentId);
        await syncToSupabase('parent_addresses', payload, created.id);
        showToast('Address added');
      }
      setAddressModal({ open: false, editing: null });
      setAddressForm({ label: 'Home', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', isPrimary: false });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteAddress = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_addresses', confirmDelete.target.id);
      await supabase.from('parent_addresses').delete().eq('id', confirmDelete.target.id);
      showToast('Address deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Identifications CRUD ----------
  const [idForm, setIdForm] = useState({
    type: 'national_id', number: '', issuedDate: '', expiryDate: '', country: '', fileUrl: '',
  });

  const handleSaveId = async () => {
    const errors = {};
    if (!idForm.type) errors.type = 'Type required';
    if (!idForm.number) errors.number = 'Number required';
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    try {
      const payload = { ...idForm, parentId };
      if (idModal.editing) {
        await updateDocument('parent_identifications', idModal.editing.id, payload, parentId);
        await syncToSupabase('parent_identifications', payload, idModal.editing.id);
        showToast('ID updated');
      } else {
        const created = await createDocument('parent_identifications', payload, parentId);
        await syncToSupabase('parent_identifications', payload, created.id);
        showToast('ID added');
      }
      setIdModal({ open: false, editing: null });
      setIdForm({ type: 'national_id', number: '', issuedDate: '', expiryDate: '', country: '', fileUrl: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleIdFileUpload = async (file) => {
    try {
      const result = await uploadToCloudinary(file);
      setIdForm((f) => ({ ...f, fileUrl: result?.secure_url || '' }));
      showToast('ID file uploaded');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteId = async () => {
    if (!confirmDelete.target) return;
    try {
      await deleteDocument('parent_identifications', confirmDelete.target.id);
      await supabase.from('parent_identifications').delete().eq('id', confirmDelete.target.id);
      showToast('ID deleted');
      setConfirmDelete({ open: false, target: null, type: '' });
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Activity log helper ----------
  const logActivity = useCallback(async (action, description) => {
    try {
      await addDoc(collection(db, 'parent_profile_activity'), {
        parentId, action, description, createdAt: serverTimestamp(),
      });
    } catch (e) { /* silent */ }
  }, [parentId]);

  // ---------- Render ----------
  const tabs = [
    { id: 'personal', label: 'Personal' },
    { id: 'children', label: 'Linked Children', count: children.length },
    { id: 'contacts', label: 'Emergency Contacts', count: emergencyContacts.length },
    { id: 'addresses', label: 'Addresses', count: addresses.length },
    { id: 'ids', label: 'Identification', count: identifications.length },
    { id: 'accounts', label: 'Connected', count: connectedAccounts.length },
    { id: 'activity', label: 'Activity', count: activityLog.length },
  ];

  return (
    <PageShell
      title="My Profile"
      subtitle="Manage your personal information, linked children, and account details."
      loading={parentLoading}
      error={parentError}
      actions={
        <>
          <Btn variant="outline" onClick={refreshParent}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </Btn>
          {activeTab === 'personal' && (
            <Btn onClick={handleSavePersonal} loading={saveStatus === 'saving'}>
              {saveStatus === 'saved' ? '✓ Saved' : 'Save Changes'}
            </Btn>
          )}
        </>
      }
    >
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition ${toast.tone === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Hero card with cover + avatar + completeness */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-40 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500">
          {merged.coverUrl && (
            <img src={merged.coverUrl} alt="cover" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <label className="absolute right-3 top-3 cursor-pointer rounded-lg bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/60">
            Change Cover
            <input type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} />
          </label>
        </div>

        <div className="px-5 pb-5">
          <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <div className="relative">
                <Avatar src={merged.avatarUrl} name={merged.displayName} size="xl" />
                <label className="absolute bottom-1 right-1 cursor-pointer rounded-full bg-sky-600 p-2 text-white shadow-lg transition hover:bg-sky-700">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                  <input type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
                </label>
                {uploading && (
                  <div className="absolute inset-x-0 -bottom-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full bg-sky-600 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
              <div className="pb-1">
                <h2 className="text-2xl font-bold text-slate-900">{merged.displayName || 'Unnamed Parent'}</h2>
                <p className="text-sm text-slate-600">{merged.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-sky-700">
                    {merged.relationType}
                  </span>
                  <span className="text-xs text-slate-500">
                    {children.length} child(ren) linked
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-64">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Profile completeness</span>
                <span className="font-bold text-sky-700">{stats.pct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all" style={{ width: `${stats.pct}%` }} />
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                {stats.filled}/{stats.total} fields completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* PERSONAL */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Basic Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name" name="displayName" value={personalForm.displayName} onChange={(e) => setPersonalForm({ ...personalForm, displayName: e.target.value })} required error={formErrors.displayName} />
              <Field label="Email" name="email" value={merged.email} disabled />
              <Field label="Phone" name="phone" type="tel" value={personalForm.phone} onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })} error={formErrors.phone} />
              <Field label="Alternate Phone" name="phoneAlt" type="tel" value={personalForm.phoneAlt} onChange={(e) => setPersonalForm({ ...personalForm, phoneAlt: e.target.value })} error={formErrors.phoneAlt} />
              <Field label="Date of Birth" name="dateOfBirth" type="date" value={personalForm.dateOfBirth} onChange={(e) => setPersonalForm({ ...personalForm, dateOfBirth: e.target.value })} />
              <Field label="Gender" name="gender" options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
                { value: 'prefer-not', label: 'Prefer not to say' },
              ]} value={personalForm.gender} onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })} />
            </div>
          </Card>

          <Card title="Professional">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Occupation" name="occupation" value={personalForm.occupation} onChange={(e) => setPersonalForm({ ...personalForm, occupation: e.target.value })} />
              <Field label="Employer" name="employer" value={personalForm.employer} onChange={(e) => setPersonalForm({ ...personalForm, employer: e.target.value })} />
              <Field label="Marital Status" name="maritalStatus" options={[
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'divorced', label: 'Divorced' },
                { value: 'widowed', label: 'Widowed' },
                { value: 'other', label: 'Other' },
              ]} value={personalForm.maritalStatus} onChange={(e) => setPersonalForm({ ...personalForm, maritalStatus: e.target.value })} />
              <Field label="Relation Type" name="relationType" options={[
                { value: 'parent', label: 'Parent' },
                { value: 'guardian', label: 'Guardian' },
                { value: 'foster', label: 'Foster Parent' },
                { value: 'relative', label: 'Relative' },
              ]} value={personalForm.relationType} onChange={(e) => setPersonalForm({ ...personalForm, relationType: e.target.value })} />
            </div>
            <div className="mt-4">
              <Field label="Bio" name="bio" textarea rows={4} value={personalForm.bio} onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })} placeholder="Tell us about yourself…" />
            </div>
          </Card>

          <Card title="Preferences">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Language" name="language" options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'sw', label: 'Swahili' },
                { value: 'pt', label: 'Portuguese' },
                { value: 'ar', label: 'Arabic' },
              ]} value={personalForm.language} onChange={(e) => setPersonalForm({ ...personalForm, language: e.target.value })} />
              <Field label="Timezone" name="timezone" value={personalForm.timezone} onChange={(e) => setPersonalForm({ ...personalForm, timezone: e.target.value })} />
              <Field label="Preferred Contact" name="preferredContactMethod" options={[
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Phone' },
                { value: 'sms', label: 'SMS' },
                { value: 'in-app', label: 'In-App' },
              ]} value={personalForm.preferredContactMethod} onChange={(e) => setPersonalForm({ ...personalForm, preferredContactMethod: e.target.value })} />
            </div>
          </Card>

          <Card title="Quick Stats">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-sky-50 p-4">
                <p className="text-xs font-medium text-sky-700">Linked Children</p>
                <p className="mt-1 text-3xl font-bold text-sky-900">{children.length}</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-4">
                <p className="text-xs font-medium text-rose-700">Emergency Contacts</p>
                <p className="mt-1 text-3xl font-bold text-rose-900">{emergencyContacts.length}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-medium text-emerald-700">Addresses</p>
                <p className="mt-1 text-3xl font-bold text-emerald-900">{addresses.length}</p>
              </div>
              <div className="rounded-xl bg-violet-50 p-4">
                <p className="text-xs font-medium text-violet-700">IDs on file</p>
                <p className="mt-1 text-3xl font-bold text-violet-900">{identifications.length}</p>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-2 flex justify-end">
            <Btn onClick={handleSavePersonal} loading={saveStatus === 'saving'}>
              {saveStatus === 'saved' ? '✓ Saved' : 'Save All Changes'}
            </Btn>
          </div>
        </div>
      )}

      {/* CHILDREN */}
      {activeTab === 'children' && (
        <Card title="Linked Children" subtitle="Children associated with your account">
          {children.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-3 text-2xl">👨‍👩‍👧</div>
              <h3 className="text-sm font-semibold text-slate-800">No children linked</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">Add children from the Dashboard to see them here.</p>
              <div className="mt-4">
                <Link to="/parent/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((c) => (
                <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100 ring-2 ring-sky-100">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-500">
                          {c.fullName?.[0] || '?'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{c.fullName}</p>
                      <p className="text-xs text-slate-500">{c.grade} · {c.school || 'No school'}</p>
                      <p className="text-[10px] uppercase text-slate-400">{c.status || 'active'}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Link to={`/parent/student-progress`} className="text-xs font-medium text-sky-600 hover:underline">
                      View progress →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* EMERGENCY CONTACTS */}
      {activeTab === 'contacts' && (
        <Card
          title="Emergency Contacts"
          subtitle="Who to call in case of emergency"
          action={<Btn size="sm" onClick={() => setContactModal({ open: true, editing: null })}>Add Contact</Btn>}
        >
          {emergencyContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-3 text-2xl">🚨</div>
              <h3 className="text-sm font-semibold text-slate-800">No emergency contacts</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">Add at least one emergency contact for safety.</p>
              <div className="mt-4">
                <Btn onClick={() => setContactModal({ open: true, editing: null })}>Add Contact</Btn>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {emergencyContacts.map((c) => (
                <li key={c.id} className="flex items-start gap-4 py-4">
                  <span className={`rounded-xl p-3 ${c.isPrimary ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                    {c.isPrimary ? '🚨' : '📞'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">{c.name}</p>
                      {c.isPrimary && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">PRIMARY</span>}
                    </div>
                    <p className="text-xs text-slate-500">{c.relationship} · {c.phone}</p>
                    {c.email && <p className="text-xs text-slate-400">{c.email}</p>}
                    {c.notes && <p className="truncate text-xs text-slate-400">{c.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn size="sm" variant="outline" onClick={() => {
                      setContactForm({
                        name: c.name || '', relationship: c.relationship || '', phone: c.phone || '',
                        email: c.email || '', address: c.address || '', isPrimary: !!c.isPrimary,
                        notes: c.notes || '', priority: c.priority || 1,
                      });
                      setContactModal({ open: true, editing: c });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: c, type: 'contact' })}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* ADDRESSES */}
      {activeTab === 'addresses' && (
        <Card
          title="Addresses"
          action={<Btn size="sm" onClick={() => setAddressModal({ open: true, editing: null })}>Add Address</Btn>}
        >
          {addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-3 text-2xl">🏠</div>
              <h3 className="text-sm font-semibold text-slate-800">No addresses</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">Add a home address.</p>
              <div className="mt-4">
                <Btn onClick={() => setAddressModal({ open: true, editing: null })}>Add Address</Btn>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {addresses.map((a) => (
                <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{a.label}</p>
                        {a.isPrimary && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">PRIMARY</span>}
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        {a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />
                        {a.city}, {a.state} {a.postalCode}<br />
                        {a.country}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Btn size="sm" variant="outline" onClick={() => {
                      setAddressForm({
                        label: a.label || 'Home', line1: a.line1 || '', line2: a.line2 || '',
                        city: a.city || '', state: a.state || '', postalCode: a.postalCode || '',
                        country: a.country || '', isPrimary: !!a.isPrimary,
                      });
                      setAddressModal({ open: true, editing: a });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: a, type: 'address' })}>Delete</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* IDENTIFICATIONS */}
      {activeTab === 'ids' && (
        <Card
          title="Identification"
          subtitle="Government IDs and documents"
          action={<Btn size="sm" onClick={() => setIdModal({ open: true, editing: null })}>Add ID</Btn>}
        >
          {identifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-3 text-2xl">🆔</div>
              <h3 className="text-sm font-semibold text-slate-800">No IDs on file</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">Add IDs for verification.</p>
              <div className="mt-4">
                <Btn onClick={() => setIdModal({ open: true, editing: null })}>Add ID</Btn>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {identifications.map((i) => (
                <div key={i.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="rounded-xl bg-violet-50 p-3 text-violet-600">🆔</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold capitalize text-slate-800">{i.type?.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-500">#{i.number}</p>
                      {i.expiryDate && <p className="text-xs text-slate-400">Expires {i.expiryDate}</p>}
                    </div>
                  </div>
                  {i.fileUrl && (
                    <a href={i.fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-medium text-sky-600 hover:underline">
                      View document →
                    </a>
                  )}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Btn size="sm" variant="outline" onClick={() => {
                      setIdForm({
                        type: i.type || 'national_id', number: i.number || '', issuedDate: i.issuedDate || '',
                        expiryDate: i.expiryDate || '', country: i.country || '', fileUrl: i.fileUrl || '',
                      });
                      setIdModal({ open: true, editing: i });
                    }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, target: i, type: 'id' })}>Delete</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* CONNECTED ACCOUNTS */}
      {activeTab === 'accounts' && (
        <Card title="Connected Accounts" subtitle="External services linked to your account">
          {connectedAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-3 text-2xl">🔗</div>
              <h3 className="text-sm font-semibold text-slate-800">No connected accounts</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">Google, Apple, and other sign-in providers will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {connectedAccounts.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-slate-100 p-3 text-lg">
                      {a.provider === 'google' ? '🔵' : a.provider === 'apple' ? '🍎' : '🔗'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold capitalize text-slate-800">{a.provider}</p>
                      <p className="text-xs text-slate-500">{a.email || a.username}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">CONNECTED</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* ACTIVITY */}
      {activeTab === 'activity' && (
        <Card title="Profile Activity" subtitle="Recent changes to your profile">
          {activityLog.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activityLog.map((a) => (
                <li key={a.id} className="flex items-start gap-3 py-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold capitalize">{a.action?.replace(/_/g, ' ')}</span>
                      {a.description ? ` · ${a.description}` : ''}
                    </p>
                    <p className="text-xs text-slate-400">{formatRelativeTime(a.createdAt)}</p>
                  </div>
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
        title={contactModal.editing ? 'Edit Contact' : 'Add Emergency Contact'}
        footer={<><Btn variant="ghost" onClick={() => setContactModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveContact}>Save</Btn></>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name" name="name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required error={formErrors.name} />
          <Field label="Relationship" name="relationship" value={contactForm.relationship} onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })} placeholder="e.g., Spouse, Grandparent" />
          <Field label="Phone" name="phone" type="tel" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} required error={formErrors.phone} />
          <Field label="Email" name="email" type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} error={formErrors.email} />
          <Field label="Priority" name="priority" type="number" min={1} value={contactForm.priority} onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })} />
          <label className="flex items-center gap-2 pt-6 text-xs font-semibold text-slate-700">
            <input type="checkbox" checked={contactForm.isPrimary} onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
            Primary emergency contact
          </label>
          <div className="sm:col-span-2">
            <Field label="Address" name="address" value={contactForm.address} onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes" name="notes" textarea rows={3} value={contactForm.notes} onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* ADDRESS MODAL */}
      <Modal
        open={addressModal.open}
        onClose={() => setAddressModal({ open: false, editing: null })}
        title={addressModal.editing ? 'Edit Address' : 'Add Address'}
        footer={<><Btn variant="ghost" onClick={() => setAddressModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveAddress}>Save</Btn></>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Label" name="label" value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} />
          <div />
          <Field label="Line 1" name="line1" value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} required error={formErrors.line1} />
          <Field label="Line 2" name="line2" value={addressForm.line2} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} />
          <Field label="City" name="city" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required error={formErrors.city} />
          <Field label="State/Province" name="state" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
          <Field label="Postal Code" name="postalCode" value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} />
          <Field label="Country" name="country" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} required error={formErrors.country} />
          <label className="flex items-center gap-2 pt-2 text-xs font-semibold text-slate-700 sm:col-span-2">
            <input type="checkbox" checked={addressForm.isPrimary} onChange={(e) => setAddressForm({ ...addressForm, isPrimary: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
            Set as primary address
          </label>
        </div>
      </Modal>

      {/* ID MODAL */}
      <Modal
        open={idModal.open}
        onClose={() => setIdModal({ open: false, editing: null })}
        title={idModal.editing ? 'Edit ID' : 'Add Identification'}
        footer={<><Btn variant="ghost" onClick={() => setIdModal({ open: false, editing: null })}>Cancel</Btn><Btn onClick={handleSaveId}>Save</Btn></>}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Type" name="type" options={[
            { value: 'national_id', label: 'National ID' },
            { value: 'passport', label: 'Passport' },
            { value: 'drivers_license', label: "Driver's License" },
            { value: 'voter_card', label: 'Voter Card' },
            { value: 'other', label: 'Other' },
          ]} value={idForm.type} onChange={(e) => setIdForm({ ...idForm, type: e.target.value })} required error={formErrors.type} />
          <Field label="Number" name="number" value={idForm.number} onChange={(e) => setIdForm({ ...idForm, number: e.target.value })} required error={formErrors.number} />
          <Field label="Issued Date" name="issuedDate" type="date" value={idForm.issuedDate} onChange={(e) => setIdForm({ ...idForm, issuedDate: e.target.value })} />
          <Field label="Expiry Date" name="expiryDate" type="date" value={idForm.expiryDate} onChange={(e) => setIdForm({ ...idForm, expiryDate: e.target.value })} />
          <Field label="Country" name="country" value={idForm.country} onChange={(e) => setIdForm({ ...idForm, country: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Document Scan</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handleIdFileUpload(e.target.files[0])}
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-sky-700 hover:file:bg-sky-100" />
            {idForm.fileUrl && <a href={idForm.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-sky-600 hover:underline">View file</a>}
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
          if (confirmDelete.type === 'address') handleDeleteAddress();
          if (confirmDelete.type === 'id') handleDeleteId();
        }}>Delete</Btn></>}
      >
        <p className="text-sm text-slate-600">Are you sure? This action cannot be undone.</p>
      </Modal>
    </PageShell>
  );
};

export default memo(ParentProfile);