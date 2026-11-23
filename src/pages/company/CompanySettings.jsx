// src/pages/company/CompanySettings.jsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

// Only import icons that ACTUALLY exist and are USED
import {
  FaCog,
  FaBuilding,
  FaBell,
  FaShieldAlt,
  FaLock,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaMapMarkerAlt,
  FaPalette,
  FaMoon,
  FaSun,
  FaDesktop,
  FaMobile,
  FaCloud,
  FaSync,
  FaTrash,
  FaDownload,
  FaUpload,
  FaFileExport,
  FaClock,
  FaCalendarAlt,
  FaUsers,
  FaUserPlus,
  FaUserMinus,
  FaUserCog,
  FaUserEdit,
  FaUserLock,
  FaUserCheck,
  FaUserTimes,
  FaLink,
  FaCopy,
  FaCheck,
  FaTimes,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaSlidersH,
  FaLanguage,
  FaCreditCard,
  FaReceipt,
  FaFileInvoice,
  FaHistory,
  FaUndo,
  FaServer,
  FaDatabase,
  FaNetworkWired,
  FaBolt,
  FaChartLine,
  FaChartBar,
  FaPercentage,
  FaBusinessTime,
  FaBriefcase,
  FaStore,
  FaHandshake,
  FaAward,
  FaCrown,
  FaStar,
  FaHeart,
  FaPaperPlane,
  FaRegEye,
  FaRegEyeSlash,
  FaRegBell,
  FaRegEnvelope,
  FaRegClock,
  FaRegCalendarAlt,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaRegQuestionCircle,
  FaRegSmile,
  FaRegSave,
  FaRegTrashAlt,
  FaRegEdit,
  FaRegCopy,
  FaRegFileAlt,
  FaRegUser,
  FaRegBuilding,
  FaRegAddressCard,
  FaRegLightbulb,
  FaRegHandshake,
  FaHandsHelping,
  FaHandHoldingHeart,
  FaLeaf,
  FaSeedling,
  FaTree,
  FaHeartbeat,
  FaShieldVirus,
  FaVirus,
  FaVirusSlash,
  FaBrain,
  FaEye as FaEyeSolid,
  FaWheelchair,
  FaSyringe,
  FaPills,
  FaFirstAid,
  FaStethoscope,
  FaDna,
  FaMicroscope,
  FaFlask,
  FaAtom,
  FaRocket,
  FaSatellite,
  FaSatelliteDish,
  FaCompass,
  FaMap,
  FaMapMarked,
  FaMapPin,
  FaLocationArrow,
  FaDirections,
  FaRoute,
  FaCar,
  FaBus,
  FaTrain,
  FaShip,
  FaPlane,
  FaBicycle,
  FaTruck,
  FaAmbulance,
  FaFireExtinguisher,
  FaTaxi,
  FaGasPump,
  FaChargingStation,
  FaBatteryFull,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaPowerOff,
  FaSolarPanel,
  FaWind,
  FaWater,
  FaTint,
  FaFaucet,
  FaShower,
  FaBath,
  FaHotTub,
  FaSwimmer,
  FaDumbbell,
  FaRunning,
  FaWalking,
  FaBiking,
  FaHiking,
  FaSkiing,
  FaSnowboarding,
  FaSkating,
  FaBasketballBall,
  FaFootballBall,
  FaBaseballBall,
  FaVolleyballBall,
  FaGolfBall,
  FaTableTennis,
  FaBowlingBall,
  FaChess,
  FaDice,
  FaGamepad,
  FaPuzzlePiece,
  FaGhost,
  FaDragon,
  FaHatWizard,
  FaMagic,
  FaBroom,
  FaGlasses,
  FaTshirt,
  FaShoePrints,
  FaSocks,
  FaMitten,
  FaUserGraduate,
  FaUserMd,
  FaUserNurse,
  FaUserSecret,
  FaUserNinja,
  FaUserAstronaut,
} from 'react-icons/fa';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { db, auth } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { apiRequest } from '../../services/apiClient';

// ============================================
// CONSTANTS
// ============================================

const SETTINGS_TABS = [
  { id: 'general', label: 'General', icon: FaCog },
  { id: 'notifications', label: 'Notifications', icon: FaBell },
  { id: 'security', label: 'Security', icon: FaShieldAlt },
  { id: 'privacy', label: 'Privacy', icon: FaLock },
  { id: 'team', label: 'Team Access', icon: FaUsers },
  { id: 'billing', label: 'Billing', icon: FaCreditCard },
  { id: 'integrations', label: 'Integrations', icon: FaLink },
  { id: 'danger', label: 'Danger Zone', icon: FaExclamationTriangle },
];

