// frontend/src/pages/alumni/AlumniSettings.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { linkWithPopup, unlink } from 'firebase/auth';
import {
  FaArrowLeft, FaBell, FaBookOpen, FaCheck,
  FaChevronRight, FaClock, FaCog, FaCreditCard, FaDownload, FaEnvelope,
  FaExclamationTriangle, FaEye, FaEyeSlash, FaFileExport, FaFingerprint,
  FaGoogle, FaGraduationCap, FaInfoCircle, FaKey,
  FaLink, FaLock, FaMobileAlt, FaMoon, FaPalette, FaPhone,
  FaSave, FaShieldAlt, FaSignOutAlt, FaSun,
  FaTimes, FaTrashAlt, FaUnlink, FaUpload, FaUserCog, FaUserShield,
  FaWallet, FaWifi,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { alumniService } from '../../services/alumniService';
import { googleProvider } from '../../config/firebase';
import { formatCurrency, formatDate } from '../../utils/formatters';

// ============================================================
// Environment
// ============================================================
const ENV = import.meta.env.VITE_APP_ENVIRONMENT || 'production';
const APP_NAME = import.meta.env.VITE_APP_NAME || 'Career Connect Lesotho';
const SUPPORT_EMAIL = 'support@careerconnect.co.ls';
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const safeLog = (...a) => { if (ENV !== 'production') console.debug('[Settings]', ...a); };
const safe = (v) => (v == null ? '' : String(v));

// ============================================================
// Static configuration
// ============================================================
const SETTINGS_TABS = [
  { id: 'account', label: 'Account', icon: FaUserCog },
  { id: 'security', label: 'Security', icon: FaShieldAlt },
  { id: 'notifications', label: 'Notifications', icon: FaBell },
  { id: 'privacy', label: 'Privacy', icon: FaEye },
  { id: 'appearance', label: 'Appearance', icon: FaPalette },
  { id: 'schools', label: 'Schools', icon: FaBookOpen },
  { id: 'payments', label: 'Payments', icon: FaCreditCard },
  { id: 'connected', label: 'Connected apps', icon: FaLink },
  { id: 'data', label: 'Data & export', icon: FaDownload },
  { id: 'danger', label: 'Danger zone', icon: FaExclamationTriangle },
];

const NOTIFICATION_CHANNELS = [
  { key: 'email', label: 'Email', icon: FaEnvelope, description: 'Receive updates to your primary email' },
  { key: 'push', label: 'Push notifications', icon: FaMobileAlt, description: 'Browser and mobile push notifications' },
  { key: 'sms', label: 'SMS', icon: FaPhone, description: 'Critical alerts via text message' },
  { key: 'inApp', label: 'In-app', icon: FaBell, description: 'Notifications inside the app' },
];

const NOTIFICATION_EVENTS = [
  { key: 'connections', label: 'Connection requests' },
  { key: 'messages', label: 'Direct messages' },
  { key: 'mentorship', label: 'Mentorship activity' },
  { key: 'donations', label: 'Donation confirmations' },
  { key: 'events', label: 'Event reminders' },
  { key: 'posts', label: 'New posts from your network' },
  { key: 'announcements', label: 'Platform announcements' },
  { key: 'digest', label: 'Weekly digest' },
  { key: 'marketing', label: 'Product updates & marketing' },
];

const PRIVACY_OPTIONS = [
  { key: 'profileVisibility', label: 'Profile visibility', options: [
    { value: 'public', label: 'Public — everyone can view' },
    { value: 'alumni', label: 'Alumni only' },
    { value: 'connections', label: 'Connections only' },
    { value: 'private', label: 'Private — nobody except you' },
  ]},
  { key: 'showEmail', label: 'Show my email address on my profile' },
  { key: 'showPhone', label: 'Show my phone number on my profile' },
  { key: 'showLocation', label: 'Show my location' },
  { key: 'showSchool', label: 'Show my schools publicly' },
  { key: 'showDonations', label: 'Show my donations on my profile' },
  { key: 'allowMessages', label: 'Allow other alumni to message me' },
  { key: 'allowMentorshipRequests', label: 'Allow mentorship requests' },
  { key: 'allowSearchEngineIndexing', label: 'Allow search engines to index my profile' },
  { key: 'allowAnalytics', label: 'Allow anonymous usage analytics' },
];

const APPEARANCE_OPTIONS = {
  themes: [
    { id: 'light', label: 'Light', icon: FaSun },
    { id: 'dark', label: 'Dark', icon: FaMoon },
    { id: 'system', label: 'System', icon: FaCog },
  ],
  density: [
    { id: 'comfortable', label: 'Comfortable' },
    { id: 'compact', label: 'Compact' },
  ],
  languages: [
    { id: 'en', label: 'English' },
    { id: 'st', label: 'Sesotho' },
    { id: 'zu', label: 'isiZulu' },
    { id: 'fr', label: 'Français' },
  ],
};

// ============================================================
// Reusable UI primitives
// ============================================================
const Section = ({ title, subtitle, children, icon: Icon, badge }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="mb-4 flex items-start justify-between gap-2">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {badge && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700">{badge}</span>}
    </div>
    {children}
  </section>
);

const Toggle = ({ checked, onChange, disabled, label, description }) => (
  <div className="flex items-start justify-between gap-3 py-2">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</p>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
      className={`relative mt-0.5 inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition ${checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'} ${disabled ? 'opacity-50' : ''}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const Radio = ({ name, value, checked, onChange, label }) => (
  <label className="flex items-center gap-2 py-1.5 text-sm">
    <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="h-3.5 w-3.5 text-brand-600" />
    {label}
  </label>
);

const PasswordField = ({ label, value, onChange, placeholder, error, showStrength }) => {
  const [visible, setVisible] = useState(false);
  const strength = useMemo(() => {
    if (!value) return 0;
    let s = 0;
    if (value.length >= 8) s++;
    if (value.length >= 12) s++;
    if (/[A-Z]/.test(value)) s++;
    if (/[0-9]/.test(value)) s++;
    if (/[^A-Za-z0-9]/.test(value)) s++;
    return s;
  }, [value]);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-500'];
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</label>
      <div className="relative mt-1">
        <input type={visible ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value.slice(0, 128))} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 p-2 pr-10 text-sm dark:border-slate-700 dark:bg-slate-800" />
        <button type="button" onClick={() => setVisible((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Toggle password visibility">
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {showStrength && value && (
        <div className="mt-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full ${strengthColors[strength]} transition-all`} style={{ width: `${(strength / 5) * 100}%` }} />
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">{strengthLabels[strength]}</p>
        </div>
      )}
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
};

