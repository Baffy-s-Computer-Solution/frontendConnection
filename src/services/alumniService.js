// frontend/src/services/alumniService.js
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  orderBy,
  limit,
  Timestamp,
  increment,
  setDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import API_BASE_URL from './apiConfig';
import supabaseService from './supabaseService';

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Unable to read selected image'));
  reader.readAsDataURL(file);
});

const uploadAlumniImage = async (file, uid, folder) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file?.type) || file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Choose a JPG, PNG, or WEBP image under 5MB' };
  }
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
  const path = `alumni/${uid}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const result = await supabaseService.uploadBase64({ path, file: await fileToDataUrl(file), contentType: file.type });
  const url = result?.publicUrl || result?.data?.publicUrl || result?.data?.url;
  return result?.success && url ? { success: true, data: { url, path, provider: 'supabase' } } : { success: false, error: result?.error || 'Supabase media upload failed' };
};

const updateAlumniStoryLike = async (storyId, shouldLike) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return { success: false, error: 'Not authenticated' };
  try {
    const ref = doc(db, 'alumni_stories', storyId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return { success: false, error: 'Story not found' };
    const likes = snapshot.data().likes || [];
    if (likes.includes(uid) === shouldLike) return { success: true };
    await updateDoc(ref, { likes: shouldLike ? arrayUnion(uid) : arrayRemove(uid), likesCount: increment(shouldLike ? 1 : -1) });
    return { success: true };
  } catch (error) { return { success: false, error: error.message }; }
};

const getCurrentUserRole = () => {
  try {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    return profile?.userType || profile?.role || null;
  } catch (error) {
    return null;
  }
};

const buildHeaders = async (options = {}) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
  } catch (error) {
    console.error('Error building headers:', error);
    return {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
  }
};

const request = async (path, options = {}) => {
  const role = getCurrentUserRole();
  if (path.includes('/api/alumni/') && role !== 'alumni' && role !== 'admin') {
    return {
      success: false,
      message: 'User role not authorized to access this route',
      skipped: true,
    };
  }

  try {
    const headers = await buildHeaders(options);
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || data?.error || 'Request failed');
    }

    return data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'success')
      ? data
      : { success: true, data };
  } catch (error) {
    console.error(`API Error (${path}):`, error);
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

// Direct Firestore operations for real-time data
const getFirestoreData = async (collectionName, userId, subCollection = null) => {
  try {
    let q;
    if (subCollection) {
      const docRef = doc(db, collectionName, userId);
      q = collection(docRef, subCollection);
    } else {
      q = collection(db, collectionName);
      if (userId) {
        q = query(q, where('userId', '==', userId));
      }
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching from ${collectionName}:`, error);
    return [];
  }
};