const NOTIFICATION_TYPES = [
  { id: 'newApplication', label: 'New Applications', description: 'When a candidate applies to your job' },
  { id: 'applicationStatus', label: 'Application Status Changes', description: 'When application status changes' },
  { id: 'newMessage', label: 'New Messages', description: 'When you receive a new message' },
  { id: 'interviewReminder', label: 'Interview Reminders', description: 'Reminders for upcoming interviews' },
  { id: 'newFollower', label: 'New Followers', description: 'When someone follows your company' },
  { id: 'jobExpiring', label: 'Job Expiring', description: 'When a job posting is about to expire' },
  { id: 'weeklyDigest', label: 'Weekly Digest', description: 'Weekly summary of your company activity' },
  { id: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates and promotions' },
];

const TIMEZONES = [
  'Africa/Maseru',
  'Africa/Johannesburg',
  'Africa/Cairo',
  'Africa/Lagos',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Singapore',
  'Australia/Sydney',
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'st', label: 'Sesotho' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'zu', label: 'Zulu' },
  { code: 'xh', label: 'Xhosa' },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  const d = date instanceof Date ? date : date?.toDate?.() || new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
};

const timeAgo = (date) => {
  if (!date) return 'Never';
  const now = new Date();
  const past = date instanceof Date ? date : date?.toDate?.() || new Date(date);
  if (isNaN(past.getTime())) return 'Never';

  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(past);
};

// ============================================
// SUB-COMPONENTS
// ============================================

const ToggleSwitch = ({ checked, onChange, disabled = false, color = 'blue' }) => {
  const colorClasses = {
    blue: checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600',
    red: checked ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600',
    green: checked ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600',
  };

  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 ${
        colorClasses[color]
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          checked ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  );
};

const SettingCard = ({ title, description, children, icon: Icon }) => (
  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
    {(title || description) && (
      <div className="mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h4>
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
    )}
    {children}
  </div>
);

