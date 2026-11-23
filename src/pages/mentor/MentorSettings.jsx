import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  doc, getDoc, updateDoc, serverTimestamp, collection, addDoc,
  query, where, getDocs, deleteDoc, onSnapshot
} from 'firebase/firestore';
import {
  updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential
} from 'firebase/auth';
import { db, auth } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import {
  Settings, User, Lock, Bell, Shield, Globe, Key, Fingerprint,
  Mail, Phone, MapPin, Camera, Upload, Trash2, Save, X, Check,
  AlertCircle, Info, HelpCircle, Loader2, ChevronLeft, ChevronRight,
  ChevronDown, Eye, EyeOff, Plus, Download, RefreshCw, LogOut,
  Smartphone, Laptop, Monitor, Tablet, MapPin as MapPinIcon,
  Clock, Calendar, DollarSign, CreditCard, Wallet, Receipt,
  BellOff, BellRing, Volume2, VolumeX, Mail as MailIcon,
  MessageSquare, Video, Users, Briefcase, Building2, Award, Star,
  Trophy, Crown, Medal, Flame, Zap, Sparkles, Target, TrendingUp,
  BarChart3, Activity, Home, Menu, XCircle, CheckCircle, Ban,
  ShieldCheck, ShieldAlert, Fingerprint as FingerprintIcon,
  QrCode, ScanFace, Delete, Archive, Download as DownloadIcon,
  Upload as UploadIcon, RotateCcw, Sun, Moon, Cloud, UserX,
  UserMinus, LogIn, ExternalLink, Copy, Link as LinkIcon,
  FileText, FileCheck, ScrollText, BookOpen, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabaseMediaService } from '../../services/supabaseMediaService';

const cn = (...inputs) => twMerge(clsx(inputs));

// ============================================================================
// COMPONENTS
// ============================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
  </div>
);

const Avatar = ({ src, name, size = 'md' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg', '2xl': 'w-20 h-20 text-xl',
  };
  const initials = name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <div className="relative inline-block flex-shrink-0">
      {src ? (
        <img src={src} alt={name} className={cn('rounded-full object-cover', sizeClasses[size])}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
      ) : null}
      <div className={cn('rounded-full flex items-center justify-center font-semibold text-white bg-indigo-600',
        sizeClasses[size], src ? 'hidden' : '')}>
        {initials}
      </div>
    </div>
  );
};

const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, loading, className, ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base', xl: 'px-8 py-4 text-lg',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
        Icon ? <Icon className={cn('w-4 h-4', children && 'mr-2')} /> : null}
      {children}
    </button>
  );
};

const Card = ({ children, className }) => (
  <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200', className)}>
    {children}
  </div>
);

const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={cn(
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0',
      checked ? 'bg-indigo-600' : 'bg-gray-200',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    <span className={cn(
      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow',
      checked ? 'translate-x-6' : 'translate-x-1'
    )} />
  </button>
);

// ============================================================================
// SECTIONS
// ============================================================================

const ProfileSection = ({ profile, user, onSave }) => {
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || profile?.fullName || profile?.name || user?.displayName || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || user?.phoneNumber || '',
    bio: profile?.bio || '',
    headline: profile?.headline || profile?.title || '',
    location: profile?.location || '',
    website: profile?.website || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || profile.fullName || profile.name || user?.displayName || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || user?.phoneNumber || '',
        bio: profile.bio || '',
        headline: profile.headline || profile.title || '',
        location: profile.location || '',
        website: profile.website || '',
      });
    }
  }, [profile, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Personal Information</h3>
        <p className="text-sm text-gray-500">Update your personal details and how mentees see you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData((p) => ({ ...p, displayName: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
          <input
            type="text"
            value={formData.headline}
            onChange={(e) => setFormData((p) => ({ ...p, headline: e.target.value }))}
            placeholder="e.g., Senior Software Engineer at Google"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        <Button type="submit" loading={saving} icon={Save}>Save Changes</Button>
      </div>
    </form>
  );
};

const SecuritySection = ({ user, onPasswordChange }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false, new: false, confirm: false,
  });
  const [changing, setChanging] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setChanging(true);
    try {
      await onPasswordChange(formData.currentPassword, formData.newPassword);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setChanging(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Password & Security</h3>
        <p className="text-sm text-gray-500">Manage your password and account security.</p>
      </div>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => setFormData((p) => ({ ...p, currentPassword: e.target.value }))}
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => setFormData((p) => ({ ...p, newPassword: e.target.value }))}
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        <Button type="submit" loading={changing} icon={Lock}>Update Password</Button>
      </div>
    </form>
  );
};

