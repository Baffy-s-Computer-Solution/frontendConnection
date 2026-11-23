import {
  addDoc,
  auth,
  collection,
  deleteDoc,
  db,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from '../config/firebase';
import { supabaseMediaService } from './supabaseMediaService';
import { apiRequest } from './apiClient';


const PROFILE_COLLECTIONS = {
  admin: 'admins',
  alumni: 'alumni',
  company: 'companies',
  entrepreneur: 'entrepreneurs',
  government: 'government_profiles',
  institute: 'institutes',
  mentor: 'mentors',
  parent: 'parents',
  student: 'students',
  youth: 'youth',
};

const FRIEND_ACCOUNT_TYPES = new Set(['student', 'mentor']);
const normalizeAccountType = (profile) => String(profile?.userType || profile?.role || '').toLowerCase();

const normalizeDate = (value) => {
  if (!value) {
    return new Date().toISOString();
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
};

const buildAuthorProfile = async (userProfile) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  const baseProfile = {
    id: currentUser.uid,
    name:
      userProfile?.displayName ||
      userProfile?.fullName ||
      userProfile?.companyName ||
      currentUser.displayName ||
      currentUser.email?.split('@')[0] ||
      'Community Member',
    role: userProfile?.userType || userProfile?.role || 'member',
    avatar: userProfile?.photoURL || userProfile?.profilePhoto || userProfile?.logo || '',
    headline:
      userProfile?.headline ||
      userProfile?.title ||
      userProfile?.currentPosition ||
      userProfile?.industry ||
      userProfile?.businessIndustry ||
      userProfile?.fieldOfStudy ||
      'Sharing progress with the community',
  };

  if (!userProfile?.userType || !PROFILE_COLLECTIONS[userProfile.userType]) {
    return baseProfile;
  }

  try {
    const profileSnap = await getDoc(
      doc(db, PROFILE_COLLECTIONS[userProfile.userType], currentUser.uid)
    );
    if (!profileSnap.exists()) {
      return baseProfile;
    }

    const profileData = profileSnap.data();
    return {
      ...baseProfile,
      name:
        profileData.displayName ||
        profileData.fullName ||
        profileData.companyName ||
        profileData.instituteName ||
        profileData.businessName ||
        baseProfile.name,
      avatar:
        profileData.photoURL || profileData.profilePhoto || profileData.logo || baseProfile.avatar,
      headline:
        profileData.headline ||
        profileData.title ||
        profileData.currentPosition ||
        profileData.industry ||
        profileData.businessIndustry ||
        profileData.fieldOfStudy ||
        baseProfile.headline,
    };
  } catch (error) {
    console.warn('Falling back to base profile for social author metadata', error);
    return baseProfile;
  }
};

const shapePost = (id, postData, userId) => ({
  id,
  ...postData,
  createdAt: normalizeDate(postData.createdAt),
  updatedAt: normalizeDate(postData.updatedAt),
  likedBy: postData.likedBy || [],
  author: {
    ...(postData.author || {}),
    avatar: postData.author?.avatar || postData.authorPhoto || '',
  },
  comments: [...new Map((postData.comments || []).map((comment, index) => {
    const normalized = {
      ...comment,
      id: comment.id || `legacy-${id}-${index}`,
      createdAt: normalizeDate(comment.createdAt),
    };
    return [normalized.id, normalized];
  })).values()],
  likeCount: postData.likeCount ?? (postData.likedBy || []).length ?? 0,
  commentCount: postData.commentCount ?? (postData.comments || []).length ?? 0,
  shareCount: postData.shareCount ?? 0,
  hasLiked: typeof postData.hasLiked === 'boolean'
    ? postData.hasLiked
    : (postData.likedBy || []).includes(userId),
});

const getConnectedIds = async (userId) => {
  const snapshot = await getDocs(query(collection(db, 'social_connections'), where('userIds', 'array-contains', userId), limit(500)));
  return new Set(snapshot.docs.flatMap((entry) => entry.data().userIds || []).filter((id) => id !== userId));
};

const getBlockedIds = async (userId) => {
  const [blocking, blockedBy] = await Promise.all([
    getDocs(query(collection(db, 'social_blocks'), where('blockerId', '==', userId), limit(100))),
    getDocs(query(collection(db, 'social_blocks'), where('blockedId', '==', userId), limit(100))),
  ]);
  return new Set([
    ...blocking.docs.map((entry) => entry.data().blockedId),
    ...blockedBy.docs.map((entry) => entry.data().blockerId),
  ].filter(Boolean));
};

export const socialPlatformService = {
  async getFeed(userProfile, pageSize = 12) {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, data: [], error: 'Sign in to view the community feed.' };

    try {
      const data = await apiRequest(`/api/social/feed?limit=${encodeURIComponent(Math.min(Math.max(Number(pageSize) || 12, 1), 50))}`);
      return {
        success: true,
        data: Array.isArray(data) ? data.map((post) => shapePost(post.id, post, currentUser.uid)) : [],
      };
    } catch (error) {
      console.error('Unable to load social feed:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  subscribeToFeed(onData, onError, pageSize = 12, userProfile = null) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      onError?.(new Error('Sign in to view the community feed.'));
      return () => {};
    }
    let stopped = false;
    let timerId;
    let requestInProgress = false;
    const refresh = async () => {
      if (stopped || requestInProgress) return;
      requestInProgress = true;
      const result = await this.getFeed(userProfile, pageSize);
      requestInProgress = false;
      if (stopped) return;
      if (result.success) onData(result.data);
      else onError?.(new Error(result.error || 'Unable to load the community feed.'));
    };
    refresh();
    timerId = setInterval(refresh, 30000);
    return () => { stopped = true; clearInterval(timerId); };
  },

  subscribeToNetwork(userId, onData, onError) {
    if (!userId) return () => {};
    const snapshots = { incoming: [], outgoing: [], connections: [] };
    const emit = () => onData?.(snapshots);
    const stops = [
      onSnapshot(query(collection(db, 'social_friend_requests'), where('recipientId', '==', userId), where('status', '==', 'pending'), limit(100)), (snapshot) => { snapshots.incoming = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })); emit(); }, onError),
      onSnapshot(query(collection(db, 'social_friend_requests'), where('senderId', '==', userId), where('status', '==', 'pending'), limit(100)), (snapshot) => { snapshots.outgoing = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })); emit(); }, onError),
      onSnapshot(query(collection(db, 'social_connections'), where('userIds', 'array-contains', userId), limit(500)), (snapshot) => { snapshots.connections = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })); emit(); }, onError),
    ];
    return () => stops.forEach((stop) => stop());
  },

  async getNetworkDirectory(userProfile) {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, data: [], error: 'Sign in to view the network.' };
    try {
      const result = await apiRequest('/api/social/suggestions?limit=50');
      const data = (result?.data || result || []).filter((person) => person.id !== currentUser.uid);
      return { success: true, data };
    } catch (error) {
      console.error('Unable to load network directory:', error);
      return { success: false, data: [], error: error.message || 'Unable to load the network.' };
    }
  },

  async sendFriendRequest(person, userProfile) {
    const currentUser = auth.currentUser;
    if (!currentUser || !person?.id || person.id === currentUser.uid) throw new Error('Choose another member to connect with.');
    const senderRole = normalizeAccountType(userProfile) || normalizeAccountType(currentUser);
    const recipientRole = String(person.role || person.userType || '').toLowerCase();
    if (senderRole === 'company' || recipientRole === 'company') {
      throw new Error('Company profiles are followed, not added as friends. Friend requests are for students and mentors.');
    }
    if (!FRIEND_ACCOUNT_TYPES.has(senderRole) || !FRIEND_ACCOUNT_TYPES.has(recipientRole)) {
      throw new Error('Friend requests are available between students and mentors only.');
    }
    if (await this.isBlocked(person.id)) throw new Error('A block is active between these accounts.');
    if ((await getConnectedIds(currentUser.uid)).has(person.id)) return { success: true, alreadyConnected: true };
    const existing = await getDocs(query(collection(db, 'social_friend_requests'), where('senderId', '==', currentUser.uid), where('recipientId', '==', person.id), where('status', '==', 'pending'), limit(1)));
    if (!existing.empty) return { success: true, alreadyPending: true };
    const incoming = await getDocs(query(collection(db, 'social_friend_requests'), where('senderId', '==', person.id), where('recipientId', '==', currentUser.uid), where('status', '==', 'pending'), limit(1)));
    if (!incoming.empty) return { success: true, incomingRequest: true, requestId: incoming.docs[0].id };
    const author = await buildAuthorProfile(userProfile);
    const request = { senderId: currentUser.uid, senderName: author.name, senderAvatar: author.avatar, senderRole: author.role, recipientId: person.id, recipientName: person.name || 'Member', recipientRole: person.role || person.userType || 'member', recipientAvatar: person.avatar || '', status: 'pending', createdAt: Timestamp.now(), updatedAt: Timestamp.now() };
    const reference = doc(collection(db, 'social_friend_requests'));
    const batch = writeBatch(db);
    batch.set(reference, request);
    batch.set(doc(collection(db, 'notifications')), {
      userId: person.id, type: 'friend_request', title: 'Connection request',
      message: `${author.name} wants to connect with you.`, read: false, createdAt: Timestamp.now(),
      friendRequestId: reference.id,
    });
    await batch.commit();
    return { success: true, data: { id: reference.id, ...request } };
  },

  async respondFriendRequest(request, status) {
    const currentUser = auth.currentUser;
    if (!currentUser || request?.recipientId !== currentUser.uid || !['accepted', 'rejected'].includes(status)) throw new Error('This connection request is no longer available.');
    if (status === 'accepted' && (request.senderRole === 'company' || request.recipientRole === 'company')) {
      throw new Error('Company profiles are followed, not added as friends.');
    }
    if (status === 'accepted' && (!FRIEND_ACCOUNT_TYPES.has(String(request.senderRole || '').toLowerCase()) || !FRIEND_ACCOUNT_TYPES.has(String(request.recipientRole || '').toLowerCase()))) {
      throw new Error('Friend connections are only available between students and mentors.');
    }
    if (status === 'accepted' && await this.isBlocked(request.senderId)) throw new Error('Unblock this member before accepting the request.');
    const batch = writeBatch(db);
    const requestRef = doc(db, 'social_friend_requests', request.id);
    batch.update(requestRef, { status, updatedAt: Timestamp.now() });
    if (status === 'accepted') {
      const userIds = [request.senderId, request.recipientId].sort();
      const connectionId = `${userIds[0]}_${userIds[1]}`;
      batch.set(doc(db, 'social_connections', connectionId), { userIds, requestId: request.id, createdAt: Timestamp.now() });
      batch.set(doc(collection(db, 'notifications')), {
        userId: request.senderId, type: 'friend_request_accepted', title: 'Request accepted',
        message: `${request.recipientName || 'A community member'} accepted your connection request.`, requestId: request.id, read: false, createdAt: Timestamp.now(),
      });
    }
    await batch.commit();
    return { success: true };
  },

  async cancelFriendRequest(request) {
    const currentUser = auth.currentUser;
    if (!currentUser || request?.senderId !== currentUser.uid || request.status !== 'pending') throw new Error('This sent request can no longer be cancelled.');
    await updateDoc(doc(db, 'social_friend_requests', request.id), { status: 'cancelled', updatedAt: Timestamp.now() });
    return { success: true };
  },

  async removeConnection(connection) {
    const currentUser = auth.currentUser;
    if (!currentUser || !connection?.id || !(connection.userIds || []).includes(currentUser.uid)) throw new Error('You cannot remove this connection.');
    await deleteDoc(doc(db, 'social_connections', connection.id));
    return { success: true };
  },

  async isBlocked(otherUserId) {
    const currentUser = auth.currentUser;
    if (!currentUser || !otherUserId || otherUserId === currentUser.uid) return false;
    const ids = [currentUser.uid, otherUserId];
    const [outgoing, incoming] = await Promise.all([
      getDoc(doc(db, 'social_blocks', `${currentUser.uid}_${otherUserId}`)),
      getDoc(doc(db, 'social_blocks', `${otherUserId}_${currentUser.uid}`)),
    ]);
    return outgoing.exists() || incoming.exists();
  },

  async blockUser(otherUserId, otherUserName = '') {
    const currentUser = auth.currentUser;
    if (!currentUser || !otherUserId || otherUserId === currentUser.uid) throw new Error('Choose a valid member to block.');
    const blockRef = doc(db, 'social_blocks', `${currentUser.uid}_${otherUserId}`);
    if ((await getDoc(blockRef)).exists()) return { success: true, alreadyBlocked: true };
    await setDoc(blockRef, {
      blockerId: currentUser.uid, blockedId: otherUserId, blockedName: otherUserName,
      createdAt: Timestamp.now(),
    });
    return { success: true };
  },

  async unblockUser(otherUserId) {
    const currentUser = auth.currentUser;
    if (!currentUser || !otherUserId) throw new Error('Sign in to manage blocked members.');
    await deleteDoc(doc(db, 'social_blocks', `${currentUser.uid}_${otherUserId}`));
    return { success: true };
  },

  async reportContent({ targetType, targetId, ownerId = '', reason, details = '' }) {
    const currentUser = auth.currentUser;
    const normalizedReason = String(reason || '').trim();
    if (!currentUser || !['profile', 'post', 'message'].includes(targetType) || !targetId || normalizedReason.length < 3) {
      throw new Error('Choose a report reason and provide at least 3 characters.');
    }
    await addDoc(collection(db, 'social_reports'), {
      reporterId: currentUser.uid, targetType, targetId, ownerId,
      reason: normalizedReason.slice(0, 120), details: String(details).trim().slice(0, 1000),
      status: 'open', createdAt: Timestamp.now(),
    });
    return { success: true };
  },

  async createPost({ content, visibility, tags, files }, userProfile) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const normalizedTags = (tags || []).filter(Boolean);

    try {
      const media = files?.length
        ? await Promise.all(files.map(async (file) => {
            const uploaded = await supabaseMediaService.uploadToSupabase(
              file,
              `social/${currentUser.uid}/posts`,
              { tags: ['social-post', `user-${currentUser.uid}`] }
            );
            if (!uploaded?.success || !uploaded.url || !uploaded.path) throw new Error(uploaded?.error || 'Supabase media upload failed');
            return { url: uploaded.url, storagePath: uploaded.path, type: file.type.startsWith('video/') ? 'video' : 'image', name: file.name };
          }))
        : [];
      const post = {
        content: content.trim(),
        visibility: files?.length && userProfile?.privacySettings?.mediaVisibility === 'private'
          ? 'private'
          : files?.length && userProfile?.privacySettings?.mediaVisibility === 'connections' && visibility === 'public'
            ? 'friends'
            : visibility || 'public',
        tags: normalizedTags,
        media,
      };

      const result = await apiRequest('/api/social/posts', { method: 'POST', body: post });
      return { success: true, data: result };
    } catch (error) {
      throw new Error(error.message || 'Unable to save this post to the community feed.');
    }
  },

  async toggleLike(postId, hasLiked) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    try {
      const data = await apiRequest(`/api/social/posts/${encodeURIComponent(postId)}/like`, { method: 'POST' });
      return { success: true, data };
    } catch (error) {
      throw new Error(error.message || 'Unable to update this post.');
    }
  },

  async addComment(postId, body, userProfile) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    try {
      const data = await apiRequest(`/api/social/posts/${encodeURIComponent(postId)}/comments`, {
        method: 'POST', body: { body: String(body || '').trim() },
      });
      return { success: true, data };
    } catch (error) {
      throw new Error(error.message || 'Unable to add your comment.');
    }
  },

  async sharePost(postId, userProfile = null) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    try {
      const data = await apiRequest(`/api/social/posts/${encodeURIComponent(postId)}/share`, { method: 'POST' });
      return { success: true, data };
    } catch (error) {
      throw new Error(error.message || 'Unable to share this post.');
    }
  },

  async getSuggestions(userProfile) {
    const currentUser = auth.currentUser;
    try {
      if (!currentUser) throw new Error('Not authenticated');
      const data = await apiRequest('/api/social/suggestions');
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.warn('Unable to load social suggestions:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  async getTrendingTopics(userProfile) {
    const response = await this.getFeed(userProfile, 24);
    const tagCounts = new Map();

    for (const post of response.data || []) {
      for (const tag of post.tags || []) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    const topics = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    if (topics.length > 0) {
      return { success: true, data: topics };
    }

    return { success: true, data: [] };
  },
};

export default socialPlatformService;