const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  showToggle,
  isVisible,
  onToggleVisibility,
  disabled,
  required,
}) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        type={showToggle ? (isVisible ? 'text' : 'password') : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${
          showToggle ? 'pr-12' : 'pr-4'
        } py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white placeholder-gray-400`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          tabIndex={-1}
        >
          {isVisible ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
        </button>
      )}
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, icon: Icon, disabled }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white appearance-none`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  type = 'button',
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    ghost: 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500',
    outline: 'bg-transparent border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <>
          <FaSpinner className="w-4 h-4 animate-spin" />
          {children}
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const CompanySettings = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { showNotification } = useNotification();
  const { theme, setTheme } = useTheme();

  const companyId = userProfile?.companyId || currentUser?.companyId || currentUser?.uid;
  const companyRole = String(userProfile?.companyRole || userProfile?.role || '').toLowerCase();
  const canManageCompanyTeam = ['company_admin', 'supervisor'].includes(companyRole);

  // State
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('recruiter');
  const [inviting, setInviting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState({});

  // Settings state
  const [settings, setSettings] = useState({
    // General
    language: 'en',
    timezone: 'Africa/Maseru',
    dateFormat: 'MM/DD/YYYY',
    theme: 'system',

    // Notifications
    notifications: {
      email: true,
      push: true,
      newApplication: true,
      applicationStatus: true,
      newMessage: true,
      interviewReminder: true,
      newFollower: true,
      jobExpiring: true,
      weeklyDigest: true,
      marketingEmails: false,
    },

    // Security
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,

    // Privacy
    profileVisibility: 'public',
    mediaVisibility: 'public',
    showContactInfo: true,
    showTeamMembers: true,
    allowMessages: 'everyone',

    // Preferences
    autoReplyEnabled: false,
    autoReplyMessage: '',
    defaultApplicationStatus: 'applied',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [settings]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && !saving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, saving]);

  // Load settings
  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        setLoading(true);

        // Load from Firebase
        const settingsDoc = await getDoc(doc(db, 'companySettings', companyId));

        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setSettings((prev) => ({
            ...prev,
            ...data,
            notifications: {
              ...prev.notifications,
              ...(data.notifications || {}),
            },
          }));
        }

        try {
          const members = await apiRequest('/api/company/team');
          setTeamMembers(Array.isArray(members) ? members : []);
        } catch (teamError) {
          setTeamMembers([]);
          if (teamError.status !== 403) console.error('Team list request failed:', teamError);
        }

        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('error', 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

  }, [companyId]);

  // ============================================
  // HANDLERS
  // ============================================

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const updateNestedSetting = useCallback((parentKey, childKey, value) => {
    setSettings((prev) => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value,
      },
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSaveSettings = async () => {
    if (!companyId) return;

    try {
      setSaving(true);
      setErrors({});

      const settingsToSave = {
        ...settings,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'companySettings', companyId), settingsToSave, { merge: true });

      // Sync to Supabase (non-blocking)
      try {
        await supabase.from('company_settings').upsert(
          {
            company_id: companyId,
            language: settings.language,
            timezone: settings.timezone,
            notifications: settings.notifications,
            privacy: {
              profileVisibility: settings.profileVisibility,
              showContactInfo: settings.showContactInfo,
              allowMessages: settings.allowMessages,
            },
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'company_id' }
        );
      } catch (supabaseError) {
        console.warn('Supabase sync failed:', supabaseError);
      }

      // Log activity
      try {
        await addDoc(collection(db, 'companyActivities'), {
          companyId,
          type: 'settings_updated',
          description: 'Company settings updated',
          createdAt: serverTimestamp(),
        });
      } catch (logError) {
        console.warn('Activity log failed:', logError);
      }

      showNotification('success', 'Settings saved successfully!');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = (key) => {
    updateNestedSetting('notifications', key, !settings.notifications[key]);
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and a number';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!currentUser) return;

    if (!validatePassword()) return;

    try {
      setSaving(true);

      // Reauthenticate
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordData.newPassword);

      // Log activity
      try {
        await addDoc(collection(db, 'securityLogs'), {
          userId: companyId,
          action: 'password_changed',
          timestamp: serverTimestamp(),
          ipAddress: 'hidden',
          userAgent: navigator.userAgent,
        });
      } catch (logError) {
        console.warn('Security log failed:', logError);
      }

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      showNotification('success', 'Password updated successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        setErrors({ currentPassword: 'Current password is incorrect' });
        showNotification('error', 'Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        setErrors({ newPassword: 'Password is too weak' });
        showNotification('error', 'Password is too weak');
      } else {
        showNotification('error', 'Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInviteTeamMember = async () => {
    if (!companyId) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      showNotification('error', 'Please enter a valid email address');
      return;
    }

    try {
      setInviting(true);

      await apiRequest('/api/company/team/invitations', {
        method: 'POST',
        body: { email: inviteEmail.toLowerCase().trim(), role: inviteRole },
      });
      const updatedMembers = await apiRequest('/api/company/team');
      setTeamMembers(Array.isArray(updatedMembers) ? updatedMembers : []);

      showNotification('success', `Invitation sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('recruiter');
    } catch (error) {
      console.error('Error inviting team member:', error);
      showNotification('error', 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveTeamMember = async (memberId) => {
    try {
      await apiRequest(`/api/company/team/${encodeURIComponent(memberId)}`, { method: 'DELETE' });
      setTeamMembers((members) => members.map((member) => member.id === memberId ? { ...member, status: 'revoked' } : member));
      showNotification('success', 'Team member removed');
    } catch (error) {
      console.error('Error removing team member:', error);
      showNotification('error', 'Failed to remove team member');
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      await apiRequest(`/api/company/team/${encodeURIComponent(memberId)}`, {
        method: 'PATCH',
        body: { role: newRole },
      });
      setTeamMembers((members) => members.map((member) => member.id === memberId ? { ...member, role: newRole } : member));
      showNotification('success', 'Role updated');
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification('error', 'Failed to update role');
    }
  };

  const handleDeleteAccount = async () => {
    showNotification('info', 'Contact platform support to request a company archive review.');
    setShowDeleteConfirm(false);
  };

  const handleExportData = async () => {
    try {
      showNotification('info', 'Preparing your data export...');

      const exportData = {
        settings,
        teamMembers,
        exportedAt: new Date().toISOString(),
        companyId,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `company-data-${companyId}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification('success', 'Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      showNotification('error', 'Failed to export data');
    }
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderGeneralTab = () => (
    <motion.div
      key="general"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          General Settings
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Customize your company account preferences
        </p>

        <div className="space-y-5">
          <SelectField
            label="Language"
            value={settings.language}
            onChange={(e) => updateSetting('language', e.target.value)}
            icon={FaLanguage}
            options={LANGUAGES.map((lang) => ({ value: lang.code, label: lang.label }))}
          />

          <SelectField
            label="Timezone"
            value={settings.timezone}
            onChange={(e) => updateSetting('timezone', e.target.value)}
            icon={FaGlobe}
            options={TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', icon: FaSun, label: 'Light' },
                { value: 'dark', icon: FaMoon, label: 'Dark' },
                { value: 'system', icon: FaDesktop, label: 'System' },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    updateSetting('theme', value);
                    setTheme(value);
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    settings.theme === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      settings.theme === value
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      settings.theme === value
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <SelectField
            label="Date Format"
            value={settings.dateFormat}
            onChange={(e) => updateSetting('dateFormat', e.target.value)}
            icon={FaCalendarAlt}
            options={[
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
            ]}
          />

          <SettingCard
            title="Auto-Reply Message"
            description="Automatically respond to new candidates"
            icon={FaRegFileAlt}
          >
            <textarea
              value={settings.autoReplyMessage}
              onChange={(e) => updateSetting('autoReplyMessage', e.target.value)}
              rows={3}
              placeholder="Thank you for your interest. We'll review your application..."
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            <div className="flex items-center gap-2 mt-3">
              <ToggleSwitch
                checked={settings.autoReplyEnabled}
                onChange={() => updateSetting('autoReplyEnabled', !settings.autoReplyEnabled)}
              />
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Enable auto-reply for new applications
              </label>
            </div>
          </SettingCard>
        </div>
      </div>
    </motion.div>
  );

  const renderNotificationsTab = () => (
    <motion.div
      key="notifications"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Notification Preferences
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Choose how and when you want to be notified
        </p>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Notification Channels
          </h4>
          <div className="space-y-3">
            {[
              { key: 'email', label: 'Email Notifications', icon: FaEnvelope, description: 'Receive updates via email' },
              { key: 'push', label: 'Push Notifications', icon: FaBell, description: 'Receive browser push notifications' },
            ].map(({ key, label, icon: Icon, description }) => (
              <SettingCard key={key}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.notifications[key]}
                    onChange={() => handleNotificationToggle(key)}
                  />
                </div>
              </SettingCard>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Notification Types
          </h4>
          <div className="space-y-2">
            {NOTIFICATION_TYPES.map(({ id, label, description }) => (
              <SettingCard key={id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                  </div>
                  <ToggleSwitch
                    checked={settings.notifications[id]}
                    onChange={() => handleNotificationToggle(id)}
                  />
                </div>
              </SettingCard>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSecurityTab = () => (
    <motion.div
      key="security"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Security Settings
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Keep your account secure with these settings
        </p>

        {/* Password Change */}
        <SettingCard title="Change Password" icon={FaUserLock}>
          <div className="space-y-3">
            <InputField
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              placeholder="Enter current password"
              showToggle
              isVisible={showPassword}
              onToggleVisibility={() => setShowPassword(!showPassword)}
              required
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>
            )}

            <InputField
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Enter new password"
              showToggle
              isVisible={showPassword}
              onToggleVisibility={() => setShowPassword(!showPassword)}
              required
            />
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
            )}

            <InputField
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              placeholder="Confirm new password"
              showToggle
              isVisible={showPassword}
              onToggleVisibility={() => setShowPassword(!showPassword)}
              required
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}

            <Button
              onClick={handlePasswordChange}
              disabled={
                saving ||
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword
              }
              loading={saving}
              icon={FaSave}
              variant="primary"
              size="md"
            >
              Update Password
            </Button>
          </div>
        </SettingCard>

        {/* Two Factor */}
        <div className="mt-6">
          <SettingCard
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            icon={FaShieldAlt}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    settings.twoFactorEnabled
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <FaShieldAlt
                    className={`w-4 h-4 ${
                      settings.twoFactorEnabled
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {settings.twoFactorEnabled
                      ? 'Your account is protected with 2FA'
                      : 'Enable 2FA for additional security'}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.twoFactorEnabled}
                onChange={() => updateSetting('twoFactorEnabled', !settings.twoFactorEnabled)}
              />
            </div>
          </SettingCard>
        </div>

        {/* Session Timeout */}
        <div className="mt-6">
          <SettingCard
            title="Session Timeout"
            description="Automatically log out after a period of inactivity"
            icon={FaClock}
          >
            <SelectField
              value={settings.sessionTimeout}
              onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
              options={[
                { value: 15, label: '15 minutes' },
                { value: 30, label: '30 minutes' },
                { value: 60, label: '1 hour' },
                { value: 120, label: '2 hours' },
                { value: 480, label: '8 hours' },
              ]}
            />
          </SettingCard>
        </div>

        {/* Login Notifications */}
        <div className="mt-6">
          <SettingCard
            title="Login Notifications"
            description="Get notified when someone logs into your account"
            icon={FaRegBell}
          >
            <ToggleSwitch
              checked={settings.loginNotifications}
              onChange={() => updateSetting('loginNotifications', !settings.loginNotifications)}
            />
          </SettingCard>
        </div>
      </div>
    </motion.div>
  );

  const renderPrivacyTab = () => (
    <motion.div
      key="privacy"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Privacy Settings
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Control who can see your company information
        </p>

        <div className="space-y-4">
          <SettingCard
            title="Profile Visibility"
            description="Control who can see your company profile"
            icon={FaEyeSolid}
          >
            <SelectField
              value={settings.profileVisibility}
              onChange={(e) => updateSetting('profileVisibility', e.target.value)}
              options={[
                { value: 'public', label: 'Public - Everyone can view' },
                { value: 'registered', label: 'Registered Users Only' },
                { value: 'private', label: 'Private - Hidden from search' },
              ]}
            />
          </SettingCard>

          <SettingCard
            title="Who can message you"
            description="Control who can send you direct messages"
            icon={FaEnvelope}
          >
            <SelectField
              value={settings.allowMessages}
              onChange={(e) => updateSetting('allowMessages', e.target.value)}
              options={[
                { value: 'everyone', label: 'Everyone' },
                { value: 'candidates', label: 'Candidates Only' },
                { value: 'team', label: 'Team Members Only' },
              ]}
            />
          </SettingCard>

          <SettingCard
            title="Profile media visibility"
            description="Choose who can view media in your company posts. Restricted settings also limit post visibility."
            icon={FaEye}
          >
            <SelectField
              value={settings.mediaVisibility || 'public'}
              onChange={(e) => updateSetting('mediaVisibility', e.target.value)}
              options={[
                { value: 'public', label: 'Anyone signed in' },
                { value: 'connections', label: 'Accepted connections' },
                { value: 'private', label: 'Only the company account' },
              ]}
            />
          </SettingCard>

          <SettingCard
            title="Show Contact Information"
            description="Display email and phone on your public profile"
            icon={FaPhone}
          >
            <ToggleSwitch
              checked={settings.showContactInfo}
              onChange={() => updateSetting('showContactInfo', !settings.showContactInfo)}
            />
          </SettingCard>

          <SettingCard
            title="Show Team Members"
            description="Display your team members on your public profile"
            icon={FaUsers}
          >
            <ToggleSwitch
              checked={settings.showTeamMembers}
              onChange={() => updateSetting('showTeamMembers', !settings.showTeamMembers)}
            />
          </SettingCard>
        </div>
      </div>
    </motion.div>
  );

  const renderTeamTab = () => (
    <motion.div
      key="team"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Access</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage who has access to your company account
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          icon={FaUserPlus}
          variant="primary"
          size="md"
        >
          Invite Member
        </Button>
      </div>

      {teamMembers.length > 0 ? (
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {member.email?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {member.name || member.email}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}
                    >
                      {member.status === 'pending' ? 'Pending' : 'Active'}
                    </span>
                    {member.invitedAt && (
                      <span className="text-xs text-gray-400">
                        {timeAgo(member.invitedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {['company_admin', 'supervisor'].includes(member.role) ? (
                  <span className="text-sm text-gray-500">{member.role.replace('_', ' ')}</span>
                ) : <select
                  value={member.role}
                  onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="manager">Manager</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="interviewer">Interviewer</option>
                  <option value="viewer">Viewer</option>
                </select>}
                {!['company_admin', 'supervisor'].includes(member.role) && <button
                  onClick={() => handleRemoveTeamMember(member.id)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Remove member"
                >
                  <FaTrashAlt className="w-4 h-4" />
                </button>}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <FaUsers className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No team members yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            Invite colleagues to collaborate on hiring
          </p>
          <Button
            onClick={() => setShowInviteModal(true)}
            icon={FaUserPlus}
            variant="primary"
            size="md"
          >
            Invite Your First Team Member
          </Button>
        </div>
      )}
    </motion.div>
  );

  const renderBillingTab = () => (
    <motion.div
      key="billing"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Billing & Subscription
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Manage your subscription and payment methods
        </p>

        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-6 text-sm text-gray-600 dark:text-gray-300">
          Billing records are not available for this company account yet.
        </div>
      </div>
    </motion.div>
  );

  const renderIntegrationsTab = () => (
    <motion.div
      key="integrations"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Integrations
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Connect your favorite tools to streamline your workflow
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'Google Calendar',
              description: 'Sync interviews with Google Calendar',
              connected: false,
              icon: FaCalendarAlt,
              color: 'blue',
            },
            {
              name: 'Slack',
              description: 'Get notifications in Slack',
              connected: false,
              icon: FaBell,
              color: 'purple',
            },
            {
              name: 'Zoom',
              description: 'Schedule Zoom meetings for interviews',
              connected: true,
              icon: FaCloud,
              color: 'blue',
            },
            {
              name: 'LinkedIn',
              description: 'Import candidates from LinkedIn',
              connected: false,
              icon: FaLink,
              color: 'blue',
            },
          ].map((integration, index) => (
            <SettingCard key={index}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                    <integration.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {integration.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{integration.description}</p>
                  </div>
                </div>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    integration.connected
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {integration.connected ? (
                    <span className="flex items-center gap-1">
                      <FaCheck className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </SettingCard>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderDangerTab = () => (
    <motion.div
      key="danger"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-red-600 mb-1">Danger Zone</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          These actions are irreversible. Please be certain before proceeding.
        </p>

        <div className="space-y-4">
          <div className="p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Export Data</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Download all your company data as a JSON file
                </p>
              </div>
              <Button
                onClick={handleExportData}
                variant="warning"
                size="md"
                icon={FaDownload}
                className="flex-shrink-0"
              >
                Export
              </Button>
            </div>
          </div>

          <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Delete Account</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Permanently delete your company account and all associated data
                </p>
              </div>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="danger"
                size="md"
                icon={FaTrashAlt}
                className="flex-shrink-0"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="lg:col-span-3 h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <FaCog className="w-6 h-6 text-blue-600" />
              </div>
              Settings
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Manage your company account settings and preferences
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium"
              >
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Unsaved changes
              </motion.span>
            )}
            <Button
              onClick={handleSaveSettings}
              disabled={saving || !hasUnsavedChanges}
              loading={saving}
              icon={FaSave}
              variant="primary"
              size="md"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-6">
              {SETTINGS_TABS.filter((tab) => tab.id !== 'team' || canManageCompanyTeam).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                  } ${
                    tab.id === 'danger'
                      ? activeTab === tab.id
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300'
                      : ''
                  }`}
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[500px]">
              <AnimatePresence mode="wait">
                {activeTab === 'general' && renderGeneralTab()}
                {activeTab === 'notifications' && renderNotificationsTab()}
                {activeTab === 'security' && renderSecurityTab()}
                {activeTab === 'privacy' && renderPrivacyTab()}
                {activeTab === 'team' && renderTeamTab()}
                {activeTab === 'billing' && renderBillingTab()}
                {activeTab === 'integrations' && renderIntegrationsTab()}
                {activeTab === 'danger' && renderDangerTab()}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <FaUserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Invite Team Member
                </h3>
              </div>

              <div className="space-y-4">
                <InputField
                  label="Email Address"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  icon={FaEnvelope}
                  required
                />

                <SelectField
                  label="Role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  options={[
                    { value: 'manager', label: 'Manager - Manage jobs & applications' },
                    { value: 'recruiter', label: 'Recruiter - Manage applications' },
                    { value: 'interviewer', label: 'Interviewer - Conduct interviews' },
                    { value: 'viewer', label: 'Viewer - Read-only access' },
                  ]}
                />

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                    <FaInfoCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>
                      They'll receive an email invitation with instructions to join your team.
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                  }}
                  variant="secondary"
                  size="md"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteTeamMember}
                  disabled={inviting || !inviteEmail.trim()}
                  loading={inviting}
                  icon={FaPaperPlane}
                  variant="primary"
                  size="md"
                  className="flex-1"
                >
                  Send Invite
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Company archive is controlled by platform super administrators. */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Request Company Archive
                  </h3>
                  <p className="text-sm text-gray-500">A platform administrator must review this request.</p>
                </div>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Company accounts cannot delete themselves. Contact platform support to request an archive review.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                  }}
                  variant="secondary"
                  size="md"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  variant="danger"
                  size="md"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanySettings;
