import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiBell,
  FiCamera,
  FiCheck,
  FiEye,
  FiLock,
  FiMoon,
  FiRefreshCw,
  FiSave,
  FiShield,
  FiSliders,
  FiSun,
  FiUser,
} from 'react-icons/fi';
import { updateProfile } from 'firebase/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { THEMES, useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import settingsService from '../../services/settingsService';

const SETTINGS_SECTIONS = {
  PROFILE: "profile",
  SECURITY: "security",
  NOTIFICATIONS: "notifications",
  APPEARANCE: "appearance",
  PRIVACY: "privacy",
};

const getProfileCollectionForUserType = (userType) => {
  switch (userType) {
    case "admin":
      return "admins";
    case "student":
      return "students";
    case "company":
      return "companies";
    case "institute":
      return "institutes";
    case "mentor":
      return "mentors";
    case "youth":
      return "youth";
    case "entrepreneur":
      return "entrepreneurs";
    case "parent":
      return "parents";
    case "alumni":
      return "alumni";
    default:
      return "students";
  }
};

const formatInitials = (fullName) => {
  if (!fullName) return "CC";
  const parts = fullName.split(" ").filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "CC"
  );
};

const StudentSettings = () => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { addSuccessNotification, addErrorNotification } = useNotification();
  const fileInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState(SETTINGS_SECTIONS.PROFILE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    profilePhoto: "",
    profileVisible: true,
    emailAlerts: true,
    pushAlerts: true,
    marketing: false,
    themePreference: THEMES.SYSTEM,
    twoFactorEnabled: false,
    loginAlerts: true,
    dataSharing: true,
    mediaVisibility: 'connections',
    messageConsent: 'connections',
    darkMode: theme === "dark",
  });

  const userType = useMemo(
    () => userProfile?.userType || userProfile?.role || "student",
    [userProfile],
  );

  useEffect(() => {
    if (!currentUser) return undefined;

    let isMounted = true;

    const syncSettings = (profile = {}) => {
      if (!isMounted) return;

      const baseName =
        profile?.fullName ||
        profile?.displayName ||
        profile?.companyName ||
        profile?.instituteName ||
        userProfile?.fullName ||
        currentUser?.displayName ||
        currentUser?.email?.split('@')[0] ||
        'Career Connect User';

      const addressCity = profile?.address?.city || userProfile?.address?.city || '';
      const addressCountry = profile?.address?.country || userProfile?.address?.country || '';

      setFormData((prev) => ({
        ...prev,
        fullName: baseName,
        email: profile?.email || currentUser?.email || userProfile?.email || '',
        phone: profile?.phone || profile?.contactNumber || currentUser?.phoneNumber || '',
        location: (typeof profile?.location === 'string' ? profile.location : '') || addressCity || [addressCity, addressCountry].filter(Boolean).join(', ') || '',
        bio: profile?.bio || profile?.description || '',
        profilePhoto:
          profile?.photoURL ||
          profile?.profilePhoto ||
          profile?.logo ||
          currentUser?.photoURL ||
          userProfile?.photoURL ||
          '',
        profileVisible: profile?.privacy?.showProfile ?? profile?.profileVisible ?? true,
        emailAlerts: profile?.notifications?.email ?? profile?.emailAlerts ?? true,
        pushAlerts: profile?.notifications?.push ?? profile?.pushAlerts ?? true,
        marketing: profile?.notifications?.marketing ?? profile?.marketing ?? false,
        loginAlerts: profile?.security?.loginAlerts ?? profile?.loginAlerts ?? true,
        twoFactorEnabled: profile?.security?.twoFactorEnabled ?? profile?.twoFactorEnabled ?? false,
        dataSharing: profile?.privacy?.dataSharing ?? true,
        mediaVisibility: profile?.privacySettings?.mediaVisibility || profile?.privacy?.mediaVisibility || 'connections',
        messageConsent: profile?.privacySettings?.messageConsent || profile?.privacy?.messageConsent || 'connections',
        themePreference: profile?.preferences?.theme || theme || THEMES.SYSTEM,
        darkMode: theme === 'dark',
      }));
    };

    (async () => {
      const result = await settingsService.getUserSettings(currentUser.uid, userType);
      if (result.success) syncSettings(result.data);
    })();

    const unsubscribe = settingsService.watchUserSettings(currentUser.uid, userType, syncSettings);

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser, userProfile, userType, theme]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const persistSettings = async (nextSettings = formData) => {
    if (!currentUser) {
      throw new Error('No authenticated user found.');
    }

    const profileUpdate = {
      fullName: nextSettings.fullName,
      displayName: nextSettings.fullName,
      email: currentUser.email || '',
      phone: nextSettings.phone || '',
      location: nextSettings.location || '',
      bio: nextSettings.bio || '',
      photoURL: nextSettings.profilePhoto || currentUser.photoURL || '',
      profilePhoto: nextSettings.profilePhoto || currentUser.photoURL || '',
      logo: nextSettings.profilePhoto || currentUser.photoURL || '',
      privacy: {
        showProfile: nextSettings.profileVisible,
        dataSharing: nextSettings.dataSharing,
        mediaVisibility: nextSettings.mediaVisibility,
        messageConsent: nextSettings.messageConsent,
      },
      preferences: {
        profileVisible: nextSettings.profileVisible,
        emailAlerts: nextSettings.emailAlerts,
        pushAlerts: nextSettings.pushAlerts,
        marketing: nextSettings.marketing,
        theme: nextSettings.themePreference || theme || THEMES.SYSTEM,
      },
      notifications: {
        email: nextSettings.emailAlerts,
        push: nextSettings.pushAlerts,
        marketing: nextSettings.marketing,
      },
      security: { loginAlerts: nextSettings.loginAlerts },
    };

    await updateProfile(currentUser, {
      displayName: nextSettings.fullName,
      photoURL: nextSettings.profilePhoto || currentUser.photoURL || '',
    });

    const result = await settingsService.saveUserSettings(currentUser.uid, userType, profileUpdate);
    await updateDoc(doc(db, 'users', currentUser.uid), {
      privacySettings: {
        profileVisibility: nextSettings.profileVisible ? 'public' : 'private',
        mediaVisibility: nextSettings.mediaVisibility,
        messageConsent: nextSettings.messageConsent,
      },
    });
    return result;
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setSaving(true);
      setStatusMessage('');
      await persistSettings();
      setTheme(formData.themePreference || theme || THEMES.SYSTEM);
      setStatusMessage('Settings saved successfully.');
      addSuccessNotification(
        'Settings updated',
        'Your profile and preferences have been saved.'
      );
    } catch (error) {
      console.error('Settings save failed:', error);
      setStatusMessage(error.message || 'Unable to save settings.');
      addErrorNotification(
        'Failed to save changes',
        error.message || 'Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const result = await refreshUserProfile();
      if (result?.success) {
        setStatusMessage("Account information refreshed.");
        addSuccessNotification(
          "Profile refreshed",
          "Latest account information has been loaded.",
        );
      }
    } catch (error) {
      addErrorNotification(
        "Refresh failed",
        error.message || "Could not refresh data.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = currentUser?.email;
    if (!email) return;
    try {
      await sendPasswordResetEmail(auth, email);
      setStatusMessage(`Password reset instructions sent to ${email}.`);
      addSuccessNotification('Password reset sent', 'Check your email for the secure reset link.');
    } catch (error) {
      setStatusMessage(error.message || 'Unable to send password reset email.');
      addErrorNotification('Password reset failed', error.message || 'Please try again.');
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const result = await settingsService.uploadProfileMedia(file, {
        userId: currentUser.uid,
        role: 'student',
        folder: 'career-connect/profile-photos',
        publicId: `${currentUser.uid}-profile`,
      });

      const nextData = { ...formData, profilePhoto: result.url };
      setFormData(nextData);
      await persistSettings(nextData);
      setStatusMessage('Profile photo updated successfully.');
      addSuccessNotification('Profile photo updated', 'Your new photo is now live.');
    } catch (error) {
      console.error('Profile photo upload failed:', error);
      setStatusMessage(error.message || 'Unable to upload your photo.');
      addErrorNotification('Upload failed', error.message || 'Unable to upload your image.');
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const displayName =
    formData.fullName ||
    userProfile?.fullName ||
    userProfile?.displayName ||
    currentUser?.displayName ||
    "Career Connect User";

  const profileInitials = formatInitials(displayName);

  const navItems = [
    { key: SETTINGS_SECTIONS.PROFILE, label: "Profile", icon: FiUser },
    { key: SETTINGS_SECTIONS.SECURITY, label: "Security", icon: FiShield },
    {
      key: SETTINGS_SECTIONS.NOTIFICATIONS,
      label: "Notifications",
      icon: FiBell,
    },
    { key: SETTINGS_SECTIONS.APPEARANCE, label: "Appearance", icon: FiSliders },
    { key: SETTINGS_SECTIONS.PRIVACY, label: "Privacy", icon: FiEye },
  ];

  return (
    <div className="student-settings-page min-h-screen min-w-0 bg-slate-50 px-2 py-3 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-3 sm:py-4 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid min-w-0 gap-3 sm:gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-base font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-200 sm:h-12 sm:w-12 sm:text-lg">
                {formData.profilePhoto ? (
                  <img
                    src={formData.profilePhoto}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profileInitials
                )}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                  {displayName}
                </h2>
                <p className="text-xs text-slate-500">Student account</p>
              </div>
            </div>

            <nav
              className="mt-3 grid grid-cols-2 gap-1.5 sm:mt-4 sm:grid-cols-3 sm:gap-2 md:flex md:flex-col md:overflow-visible"
              aria-label="Student settings sections"
            >
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSection(key)}
                  className={`flex min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-left text-xs font-medium transition sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm md:w-full ${
                    activeSection === key
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-3 hidden rounded-xl bg-brand-50 p-3 dark:bg-brand-950/40 sm:mt-5 sm:block">
              <span className="inline-flex rounded-full bg-brand-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                Active profile
              </span>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Keep your information accurate and up to date.
              </p>
            </div>
          </aside>

          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 sm:gap-4 sm:pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                  Student settings
                </p>
                <h1 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100 sm:mt-2 sm:text-2xl">
                  Account preferences
                </h1>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  title="Refresh account information"
                  aria-label="Refresh account information"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
                  ) : <FiRefreshCw className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : <FiSave className="h-4 w-4" />}
                  Save changes
                </button>
              </div>
            </div>

            {statusMessage ? (
              <div role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-900 dark:bg-brand-950/30 dark:text-brand-200">
                <FiCheck className="h-4 w-4 shrink-0" aria-hidden />
                {statusMessage}
              </div>
            ) : null}

            {activeSection === SETTINGS_SECTIONS.PROFILE && (
              <div className="mt-6 space-y-5">
                <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:p-5">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-2xl font-bold text-brand-700 ring-4 ring-white dark:bg-brand-950 dark:text-brand-200 dark:ring-slate-900">
                    {formData.profilePhoto ? (
                      <img
                        src={formData.profilePhoto}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      profileInitials
                    )}
                    <button
                      type="button"
                      aria-label="Upload profile photo"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-card transition hover:bg-brand-700 dark:border-slate-950"
                    >
                      <FiCamera size={16} />
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">Profile identity</p>
                    <h3 className="mt-1 truncate text-lg font-semibold text-slate-900 dark:text-slate-100">{displayName}</h3>
                    <p className="mt-0.5 truncate text-sm text-slate-500">{formData.email || 'No email on file'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"><FiCheck aria-hidden />Active</span>
                    {uploadingPhoto && <span className="text-xs text-slate-500">Uploading…</span>}
                  </div>
                </div>

                <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-5">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
                    <FiUser className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden />
                    <div><h3 className="font-semibold text-slate-900 dark:text-slate-100">Profile details</h3><p className="mt-0.5 text-xs text-slate-500">Keep your contact and introduction up to date.</p></div>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Full name
                      <input
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email address
                      <input
                        type="email"
                        value={formData.email}
                        readOnly
                        aria-describedby="account-email-note"
                        className="mt-2 block w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      />
                      <span id="account-email-note" className="mt-1 block text-xs font-normal text-slate-500">Your sign-in email is managed by your account provider.</span>
                    </label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Phone number
                      <input
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Location
                      <input
                        value={formData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </label>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Bio
                        <textarea
                          rows={4}
                          value={formData.bio}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === SETTINGS_SECTIONS.SECURITY && (
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Security
                  </h3>
                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Two-factor authentication
                        </h4>
                        <p className="text-xs text-slate-500">
                          Two-factor authentication enrollment is not available for this account yet.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={false}
                        disabled
                        aria-label="Two-factor authentication enrollment is unavailable"
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Login alerts
                        </h4>
                        <p className="text-xs text-slate-500">
                          Receive notifications when someone signs into your
                          account.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.loginAlerts}
                        onChange={() => handleToggle("loginAlerts")}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Password reset
                        </h4>
                        <p className="text-xs text-slate-500">
                          Use a strong password and update it regularly.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Change password
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Session security
                  </h3>
                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <FiShield className="h-5 w-5 text-brand-600" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          Security status
                        </p>
                        <p className="text-xs text-slate-500">
                          Your account is protected with standard login checks.
                        </p>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-2">
                        <FiCheck className="h-4 w-4 text-emerald-500" /> Email
                        verified
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheck className="h-4 w-4 text-emerald-500" /> Secure
                        browsing enabled
                      </li>
                      <li className="flex items-center gap-2">
                        <FiLock className="h-4 w-4 text-brand-500" /> Protected
                        with role-based access
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === SETTINGS_SECTIONS.NOTIFICATIONS && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Notifications
                </h3>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Email notifications
                      </h4>
                        <p className="text-xs text-slate-500">
                          Save email notification preferences for your account.
                        </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.emailAlerts}
                      onChange={() => handleToggle("emailAlerts")}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Push notifications
                      </h4>
                        <p className="text-xs text-slate-500">
                          Save push notification preferences for your account.
                        </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.pushAlerts}
                      onChange={() => handleToggle("pushAlerts")}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Marketing and product updates
                      </h4>
                      <p className="text-xs text-slate-500">
                        Stay informed about new features and opportunity
                        highlights.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.marketing}
                      onChange={() => handleToggle("marketing")}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === SETTINGS_SECTIONS.APPEARANCE && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Appearance
                </h3>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Theme preference
                    <select
                      value={formData.themePreference}
                      onChange={(e) =>
                        handleInputChange("themePreference", e.target.value)
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value={THEMES.LIGHT}>Light</option>
                      <option value={THEMES.DARK}>Dark</option>
                      <option value={THEMES.SYSTEM}>System default</option>
                    </select>
                  </label>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Dark mode preview
                      </h4>
                      <p className="text-xs text-slate-500">
                        Quick visual check for the current theme.
                      </p>
                    </div>
                    {formData.themePreference === THEMES.DARK ||
                    formData.darkMode ? (
                      <FiMoon className="h-5 w-5 text-brand-600" />
                    ) : (
                      <FiSun className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === SETTINGS_SECTIONS.PRIVACY && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Privacy
                </h3>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Public profile visibility
                      </h4>
                      <p className="text-xs text-slate-500">
                        Control whether your profile is visible to other users.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.profileVisible}
                      onChange={() => handleToggle("profileVisible")}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Data sharing
                      </h4>
                      <p className="text-xs text-slate-500">
                        Allow platform recommendations and tailored
                        opportunities to use your profile data.
                      </p>
                    </div>
                    <input type="checkbox" checked={formData.dataSharing ?? true} onChange={() => handleToggle('dataSharing')} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  </div>
                  <label className="block rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Who can view profile media</span>
                    <select value={formData.mediaVisibility} onChange={(event) => handleInputChange('mediaVisibility', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                      <option value="public">Anyone signed in</option><option value="connections">Accepted connections</option><option value="private">Only me</option>
                    </select>
                  </label>
                  <label className="block rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">New message requests</span>
                    <select value={formData.messageConsent} onChange={(event) => handleInputChange('messageConsent', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                      <option value="connections">Accepted connections only</option><option value="followers">Company followers and connections</option><option value="nobody">No new conversations</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;