const ConfirmDialog = ({ open, title, message, requirePassword, onCancel, onConfirm, busy, danger }) => {
  const [password, setPassword] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
        <h3 className={`text-base font-semibold ${danger ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'}`}>{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{message}</p>
        {requirePassword && (
          <div className="mt-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Confirm with your password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value.slice(0, 128))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => { setPassword(''); onCancel(); }} disabled={busy} className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">Cancel</button>
          <button onClick={() => { onConfirm(password); setPassword(''); }} disabled={busy || (requirePassword && !password)} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${danger ? 'bg-red-600' : 'bg-brand-600'}`}>{busy ? 'Working…' : 'Confirm'}</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Main Settings Page
// ============================================================
const AlumniSettings = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout, updateUserPhoto, updateUserProfile } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();
  const { theme, setTheme, fontSize, setFontSize, reducedMotion, highContrast, toggleReducedMotion, toggleHighContrast } = useTheme();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('account');
  const [mobileMenu, setMobileMenu] = useState(false);

  // Account
  const [accountForm, setAccountForm] = useState({ displayName: '', email: '', phone: '', language: 'en' });
  const [savingAccount, setSavingAccount] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  // Security
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  // Notifications
  const [notificationPrefs, setNotificationPrefs] = useState({
    channels: { email: true, push: true, sms: false, inApp: true },
    events: { connections: true, messages: true, mentorship: true, donations: true, events: true, posts: true, announcements: true, digest: true, marketing: false },
    quietHours: { enabled: false, from: '22:00', to: '07:00' },
  });
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Privacy
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'alumni', showEmail: false, showPhone: false, showLocation: true, showSchool: true,
    showDonations: true, allowMessages: true, allowMentorshipRequests: true,
    allowSearchEngineIndexing: false, allowAnalytics: true,
  });
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Appearance
  const [appearance, setAppearance] = useState({ theme: theme || 'system', density: 'comfortable', language: 'en', reducedMotion: false, highContrast: false });
  const [appearanceLoaded, setAppearanceLoaded] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);

  // Schools
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [schoolModal, setSchoolModal] = useState(false);
  const [schoolForm, setSchoolForm] = useState({ name: '', graduationYear: '', relationship: 'alumni', consentAccepted: false });
  const [schoolSubmitting, setSchoolSubmitting] = useState(false);

  // Connected apps

  // Data & Export
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [dataSummary, setDataSummary] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [googleLinkBusy, setGoogleLinkBusy] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(() =>
    Boolean(currentUser?.providerData?.some((provider) => provider.providerId === 'google.com'))
  );

  // Danger zone
  const [confirmAction, setConfirmAction] = useState(null);
  const [dangerBusy, setDangerBusy] = useState(false);

  // ============================================================
  // Load initial state
  // ============================================================
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, schoolsRes, dataRes, donationsRes] = await Promise.allSettled([
        alumniService.getAlumniSettings(),
        alumniService.getLinkedSchools(),
        alumniService.getDataSummary(),
        alumniService.getMyDonations(),
      ]);

      if (settingsRes.status === 'fulfilled' && settingsRes.value?.success) {
        const d = settingsRes.value.data || {};
        if (d.account) setAccountForm({ displayName: d.account.displayName || '', email: d.account.email || currentUser?.email || '', phone: d.account.phone || '', language: d.account.language || 'en' });
        if (d.notifications) setNotificationPrefs((prev) => ({ ...prev, ...d.notifications }));
        if (d.privacy) setPrivacy((prev) => ({ ...prev, ...d.privacy }));
        if (d.appearance) {
          setAppearance((prev) => ({ ...prev, ...d.appearance }));
        }
        setAppearanceLoaded(true);
      } else {
        addErrorNotification('Settings', 'Could not load your saved preferences');
      }
      if (schoolsRes.status === 'fulfilled' && schoolsRes.value?.success) {
        setSchools(Array.isArray(schoolsRes.value.data) ? schoolsRes.value.data : []);
      } else {
        addErrorNotification('Schools', 'Could not load your linked schools');
      }
      if (dataRes.status === 'fulfilled' && dataRes.value?.success) {
        setDataSummary(dataRes.value.data || {});
      } else {
        setDataSummary({ unavailable: true });
      }
      if (donationsRes.status === 'fulfilled' && donationsRes.value?.success) {
        setDonationHistory(Array.isArray(donationsRes.value.data) ? donationsRes.value.data : []);
      }
    } catch (e) {
      safeLog(e);
      addErrorNotification('Settings', 'Failed to load settings');
    } finally {
      setLoading(false);
      setLoadingSchools(false);
    }
  }, [currentUser?.email, addErrorNotification]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  useEffect(() => {
    setGoogleConnected(Boolean(currentUser?.providerData?.some((provider) => provider.providerId === 'google.com')));
  }, [currentUser?.providerData]);

  useEffect(() => {
    if (!appearanceLoaded) return;
    if (appearance.theme !== theme) setTheme(appearance.theme);
    const nextFontSize = appearance.density === 'compact' ? 'small' : 'medium';
    if (fontSize !== nextFontSize) setFontSize(nextFontSize);
    if (Boolean(appearance.reducedMotion) !== reducedMotion) toggleReducedMotion();
    if (Boolean(appearance.highContrast) !== highContrast) toggleHighContrast();
  }, [appearanceLoaded, appearance, theme, setTheme, fontSize, setFontSize, reducedMotion, highContrast, toggleReducedMotion, toggleHighContrast]);

  // ============================================================
  // Handlers
  // ============================================================
  const saveAccount = async () => {
    if (!accountForm.displayName.trim()) { addErrorNotification('Account', 'Display name is required'); return; }
    setSavingAccount(true);
    try {
      const res = await alumniService.updateAlumniSettings?.({ account: {
        displayName: accountForm.displayName.trim().slice(0, 100),
        phone: accountForm.phone.slice(0, 30),
        language: accountForm.language,
      }});
      if (res?.success) {
        updateUserProfile?.({
          displayName: accountForm.displayName.trim().slice(0, 100),
          fullName: accountForm.displayName.trim().slice(0, 100),
          phone: accountForm.phone.slice(0, 30),
        });
        addSuccessNotification('Account', 'Account settings saved');
      }
      else addErrorNotification('Account', res?.error || 'Save failed');
    } catch (error) {
      addErrorNotification('Account', error.message || 'Save failed');
    } finally {
      setSavingAccount(false);
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      addErrorNotification('Profile photo', 'Choose a JPG, PNG, or WEBP image');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      addErrorNotification('Profile photo', 'Image must be 5MB or smaller');
      event.target.value = '';
      return;
    }

    setUploadingAvatar(true);
    try {
      const result = await alumniService.uploadAvatar(file);
      if (!result.success || !result.data?.url) {
        addErrorNotification('Profile photo', result.error || 'Upload failed');
        return;
      }
      updateUserPhoto?.(result.data.url);
      addSuccessNotification('Profile photo', 'Profile photo updated');
    } catch (error) {
      addErrorNotification('Profile photo', error.message || 'Upload failed');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const toggleGoogleConnection = async () => {
    if (!currentUser || googleLinkBusy) return;
    setGoogleLinkBusy(true);
    try {
      if (googleConnected) {
        const hasOtherSignInMethod = currentUser.providerData.some((provider) => provider.providerId !== 'google.com');
        if (!hasOtherSignInMethod) {
          addErrorNotification('Google account', 'Add another sign-in method before disconnecting Google.');
          return;
        }
        await unlink(currentUser, 'google.com');
        setGoogleConnected(false);
        addSuccessNotification('Google account', 'Google sign-in disconnected');
      } else {
        await linkWithPopup(currentUser, googleProvider);
        setGoogleConnected(true);
        addSuccessNotification('Google account', 'Google sign-in connected');
      }
    } catch (error) {
      const message = error.code === 'auth/credential-already-in-use'
        ? 'That Google account is already connected to another account.'
        : error.code === 'auth/popup-closed-by-user'
          ? 'Google account connection was cancelled.'
          : error.message || 'Could not update Google sign-in.';
      addErrorNotification('Google account', message);
    } finally {
      setGoogleLinkBusy(false);
    }
  };

  const changePassword = async () => {
    if (!passwordForm.current) { addErrorNotification('Password', 'Enter current password'); return; }
    if (passwordForm.next.length < 8) { addErrorNotification('Password', 'New password must be at least 8 characters'); return; }
    if (passwordForm.next !== passwordForm.confirm) { addErrorNotification('Password', 'Passwords do not match'); return; }
    setChangingPassword(true);
    try {
      const res = await alumniService.changePassword?.({ currentPassword: passwordForm.current, newPassword: passwordForm.next });
      if (res?.success) {
        addSuccessNotification('Password', 'Password changed');
        setPasswordForm({ current: '', next: '', confirm: '' });
      } else {
        addErrorNotification('Password', res?.error || 'Password change failed');
      }
    } catch (error) {
      addErrorNotification('Password', error.message || 'Password change failed');
    } finally {
      setChangingPassword(false);
    }
  };

  const saveNotifications = async () => {
    setSavingNotifications(true);
    try {
      const res = await alumniService.updateNotificationPreferences?.(notificationPrefs);
      if (res?.success) addSuccessNotification('Notifications', 'Preferences saved');
      else addErrorNotification('Notifications', res?.error || 'Save failed');
    } catch (error) { addErrorNotification('Notifications', error.message || 'Save failed');
    } finally { setSavingNotifications(false); }
  };

  const savePrivacy = async () => {
    setSavingPrivacy(true);
    try {
      const res = await alumniService.updateAlumniPrivacy?.(privacy);
      if (res?.success) addSuccessNotification('Privacy', 'Privacy preferences saved');
      else addErrorNotification('Privacy', res?.error || 'Save failed');
    } catch (error) { addErrorNotification('Privacy', error.message || 'Save failed');
    } finally { setSavingPrivacy(false); }
  };

  const saveAppearance = async () => {
    setSavingAppearance(true);
    try {
      if (appearance.theme && appearance.theme !== theme) setTheme(appearance.theme);
      const res = await alumniService.updateAppearancePreferences?.(appearance);
      if (res?.success) addSuccessNotification('Appearance', 'Preferences saved');
      else addErrorNotification('Appearance', res?.error || 'Save failed');
    } catch (error) { addErrorNotification('Appearance', error.message || 'Save failed');
    } finally { setSavingAppearance(false); }
  };

  const requestSchool = async () => {
    if (!schoolForm.name.trim()) { addErrorNotification('School', 'School name is required'); return; }
    if (!schoolForm.consentAccepted) { addErrorNotification('School', 'You must consent to share school information'); return; }
    setSchoolSubmitting(true);
    try {
      const res = await alumniService.requestSchoolLink?.({
        name: schoolForm.name.trim().slice(0, 200),
        graduationYear: schoolForm.graduationYear ? parseInt(schoolForm.graduationYear, 10) : null,
        relationship: schoolForm.relationship,
        consentAccepted: true,
      });
      if (res?.success) {
        addSuccessNotification('School', 'Verification request submitted');
        setSchoolModal(false);
        setSchoolForm({ name: '', graduationYear: '', relationship: 'alumni', consentAccepted: false });
        const refreshed = await alumniService.getLinkedSchools?.();
        if (refreshed?.success) setSchools(refreshed.data || []);
      } else {
        addErrorNotification('School', res?.error || 'Request failed');
      }
    } finally { setSchoolSubmitting(false); }
  };

  const unlinkSchool = async (id) => {
    try {
      const res = await alumniService.unlinkSchool?.(id);
      if (res?.success) {
        setSchools((prev) => prev.filter((s) => s.id !== id));
        addSuccessNotification('School', 'School removed');
      }
    } catch { addErrorNotification('School', 'Failed to remove school'); }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const res = await alumniService.exportMyData?.({ format: exportFormat });
      if (!res?.success || !res.data?.url) {
        addErrorNotification('Export', res?.error || 'Export failed');
        return;
      }
      const link = document.createElement('a');
      link.href = res.data.url;
      link.download = res.data.filename || `career-connect-alumni-data.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(res.data.url), 1000);
      addSuccessNotification('Export', 'Your data download has started');
    } catch (error) { addErrorNotification('Export', error.message || 'Export failed'); }
    finally { setExporting(false); }
  };

  const handleDangerAction = async () => {
    if (confirmAction !== 'signOutCurrent') return;
    setDangerBusy(true);
    try {
      await logout();
      setConfirmAction(null);
      navigate('/login');
    } catch (error) {
      addErrorNotification('Sign out', error.message || 'Sign out failed');
    } finally { setDangerBusy(false); }
  };

  // ============================================================
  // Render
  // ============================================================
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px] animate-pulse space-y-4">
          <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
          <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
            <div className="h-96 rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-96 rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <button onClick={() => navigate('/alumni/dashboard')} className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-600">
                <FaArrowLeft /> Back to dashboard
              </button>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Alumni · Settings</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Account settings</h1>
              <p className="mt-1 text-sm text-slate-500">Manage your account, security, privacy, notifications, and data.</p>
            </div>
            <button onClick={() => setMobileMenu((v) => !v)} className="self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold lg:hidden dark:border-slate-700">
              <FaCog className="mr-1 inline" /> Menu
            </button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          {/* Sidebar nav */}
          <aside className={`${mobileMenu ? 'block' : 'hidden'} lg:block`}>
            <nav className="sticky top-4 space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              {SETTINGS_TABS.map((t) => {
                const Icon = t.icon;
                const isDanger = t.id === 'danger';
                return (
                  <button
                    key={t.id}
                    onClick={() => { setActiveTab(t.id); setMobileMenu(false); }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${activeTab === t.id ? (isDanger ? 'bg-red-50 text-red-600 dark:bg-red-900/30' : 'bg-brand-50 text-brand-700 dark:bg-brand-900/30') : isDanger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="flex-1">{t.label}</span>
                    <FaChevronRight className="h-3 w-3 opacity-50" />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content panel */}
          <div className="space-y-4">
            {/* ===== ACCOUNT ===== */}
            {activeTab === 'account' && (
              <>
                <Section title="Account information" subtitle="Your basic account details" icon={FaUserCog}>
                  <div className="mb-4 flex items-center gap-4">
                    {userProfile?.photoURL || userProfile?.profilePhoto || currentUser?.photoURL ? (
                      <img
                        src={userProfile?.photoURL || userProfile?.profilePhoto || currentUser?.photoURL}
                        alt={`${accountForm.displayName || 'Alumni'} profile`}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-200">
                        {(accountForm.displayName || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={uploadAvatar}
                        className="hidden"
                        aria-label="Choose profile photo"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <FaUpload /> {uploadingAvatar ? 'Uploading…' : 'Change profile photo'}
                      </button>
                      <p className="mt-1 text-[11px] text-slate-500">JPG, PNG, or WEBP, up to 5MB.</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Display name</label>
                      <input value={accountForm.displayName} onChange={(e) => setAccountForm((p) => ({ ...p, displayName: e.target.value.slice(0, 100) }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Email (read-only)</label>
                      <input value={accountForm.email} readOnly disabled className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Phone</label>
                      <input value={accountForm.phone} onChange={(e) => setAccountForm((p) => ({ ...p, phone: e.target.value.slice(0, 30) }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Language</label>
                      <select value={accountForm.language} onChange={(e) => setAccountForm((p) => ({ ...p, language: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                        {APPEARANCE_OPTIONS.languages.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button onClick={saveAccount} disabled={savingAccount} className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                      <FaSave /> {savingAccount ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </Section>

                <Section title="Session" subtitle="Sign out of this device" icon={FaSignOutAlt}>
                  <p className="text-sm text-slate-600 dark:text-slate-300">You are signed in as <strong>{safe(accountForm.email)}</strong>.</p>
                  <button onClick={() => setConfirmAction('signOutCurrent')} className="mt-3 flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700"><FaSignOutAlt /> Sign out of this device</button>
                </Section>
              </>
            )}

            {/* ===== SECURITY ===== */}
            {activeTab === 'security' && (
              <>
                <Section title="Change password" subtitle="Use a strong, unique password" icon={FaKey}>
                  <div className="space-y-3">
                    <PasswordField label="Current password" value={passwordForm.current} onChange={(v) => setPasswordForm((p) => ({ ...p, current: v }))} placeholder="Enter current password" />
                    <PasswordField label="New password" value={passwordForm.next} onChange={(v) => setPasswordForm((p) => ({ ...p, next: v }))} placeholder="At least 8 characters" showStrength />
                    <PasswordField label="Confirm new password" value={passwordForm.confirm} onChange={(v) => setPasswordForm((p) => ({ ...p, confirm: v }))} placeholder="Repeat new password" />
                    {passwordForm.confirm && passwordForm.next !== passwordForm.confirm && <p className="text-[11px] text-red-600">Passwords do not match</p>}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button onClick={changePassword} disabled={changingPassword || !passwordForm.current || passwordForm.next !== passwordForm.confirm || passwordForm.next.length < 8} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{changingPassword ? 'Updating…' : 'Update password'}</button>
                  </div>
                </Section>

                <Section title="Two-factor authentication" subtitle="Additional sign-in verification" icon={FaFingerprint} badge="Not configured">
                  <p className="text-xs text-slate-500">
                    Two-factor enrollment is not configured for this account yet. Use your identity provider’s security settings to review available sign-in protections.
                  </p>
                </Section>

                <Section title="Active sessions" subtitle="Devices currently signed in to your account" icon={FaWifi}>
                  <p className="text-xs text-slate-500">Per-device session management is not available yet. You can sign out of this device from the Account tab.</p>
                </Section>

                <Section title="Recent login history" subtitle="Last 10 login attempts" icon={FaClock}>
                  <p className="text-xs text-slate-500">Detailed login history is not available yet.</p>
                </Section>
              </>
            )}

            {/* ===== NOTIFICATIONS ===== */}
            {activeTab === 'notifications' && (
              <>
                <Section title="Delivery channels" subtitle="Choose how you receive notifications" icon={FaBell}>
                  {NOTIFICATION_CHANNELS.map((c) => (
                    <Toggle
                      key={c.key}
                      label={<span className="flex items-center gap-2"><c.icon className="h-3 w-3" /> {c.label}</span>}
                      description={c.description}
                      checked={!!notificationPrefs.channels[c.key]}
                      onChange={(v) => setNotificationPrefs((p) => ({ ...p, channels: { ...p.channels, [c.key]: v } }))}
                    />
                  ))}
                </Section>

                <Section title="Notification events" subtitle="Toggle what you want to be notified about" icon={FaEnvelope}>
                  {NOTIFICATION_EVENTS.map((e) => (
                    <Toggle
                      key={e.key}
                      label={e.label}
                      checked={!!notificationPrefs.events[e.key]}
                      onChange={(v) => setNotificationPrefs((p) => ({ ...p, events: { ...p.events, [e.key]: v } }))}
                    />
                  ))}
                </Section>

                <Section title="Quiet hours" subtitle="Pause notifications during specific times" icon={FaMoon}>
                  <Toggle label="Enable quiet hours" checked={notificationPrefs.quietHours.enabled} onChange={(v) => setNotificationPrefs((p) => ({ ...p, quietHours: { ...p.quietHours, enabled: v } }))} />
                  {notificationPrefs.quietHours.enabled && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">From</label>
                        <input type="time" value={notificationPrefs.quietHours.from} onChange={(e) => setNotificationPrefs((p) => ({ ...p, quietHours: { ...p.quietHours, from: e.target.value } }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">To</label>
                        <input type="time" value={notificationPrefs.quietHours.to} onChange={(e) => setNotificationPrefs((p) => ({ ...p, quietHours: { ...p.quietHours, to: e.target.value } }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                      </div>
                    </div>
                  )}
                </Section>

                <div className="flex justify-end">
                  <button onClick={saveNotifications} disabled={savingNotifications} className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    <FaSave /> {savingNotifications ? 'Saving…' : 'Save notification preferences'}
                  </button>
                </div>
              </>
            )}

            {/* ===== PRIVACY ===== */}
            {activeTab === 'privacy' && (
              <>
                <Section title="Profile visibility" subtitle="Control who can see your profile" icon={FaEye}>
                  {PRIVACY_OPTIONS.find((o) => o.key === 'profileVisibility').options.map((opt) => (
                    <Radio key={opt.value} name="profileVisibility" value={opt.value} checked={privacy.profileVisibility === opt.value} onChange={(v) => setPrivacy((p) => ({ ...p, profileVisibility: v }))} label={opt.label} />
                  ))}
                </Section>

                <Section title="Data sharing" subtitle="Control what appears on your profile" icon={FaUserShield}>
                  {PRIVACY_OPTIONS.filter((o) => o.options === undefined).map((opt) => (
                    <Toggle key={opt.key} label={opt.label} checked={!!privacy[opt.key]} onChange={(v) => setPrivacy((p) => ({ ...p, [opt.key]: v }))} />
                  ))}
                </Section>

                <div className="flex justify-end">
                  <button onClick={savePrivacy} disabled={savingPrivacy} className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    <FaSave /> {savingPrivacy ? 'Saving…' : 'Save privacy preferences'}
                  </button>
                </div>
              </>
            )}

            {/* ===== APPEARANCE ===== */}
            {activeTab === 'appearance' && (
              <>
                <Section title="Theme" subtitle="Choose your preferred color mode" icon={FaPalette}>
                  <div className="grid grid-cols-3 gap-2">
                    {APPEARANCE_OPTIONS.themes.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button key={t.id} onClick={() => setAppearance((p) => ({ ...p, theme: t.id }))} className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition ${appearance.theme === t.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'}`}>
                          <Icon className="h-5 w-5" />
                          <span className="text-xs font-semibold">{t.label}</span>
                          {appearance.theme === t.id && <FaCheck className="h-3 w-3 text-brand-600" />}
                        </button>
                      );
                    })}
                  </div>
                </Section>

                <Section title="Layout density" subtitle="Comfortable or compact spacing" icon={FaCog}>
                  {APPEARANCE_OPTIONS.density.map((d) => (
                    <Radio key={d.id} name="density" value={d.id} checked={appearance.density === d.id} onChange={(v) => setAppearance((p) => ({ ...p, density: v }))} label={d.label} />
                  ))}
                </Section>

                <Section title="Accessibility" subtitle="Adjust visual experience" icon={FaEye}>
                  <Toggle label="Reduced motion" description="Disable animations" checked={appearance.reducedMotion} onChange={(v) => setAppearance((p) => ({ ...p, reducedMotion: v }))} />
                  <Toggle label="High contrast" description="Increase color contrast" checked={appearance.highContrast} onChange={(v) => setAppearance((p) => ({ ...p, highContrast: v }))} />
                </Section>

                <div className="flex justify-end">
                  <button onClick={saveAppearance} disabled={savingAppearance} className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    <FaSave /> {savingAppearance ? 'Saving…' : 'Save appearance'}
                  </button>
                </div>
              </>
            )}

            {/* ===== SCHOOLS ===== */}
            {activeTab === 'schools' && (
              <>
                <Section title="My schools" subtitle="Schools you're linked to — verification takes 24-48 hours" icon={FaBookOpen}>
                  {loadingSchools ? (
                    <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}</div>
                  ) : schools.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
                      <FaGraduationCap className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                      <p className="text-xs text-slate-500">You haven't linked any schools yet.</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {schools.map((s) => (
                        <li key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700"><FaBookOpen className="h-4 w-4" /></span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{safe(s.name)}</p>
                            <p className="truncate text-[11px] text-slate-500">
                              {s.status === 'verified' ? <span className="text-emerald-600">✓ Verified</span> : s.status === 'pending' ? <span className="text-amber-600">⏳ Pending approval</span> : s.status === 'rejected' ? <span className="text-red-600">Rejected</span> : 'Unverified'}
                              {' · '}{safe(s.relationship || 'Alumni')}
                              {s.graduationYear && ` · Class of ${s.graduationYear}`}
                            </p>
                          </div>
                          {s.status !== 'pending' && (
                            <button onClick={() => unlinkSchool(s.id)} className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-500 hover:border-red-200 hover:text-red-600 dark:border-slate-700"><FaUnlink /></button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button onClick={() => setSchoolModal(true)} className="mt-3 flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white"><FaLink /> Link a school</button>
                </Section>

                {schoolModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
                    <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-base font-semibold">Link a school</h3>
                        <button onClick={() => setSchoolModal(false)} className="text-slate-400 hover:text-red-500" aria-label="Close"><FaTimes /></button>
                      </div>
                      <input value={schoolForm.name} onChange={(e) => setSchoolForm((p) => ({ ...p, name: e.target.value.slice(0, 200) }))} placeholder="School name" className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                      <input value={schoolForm.graduationYear} onChange={(e) => setSchoolForm((p) => ({ ...p, graduationYear: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="Graduation year (optional)" className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                      <select value={schoolForm.relationship} onChange={(e) => setSchoolForm((p) => ({ ...p, relationship: e.target.value }))} className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                        <option value="alumni">Alumni</option><option value="staff">Staff</option><option value="student">Student</option><option value="parent">Parent</option>
                      </select>
                      <label className="mb-3 flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                        <input type="checkbox" checked={schoolForm.consentAccepted} onChange={(e) => setSchoolForm((p) => ({ ...p, consentAccepted: e.target.checked }))} className="mt-0.5" />
                        <span>I consent to sharing this school information with the platform and relevant alumni network features. I understand I can revoke this consent at any time.</span>
                      </label>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSchoolModal(false)} className="rounded-lg border px-4 py-2 text-sm dark:border-slate-700">Cancel</button>
                        <button onClick={requestSchool} disabled={schoolSubmitting || !schoolForm.consentAccepted} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{schoolSubmitting ? 'Submitting…' : 'Request verification'}</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ===== PAYMENTS ===== */}
            {activeTab === 'payments' && (
              <>
                <Section title="Donation activity" subtitle="Review your gifts and their current status" icon={FaCreditCard}>
                  {donationHistory.length ? (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {donationHistory.slice(0, 8).map((donation) => (
                        <li key={donation.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {formatCurrency(Number(donation.amount) || 0)}
                              {donation.campaign ? ` · ${safe(donation.campaign)}` : ''}
                            </p>
                            <p className="text-xs text-slate-500">{donation.createdAt ? formatDate(donation.createdAt) : 'Date unavailable'}</p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">{safe(donation.status || (donation.isRecurring ? 'recurring' : 'recorded'))}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">No donation records are linked to this account yet.</p>
                  )}
                  <button type="button" onClick={() => navigate('/alumni/donations')} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">
                    <FaWallet /> View donations and give
                  </button>
                </Section>
                <Section title="Payment details" subtitle="Payment methods are handled by the donation checkout" icon={FaLock}>
                  <p className="text-xs text-slate-500">This account does not store card numbers or bank details. Add or update payment information only in the secure checkout when making a donation.</p>
                </Section>
              </>
            )}

            {/* ===== CONNECTED APPS ===== */}
            {activeTab === 'connected' && (
              <Section title="Connected sign-in providers" subtitle="Connect a provider to choose how you sign in" icon={FaLink}>
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg dark:bg-slate-800"><FaGoogle /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Google sign-in</p>
                    <p className="text-[11px] text-slate-500">{googleConnected ? 'Connected to this account' : 'Use Google as an additional sign-in method'}</p>
                  </div>
                  <button type="button" onClick={toggleGoogleConnection} disabled={googleLinkBusy} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                    {googleLinkBusy ? 'Please wait…' : googleConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">Calendar, LinkedIn, Facebook, Outlook, and Zoom permissions are not configured for this application.</p>
              </Section>
            )}

            {/* ===== DATA & EXPORT ===== */}
            {activeTab === 'data' && (
              <>
                <Section title="Your data" subtitle="Summary of data we hold about you" icon={FaInfoCircle}>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { label: 'Posts', value: dataSummary?.unavailable ? 'Unavailable' : dataSummary?.postsCount ?? 0 },
                      { label: 'Connections', value: dataSummary?.unavailable ? 'Unavailable' : dataSummary?.connectionsCount ?? 0 },
                      { label: 'Donations', value: dataSummary?.unavailable ? 'Unavailable' : dataSummary?.donationsCount ?? 0 },
                      { label: 'Stories', value: dataSummary?.unavailable ? 'Unavailable' : dataSummary?.storiesCount ?? 0 },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800">
                        <p className="text-lg font-bold">{s.value}</p>
                        <p className="text-[11px] text-slate-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Export your data" subtitle="Download a copy of your data (GDPR/CCPA)" icon={FaFileExport}>
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                      <option value="json">JSON</option><option value="csv">CSV</option>
                    </select>
                    <button onClick={exportData} disabled={exporting} className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><FaDownload /> {exporting ? 'Exporting…' : 'Request export'}</button>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">Your export is generated from your account data and downloaded to this device.</p>
                </Section>
              </>
            )}

            {/* ===== DANGER ZONE ===== */}
            {activeTab === 'danger' && (
              <>
                <Section title="Delete account permanently" subtitle="This action cannot be undone" icon={FaExclamationTriangle}>
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    <p className="font-semibold">Account deletion is handled by the support team.</p>
                    <p className="mt-1">Send a request from your account email. Support will verify your identity and explain how associated records are handled.</p>
                    <a
                      href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Alumni account deletion request')}&body=${encodeURIComponent(`Please help me delete my Career Connect Lesotho alumni account.\n\nAccount email: ${currentUser?.email || ''}\n`)}`}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-700"
                    >
                      <FaTrashAlt /> Email deletion request
                    </a>
                  </div>
                </Section>

                <Section title="Contact support" subtitle="Need help? Our team is here" icon={FaEnvelope}>
                  <p className="text-xs text-slate-500">Email us at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-600 underline" rel="noopener noreferrer">{SUPPORT_EMAIL}</a>.</p>
                </Section>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Global confirm dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction === 'signOutCurrent' ? 'Sign out of this device?' :
          'Confirm action'
        }
        message={
          confirmAction === 'signOutCurrent' ? 'You will be signed out on this device.' : ''
        }
        requirePassword={false}
        danger={confirmAction === 'deleteAccount'}
        busy={dangerBusy}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleDangerAction}
      />
    </main>
  );
};

export default AlumniSettings;
