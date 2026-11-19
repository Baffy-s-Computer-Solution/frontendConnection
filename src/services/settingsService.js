import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from '../config/firebase';
import { cloudinaryService } from './cloudinaryService';
import API_BASE_URL from './apiConfig';

const DEFAULT_NOTIFICATION_PREFERENCES = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  inAppNotifications: true,
  notificationFrequency: 'instant',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  soundEnabled: true,
  desktopNotifications: true,
  categories: {
    application_updates: true,
    job_recommendations: true,
    mentorship: true,
    courses: true,
    deadlines: true,
    messages: true,
    social: true,
    marketing: false,
    system: true,
    security: true,
  },
};

const PROFILE_COLLECTIONS = {
  admin: 'admins',
  student: 'students',
  company: 'companies',
  institute: 'institutes',
  mentor: 'mentors',
  youth: 'youth',
  entrepreneur: 'entrepreneurs',
  parent: 'parents',
  alumni: 'alumni',
};

export const normalizeUserType = (userType = 'student') => {
  const normalized = String(userType || 'student').toLowerCase();
  return PROFILE_COLLECTIONS[normalized] ? normalized : 'student';
};

export const getProfileCollectionForUserType = (userType = 'student') => {
  return PROFILE_COLLECTIONS[normalizeUserType(userType)] || 'students';
};

export const getNotificationPreferences = async (uid) => {
  if (!uid || !db) {
    return { success: false, error: 'Missing user id or database connection.' };
  }

  try {
    const ref = doc(db, 'notificationPreferences', uid);
    const snapshot = await getDoc(ref);
    return {
      success: true,
      data: snapshot.exists() ? snapshot.data() : { ...DEFAULT_NOTIFICATION_PREFERENCES, userId: uid },
    };
  } catch (error) {
    console.error('Error loading notification preferences:', error);
    return {
      success: false,
      error: error.message || 'Unable to load notification preferences.',
    };
  }
};

export const updateNotificationPreferences = async (uid, preferences) => {
  if (!uid || !db) {
    throw new Error('Missing user id or database connection.');
  }

  try {
    const ref = doc(db, 'notificationPreferences', uid);
    const nextPreferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...preferences,
      categories: {
        ...DEFAULT_NOTIFICATION_PREFERENCES.categories,
        ...(preferences?.categories || {}),
      },
      userId: uid,
      updatedAt: serverTimestamp(),
    };

    const current = await getDoc(ref);
    await setDoc(ref, { ...nextPreferences, ...(!current.exists() ? { createdAt: serverTimestamp() } : {}) }, { merge: true });
    return { success: true, data: nextPreferences };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

export const getUserSettings = async (uid, userType = 'student') => {
  if (!uid || !db || typeof getDoc !== 'function') {
    return { success: false, error: 'Missing user id or database connection.' };
  }

  try {
    const ref = doc(db, getProfileCollectionForUserType(userType), uid);
    const snapshot = await getDoc(ref);

    return {
      success: true,
      data: snapshot?.exists ? (snapshot.exists() ? snapshot.data() : {}) : {},
    };
  } catch (error) {
    console.error('Error loading user settings:', error);
    return {
      success: false,
      error: error.message || 'Unable to load user settings.',
    };
  }
};

export const saveUserSettings = async (uid, userType = 'student', settings = {}) => {
  if (!uid || !db || typeof setDoc !== 'function') {
    throw new Error('Missing user id or database connection.');
  }

  const normalizedType = normalizeUserType(userType);
  const profileRef = doc(db, getProfileCollectionForUserType(normalizedType), uid);
  const userRef = doc(db, 'users', uid);

  const currentProfileSnapshot = await getDoc(profileRef).catch(() => null);
  const currentProfile = currentProfileSnapshot?.exists() ? currentProfileSnapshot.data() : {};

  const nextProfile = {
    ...currentProfile,
    ...settings,
    userId: uid,
    userType: normalizedType,
    updatedAt: serverTimestamp(),
  };

  if (settings.preferences) {
    nextProfile.preferences = {
      ...(currentProfile.preferences || {}),
      ...settings.preferences,
    };
  }

  if (settings.notifications) {
    nextProfile.notifications = {
      ...(currentProfile.notifications || {}),
      ...settings.notifications,
    };
  }

  if (settings.privacy) {
    nextProfile.privacy = {
      ...(currentProfile.privacy || {}),
      ...settings.privacy,
    };
  }

  const userDoc = {
    uid,
    userType: normalizedType,
    fullName: settings.fullName || currentProfile.fullName || currentProfile.displayName || '',
    displayName: settings.displayName || settings.fullName || currentProfile.displayName || '',
    name: settings.displayName || settings.fullName || currentProfile.name || currentProfile.displayName || '',
    email: settings.email || currentProfile.email || auth.currentUser?.email || '',
    phone: settings.phone || currentProfile.phone || '',
    location: settings.location || currentProfile.location || '',
    photoURL: settings.photoURL || currentProfile.photoURL || auth.currentUser?.photoURL || '',
    profilePhoto: settings.profilePhoto || currentProfile.profilePhoto || auth.currentUser?.photoURL || '',
    updatedAt: serverTimestamp(),
  };

  await setDoc(profileRef, nextProfile, { merge: true });
  await setDoc(userRef, userDoc, { merge: true });

  return { success: true, data: nextProfile };
};

export const watchUserSettings = (uid, userType = 'student', onChange) => {
  if (!uid || !db || typeof onSnapshot !== 'function' || typeof onChange !== 'function') {
    return () => {};
  }

  const normalizedType = normalizeUserType(userType);
  const ref = doc(db, getProfileCollectionForUserType(normalizedType), uid);

  try {
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        onChange(snapshot.exists() ? snapshot.data() : {});
      },
      (error) => {
        console.error('User settings subscription failed:', error);
        onChange({});
      }
    );

    return typeof unsubscribe === 'function' ? unsubscribe : () => {};
  } catch (error) {
    console.error('User settings subscription setup failed:', error);
    return () => {};
  }
};

export const uploadProfileMedia = async (file, options = {}) => {
  if (!file) {
    throw new Error('No file selected to upload.');
  }

  const folder = options.folder || 'career-connect/profile-media';
  const publicId = options.publicId;

  if (options.userId && options.role === 'student') {
    const token = await auth.currentUser?.getIdToken();
    if (!token || auth.currentUser?.uid !== options.userId) throw new Error('Please sign in again to upload your profile image.');
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/api/media/student/profile-photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success || !result.photoURL) throw new Error(result.message || 'Unable to upload your profile image.');
    return { success: true, source: 'cloudinary', url: result.photoURL, publicId: result.publicId };
  }

  try {
    const result = await cloudinaryService.uploadImage(file, {
      folder,
      public_id: publicId,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

    if (result?.success) {
      return {
        success: true,
        source: 'cloudinary',
        url: result.url || result.secure_url,
        publicId: result.public_id || publicId,
      };
    }

    throw new Error(result?.error || 'Cloudinary upload failed.');
  } catch (cloudinaryError) {
    console.error('Cloudinary profile media upload failed:', cloudinaryError);
    throw new Error(cloudinaryError.message || 'Unable to upload media to Cloudinary.');
  }
};

const settingsService = {
  getNotificationPreferences,
  updateNotificationPreferences,
  getUserSettings,
  saveUserSettings,
  watchUserSettings,
  uploadProfileMedia,
};

export default settingsService;