const NotificationsSection = ({ preferences, onSave }) => {
  const [prefs, setPrefs] = useState(preferences || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences) setPrefs(preferences);
  }, [preferences]);

  const toggles = [
    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email', icon: Mail },
    { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser push notifications', icon: BellRing },
    { key: 'sessionReminders', label: 'Session Reminders', description: 'Reminders before scheduled sessions', icon: Clock },
    { key: 'newMenteeAlerts', label: 'New Mentee Alerts', description: 'When someone requests mentorship', icon: Users },
    { key: 'messageAlerts', label: 'Message Alerts', description: 'New messages from mentees', icon: MessageSquare },
    { key: 'reviewAlerts', label: 'Review Alerts', description: 'When mentees leave reviews', icon: Star },
    { key: 'paymentAlerts', label: 'Payment Alerts', description: 'Payment and payout notifications', icon: DollarSign },
    { key: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates and promotions', icon: Sparkles },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(prefs);
      toast.success('Notification preferences saved');
    } catch (e) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h3>
        <p className="text-sm text-gray-500">Control how and when you receive notifications.</p>
      </div>

      <div className="space-y-1">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <t.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{t.label}</p>
                <p className="text-xs text-gray-500">{t.description}</p>
              </div>
            </div>
            <Toggle
              checked={prefs[t.key] !== false}
              onChange={(v) => setPrefs((p) => ({ ...p, [t.key]: v }))}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        <Button loading={saving} icon={Save} onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  );
};

