import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaBell, FaCamera, FaCheckCircle, FaClock, FaCrown, FaEdit, FaEnvelope, FaGlobe, FaKey, FaMapMarkerAlt, FaPhone, FaSave, FaShieldAlt, FaSync, FaTimes, FaTimesCircle, FaTrash, FaUndo, FaUpload, FaUser, FaUserShield } from "react-icons/fa";

import AdminPageShell from '../../components/admin/AdminPageShell';
import Button from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import adminService from '../../services/adminService';
import cloudinaryService from '../../services/cloudinaryService';

const AdminProfile = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    location: '',
    website: '',
    photoURL: '',
    role: 'admin',
    timezone: 'Africa/Maseru',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    twoFactorEnabled: false,
  });
  const [stats, setStats] = useState({
    actionsPerformed: 0,
    lastLogin: null,
    accountCreated: null,
    loginCount: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const isSuperAdmin = useMemo(() => {
    const email = String(currentUser?.email || '').toLowerCase();
    const ownerEmail = String(import.meta.env.VITE_SUPER_ADMIN_EMAIL || '').toLowerCase();
    return (
      userProfile?.role === 'super_admin' ||
      userProfile?.adminLevel === 'super_admin' ||
      (ownerEmail && ownerEmail === email)
    );
  }, [currentUser?.email, userProfile?.role, userProfile?.adminLevel]);

  const loadProfile = useCallback(async () => {
    if (!isAdmin || !currentUser) return;
    setLoading(true);
    setError('');

    try {
      const [profileRes, activityRes] = await Promise.all([
        adminService.profile.getAdminProfile(currentUser.uid),
        adminService.profile.getAdminActivity(currentUser.uid, 10),
      ]);

      if (profileRes.success) {
        setProfile((prev) => ({ ...prev, ...profileRes.data }));
        setStats(profileRes.data.stats || {});
      } else {
        setProfile((prev) => ({
          ...prev,
          displayName: userProfile?.displayName || '',
          email: currentUser?.email || '',
          phoneNumber: userProfile?.phoneNumber || '',
          photoURL: userProfile?.photoURL || '',
          role: userProfile?.role || 'admin',
        }));
      }

      if (activityRes.success) {
        setRecentActivity(activityRes.data.activities || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, currentUser, userProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await adminService.profile.updateAdminProfile(
        currentUser.uid,
        profile,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Profile updated successfully');
        await loadProfile();
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      addErrorNotification('Error', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addErrorNotification('Validation', 'Image must be smaller than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      addErrorNotification('Validation', 'Only image files are allowed');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadResult = await cloudinaryService.uploadToCloudinary(
        file,
        'career-connect/admins/profiles',
        {
          tags: ['admin', 'profile', 'avatar'],
          context: `user_id=${currentUser.uid}|role=${profile.role}`,
          onProgress: (progress) => setUploadProgress(progress),
        }
      );

      if (uploadResult.success) {
        const updateRes = await adminService.profile.updateAdminPhoto(
          currentUser.uid,
          {
            url: uploadResult.url,
            publicId: uploadResult.public_id,
            provider: 'cloudinary',
          },
          currentUser,
          userProfile
        );

        if (updateRes.success) {
          setProfile((prev) => ({ ...prev, photoURL: uploadResult.url }));
          addSuccessNotification('Success', 'Profile photo updated');
          setShowPhotoModal(false);
          await loadProfile();
        } else {
          throw new Error(updateRes.error || 'Failed to save photo');
        }
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      addErrorNotification('Error', err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!profile.photoURL) return;
    setUploading(true);

    try {
      const response = await adminService.profile.removeAdminPhoto(
        currentUser.uid,
        currentUser,
        userProfile
      );

      if (response.success) {
        setProfile((prev) => ({ ...prev, photoURL: '' }));
        addSuccessNotification('Success', 'Profile photo removed');
        setShowPhotoModal(false);
        await loadProfile();
      } else {
        throw new Error(response.error || 'Failed to remove photo');
      }
    } catch (err) {
      console.error('Error removing photo:', err);
      addErrorNotification('Error', err.message || 'Failed to remove photo');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      addErrorNotification('Validation', 'All fields are required');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addErrorNotification('Validation', 'Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      addErrorNotification('Validation', 'Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const response = await adminService.profile.changeAdminPassword(
        currentUser.uid,
        passwordForm.currentPassword,
        passwordForm.newPassword,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Password changed successfully');
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw new Error(response.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      addErrorNotification('Error', err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      addErrorNotification('Validation', 'Please type DELETE to confirm');
      return;
    }

    setSaving(true);
    try {
      const response = await adminService.profile.deleteAdminAccount(
        currentUser.uid,
        currentUser,
        userProfile
      );

      if (response.success) {
        addSuccessNotification('Success', 'Account deleted');
        window.location.href = '/login';
      } else {
        throw new Error(response.error || 'Failed to delete account');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      addErrorNotification('Error', err.message || 'Failed to delete account');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelative = (value) => {
    if (!value) return 'Never';
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return formatDate(value);
  };

  if (!isAdmin) {
    return (
      <AdminPageShell
        title="Admin Profile"
        description="Access denied"
        icon={FaUser}
      >
        <Card>
          <CardBody>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              <FaTimesCircle className="mb-3 h-10 w-10" />
              <h2 className="text-xl font-semibold">Access Denied</h2>
              <p className="mt-1 text-sm">You must be an administrator to access this page.</p>
            </div>
          </CardBody>
        </Card>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Admin Profile"
      description="Manage your administrator account, preferences, and security"
      icon={FaUser}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveProfile} disabled={saving}>
            <FaSave className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Profile Information
              </h2>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
                  <p className="mt-3 text-sm text-slate-500">Loading profile...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="relative">
                      <div
                        className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-3xl font-bold ${
                          isSuperAdmin
                            ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white'
                            : 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
                        }`}
                      >
                        {profile.photoURL ? (
                          <img
                            src={profile.photoURL}
                            alt={profile.displayName}
                            className="h-24 w-24 rounded-full object-cover"
                          />
                        ) : (
                          (profile.displayName || 'A')[0].toUpperCase()
                        )}
                      </div>
                      {isSuperAdmin && (
                        <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg">
                          <FaCrown className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                          {profile.displayName || 'Administrator'}
                        </h3>
                        <p className="flex items-center gap-1 text-sm text-slate-500">
                          <FaEnvelope className="h-3 w-3" />
                          {profile.email || currentUser?.email}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                            isSuperAdmin
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-brand-100 text-brand-700'
                          }`}
                        >
                          {isSuperAdmin ? <FaCrown /> : <FaUserShield />}
                          {isSuperAdmin ? 'Super Admin' : 'Admin'}
                        </span>
                        <button
                          onClick={() => setShowPhotoModal(true)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-700"
                        >
                          <FaCamera className="h-3 w-3" />
                          Change Photo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profile.displayName || ''}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, displayName: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email || ''}
                        disabled
                        className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Contact super admin to change email
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phoneNumber || ''}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, phoneNumber: e.target.value }))
                        }
                        placeholder="+266 1234 5678"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profile.location || ''}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, location: e.target.value }))
                        }
                        placeholder="Maseru, Lesotho"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profile.website || ''}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, website: e.target.value }))
                        }
                        placeholder="https://yourwebsite.com"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Bio
                      </label>
                      <textarea
                        value={profile.bio || ''}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, bio: e.target.value }))
                        }
                        rows={4}
                        maxLength={500}
                        placeholder="Tell us a bit about yourself..."
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        {profile.bio?.length || 0}/500 characters
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Preferences
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Timezone
                    </label>
                    <select
                      value={profile.timezone || 'Africa/Maseru'}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, timezone: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="Africa/Maseru">Africa/Maseru (GMT+2)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Language
                    </label>
                    <select
                      value={profile.language || 'en'}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, language: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="en">English</option>
                      <option value="st">Sesotho</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Email Notifications
                    </p>
                    <p className="text-xs text-slate-500">
                      Receive email updates about approvals and activity
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.emailNotifications || false}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, emailNotifications: e.target.checked }))
                    }
                    className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </label>

                <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Push Notifications
                    </p>
                    <p className="text-xs text-slate-500">Real-time browser notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.pushNotifications || false}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, pushNotifications: e.target.checked }))
                    }
                    className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </label>
              </div>
            </CardBody>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Security
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                      <FaKey />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Password
                      </p>
                      <p className="text-xs text-slate-500">Last changed recently</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change Password
                  </Button>
                </div>

                <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        profile.twoFactorEnabled
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <FaShieldAlt />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-slate-500">
                        {profile.twoFactorEnabled
                          ? 'Enabled — your account is extra secure'
                          : 'Not enabled — add an extra layer of security'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={profile.twoFactorEnabled ? 'outline' : 'primary'}
                    size="sm"
                    onClick={async () => {
                      try {
                        const res = await adminService.profile.toggle2FA(
                          currentUser.uid,
                          !profile.twoFactorEnabled,
                          currentUser,
                          userProfile
                        );
                        if (res.success) {
                          setProfile((prev) => ({
                            ...prev,
                            twoFactorEnabled: !prev.twoFactorEnabled,
                          }));
                          addSuccessNotification(
                            'Success',
                            `2FA ${!profile.twoFactorEnabled ? 'enabled' : 'disabled'}`
                          );
                        }
                      } catch (err) {
                        addErrorNotification('Error', 'Failed to toggle 2FA');
                      }
                    }}
                  >
                    {profile.twoFactorEnabled ? 'Disable' : 'Enable 2FA'}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Account Stats */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Account Stats
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Actions Performed</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {stats.actionsPerformed || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Login Count</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {stats.loginCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-300">Last Login</span>
                  <span className="text-xs text-slate-500">
                    {formatRelative(stats.lastLogin)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Account Created</span>
                  <span className="text-xs text-slate-500">
                    {formatDate(stats.accountCreated)}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Recent Activity
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              {recentActivity.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No recent activity yet
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-200">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatRelative(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Danger Zone */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowDangerModal(true)}
                >
                  <FaTrash className="mr-2" /> Delete Account
                </Button>
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>

      {/* Photo Modal */}
      <Modal
        isOpen={showPhotoModal}
        onClose={() => {
          setShowPhotoModal(false);
          setUploadProgress(0);
        }}
        title="Change Profile Photo"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div
              className={`flex h-32 w-32 items-center justify-center overflow-hidden rounded-full text-4xl font-bold ${
                isSuperAdmin
                  ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white'
                  : 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
              }`}
            >
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="h-32 w-32 rounded-full object-cover"
                />
              ) : (
                (profile.displayName || 'A')[0].toUpperCase()
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {uploading && uploadProgress > 0 && (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">Uploading...</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <FaUpload className="mr-2" />
              {uploading ? 'Uploading...' : 'Upload New Photo'}
            </Button>
            {profile.photoURL && (
              <Button variant="danger" onClick={handleRemovePhoto} disabled={uploading}>
                <FaTrash className="mr-2" /> Remove Photo
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-slate-500">
            JPG, PNG or GIF. Max 5MB. Powered by Cloudinary.
          </p>
        </div>
      </Modal>

      {/* Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }}
        title="Change Password"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Current Password *
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              New Password *
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
            <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Confirm New Password *
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowPasswordModal(false);
              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleChangePassword} disabled={saving}>
            {saving ? 'Changing...' : 'Change Password'}
          </Button>
        </div>
      </Modal>

      {/* Danger Modal */}
      <Modal
        isOpen={showDangerModal}
        onClose={() => {
          setShowDangerModal(false);
          setDeleteConfirmText('');
        }}
        title="Delete Account"
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <FaTimesCircle className="mb-2 h-6 w-6" />
          <strong>Warning:</strong> This action is permanent and cannot be undone. All your data,
          settings, and history will be permanently deleted.
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          To confirm, please type <strong className="text-red-600">DELETE</strong> in the box
          below:
        </p>
        <input
          type="text"
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          placeholder="Type DELETE to confirm"
          className="mt-2 w-full rounded-lg border border-red-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-red-800 dark:bg-slate-800"
        />
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowDangerModal(false);
              setDeleteConfirmText('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={saving || deleteConfirmText !== 'DELETE'}
          >
            {saving ? 'Deleting...' : 'Delete My Account'}
          </Button>
        </div>
      </Modal>
    </AdminPageShell>
  );
};

export default AdminProfile;