const getAlumniOwnedData = async (uid) => {
  const getOwned = async (collectionName, ownerField, ownerId = uid) => {
    const snapshot = await getDocs(query(collection(db, collectionName), where(ownerField, '==', ownerId), limit(500)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  };
  const [sharedPosts, alumniPosts, connections, incomingConnections, donations, stories, savedPosts, notifications, mentorshipRequests, mentorships] = await Promise.all([
    getOwned('social_posts', 'authorId'),
    getOwned('alumni_posts', 'userId'),
    getOwned('alumni_connections', 'userId'),
    getOwned('alumni_connections', 'connectedUserId'),
    getOwned('donations', 'alumniId'),
    getOwned('alumni_stories', 'authorId'),
    getOwned('alumni_saved_posts', 'userId'),
    getOwned('alumni_notifications', 'userId'),
    getOwned('mentorship_requests', 'alumniId'),
    getOwned('mentorships', 'menteeId'),
  ]);
  const mergeById = (records) => Array.from(new Map(records.map((record) => [record.id, record])).values());
  return {
    posts: mergeById([...sharedPosts, ...alumniPosts]),
    connections: mergeById([...connections, ...incomingConnections]),
    donations,
    stories,
    savedPosts,
    notifications,
    mentorshipRequests,
    mentorships,
  };
};

export const alumniService = {
  listMentors: async () => {
    try {
      const snapshot = await getDocs(query(collection(db, 'mentors'), limit(300)));
      const data = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
        .filter((mentor) => ['approved', 'active'].includes(String(mentor.status || '').toLowerCase()) || mentor.isVerified === true)
        .map((mentor) => ({
          ...mentor,
          name: mentor.name || mentor.displayName || mentor.fullName || 'Mentor',
          photoURL: mentor.photoURL || mentor.profilePhoto || '',
          position: mentor.position || mentor.title || mentor.headline || '',
          company: mentor.company || mentor.currentEmployer || '',
          expertise: Array.isArray(mentor.expertise) ? mentor.expertise : [],
          reviewsCount: mentor.reviewsCount || mentor.totalReviews || 0,
        }));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },
  getMyMentorshipRequests: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated', data: [] };
    try {
      const snapshot = await getDocs(query(collection(db, 'mentorship_requests'), where('alumniId', '==', uid), limit(200)));
      const data = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      data.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      return { success: true, data };
    } catch (error) { return { success: false, error: error.message, data: [] }; }
  },
  getMentorshipSessions: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated', data: [] };
    try {
      const [menteeSnapshot, alumniSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'mentorships'), where('menteeId', '==', uid), limit(200))),
        getDocs(query(collection(db, 'mentorships'), where('alumniId', '==', uid), limit(200))),
      ]);
      const records = [...menteeSnapshot.docs, ...alumniSnapshot.docs];
      const data = Array.from(new Map(records.map((item) => [item.id, { id: item.id, ...item.data() }])).values());
      data.sort((a, b) => (b.updatedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0));
      return { success: true, data };
    } catch (error) { return { success: false, error: error.message, data: [] }; }
  },
  requestMentorship: async ({ mentorId, topic, message, preferredDate = '', preferredTime = '' }) => {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'Not authenticated' };
    if (!mentorId || !String(message || '').trim()) return { success: false, error: 'Choose a mentor and include a message' };
    try {
      const mentorSnapshot = await getDoc(doc(db, 'mentors', mentorId));
      if (!mentorSnapshot.exists()) return { success: false, error: 'Mentor profile not found' };
      const mentor = mentorSnapshot.data();
      if (!(['approved', 'active'].includes(String(mentor.status || '').toLowerCase()) || mentor.isVerified === true)) {
        return { success: false, error: 'This mentor is not currently accepting requests' };
      }
      const profileSnapshot = await getDoc(doc(db, 'alumni', user.uid));
      const userSnapshot = await getDoc(doc(db, 'users', user.uid));
      const profile = profileSnapshot.exists() ? profileSnapshot.data() : {};
      const userData = userSnapshot.exists() ? userSnapshot.data() : {};
      const existingSnapshot = await getDocs(query(collection(db, 'mentorship_requests'), where('alumniId', '==', user.uid), limit(200)));
      if (existingSnapshot.docs.some((item) => item.data().mentorId === mentorId && item.data().status === 'pending')) {
        return { success: false, error: 'You already have a pending request with this mentor' };
      }
      const record = {
        mentorId,
        mentorName: mentor.name || mentor.displayName || mentor.fullName || 'Mentor',
        mentorPhoto: mentor.photoURL || mentor.profilePhoto || '',
        alumniId: user.uid,
        alumniName: profile.name || profile.displayName || userData.displayName || user.displayName || 'Alumni',
        alumniPhoto: profile.photoURL || profile.profilePhoto || userData.photoURL || user.photoURL || '',
        topic: String(topic || '').trim().slice(0, 120),
        message: String(message).trim().slice(0, 1000),
        preferredDate: String(preferredDate || ''),
        preferredTime: String(preferredTime || ''),
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const ref = await addDoc(collection(db, 'mentorship_requests'), record);
      return { success: true, data: { id: ref.id, ...record } };
    } catch (error) { return { success: false, error: error.message }; }
  },
  becomeMentor: async (payload) => {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const profileSnapshot = await getDoc(doc(db, 'alumni', user.uid));
      const profile = profileSnapshot.exists() ? profileSnapshot.data() : {};
      await setDoc(doc(db, 'mentors', user.uid), {
        userId: user.uid,
        uid: user.uid,
        name: profile.name || profile.displayName || user.displayName || 'Alumni Mentor',
        displayName: profile.displayName || profile.name || user.displayName || 'Alumni Mentor',
        email: user.email || '',
        photoURL: profile.photoURL || profile.profilePhoto || user.photoURL || '',
        headline: String(payload.headline || '').slice(0, 120),
        title: String(payload.headline || '').slice(0, 120),
        expertise: Array.isArray(payload.expertise) ? payload.expertise : [],
        bio: String(payload.bio || '').slice(0, 1000),
        sessionLength: Number(payload.sessionLength) || 30,
        availability: payload.availability || 'weekly',
        maxMentees: Number(payload.maxMentees) || 3,
        status: 'pending',
        isVerified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }, { merge: true });
      return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  },
  updateMentorshipSession: async (sessionId, updates) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated' };
    if (!sessionId || !['active', 'paused', 'ended', 'completed'].includes(updates?.status)) return { success: false, error: 'Invalid session update' };
    try {
      const ref = doc(db, 'mentorships', sessionId);
      const snapshot = await getDoc(ref);
      if (!snapshot.exists()) return { success: false, error: 'Mentorship not found' };
      const data = snapshot.data();
      if (data.menteeId !== uid && data.alumniId !== uid) return { success: false, error: 'Not authorized to update this mentorship' };
      await updateDoc(ref, { status: updates.status, updatedAt: Timestamp.now() });
      return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  },
  listAlumniStories: async ({ search = '', category } = {}) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated', data: [] };
    try {
      const snapshot = await getDocs(query(collection(db, 'alumni_stories'), orderBy('createdAt', 'desc'), limit(100)));
      const data = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
        .filter((story) => story.status === 'published' || story.authorId === uid)
        .filter((story) => !category || story.category === category)
        .filter((story) => !search || `${story.title || ''} ${story.excerpt || ''} ${story.content || ''}`.toLowerCase().includes(search.toLowerCase()))
        .map((story) => ({ ...story, isLiked: Array.isArray(story.likes) && story.likes.includes(uid), likesCount: story.likesCount || story.likes?.length || 0 }));
      return { success: true, data };
    } catch (error) { return { success: false, error: error.message, data: [] }; }
  },
  createAlumniStory: async (payload) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated' };
    try {
      let coverImage = '';
      let coverImagePath = '';
      if (typeof File !== 'undefined' && payload.coverImage instanceof File) {
        const uploaded = await uploadAlumniImage(payload.coverImage, uid, 'stories');
        if (!uploaded.success) return uploaded;
        coverImage = uploaded.data.url;
        coverImagePath = uploaded.data.path;
      }
      const user = auth.currentUser;
      const profile = await getDoc(doc(db, 'alumni', uid));
      const author = profile.exists() ? profile.data() : {};
      const record = {
        title: String(payload.title || '').slice(0, 200), category: String(payload.category || 'career').slice(0, 60),
        excerpt: String(payload.excerpt || '').slice(0, 300), content: String(payload.content || '').slice(0, 10000),
        coverImage, coverImagePath, authorId: uid, authorName: author.name || author.displayName || user.displayName || 'Alumni',
        authorPhoto: author.photoURL || author.profilePhoto || user.photoURL || '',
        likes: [], likesCount: 0, status: 'published', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
      };
      const ref = await addDoc(collection(db, 'alumni_stories'), record);
      return { success: true, data: { id: ref.id, ...record } };
    } catch (error) { return { success: false, error: error.message }; }
  },
  updateAlumniStory: async (storyId, payload) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated' };
    try {
      const ref = doc(db, 'alumni_stories', storyId);
      const existing = await getDoc(ref);
      if (!existing.exists()) return { success: false, error: 'Story not found' };
      if (existing.data().authorId !== uid) return { success: false, error: 'Not authorized to edit this story' };
      const updates = { title: String(payload.title || '').slice(0, 200), category: String(payload.category || 'career').slice(0, 60), excerpt: String(payload.excerpt || '').slice(0, 300), content: String(payload.content || '').slice(0, 10000), updatedAt: Timestamp.now() };
      if (typeof File !== 'undefined' && payload.coverImage instanceof File) {
        const uploaded = await uploadAlumniImage(payload.coverImage, uid, 'stories');
        if (!uploaded.success) return uploaded;
        updates.coverImage = uploaded.data.url;
        updates.coverImagePath = uploaded.data.path;
      }
      const oldImage = existing.data().coverImage;
      const oldImagePath = existing.data().coverImagePath;
      if (updates.coverImage && oldImagePath) {
        await supabaseService.deleteObject(oldImagePath);
      } else if (updates.coverImage && typeof oldImage === 'string' && oldImage.includes('/storage/v1/object/public/')) {
        const objectPath = decodeURIComponent(oldImage.split('/storage/v1/object/public/')[1].split('/').slice(1).join('/'));
        await supabaseService.deleteObject(objectPath);
      }
      await updateDoc(ref, updates);
      return { success: true, data: { id: storyId, ...updates } };
    } catch (error) { return { success: false, error: error.message }; }
  },
  deleteAlumniStory: async (storyId) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated' };
    try {
      const ref = doc(db, 'alumni_stories', storyId);
      const existing = await getDoc(ref);
      if (!existing.exists()) return { success: false, error: 'Story not found' };
      if (existing.data().authorId !== uid) return { success: false, error: 'Not authorized to delete this story' };
      const imageUrl = existing.data().coverImage;
      const imagePath = existing.data().coverImagePath;
      if (imagePath) {
        await supabaseService.deleteObject(imagePath);
      } else if (typeof imageUrl === 'string' && imageUrl.includes('/storage/v1/object/public/')) {
        const objectPath = decodeURIComponent(imageUrl.split('/storage/v1/object/public/')[1].split('/').slice(1).join('/'));
        await supabaseService.deleteObject(objectPath);
      }
      await deleteDoc(ref);
      return { success: true, data: { id: storyId } };
    } catch (error) { return { success: false, error: error.message }; }
  },
  likeAlumniStory: async (storyId) => updateAlumniStoryLike(storyId, true),
  unlikeAlumniStory: async (storyId) => updateAlumniStoryLike(storyId, false),
  getAlumniProfile: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated' };
    try {
      const snapshot = await getDoc(doc(db, 'alumni', uid));
      if (snapshot.exists()) return { success: true, data: { id: snapshot.id, ...snapshot.data() } };
      const userSnapshot = await getDoc(doc(db, 'users', uid));
      return { success: true, data: userSnapshot.exists() ? { id: userSnapshot.id, ...userSnapshot.data() } : {} };
    } catch (error) { return { success: false, error: error.message }; }
  },
  updateAlumniProfile: async (profile) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated' };
    try {
      await setDoc(doc(db, 'alumni', uid), { ...profile, updatedAt: Timestamp.now() }, { merge: true });
      return { success: true, data: profile };
    } catch (error) { return { success: false, error: error.message }; }
  },
  getMyActivity: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated' };
    try {
      const records = await getFirestoreData('analytics', uid);
      records.sort((a, b) => (b.timestamp?.toDate?.() || new Date(b.timestamp || 0)) - (a.timestamp?.toDate?.() || new Date(a.timestamp || 0)));
      return { success: true, data: records.slice(0, 30) };
    } catch (error) { return { success: false, error: error.message }; }
  },
  uploadAvatar: async (file) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated' };
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file?.type) || file.size > 5 * 1024 * 1024) return { success: false, error: 'Choose a JPG, PNG, or WEBP image under 5MB' };
    try {
      const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
      const path = `alumni/${uid}/avatar/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
      const uploaded = await supabaseService.uploadBase64({ path, file: await fileToDataUrl(file), contentType: file.type });
      const url = uploaded?.publicUrl || uploaded?.data?.publicUrl || uploaded?.data?.url;
      if (!uploaded?.success || !url) throw new Error(uploaded?.error || 'Supabase avatar upload failed');
      await setDoc(doc(db, 'alumni', uid), { photoURL: url, profilePhoto: url, photoStorage: 'supabase', photoStoragePath: path, updatedAt: Timestamp.now() }, { merge: true });
      await setDoc(doc(db, 'users', uid), { photoURL: url, profilePhoto: url, updatedAt: Timestamp.now() }, { merge: true });
      await auth.currentUser.updateProfile?.({ photoURL: url });
      return { success: true, data: { url, path, provider: 'supabase' } };
    } catch (error) { return { success: false, error: error.message }; }
  },
  getAlumniSettings: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated' };
    try {
      const [snapshot, userSnapshot] = await Promise.all([
        getDoc(doc(db, 'alumni', uid)),
        getDoc(doc(db, 'users', uid)),
      ]);
      const profile = snapshot.exists() ? snapshot.data() : {};
      const user = userSnapshot.exists() ? userSnapshot.data() : {};
      const settings = profile.settings || {};
      return {
        success: true,
        data: {
          ...settings,
          account: {
            displayName: profile.displayName || profile.name || user.displayName || user.fullName || auth.currentUser.displayName || '',
            email: auth.currentUser.email || '',
            phone: profile.phone || '',
            language: settings.account?.language || 'en',
          },
          notifications: profile.notifications || settings.notifications,
          privacy: profile.privacy || settings.privacy,
          appearance: settings.appearance,
        },
      };
    } catch (error) {
      console.error('Error loading alumni settings:', error);
      return { success: false, error: error.message };
    }
  },
  updateAlumniSettings: async (updates) => {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const ref = doc(db, 'alumni', user.uid);
      const snapshot = await getDoc(ref);
      const profile = snapshot.exists() ? snapshot.data() : {};
      const settings = profile.settings || {};
      const account = updates.account || {};
      const nextSettings = {
        ...settings,
        ...Object.fromEntries(Object.entries(updates).filter(([key]) => key !== 'account')),
        ...(account.language ? { account: { ...settings.account, language: account.language } } : {}),
      };
      await setDoc(
        ref,
        {
          ...(account.displayName ? { displayName: account.displayName, name: account.displayName } : {}),
          ...(account.phone !== undefined ? { phone: account.phone } : {}),
          ...(updates.notifications ? { notifications: updates.notifications } : {}),
          settings: nextSettings,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
      const userUpdates = {
        updatedAt: Timestamp.now(),
        ...(account.displayName ? { displayName: account.displayName, fullName: account.displayName } : {}),
        ...(account.phone !== undefined ? { phone: account.phone } : {}),
      };
      if (Object.keys(userUpdates).length > 1) {
        await setDoc(doc(db, 'users', user.uid), userUpdates, { merge: true });
      }
      if (account.displayName && account.displayName !== user.displayName) {
        await updateProfile(user, { displayName: account.displayName });
      }
      return { success: true, data: { ...nextSettings, account: { ...account, email: user.email || '' } } };
    } catch (error) {
      console.error('Error saving alumni settings:', error);
      return { success: false, error: error.message };
    }
  },
  updateNotificationPreferences: async (preferences) => {
    return alumniService.updateAlumniSettings({ notifications: preferences });
  },
  updateAppearancePreferences: async (preferences) => {
    return alumniService.updateAlumniSettings({ appearance: preferences });
  },
  changePassword: async ({ currentPassword, newPassword }) => {
    const user = auth.currentUser;
    if (!user?.email) return { success: false, error: 'No email/password account is signed in' };
    if (!user.providerData.some((provider) => provider.providerId === 'password')) {
      return { success: false, error: 'This account does not use an email password. Change credentials with your sign-in provider.' };
    }
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return { success: false, error: 'Enter your current password and a new password of at least 8 characters' };
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Error changing alumni password:', error);
      return { success: false, error: error.message };
    }
  },
  getDataSummary: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated' };
    try {
      const ownedData = await getAlumniOwnedData(uid);
      return {
        success: true,
        data: {
          postsCount: ownedData.posts.length,
          connectionsCount: ownedData.connections.length,
          donationsCount: ownedData.donations.length,
          storiesCount: ownedData.stories.length,
        },
      };
    } catch (error) {
      console.error('Error loading alumni data summary:', error);
      return { success: false, error: error.message };
    }
  },
  getMyDonations: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated', data: [] };
    try {
      const donations = (await getAlumniOwnedData(uid)).donations;
      return { success: true, data: donations.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA;
      }) };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },
  exportMyData: async ({ format = 'json' } = {}) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated' };
    if (!['json', 'csv'].includes(format)) {
      return { success: false, error: 'Choose JSON or CSV export format' };
    }
    try {
      const [profile, user, ownedData] = await Promise.all([
        getDoc(doc(db, 'alumni', uid)),
        getDoc(doc(db, 'users', uid)),
        getAlumniOwnedData(uid),
      ]);
      const data = {
        exportedAt: new Date().toISOString(),
        profile: profile.exists() ? { id: profile.id, ...profile.data() } : {},
        user: user.exists() ? { id: user.id, ...user.data() } : {},
        ...ownedData,
      };
      const content =
        format === 'json'
          ? JSON.stringify(data, null, 2)
          : [
              'collection,documentId,data',
              ...[['profile', uid, JSON.stringify(data.profile)], ['user', uid, JSON.stringify(data.user)]].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
              ...Object.entries(ownedData).flatMap(([collectionName, records]) =>
                records.map((record) =>
                  [collectionName, record.id, JSON.stringify(record)]
                    .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                    .join(',')
                )
              ),
            ].join('\n');
      const blob = new Blob([content], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });
      return {
        success: true,
        data: {
          url: URL.createObjectURL(blob),
          filename: `career-connect-alumni-data-${new Date().toISOString().slice(0, 10)}.${format}`,
        },
      };
    } catch (error) {
      console.error('Error exporting alumni data:', error);
      return { success: false, error: error.message };
    }
  },
  updateAlumniPrivacy: async (privacy) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, error: 'Not authenticated' };
    try { await setDoc(doc(db, 'alumni', uid), { privacy, updatedAt: Timestamp.now() }, { merge: true }); return { success: true, data: privacy }; }
    catch (error) { return { success: false, error: error.message }; }
  },
  getLinkedSchools: async () => request('/api/alumni/schools'),
  requestSchoolLink: async (school) => request('/api/alumni/schools', { method: 'POST', body: JSON.stringify(school) }),
  unlinkSchool: async (schoolId) => request(`/api/alumni/schools/${encodeURIComponent(schoolId)}`, { method: 'DELETE' }),
  getLeaderboard: async () => request('/api/alumni/dashboard/leaderboard'),

  // Dashboard Overview
  getOverview: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      // Fetch all relevant data in parallel
      const [
        profile,
        connections,
        mentorshipRequests,
        donations,
        eventRegistrations,
        stories,
        analytics,
      ] = await Promise.all([
        getDoc(doc(db, 'alumni', userId)).catch(() => null),
        getFirestoreData('alumni_connections', userId),
        getFirestoreData('mentorship_requests', userId),
        getFirestoreData('donations', userId),
        getFirestoreData('event_registrations', userId),
        getFirestoreData('alumni_stories', userId),
        getFirestoreData('analytics', userId),
      ]);

      const profileData = profile?.exists() ? profile.data() : {};

      // Calculate stats
      const activeMentorships = mentorshipRequests.filter((m) => m.status === 'active').length;
      const completedDonations = donations.filter((d) => d.status === 'completed');
      const totalDonated = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const attendedEvents = eventRegistrations.filter((e) => e.attended === true).length;

      // Calculate engagement score
      const engagementScore = calculateEngagementScore({
        connections: connections.length,
        mentorshipHours: activeMentorships * 5, // Assuming 5 hours per mentorship
        donationAmount: totalDonated,
        eventsAttended: attendedEvents,
        storiesShared: stories.length,
      });

      return {
        success: true,
        data: {
          collectionCounts: {
            total_connections: connections.length,
            active_mentorships: activeMentorships,
            total_donations: donations.length,
            total_donated: totalDonated,
            events_attended: attendedEvents,
            stories_shared: stories.length,
          },
          recentActivity: analytics.slice(0, 10),
          engagementScore,
          profile: profileData,
        },
      };
    } catch (error) {
      console.error('Error fetching overview:', error);
      return { success: false, message: error.message };
    }
  },

  // Get AI Models
  getModels: async () => {
    try {
      const models = await getFirestoreData('ai_models', null);
      return {
        success: true,
        data: models.length
          ? models
          : [
              {
                id: 'engagement_predictor',
                name: 'Engagement Predictor',
                description: 'Predicts alumni engagement trends',
                status: 'active',
                task: 'classification',
              },
              {
                id: 'donation_predictor',
                name: 'Donation Predictor',
                description: 'Forecasts donation potential',
                status: 'active',
                task: 'regression',
              },
              {
                id: 'mentorship_matcher',
                name: 'Mentorship Matcher',
                description: 'Matches alumni with students',
                status: 'active',
                task: 'recommendation',
              },
              {
                id: 'network_analyzer',
                name: 'Network Analyzer',
                description: 'Analyzes network strength',
                status: 'active',
                task: 'analysis',
              },
              {
                id: 'impact_calculator',
                name: 'Impact Calculator',
                description: 'Calculates social impact',
                status: 'active',
                task: 'calculation',
              },
            ],
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get AI Insights
  getInsights: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      // Try to get from API first
      const apiResponse = await request('/api/alumni/insights', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });

      if (apiResponse.success && apiResponse.data?.insights?.length) {
        return apiResponse;
      }

      // Fallback to local insights generation
      const [profile, connections, donations, mentorshipRequests] = await Promise.all([
        getDoc(doc(db, 'alumni', userId)),
        getFirestoreData('alumni_connections', userId),
        getFirestoreData('donations', userId),
        getFirestoreData('mentorship_requests', userId),
      ]);

      const profileData = profile.exists() ? profile.data() : {};
      const insights = [];

      // Network insight
      if (connections.length < 20) {
        insights.push({
          id: 'network_growth',
          title: 'Expand Your Network',
          description: `You have ${connections.length} connections. Alumni with 50+ connections are 3x more likely to receive opportunities.`,
          type: 'network',
          priority: 'high',
          recommendation: 'Connect with 5 new alumni this month',
        });
      } else if (connections.length > 50) {
        insights.push({
          id: 'network_strength',
          title: 'Strong Network!',
          description: `You're in the top 20% with ${connections.length} connections. Your network is a valuable asset.`,
          type: 'network',
          priority: 'medium',
          recommendation: 'Leverage your network to help fellow alumni',
        });
      }

      // Mentorship insight
      const activeMentorships = mentorshipRequests.filter((m) => m.status === 'active').length;
      if (activeMentorships === 0) {
        insights.push({
          id: 'mentorship_opportunity',
          title: 'Share Your Expertise',
          description: 'Become a mentor and guide the next generation of leaders.',
          type: 'mentorship',
          priority: 'high',
          recommendation: 'Sign up as a mentor today',
        });
      } else if (activeMentorships > 3) {
        insights.push({
          id: 'mentorship_excellence',
          title: 'Mentorship Champion',
          description: `You're actively mentoring ${activeMentorships} students. Your impact is remarkable!`,
          type: 'mentorship',
          priority: 'low',
          recommendation: 'Share your mentoring experience',
        });
      }

      // Donation insight
      const completedDonations = donations.filter((d) => d.status === 'completed');
      const totalDonated = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

      if (totalDonated === 0) {
        insights.push({
          id: 'donation_opportunity',
          title: 'Make an Impact',
          description: 'Your donation can help fund scholarships and programs.',
          type: 'donation',
          priority: 'medium',
          recommendation: 'Start with a small donation today',
        });
      } else if (totalDonated > 1000) {
        insights.push({
          id: 'donation_impact',
          title: 'Generous Contributor',
          description: `Your contributions of $${totalDonated} have helped support ${Math.floor(totalDonated / 100)} students.`,
          type: 'donation',
          priority: 'low',
          recommendation: 'Share your impact story',
        });
      }

      // Engagement insight
      const lastLogin = profileData.lastLoginAt?.toDate?.() || new Date();
      const daysSinceLogin = Math.floor((Date.now() - lastLogin) / (1000 * 60 * 60 * 24));

      if (daysSinceLogin > 30) {
        insights.push({
          id: 'reengagement',
          title: 'We Miss You!',
          description: `It's been ${daysSinceLogin} days since your last visit. Come see what's new!`,
          type: 'engagement',
          priority: 'high',
          recommendation: 'Log in and explore new opportunities',
        });
      }

      return { success: true, data: { insights } };
    } catch (error) {
      console.error('Error getting insights:', error);
      return { success: false, message: error.message };
    }
  },

  // Get History
  getHistory: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const historyData = await getFirestoreData('analytics', userId);
      const sortedHistory = historyData.sort((a, b) => {
        const dateA = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const dateB = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return dateB - dateA;
      });

      return {
        success: true,
        data: sortedHistory.map((item) => ({
          id: item.id,
          modelId: item.modelId,
          model: item.model,
          status: item.status,
          timestamp: item.timestamp,
          action: item.action,
          details: item.details,
        })),
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // AI Predictions
  getAIPredictions: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      // Try API first
      const apiResponse = await request('/api/alumni/predictions', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });

      if (apiResponse.success && apiResponse.data?.predictions) {
        return apiResponse;
      }

      // Generate local predictions
      const [connections, donations, mentorshipRequests, events] = await Promise.all([
        getFirestoreData('alumni_connections', userId),
        getFirestoreData('donations', userId),
        getFirestoreData('mentorship_requests', userId),
        getFirestoreData('event_registrations', userId),
      ]);

      const predictions = [];

      // Engagement prediction
      const monthlyGrowth = calculateMonthlyGrowth(connections);
      predictions.push({
        id: 'engagement_trend',
        title: 'Network Growth Prediction',
        description: `Your network is growing at ${monthlyGrowth}% per month. At this rate, you'll reach 100 connections in ${Math.ceil((100 - connections.length) / ((connections.length * monthlyGrowth) / 100))} months.`,
        confidence: 0.85,
        recommendations: ['Attend more networking events', 'Connect with industry peers'],
      });

      // Donation prediction
      const donationRate = calculateDonationRate(donations);
      predictions.push({
        id: 'donation_potential',
        title: 'Donation Impact Prediction',
        description: `Based on your giving pattern, increasing donations by 25% could support ${Math.ceil(calculatePotentialImpact(donations))} additional students.`,
        confidence: 0.78,
        recommendations: ['Set up recurring monthly donation', 'Join the leadership circle'],
      });

      // Mentorship prediction
      const mentorshipSuccess = calculateMentorshipSuccessRate(mentorshipRequests);
      predictions.push({
        id: 'mentorship_success',
        title: 'Mentorship Success Prediction',
        description: `Your mentorship has a ${mentorshipSuccess}% success rate. Continue this excellent work!`,
        confidence: 0.92,
        recommendations: ['Share your mentorship experience', 'Take on another mentee'],
      });

      return { success: true, data: { predictions } };
    } catch (error) {
      console.error('Error getting predictions:', error);
      return {
        success: true,
        data: {
          predictions: [
            {
              id: 'default_1',
              title: 'Engagement Trend',
              description: 'Your engagement score is trending upward',
              confidence: 0.85,
              recommendations: ['Stay active in the community'],
            },
          ],
        },
      };
    }
  },

  // AI Recommendations
  getAIRecommendations: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const apiResponse = await request('/api/alumni/recommendations', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });

      if (apiResponse.success && apiResponse.data?.recommendations) {
        return apiResponse;
      }

      // Generate local recommendations
      const [profile, connections, upcomingEvents] = await Promise.all([
        getDoc(doc(db, 'alumni', userId)),
        getFirestoreData('alumni_connections', userId),
        getFirestoreData('alumni_events', null),
      ]);

      const profileData = profile.exists() ? profile.data() : {};
      const recommendations = [];

      // Connection recommendations
      if (connections.length < 50) {
        recommendations.push({
          type: 'connection',
          title: 'Expand Your Professional Network',
          description: `Connect with ${50 - connections.length} more alumni to unlock new opportunities.`,
          priority: 'high',
          action: 'Browse suggested connections',
          link: '/alumni/network',
        });
      }

      // Event recommendations
      const upcoming = upcomingEvents.filter((e) => e.startDate?.toDate?.() > new Date());
      if (upcoming.length > 0) {
        recommendations.push({
          type: 'event',
          title: 'Upcoming Events',
          description: `${upcoming.length} events are happening soon. Don't miss out!`,
          priority: 'high',
          action: 'View Events',
          link: '/alumni/events',
        });
      }

      // Mentorship recommendations
      recommendations.push({
        type: 'mentorship',
        title: 'Become a Mentor',
        description: 'Share your expertise and guide the next generation.',
        priority: 'medium',
        action: 'Apply Now',
        link: '/alumni/mentorship',
      });

      // Donation recommendations
      recommendations.push({
        type: 'donation',
        title: 'Support Student Scholarships',
        description: "Your contribution can change a student's life.",
        priority: 'medium',
        action: 'Donate Now',
        link: '/alumni/donations',
      });

      return { success: true, data: { recommendations } };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        success: true,
        data: {
          recommendations: [
            {
              type: 'connection',
              title: 'Connect with Peers',
              description: 'Grow your professional network',
              priority: 'high',
            },
          ],
        },
      };
    }
  },

  // Engagement Metrics
  getEngagementMetrics: async (period = 'month') => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const startDate = new Date();
      if (period === 'week') startDate.setDate(startDate.getDate() - 7);
      else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
      else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

      const analytics = await getFirestoreData('analytics', userId);
      const filteredAnalytics = analytics.filter((a) => {
        const date = a.timestamp?.toDate?.() || new Date(a.timestamp);
        return date >= startDate;
      });

      // Calculate metrics
      const loginActivity = filteredAnalytics.filter((a) => a.action === 'login').length;
      const profileViews = filteredAnalytics.filter((a) => a.action === 'profile_view').length;
      const connectionRequests = filteredAnalytics.filter(
        (a) => a.action === 'connection_request'
      ).length;

      // Generate trend data (last 4 weeks)
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekData = analytics.filter((a) => {
          const date = a.timestamp?.toDate?.() || new Date(a.timestamp);
          return date >= weekStart && date < weekEnd;
        });

        weeks.push({
          logins: weekData.filter((a) => a.action === 'login').length,
          views: weekData.filter((a) => a.action === 'profile_view').length,
          interactions: weekData.filter((a) => a.action === 'interaction').length,
        });
      }

      return {
        success: true,
        data: {
          period,
          loginActivity: { count: loginActivity, trend: weeks.map((w) => w.logins) },
          profileViews: { count: profileViews, trend: weeks.map((w) => w.views) },
          connectionRequests: {
            count: connectionRequests,
            trend: weeks.map((w) => w.interactions),
          },
          overallScore: calculateEngagementScoreFromData(
            loginActivity,
            profileViews,
            connectionRequests
          ),
        },
      };
    } catch (error) {
      console.error('Error getting engagement metrics:', error);
      return {
        success: true,
        data: {
          period,
          loginActivity: { count: 0, trend: [5, 7, 6, 8] },
          profileViews: { count: 0, trend: [12, 15, 14, 18] },
          connectionRequests: { count: 0, trend: [8, 10, 12, 15] },
          overallScore: 65,
        },
      };
    }
  },

  // Network Suggestions
  getNetworkSuggestions: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const [profile, existingConnections] = await Promise.all([
        getDoc(doc(db, 'alumni', userId)),
        getFirestoreData('alumni_connections', userId),
      ]);

      const profileData = profile.exists() ? profile.data() : {};
      const connectedIds = new Set([userId, ...existingConnections.map((c) => c.connectedUserId)]);

      // Get all alumni
      const alumniSnapshot = await getDocs(collection(db, 'alumni'));
      const suggestions = [];

      for (const doc of alumniSnapshot.docs) {
        const alumniData = doc.data();
        if (!connectedIds.has(doc.id)) {
          // Calculate match score
          let matchScore = 0;
          let factors = 0;

          if (profileData.graduationYear === alumniData.graduationYear) {
            matchScore += 0.3;
            factors++;
          }

          if (profileData.industry === alumniData.industry) {
            matchScore += 0.3;
            factors++;
          }

          if (profileData.location === alumniData.location) {
            matchScore += 0.2;
            factors++;
          }

          const sharedInterests = (profileData.interests || []).filter((i) =>
            (alumniData.interests || []).includes(i)
          );
          if (sharedInterests.length > 0) {
            matchScore += Math.min(sharedInterests.length / 10, 0.2);
            factors++;
          }

          matchScore = factors > 0 ? matchScore / factors : 0;

          if (matchScore > 0.3) {
            suggestions.push({
              id: doc.id,
              name: alumniData.name,
              photoURL: alumniData.photoURL || alumniData.profilePhoto || '',
              graduationYear: alumniData.graduationYear,
              industry: alumniData.industry,
              company: alumniData.company,
              position: alumniData.position,
              location: alumniData.location,
              matchScore,
              mutualConnections: await getMutualConnections(userId, doc.id),
              commonInterests: sharedInterests.slice(0, 3),
            });
          }
        }
      }

      suggestions.sort((a, b) => b.matchScore - a.matchScore);
      return { success: true, data: suggestions.slice(0, 10) };
    } catch (error) {
      console.error('Error getting network suggestions:', error);
      return { success: true, data: [] };
    }
  },

  // Send Connection Request
  sendConnectionRequest: async (connectedUserId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const connectionData = {
        userId,
        connectedUserId,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'alumni_connections'), connectionData);

      // Log analytics
      await addDoc(collection(db, 'analytics'), {
        userId,
        action: 'connection_request',
        timestamp: Timestamp.now(),
        details: { connectedUserId },
      });

      return { success: true, data: connectionData };
    } catch (error) {
      console.error('Error sending connection request:', error);
      return { success: false, message: error.message };
    }
  },

  // Get Donation Impact
  getDonationImpact: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const donations = await getFirestoreData('donations', userId);
      const completedDonations = donations.filter((d) => d.status === 'completed');
      const totalAmount = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

      const impact = {
        totalDonated: totalAmount,
        studentsSupported: Math.floor(totalAmount / 100),
        scholarshipsProvided: Math.floor(totalAmount / 500),
        programsFunded: Math.floor(totalAmount / 1000),
        recognitionLevel: getRecognitionLevel(totalAmount),
        impactStories: await getImpactStories(),
        monthlyBreakdown: getMonthlyBreakdown(completedDonations),
      };

      return { success: true, data: impact };
    } catch (error) {
      console.error('Error getting donation impact:', error);
      return { success: false, message: error.message };
    }
  },

  // Create Donation
  createDonation: async (donationData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const donation = {
        alumniId: userId,
        amount: donationData.amount,
        campaign: donationData.campaign || 'general',
        isRecurring: donationData.isRecurring || false,
        paymentMethod: donationData.paymentMethod || 'card',
        message: donationData.message || '',
        status: 'completed',
        transactionId: `txn_${Date.now()}_${userId}`,
        createdAt: Timestamp.now(),
        paidAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'donations'), donation);

      // Update alumni stats
      const alumniRef = doc(db, 'alumni', userId);
      await updateDoc(alumniRef, {
        totalDonations: increment(donation.amount),
        lastDonationAt: Timestamp.now(),
      });

      // Log analytics
      await addDoc(collection(db, 'analytics'), {
        userId,
        action: 'donation',
        timestamp: Timestamp.now(),
        details: { amount: donation.amount, campaign: donation.campaign },
      });

      return { success: true, data: donation };
    } catch (error) {
      console.error('Error creating donation:', error);
      return { success: false, message: error.message };
    }
  },

  // Get Upcoming Events
  getUpcomingEvents: async () => {
    try {
      const now = Timestamp.now();
      const eventsQuery = query(
        collection(db, 'alumni_events'),
        where('startDate', '>=', now),
        where('status', '==', 'published'),
        orderBy('startDate', 'asc'),
        limit(10)
      );

      const snapshot = await getDocs(eventsQuery);
      const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      return { success: true, data: events };
    } catch (error) {
      if (error?.code === 'failed-precondition' || /index/i.test(error?.message || '')) {
        try {
          const fallbackSnapshot = await getDocs(collection(db, 'alumni_events'));
          const events = fallbackSnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((event) => event.status === 'published' && (event.startDate?.toDate?.() || new Date(event.startDate)) >= new Date())
            .sort((a, b) => {
              const aDate = a.startDate?.toDate?.() || new Date(a.startDate);
              const bDate = b.startDate?.toDate?.() || new Date(b.startDate);
              return aDate - bDate;
            })
            .slice(0, 10);

          return { success: true, data: events };
        } catch (fallbackError) {
          console.error('Error getting upcoming events with fallback:', fallbackError);
          return { success: true, data: [] };
        }
      }

      console.error('Error getting upcoming events:', error);
      return { success: true, data: [] };
    }
  },

  // Register for Event
  registerForEvent: async (eventId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const registration = {
        eventId,
        userId,
        registeredAt: Timestamp.now(),
        status: 'confirmed',
        attended: false,
      };

      await addDoc(collection(db, 'event_registrations'), registration);

      // Log analytics
      await addDoc(collection(db, 'analytics'), {
        userId,
        action: 'event_registration',
        timestamp: Timestamp.now(),
        details: { eventId },
      });

      return { success: true, data: registration };
    } catch (error) {
      console.error('Error registering for event:', error);
      return { success: false, message: error.message };
    }
  },

  // Get Success Stories
  getSuccessStories: async () => {
    try {
      const storiesQuery = query(
        collection(db, 'alumni_stories'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(storiesQuery);
      const stories = [];

      for (const doc of snapshot.docs) {
        const storyData = doc.data();
        const author = await getDoc(doc(db, 'alumni', storyData.authorId));

        stories.push({
          id: doc.id,
          ...storyData,
          author: author.exists()
            ? {
                name: author.data().name,
                photoURL: author.data().photoURL || author.data().profilePhoto || '',
                graduationYear: author.data().graduationYear,
              }
            : null,
        });
      }

      return { success: true, data: stories };
    } catch (error) {
      if (error?.code === 'failed-precondition' || /index/i.test(error?.message || '')) {
        try {
          const fallbackSnapshot = await getDocs(collection(db, 'alumni_stories'));
          const stories = [];

          for (const doc of fallbackSnapshot.docs) {
            const storyData = doc.data();
            if (storyData.status !== 'published') continue;

            const author = storyData.authorId ? await getDoc(doc(db, 'alumni', storyData.authorId)) : null;

            stories.push({
              id: doc.id,
              ...storyData,
              author: author?.exists()
                ? {
                    name: author.data().name,
                    photoURL: author.data().photoURL || author.data().profilePhoto || '',
                    graduationYear: author.data().graduationYear,
                  }
                : null,
            });
          }

          stories.sort((a, b) => {
            const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return bDate - aDate;
          });

          return { success: true, data: stories.slice(0, 10) };
        } catch (fallbackError) {
          console.error('Error getting success stories with fallback:', fallbackError);
          return { success: true, data: [] };
        }
      }

      console.error('Error getting success stories:', error);
      return { success: true, data: [] };
    }
  },

  // Create Success Story
  createSuccessStory: async (storyData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const story = {
        authorId: userId,
        title: storyData.title,
        content: storyData.content,
        imageUrl: storyData.imageUrl || null,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'alumni_stories'), story);

      return { success: true, data: { id: docRef.id, ...story } };
    } catch (error) {
      console.error('Error creating success story:', error);
      return { success: false, message: error.message };
    }
  },

  // Get Dashboard Stats (Legacy compatibility)
  getDashboardStats: async () => {
    return alumniService.getOverview();
  },

  // Train Model (Admin only)
  trainModel: async (modelId, trainingData) => {
    const user = auth.currentUser;
    if (!user) return { success: false, message: 'Not authenticated' };

    // Check if admin (you may want to verify admin status)
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().userType !== 'admin') {
      return { success: false, message: 'Admin access required' };
    }

    try {
      const response = await request(`/api/alumni/train/${modelId}`, {
        method: 'POST',
        body: JSON.stringify(trainingData),
      });

      return response;
    } catch (error) {
      console.error('Error training model:', error);
      return { success: false, message: error.message };
    }
  },

  // Make Prediction using specific model
  predict: async (modelId, payload) => {
    try {
      const response = await request(`/api/alumni/predict/${modelId}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response;
    } catch (error) {
      console.error('Error making prediction:', error);
      return { success: false, message: error.message };
    }
  },
};

// Helper functions
function calculateEngagementScore(data) {
  let score = 0;
  score += Math.min(data.connections / 50, 1) * 25;
  score += Math.min(data.mentorshipHours / 20, 1) * 25;
  score += Math.min(data.donationAmount / 1000, 1) * 25;
  score += Math.min(data.eventsAttended / 10, 1) * 15;
  score += Math.min(data.storiesShared / 5, 1) * 10;
  return Math.round(score);
}

function calculateEngagementScoreFromData(logins, views, interactions) {
  let score = 0;
  score += Math.min(logins / 30, 1) * 40;
  score += Math.min(views / 50, 1) * 30;
  score += Math.min(interactions / 20, 1) * 30;
  return Math.round(score);
}

function calculateMonthlyGrowth(data) {
  if (data.length < 2) return 5;
  const lastMonth = data.filter((d) => {
    const date = d.createdAt?.toDate?.() || new Date(d.createdAt);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return date >= monthAgo;
  }).length;

  const previousMonth = data.filter((d) => {
    const date = d.createdAt?.toDate?.() || new Date(d.createdAt);
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return date >= twoMonthsAgo && date < oneMonthAgo;
  }).length;

  if (previousMonth === 0) return 10;
  return Math.round(((lastMonth - previousMonth) / previousMonth) * 100);
}

function calculateDonationRate(donations) {
  const completed = donations.filter((d) => d.status === 'completed');
  if (completed.length === 0) return 0;
  const total = completed.reduce((sum, d) => sum + (d.amount || 0), 0);
  return total / completed.length;
}

function calculatePotentialImpact(donations) {
  const avgDonation = calculateDonationRate(donations);
  return (avgDonation * 0.25) / 100;
}

function calculateMentorshipSuccessRate(mentorships) {
  const completed = mentorships.filter((m) => m.status === 'completed').length;
  const total = mentorships.length;
  if (total === 0) return 85;
  return Math.round((completed / total) * 100);
}

async function getMutualConnections(userId1, userId2) {
  try {
    const connections1 = await getFirestoreData('alumni_connections', userId1);
    const connections2 = await getFirestoreData('alumni_connections', userId2);

    const set1 = new Set(connections1.map((c) => c.connectedUserId));
    const set2 = new Set(connections2.map((c) => c.connectedUserId));

    const mutual = [...set1].filter((id) => set2.has(id));
    return mutual.length;
  } catch (error) {
    return 0;
  }
}

function getRecognitionLevel(amount) {
  if (amount >= 10000) return 'Platinum Benefactor';
  if (amount >= 5000) return 'Gold Benefactor';
  if (amount >= 1000) return 'Silver Supporter';
  if (amount >= 500) return 'Bronze Supporter';
  if (amount > 0) return 'Friend of the Foundation';
  return 'Not yet donated';
}

async function getImpactStories() {
  try {
    const stories = await getFirestoreData('impact_stories', null);
    return stories.slice(0, 3).map((s) => ({
      title: s.title,
      description: s.description,
      impact: s.impact,
    }));
  } catch (error) {
    return [
      { title: 'Scholarship Fund', description: 'Provided 5 scholarships', impact: '5 students' },
      { title: 'Mentorship Program', description: 'Guided 10 students', impact: '10 mentees' },
    ];
  }
}

function getMonthlyBreakdown(donations) {
  const months = {};
  donations.forEach((d) => {
    const date = d.paidAt?.toDate?.() || new Date(d.paidAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    months[monthKey] = (months[monthKey] || 0) + (d.amount || 0);
  });

  return Object.entries(months).map(([month, amount]) => ({ month, amount }));
}

export default alumniService;