const PrivacySection = ({ profile, onSave }) => {
  const [settings, setSettings] = useState({
    profileVisibility: profile?.profileVisibility || 'public',
    showEmail: profile?.showEmail !== false,
    showPhone: profile?.showPhone || false,
    showLocation: profile?.showLocation !== false,
    allowDirectMessages: profile?.allowDirectMessages !== false,
    showOnlineStatus: profile?.showOnlineStatus !== false,
    allowMentorRequests: profile?.allowMentorRequests !== false,
    mediaVisibility: profile?.mediaVisibility || 'connections',
    messageConsent: profile?.messageConsent || 'connections',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(settings);
      toast.success('Privacy settings saved');
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Privacy Settings</h3>
        <p className="text-sm text-gray-500">Control who can see your information.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
        <select
          value={settings.profileVisibility}
          onChange={(e) => setSettings((p) => ({ ...p, profileVisibility: e.target.value }))}
          className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="public">Public - Anyone can see my profile</option>
          <option value="mentees_only">Mentees Only - Only my mentees</option>
          <option value="private">Private - Hidden from everyone</option>
        </select>
      </div>

      <div className="space-y-1">
        {[
          { key: 'showEmail', label: 'Show Email Address' },
          { key: 'showPhone', label: 'Show Phone Number' },
          { key: 'showLocation', label: 'Show Location' },
          { key: 'allowDirectMessages', label: 'Allow Direct Messages' },
          { key: 'showOnlineStatus', label: 'Show Online Status' },
          { key: 'allowMentorRequests', label: 'Allow New Mentor Requests' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50">
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
            <Toggle
              checked={settings[item.key]}
              onChange={(v) => setSettings((p) => ({ ...p, [item.key]: v }))}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Profile media visibility
          <select value={settings.mediaVisibility} onChange={(e) => setSettings((p) => ({ ...p, mediaVisibility: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="public">Anyone signed in</option><option value="connections">Accepted connections</option><option value="private">Only me</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">New message requests
          <select value={settings.messageConsent} onChange={(e) => setSettings((p) => ({ ...p, messageConsent: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="connections">Accepted connections only</option><option value="followers">Accepted connections and company followers</option><option value="nobody">No new conversations</option>
          </select>
        </label>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        <Button loading={saving} icon={Save} onClick={handleSave}>Save Privacy</Button>
      </div>
    </div>
  );
};

const SessionsSection = ({ profile, onSave }) => {
  const [settings, setSettings] = useState({
    defaultDuration: profile?.defaultDuration || 60,
    bufferMinutes: profile?.bufferMinutes || 15,
    autoConfirm: profile?.autoConfirm || false,
    allowCancellation: profile?.allowCancellation !== false,
    cancellationWindow: profile?.cancellationWindow || 24,
    sessionReminderMinutes: profile?.sessionReminderMinutes || 30,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(settings);
      toast.success('Session settings saved');
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Session Preferences</h3>
        <p className="text-sm text-gray-500">Configure your default session settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Session Duration</label>
          <select
            value={settings.defaultDuration}
            onChange={(e) => setSettings((p) => ({ ...p, defaultDuration: parseInt(e.target.value) }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Between Sessions</label>
          <select
            value={settings.bufferMinutes}
            onChange={(e) => setSettings((p) => ({ ...p, bufferMinutes: parseInt(e.target.value) }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={0}>None</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Reminder</label>
          <select
            value={settings.sessionReminderMinutes}
            onChange={(e) => setSettings((p) => ({ ...p, sessionReminderMinutes: parseInt(e.target.value) }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={15}>15 minutes before</option>
            <option value={30}>30 minutes before</option>
            <option value={60}>1 hour before</option>
            <option value={1440}>1 day before</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Window</label>
          <select
            value={settings.cancellationWindow}
            onChange={(e) => setSettings((p) => ({ ...p, cancellationWindow: parseInt(e.target.value) }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={12}>12 hours before</option>
            <option value={24}>24 hours before</option>
            <option value={48}>48 hours before</option>
            <option value={72}>72 hours before</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50">
          <div>
            <p className="text-sm font-medium text-gray-700">Auto-Confirm Bookings</p>
            <p className="text-xs text-gray-500">Automatically confirm new session bookings</p>
          </div>
          <Toggle
            checked={settings.autoConfirm}
            onChange={(v) => setSettings((p) => ({ ...p, autoConfirm: v }))}
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50">
          <div>
            <p className="text-sm font-medium text-gray-700">Allow Cancellations</p>
            <p className="text-xs text-gray-500">Let mentees cancel sessions</p>
          </div>
          <Toggle
            checked={settings.allowCancellation}
            onChange={(v) => setSettings((p) => ({ ...p, allowCancellation: v }))}
          />
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        <Button loading={saving} icon={Save} onClick={handleSave}>Save Session Settings</Button>
      </div>
    </div>
  );
};

const PayoutSection = ({ profile, onSave }) => {
  const [method, setMethod] = useState(profile?.payoutMethod || 'bank_transfer');
  const [details, setDetails] = useState({
    accountName: profile?.payoutDetails?.accountName || '',
    accountNumber: profile?.payoutDetails?.accountNumber || '',
    routingNumber: profile?.payoutDetails?.routingNumber || '',
    bankName: profile?.payoutDetails?.bankName || '',
    paypalEmail: profile?.payoutDetails?.paypalEmail || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ payoutMethod: method, payoutDetails: details });
      toast.success('Payout settings saved');
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const methods = [
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
    { value: 'paypal', label: 'PayPal', icon: DollarSign },
    { value: 'stripe', label: 'Stripe', icon: CreditCard },
    { value: 'wise', label: 'Wise', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Payout Settings</h3>
        <p className="text-sm text-gray-500">Configure how you receive your earnings.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payout Method</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {methods.map((m) => (
            <button key={m.value} type="button" onClick={() => setMethod(m.value)}
              className={cn(
                'flex flex-col items-center p-3 rounded-lg border-2 transition-all',
                method === m.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
              )}>
              <m.icon className={cn('w-5 h-5 mb-1', method === m.value ? 'text-indigo-600' : 'text-gray-500')} />
              <span className="text-xs font-medium text-gray-700">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {method === 'bank_transfer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
            <input type="text" value={details.accountName}
              onChange={(e) => setDetails((p) => ({ ...p, accountName: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <input type="text" value={details.bankName}
              onChange={(e) => setDetails((p) => ({ ...p, bankName: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input type="text" value={details.accountNumber}
              onChange={(e) => setDetails((p) => ({ ...p, accountNumber: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
            <input type="text" value={details.routingNumber}
              onChange={(e) => setDetails((p) => ({ ...p, routingNumber: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>
      )}

      {method === 'paypal' && (
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email</label>
          <input type="email" value={details.paypalEmail}
            onChange={(e) => setDetails((p) => ({ ...p, paypalEmail: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      )}

      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        <Button loading={saving} icon={Save} onClick={handleSave}>Save Payout Settings</Button>
      </div>
    </div>
  );
};

const DangerZone = ({ onDeactivate, onDelete }) => {
  const [confirmText, setConfirmText] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-red-600 mb-1">Danger Zone</h3>
        <p className="text-sm text-gray-500">Irreversible actions. Please proceed with caution.</p>
      </div>

      <div className="border border-red-200 rounded-lg p-5 bg-red-50">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Deactivate Account</h4>
            <p className="text-sm text-gray-600 mt-1">
              Temporarily disable your account. You can reactivate anytime.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onDeactivate}>Deactivate</Button>
        </div>
      </div>

      <div className="border border-red-300 rounded-lg p-5 bg-red-50">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Delete Account</h4>
            <p className="text-sm text-gray-600 mt-1">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setShowDelete(!showDelete)}>
            Delete Account
          </Button>
        </div>

        <AnimatePresence>
          {showDelete && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-red-200">
                <p className="text-sm text-red-700 mb-2">
                  Type <strong>DELETE MY ACCOUNT</strong> to confirm
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-2.5 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-3"
                />
                <Button
                  variant="danger"
                  disabled={confirmText !== 'DELETE MY ACCOUNT'}
                  onClick={onDelete}
                  icon={Trash2}
                >
                  Permanently Delete
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MentorSettings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const photoInputRef = useRef(null);

  const mentorId = user?.uid;

  // Load profile
  useEffect(() => {
    if (!mentorId) return;
    const unsub = onSnapshot(doc(db, 'mentors', mentorId), (snap) => {
      if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, [mentorId]);

  // Generic profile save
  const saveProfile = useCallback(async (updates) => {
    if (!mentorId) throw new Error('Not authenticated');
    await updateDoc(doc(db, 'mentors', mentorId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    if ('messageConsent' in updates || 'mediaVisibility' in updates || 'profileVisibility' in updates) {
      await updateDoc(doc(db, 'users', mentorId), {
        privacySettings: {
          ...(updates.privacySettings || {}),
          ...(updates.messageConsent ? { messageConsent: updates.messageConsent } : {}),
          ...(updates.mediaVisibility ? { mediaVisibility: updates.mediaVisibility } : {}),
          ...(updates.profileVisibility ? { profileVisibility: updates.profileVisibility } : {}),
        },
      });
    }

  }, [mentorId]);

  // Photo upload
  const handlePhotoUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !mentorId) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setPhotoUploading(true);
    setPhotoProgress(0);

    try {
      const uploaded = await supabaseMediaService.uploadImage(file, { folder: `mentor-profiles/${mentorId}` });
      const finalUrl = uploaded.url;

      await saveProfile({ photoURL: finalUrl, profilePhoto: finalUrl });
      toast.success('Profile photo updated');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
      setPhotoProgress(0);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  }, [mentorId, saveProfile]);

  // Password change
  const handlePasswordChange = useCallback(async (current, newPwd) => {
    if (!user?.email) throw new Error('No email on account');
    const cred = EmailAuthProvider.credential(user.email, current);
    await reauthenticateWithCredential(auth.currentUser, cred);
    await updatePassword(auth.currentUser, newPwd);
  }, [user]);

  const handleProfileSave = useCallback(async (updates) => {
    if (updates.email && updates.email !== user?.email) {
      if (!auth.currentUser) throw new Error('Your sign-in session has expired. Sign in again to change your email.');
      await updateEmail(auth.currentUser, updates.email);
    }
    await saveProfile({
      ...updates,
      ...(typeof updates.displayName === 'string' ? { fullName: updates.displayName } : {}),
      ...(typeof updates.headline === 'string' ? { title: updates.headline } : {}),
    });
  }, [saveProfile, user?.email]);

  // Deactivate account
  const handleDeactivate = useCallback(async () => {
    if (!window.confirm('Are you sure you want to deactivate your account?')) return;
    try {
      await saveProfile({ accountStatus: 'deactivated', deactivatedAt: serverTimestamp() });
      toast.success('Account deactivated');
    } catch (e) {
      toast.error('Failed to deactivate');
    }
  }, [saveProfile]);

  // Delete account
  const handleDelete = useCallback(async () => {
    try {
      await saveProfile({ accountStatus: 'deleted', deletedAt: serverTimestamp() });
      try {
        await supabase.from('mentor_profiles').delete().eq('firebase_id', mentorId);
      } catch (e) { console.warn('Supabase delete failed:', e); }
      toast.success('Account scheduled for deletion');
      await auth.signOut();
      navigate('/');
    } catch (e) {
      toast.error('Failed to delete account');
    }
  }, [mentorId, saveProfile, navigate]);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!user) { navigate('/login'); return null; }

  const sections = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Personal info & bio' },
    { id: 'security', label: 'Security', icon: Lock, description: 'Password & auth' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert preferences' },
    { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Who sees your data' },
    { id: 'sessions', label: 'Sessions', icon: Calendar, description: 'Session defaults' },
    { id: 'payout', label: 'Payout', icon: Wallet, description: 'Payment settings' },
    { id: 'danger', label: 'Danger Zone', icon: AlertCircle, description: 'Account actions' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/mentor/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar
                    src={profile?.photoURL || profile?.profilePhoto || user.photoURL}
                    name={profile?.displayName || profile?.fullName || profile?.name || user.displayName}
                    size="2xl"
                  />
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
                  >
                    {photoUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="mt-3 font-semibold text-gray-900">
                  {profile?.displayName || profile?.fullName || profile?.name || user.displayName}
                </p>
                <p className="text-sm text-gray-500">{profile?.email || user.email}</p>
                {photoUploading && photoProgress > 0 && (
                  <p className="text-xs text-indigo-600 mt-2">Uploading... {photoProgress}%</p>
                )}
              </div>
            </Card>

            <nav className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left',
                    activeSection === s.id
                      ? s.id === 'danger'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                  )}
                >
                  <s.icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-gray-500 truncate">{s.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card className="p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeSection === 'profile' && (
                    <ProfileSection profile={profile} user={user} onSave={handleProfileSave} />
                  )}
                  {activeSection === 'security' && (
                    <SecuritySection user={user} onPasswordChange={handlePasswordChange} />
                  )}
                  {activeSection === 'notifications' && (
                    <NotificationsSection
                      preferences={profile?.notificationPreferences}
                      onSave={(prefs) => saveProfile({ notificationPreferences: prefs })}
                    />
                  )}
                  {activeSection === 'privacy' && (
                    <PrivacySection profile={profile} onSave={saveProfile} />
                  )}
                  {activeSection === 'sessions' && (
                    <SessionsSection profile={profile} onSave={saveProfile} />
                  )}
                  {activeSection === 'payout' && (
                    <PayoutSection profile={profile} onSave={saveProfile} />
                  )}
                  {activeSection === 'danger' && (
                    <DangerZone onDeactivate={handleDeactivate} onDelete={handleDelete} />
                  )}
                </motion.div>
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorSettings;
