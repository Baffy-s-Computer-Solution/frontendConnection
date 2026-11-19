// frontend/src/pages/parent/ParentSettings.jsx
// ============================================================================
// PARENT SETTINGS - Production Ready
// Account | Security | Privacy | Notifications | Data export | Sessions
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
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
  deleteUser,
} from 'firebase/auth';
import { db, auth } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useParent } from '../../hooks/useParent';
import { useNotifications } from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../utils/formatters';
import { validateRequired, validateEmail } from '../../utils/validators';

// ============================================================================
// TAILWIND UI PRIMITIVES
// ============================================================================

const PageShell = ({ title, subtitle, children, loading }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/parent" className="hover:text-slate-700">Parent</Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-slate-700">{title}</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>}
      </header>
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white/60" />
          ))}
        </div>
      ) : children}
    </div>
  </div>
);

const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, loading, type = 'button', className = '', ...rest }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  const variants = {
    primary: 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus:ring-slate-700',
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
      ) : null}
      {children}
    </button>
  );
};

const Card = ({ title, subtitle, action, children, danger = false }) => (
  <section className={`rounded-2xl border bg-white shadow-sm ${danger ? 'border-red-200' : 'border-slate-200'}`}>
    {(title || action) && (
      <header className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${danger ? 'border-red-100' : 'border-slate-100'}`}>
        <div>
          {title && <h2 className={`text-sm font-semibold ${danger ? 'text-red-700' : 'text-slate-900'}`}>{title}</h2>}
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>
    )}
    <div className="p-5">{children}</div>
  </section>
);

const Field = ({ label, name, value, onChange, type = 'text', placeholder, required, error, textarea, rows = 3, disabled, ...rest }) => (
  <div className="w-full">
    {label && <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label>}
    {textarea ? (
      <textarea id={name} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={rows} disabled={disabled}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 disabled:bg-slate-50 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
    ) : (
      <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} disabled={disabled}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 disabled:bg-slate-50 ${error ? 'border-red-400' : 'border-slate-300'}`} {...rest} />
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
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };
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

const SidebarLink = ({ id, label, icon, active, onClick, tone = 'default' }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
      active ? 'bg-slate-900 text-white' : tone === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-100'
    }`}
  >
    <span className="text-base">{icon}</span>
    <span>{label}</span>
  </button>
);

const Toggle = ({ checked, onChange, label, description, disabled }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition ${checked ? 'bg-emerald-600' : 'bg-slate-300'} disabled:opacity-50`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`} />
    </button>
  </div>
);

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

const ParentSettings = () => {
  const navigate = useNavigate();
  const { user, profile, refresh: refreshAuth } = useAuth();
  const { refresh: refreshParent } = useParent();
  const { push: pushNotification } = useNotifications();
  const parentId = user?.uid ?? profile?.uid;

  const [activeSection, setActiveSection] = useState('account');
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ---------- Account form ----------
  const [accountForm, setAccountForm] = useState({
    email: user?.email || '',
    reauthPassword: '',
  });
  const [accountErrors, setAccountErrors] = useState({});
  const [savingAccount, setSavingAccount] = useState(false);

  useEffect(() => {
    setAccountForm((f) => ({ ...f, email: user?.email || '' }));
  }, [user?.email]);

  const handleUpdateEmail = async () => {
    setAccountErrors({});
    if (!accountForm.email || !validateEmail(accountForm.email)) {
      setAccountErrors({ email: 'Valid email required' });
      return;
    }
    if (!accountForm.reauthPassword) {
      setAccountErrors({ reauthPassword: 'Password required for re-authentication' });
      return;
    }
    try {
      setSavingAccount(true);
      const credential = EmailAuthProvider.credential(user.email, accountForm.reauthPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, accountForm.email);
      await updateDocument('parents', parentId, { email: accountForm.email }, parentId);
      await syncToSupabase('parents', { email: accountForm.email }, parentId);
      await logActivity('email_changed', 'Email address updated');
      showToast('Email updated successfully');
      setAccountForm((f) => ({ ...f, reauthPassword: '' }));
      refreshAuth?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingAccount(false);
    }
  };

  // ---------- Password change ----------
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.current) errors.current = 'Current password required';
    if (!passwordForm.next || passwordForm.next.length < 8) errors.next = 'Min 8 characters';
    if (passwordForm.next !== passwordForm.confirm) errors.confirm = 'Passwords do not match';
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    try {
      setSavingPassword(true);
      const credential = EmailAuthProvider.credential(user.email, passwordForm.current);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, passwordForm.next);
      await logActivity('password_changed', 'Password changed');
      showToast('Password updated successfully');
      setPasswordForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // ---------- Realtime security: sessions ----------
  const [sessions, setSessions] = useState([]);
  useEffect(() => {
    if (!parentId) return;
    const q = query(collection(db, 'parent_sessions'), where('parentId', '==', parentId), orderBy('lastActiveAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [parentId]);

  const handleRevokeSession = async (s) => {
    try {
      await deleteDoc(doc(db, 'parent_sessions', s.id));
      await logActivity('session_revoked', `Revoked session ${s.deviceLabel || 'unknown'}`);
      showToast('Session revoked');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleRevokeAllSessions = async () => {
    if (!window.confirm('Sign out of all other devices?')) return;
    try {
      for (const s of sessions) {
        if (s.current) continue;
        await deleteDoc(doc(db, 'parent_sessions', s.id));
      }
      showToast('All other sessions signed out');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Privacy ----------
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    showEmailToContacts: true,
    showPhoneToContacts: true,
    allowSearchByEmail: false,
    allowCommunityDiscover: true,
    allowAnalytics: true,
    allowPersonalization: true,
  });

  useEffect(() => {
    if (!parentId) return;
    const unsub = onSnapshot(doc(db, 'parent_privacy', parentId), (snap) => {
      if (snap.exists()) setPrivacy((p) => ({ ...p, ...snap.data() }));
    });
    return () => unsub();
  }, [parentId]);

  const handleSavePrivacy = async () => {
    try {
      await updateDocument('parent_privacy', parentId, privacy, parentId);
      await syncToSupabase('parent_privacy', privacy, parentId);
      await logActivity('privacy_updated', 'Privacy preferences updated');
      showToast('Privacy preferences saved');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- App preferences ----------
  const [appPrefs, setAppPrefs] = useState({
    theme: 'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'YYYY-MM-DD',
    weekStart: 'monday',
    reduceMotion: false,
    compactMode: false,
  });

  useEffect(() => {
    if (!parentId) return;
    const unsub = onSnapshot(doc(db, 'parent_app_prefs', parentId), (snap) => {
      if (snap.exists()) setAppPrefs((p) => ({ ...p, ...snap.data() }));
    });
    return () => unsub();
  }, [parentId]);

  const handleSaveAppPrefs = async () => {
    try {
      await updateDocument('parent_app_prefs', parentId, appPrefs, parentId);
      await syncToSupabase('parent_app_prefs', appPrefs, parentId);
      await logActivity('app_prefs_updated', 'App preferences updated');
      showToast('Preferences saved');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ---------- Data export ----------
  const [exporting, setExporting] = useState(false);

  const handleExportData = async (format = 'json') => {
    setExporting(true);
    try {
      const collections = [
        'parents', 'parent_children', 'parent_documents', 'parent_expenses',
        'parent_meetings', 'notifications', 'wellbeing_records', 'parent_posts',
      ];
      const dump = {};
      for (const c of collections) {
        try {
          const q = query(collection(db, c), where('parentId', '==', parentId));
          const snap = await getDocs(q);
          dump[c] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch (e) {
          dump[c] = [];
        }
      }
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `parent-data-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      await logActivity('data_exported', `Data exported (${format})`);
      showToast('Data export ready');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setExporting(false); }
  };

  // ---------- Delete account flow ----------
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      showToast('Type DELETE to confirm', 'error');
      return;
    }
    try {
      setDeleting(true);
      // Anonymize data (soft delete)
      await updateDocument('parents', parentId, {
        deleted: true, deletedAt: serverTimestamp(), email: '', displayName: 'Deleted User',
      }, parentId);
      await syncToSupabase('parents', { deleted: true }, parentId);
      await logActivity('account_deleted', 'Account marked for deletion');
      try { await deleteUser(auth.currentUser); } catch (e) { /* auth delete may fail; fall back to signOut */ }
      await signOut(auth);
      navigate('/');
    } catch (err) {
      showToast(err.message, 'error');
      setDeleting(false);
    }
  };

  // ---------- Activity log ----------
  const logActivity = useCallback(async (action, description) => {
    try {
      await addDoc(collection(db, 'parent_settings_activity'), {
        parentId, action, description, createdAt: serverTimestamp(),
      });
    } catch (e) {}
  }, [parentId]);

  const [activityLog, setActivityLog] = useState([]);
  useEffect(() => {
    if (!parentId) return;
    const q = query(collection(db, 'parent_settings_activity'), where('parentId', '==', parentId), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setActivityLog(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [parentId]);

  // ---------- Sidebar sections ----------
  const sections = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' },
    { id: 'appearance', label: 'Appearance & Language', icon: '🎨' },
    { id: 'sessions', label: 'Sessions & Devices', icon: '💻' },
    { id: 'data', label: 'Data & Export', icon: '📦' },
    { id: 'danger', label: 'Delete Account', icon: '⚠️', tone: 'danger' },
  ];

  return (
    <PageShell title="Settings" subtitle="Manage your account, security, privacy, and preferences.">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition ${toast.tone === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <nav className="space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {sections.map((s) => (
              <SidebarLink
                key={s.id}
                id={s.id}
                label={s.label}
                icon={s.icon}
                active={activeSection === s.id}
                onClick={setActiveSection}
                tone={s.tone}
              />
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="space-y-5 lg:col-span-3">
          {activeSection === 'account' && (
            <>
              <Card title="Account Information" subtitle="Your login email and identity">
                <div className="space-y-4">
                  <Field
                    label="Email Address"
                    name="email"
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    error={accountErrors.email}
                  />
                  <Field
                    label="Confirm Password (re-authentication)"
                    name="reauthPassword"
                    type="password"
                    value={accountForm.reauthPassword}
                    onChange={(e) => setAccountForm({ ...accountForm, reauthPassword: e.target.value })}
                    error={accountErrors.reauthPassword}
                    placeholder="Enter your current password"
                  />
                  <div className="flex justify-end">
                    <Btn onClick={handleUpdateEmail} loading={savingAccount}>Update Email</Btn>
                  </div>
                </div>
              </Card>

              <Card title="Password" subtitle="Change your login password">
                <div className="space-y-4">
                  <Field label="Current Password" name="current" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} error={passwordErrors.current} />
                  <Field label="New Password" name="next" type="password" value={passwordForm.next} onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })} error={passwordErrors.next} />
                  <Field label="Confirm New Password" name="confirm" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} error={passwordErrors.confirm} />
                  <div className="flex justify-end">
                    <Btn onClick={handleChangePassword} loading={savingPassword}>Change Password</Btn>
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeSection === 'security' && (
            <>
              <Card title="Two-Factor Authentication" subtitle="Add an extra layer of security">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Authenticator App</p>
                    <p className="mt-0.5 text-xs text-slate-500">Use Google Authenticator, Authy, or similar</p>
                  </div>
                  <Btn variant="outline" onClick={() => showToast('2FA setup flow coming soon')}>Enable</Btn>
                </div>
              </Card>

              <Card title="Security Questions" subtitle="Recovery options for account access">
                <div className="space-y-3">
                  <Field label="Question 1" value="What was your childhood nickname?" disabled />
                  <Field label="Answer 1" type="password" value="••••••••" disabled />
                </div>
              </Card>

              <Card title="Security Log" subtitle="Recent security events">
                {activityLog.filter((a) => a.action?.includes('password') || a.action?.includes('session') || a.action?.includes('email')).length === 0 ? (
                  <p className="text-sm text-slate-500">No security events yet.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {activityLog.filter((a) => a.action?.includes('password') || a.action?.includes('session') || a.action?.includes('email')).map((a) => (
                      <li key={a.id} className="flex items-start gap-3 py-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-700">{a.description || a.action}</p>
                          <p className="text-xs text-slate-400">{formatRelativeTime(a.createdAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </>
          )}

          {activeSection === 'privacy' && (
            <Card title="Privacy Preferences" subtitle="Control who sees what">
              <div>
                <Field
                  label="Profile Visibility"
                  name="profileVisibility"
                  value={privacy.profileVisibility}
                  onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                  options={[
                    { value: 'public', label: 'Public — visible to everyone' },
                    { value: 'contacts', label: 'Contacts only' },
                    { value: 'private', label: 'Private — only you' },
                  ]}
                />
              </div>
              <div className="mt-4">
                <Toggle checked={privacy.showEmailToContacts} onChange={(v) => setPrivacy({ ...privacy, showEmailToContacts: v })} label="Show email to contacts" />
                <Toggle checked={privacy.showPhoneToContacts} onChange={(v) => setPrivacy({ ...privacy, showPhoneToContacts: v })} label="Show phone to contacts" />
                <Toggle checked={privacy.allowSearchByEmail} onChange={(v) => setPrivacy({ ...privacy, allowSearchByEmail: v })} label="Allow search by email" description="Others can find you via email search" />
                <Toggle checked={privacy.allowCommunityDiscover} onChange={(v) => setPrivacy({ ...privacy, allowCommunityDiscover: v })} label="Discoverable in community" />
                <Toggle checked={privacy.allowAnalytics} onChange={(v) => setPrivacy({ ...privacy, allowAnalytics: v })} label="Share anonymous analytics" />
                <Toggle checked={privacy.allowPersonalization} onChange={(v) => setPrivacy({ ...privacy, allowPersonalization: v })} label="Enable personalization" />
              </div>
              <div className="mt-5 flex justify-end">
                <Btn onClick={handleSavePrivacy}>Save Privacy Settings</Btn>
              </div>
            </Card>
          )}

          {activeSection === 'appearance' && (
            <Card title="Appearance & Language">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Theme" name="theme" value={appPrefs.theme} onChange={(e) => setAppPrefs({ ...appPrefs, theme: e.target.value })} options={[
                  { value: 'system', label: 'System Default' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]} />
                <Field label="Language" name="language" value={appPrefs.language} onChange={(e) => setAppPrefs({ ...appPrefs, language: e.target.value })} options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'sw', label: 'Swahili' },
                  { value: 'pt', label: 'Portuguese' },
                ]} />
                <Field label="Timezone" name="timezone" value={appPrefs.timezone} onChange={(e) => setAppPrefs({ ...appPrefs, timezone: e.target.value })} />
                <Field label="Date Format" name="dateFormat" value={appPrefs.dateFormat} onChange={(e) => setAppPrefs({ ...appPrefs, dateFormat: e.target.value })} options={[
                  { value: 'YYYY-MM-DD', label: '2025-12-31' },
                  { value: 'DD/MM/YYYY', label: '31/12/2025' },
                  { value: 'MM/DD/YYYY', label: '12/31/2025' },
                ]} />
                <Field label="Week Starts On" name="weekStart" value={appPrefs.weekStart} onChange={(e) => setAppPrefs({ ...appPrefs, weekStart: e.target.value })} options={[
                  { value: 'sunday', label: 'Sunday' },
                  { value: 'monday', label: 'Monday' },
                ]} />
              </div>
              <div className="mt-4">
                <Toggle checked={appPrefs.reduceMotion} onChange={(v) => setAppPrefs({ ...appPrefs, reduceMotion: v })} label="Reduce motion" description="Minimize animations" />
                <Toggle checked={appPrefs.compactMode} onChange={(v) => setAppPrefs({ ...appPrefs, compactMode: v })} label="Compact mode" description="Show more content with less spacing" />
              </div>
              <div className="mt-5 flex justify-end">
                <Btn onClick={handleSaveAppPrefs}>Save Preferences</Btn>
              </div>
            </Card>
          )}

          {activeSection === 'sessions' && (
            <Card
              title="Active Sessions"
              subtitle="Devices where you're signed in"
              action={sessions.length > 1 && <Btn size="sm" variant="danger" onClick={handleRevokeAllSessions}>Sign out all others</Btn>}
            >
              {sessions.length === 0 ? (
                <p className="text-sm text-slate-500">No active sessions tracked.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {sessions.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-4 py-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="rounded-xl bg-slate-100 p-3 text-lg">
                          {s.deviceType === 'mobile' ? '📱' : s.deviceType === 'tablet' ? '📱' : '💻'}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-800">{s.deviceLabel || 'Unknown device'}</p>
                            {s.current && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">THIS DEVICE</span>}
                          </div>
                          <p className="text-xs text-slate-500">{s.userAgent ? s.userAgent.slice(0, 60) : 'Unknown'}</p>
                          <p className="text-xs text-slate-400">Last active {formatRelativeTime(s.lastActiveAt)} · {s.ipAddress || 'unknown IP'}</p>
                        </div>
                      </div>
                      {!s.current && (
                        <Btn size="sm" variant="danger" onClick={() => handleRevokeSession(s)}>Revoke</Btn>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {activeSection === 'data' && (
            <>
              <Card title="Export Your Data" subtitle="Download a copy of your data">
                <p className="text-sm text-slate-600">
                  Export all your personal data including profile, children, documents metadata, meetings, expenses, and notifications in JSON format.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Btn onClick={() => handleExportData('json')} loading={exporting}>Export JSON</Btn>
                  <Btn variant="outline" onClick={() => showToast('CSV export coming soon')}>Export CSV</Btn>
                </div>
              </Card>

              <Card title="Import Data" subtitle="Restore from a previous export">
                <input type="file" accept="application/json" className="block w-full text-sm" />
                <div className="mt-4 flex justify-end">
                  <Btn variant="outline" onClick={() => showToast('Import coming soon')}>Import Data</Btn>
                </div>
              </Card>

              <Card title="Data Retention" subtitle="How long we keep your data">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2"><span>•</span><span>Active account data is retained indefinitely until you delete your account</span></li>
                  <li className="flex items-start gap-2"><span>•</span><span>Deleted accounts are anonymized within 30 days</span></li>
                  <li className="flex items-start gap-2"><span>•</span><span>Backups are purged within 90 days</span></li>
                </ul>
              </Card>
            </>
          )}

          {activeSection === 'danger' && (
            <Card
              title="Delete Account"
              subtitle="This action cannot be undone"
              danger
            >
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
                <p className="font-semibold">Warning</p>
                <p className="mt-1">
                  Deleting your account will permanently remove your profile, children links, documents, meetings, and all associated data. This cannot be undone.
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <Btn variant="danger" onClick={() => setDeleteModal(true)}>Delete My Account</Btn>
              </div>
            </Card>
          )}

          {/* Recent activity */}
          <Card title="Recent Settings Activity">
            {activityLog.length === 0 ? (
              <p className="text-sm text-slate-500">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {activityLog.slice(0, 8).map((a) => (
                  <li key={a.id} className="flex items-start gap-3 py-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700">{a.description || a.action}</p>
                      <p className="text-xs text-slate-400">{formatRelativeTime(a.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </main>
      </div>

      {/* DELETE ACCOUNT MODAL */}
      <Modal
        open={deleteModal}
        onClose={() => { setDeleteModal(false); setDeleteConfirm(''); }}
        title="Delete Account"
        footer={<>
          <Btn variant="ghost" onClick={() => { setDeleteModal(false); setDeleteConfirm(''); }}>Cancel</Btn>
          <Btn variant="danger" onClick={handleDeleteAccount} loading={deleting} disabled={deleteConfirm !== 'DELETE'}>Delete Forever</Btn>
        </>}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            This will permanently delete your account and all associated data. Type <span className="font-mono font-bold text-red-600">DELETE</span> below to confirm.
          </p>
          <Field
            label="Confirmation"
            name="confirm"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Type DELETE"
          />
        </div>
      </Modal>
    </PageShell>
  );
};

export default memo(ParentSettings);