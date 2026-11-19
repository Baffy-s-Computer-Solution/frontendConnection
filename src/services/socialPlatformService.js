import {
  addDoc,
  arrayRemove,
  arrayUnion,
  auth,
  collection,
  deleteDoc,
  db,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from '../config/firebase';
import { cloudinaryService } from './cloudinaryService';

const SOCIAL_COLLECTION = 'social_posts';

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
    role: userProfile?.userType || 'member',
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
  hasLiked: (postData.likedBy || []).includes(userId),
});

const isSuperAdminProfile = (profile) => profile?.isSuperAdmin === true
  || profile?.adminLevel === 'super_admin'
  || profile?.role === 'super_admin'
  || profile?.userRole === 'super_admin';

const canViewPost = (post, userId, connectedIds = new Set(), superAdmin = false) => superAdmin || !post.visibility || post.visibility === 'public' || post.authorId === userId || (['friends', 'connections'].includes(post.visibility) && connectedIds.has(post.authorId));

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

const canAccessPost = async (post, userId, superAdmin = false) => {
  if (superAdmin) return true;
  if (!post || post.authorId === userId || !post.visibility || post.visibility === 'public') return true;
  if (!['friends', 'connections'].includes(post.visibility)) return false;
  return (await getConnectedIds(userId)).has(post.authorId);
};

export const socialPlatformService = {
  async getFeed(userProfile, pageSize = 12) {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, data: [], error: 'Sign in to view the community feed.' };

    try {
      const postsRef = collection(db, SOCIAL_COLLECTION);
      if (isSuperAdminProfile(userProfile)) {
        const snapshot = await getDocs(query(postsRef, orderBy('createdAt', 'desc'), limit(pageSize)));
        return { success: true, data: snapshot.docs.map((entry) => shapePost(entry.id, entry.data(), currentUser.uid)) };
      }
      const warnings = [];
      const ownResult = await getDocs(query(postsRef, where('authorId', '==', currentUser.uid), limit(pageSize)))
        .then((snapshot) => ({ status: 'fulfilled', value: snapshot }))
        .catch((error) => { warnings.push('Your own posts could not be loaded.'); console.error('Own social posts query failed:', error); return { status: 'rejected' }; });
      const [connectionsResult, blocksResult] = await Promise.allSettled([
        getConnectedIds(currentUser.uid),
        getBlockedIds(currentUser.uid),
      ]);
      const connectedIds = connectionsResult.status === 'fulfilled' ? connectionsResult.value : new Set();
      const blockedIds = blocksResult.status === 'fulfilled' ? blocksResult.value : new Set();
      if (connectionsResult.status === 'rejected') {
        warnings.push('Connection-only posts are temporarily unavailable.');
        console.error('Social connections feed lookup failed:', connectionsResult.reason);
      }
      if (blocksResult.status === 'rejected') {
        warnings.push('Public posts are hidden until block settings can be checked.');
        console.error('Social block feed lookup failed:', blocksResult.reason);
      }

      let publicDocs = [];
      if (blocksResult.status === 'fulfilled' && blockedIds.size <= 10) {
        try {
          const publicSnapshot = await getDocs(query(postsRef, where('visibility', '==', 'public'), ...(blockedIds.size ? [where('authorId', 'not-in', [...blockedIds])] : []), limit(pageSize)));
          publicDocs = publicSnapshot.docs;
        } catch (error) {
          warnings.push('Public posts are temporarily unavailable.');
          console.error('Public social posts query failed:', error);
        }
      }
      const connectedList = [...connectedIds].filter((friendId) => !blockedIds.has(friendId)).slice(0, 20);
      const friendResults = connectionsResult.status === 'fulfilled' && blocksResult.status === 'fulfilled'
        ? await Promise.allSettled(connectedList.map((friendId) => getDocs(query(postsRef, where('authorId', '==', friendId), where('visibility', 'in', ['friends', 'connections']), limit(pageSize)))))
        : [];
      if (friendResults.some((result) => result.status === 'rejected')) {
        warnings.push('Some connection posts could not be loaded.');
        friendResults.filter((result) => result.status === 'rejected').forEach((result) => console.error('Connection-only social posts query failed:', result.reason));
      }
      const entries = [...publicDocs, ...(ownResult.value?.docs || []), ...friendResults.filter((result) => result.status === 'fulfilled').flatMap((result) => result.value.docs)];
      const posts = [...new Map(entries.map((entry) => [entry.id, shapePost(entry.id, entry.data(), currentUser.uid)])).values()]
        .filter((post) => canViewPost(post, currentUser.uid, connectedIds))
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
        .slice(0, pageSize);
      return { success: true, data: posts, warning: warnings[0] || '' };
    } catch (error) {
      console.error('Unable to load social feed from Firestore:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  subscribeToFeed(onData, onError, pageSize = 12, userProfile = null) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      onError?.(new Error('Sign in to view the community feed.'));
      return () => {};
    }
    const postsRef = collection(db, SOCIAL_COLLECTION);
    if (isSuperAdminProfile(userProfile)) {
      return onSnapshot(query(postsRef, orderBy('createdAt', 'desc'), limit(pageSize)), (snapshot) => {
        onData(snapshot.docs.map((entry) => shapePost(entry.id, entry.data(), currentUser.uid)));
      }, onError);
    }
    const snapshots = new Map();
    const connectedStops = new Map();
    let publicStop = null;
    let friendIds = new Set();
    let blockedIds = new Set();
    const blockSnapshots = { blocking: [], blockedBy: [] };
    const blockReady = { blocking: false, blockedBy: false };
    const refreshPublicFeed = () => {
      publicStop?.();
      snapshots.delete('public');
      if (!blockReady.blocking || !blockReady.blockedBy) return;
      if (blockedIds.size > 10) { emit(); return; }
      const publicQuery = query(postsRef, where('visibility', '==', 'public'), ...(blockedIds.size ? [where('authorId', 'not-in', [...blockedIds])] : []), limit(pageSize));
      publicStop = onSnapshot(publicQuery, (snapshot) => { snapshots.set('public', snapshot); emit(); }, (error) => { console.error('Public social posts subscription failed:', error); onError?.(error); });
    };
    const refreshFriendFeeds = () => {
      connectedStops.forEach((stop) => stop());
      connectedStops.clear();
      if (!blockReady.blocking || !blockReady.blockedBy) { emit(); return; }
      [...friendIds].filter((friendId) => !blockedIds.has(friendId)).slice(0, 20).forEach((friendId) => {
        connectedStops.set(friendId, onSnapshot(query(postsRef, where('authorId', '==', friendId), where('visibility', 'in', ['friends', 'connections']), limit(pageSize)), (friendSnapshot) => { snapshots.set(`friend:${friendId}`, friendSnapshot); emit(); }, (error) => { console.warn('Connection-only post feed unavailable for a connection:', error); }));
      });
      emit();
    };
    const refreshBlockedIds = () => {
      blockedIds = new Set([
        ...blockSnapshots.blocking.map((entry) => entry.blockedId),
        ...blockSnapshots.blockedBy.map((entry) => entry.blockerId),
      ].filter(Boolean));
      refreshPublicFeed();
      refreshFriendFeeds();
    };
    const emit = () => {
      const entries = [...new Map([...snapshots.values()].flatMap((snapshot) => snapshot.docs).map((entry) => [entry.id, entry])).values()];
      onData(entries.map((entry) => shapePost(entry.id, entry.data(), currentUser.uid))
        .filter((post) => canViewPost(post, currentUser.uid, friendIds))
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
        .slice(0, pageSize));
    };
    const stops = [
      onSnapshot(query(postsRef, where('authorId', '==', currentUser.uid), limit(pageSize)), (snapshot) => { snapshots.set('own', snapshot); emit(); }, (error) => { console.error('Owned social posts subscription failed:', error); onError?.(error); }),
      onSnapshot(query(collection(db, 'social_blocks'), where('blockerId', '==', currentUser.uid), limit(100)), (snapshot) => { blockSnapshots.blocking = snapshot.docs.map((entry) => entry.data()); blockReady.blocking = true; refreshBlockedIds(); }, (error) => { console.error('Outgoing social blocks subscription failed:', error); onError?.(error); }),
      onSnapshot(query(collection(db, 'social_blocks'), where('blockedId', '==', currentUser.uid), limit(100)), (snapshot) => { blockSnapshots.blockedBy = snapshot.docs.map((entry) => entry.data()); blockReady.blockedBy = true; refreshBlockedIds(); }, (error) => { console.error('Incoming social blocks subscription failed:', error); onError?.(error); }),
      onSnapshot(query(collection(db, 'social_connections'), where('userIds', 'array-contains', currentUser.uid), limit(500)), (snapshot) => {
        friendIds = new Set(snapshot.docs.flatMap((entry) => entry.data().userIds || []).filter((id) => id !== currentUser.uid));
        refreshFriendFeeds();
      }, (error) => { console.error('Social connections feed subscription failed:', error); onError?.(error); }),
    ];
    refreshPublicFeed();
    return () => { stops.forEach((stop) => stop()); publicStop?.(); connectedStops.forEach((stop) => stop()); };
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
      const [usersSnapshot, blockedIds, connectedIds] = await Promise.all([
        getDocs(query(collection(db, 'users'), limit(200))),
        getBlockedIds(currentUser.uid),
        getConnectedIds(currentUser.uid),
      ]);
      const eligibleRoles = new Set(['student', 'mentor', 'company']);
      const data = usersSnapshot.docs.flatMap((entry) => {
        const user = entry.data() || {};
        const role = String(user.userType || user.role || '').toLowerCase();
        if (entry.id === currentUser.uid || !eligibleRoles.has(role) || blockedIds.has(entry.id)) return [];
        const isConnection = connectedIds.has(entry.id);
        const profileVisibility = user.privacySettings?.profileVisibility || user.profileVisibility || user.profile?.visibility || 'public';
        if (profileVisibility !== 'public' && !isConnection) return [];
        return [{
          id: entry.id,
          name: user.displayName || user.fullName || user.companyName || 'Community member',
          role,
          avatar: user.photoURL || user.profilePhoto || user.logo || '',
          headline: user.title || user.currentPosition || user.industry || user.fieldOfStudy || '',
          isConnection,
        }];
      });
      return { success: true, data };
    } catch (error) {
      console.error('Unable to load network directory:', error);
      return { success: false, data: [], error: error.message || 'Unable to load the network.' };
    }
  },

  async sendFriendRequest(person, userProfile) {
    const currentUser = auth.currentUser;
    if (!currentUser || !person?.id || person.id === currentUser.uid) throw new Error('Choose another member to connect with.');
    if (!['student', 'mentor', 'company'].includes(String(person.role || person.userType || '').toLowerCase())) throw new Error('Connection requests are available between students, mentors, and companies.');
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
        message: `${request.recipientName || 'A community member'} accepted your connection request.`, read: false, createdAt: Timestamp.now(),
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

    const author = await buildAuthorProfile(userProfile);
    const normalizedTags = (tags || []).filter(Boolean);

    try {
      const media = files?.length
        ? await Promise.all(files.map(async (file) => {
            const uploaded = await cloudinaryService.uploadToCloudinary(
              file,
              `social/${currentUser.uid}/posts`,
              { tags: ['social-post', `user-${currentUser.uid}`] }
            );
            if (!uploaded?.success || !uploaded.url) throw new Error(uploaded?.error || 'Cloudinary media upload failed');
            return { url: uploaded.url, publicId: uploaded.public_id, type: file.type.startsWith('video/') ? 'video' : 'image', name: file.name };
          }))
        : [];
      const post = {
        authorId: currentUser.uid,
        author,
        content: content.trim(),
        visibility: files?.length && userProfile?.privacySettings?.mediaVisibility === 'private'
          ? 'private'
          : files?.length && userProfile?.privacySettings?.mediaVisibility === 'connections' && visibility === 'public'
            ? 'friends'
            : visibility || 'public',
        tags: normalizedTags,
        media,
        likedBy: [],
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        comments: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, SOCIAL_COLLECTION), post);
      return { success: true, data: shapePost(docRef.id, post, currentUser.uid) };
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
      const postRef = doc(db, SOCIAL_COLLECTION, postId);
      await updateDoc(postRef, {
        likedBy: hasLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
        likes: hasLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
        likeCount: increment(hasLiked ? -1 : 1),
        likesCount: increment(hasLiked ? -1 : 1),
        updatedAt: Timestamp.now(),
      });

      return { success: true };
    } catch (error) {
      throw new Error(error.message || 'Unable to update this post.');
    }
  },

  async addComment(postId, body, userProfile) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const author = await buildAuthorProfile(userProfile);
    const comment = {
      id: `comment-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`,
      authorId: currentUser.uid,
      authorName: author.name,
      authorRole: author.role,
      authorAvatar: author.avatar,
      body: body.trim(),
      createdAt: Timestamp.now(),
    };

    try {
      const postRef = doc(db, SOCIAL_COLLECTION, postId);
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists() || !(await canAccessPost(postSnap.data(), currentUser.uid, isSuperAdminProfile(userProfile)))) {
        throw new Error('You do not have access to comment on this post.');
      }
      const postData = postSnap.data() || {};
      const comments = [...(postData.comments || []), comment];

      await updateDoc(postRef, {
        comments,
        commentCount: comments.length,
        commentsCount: comments.length,
        updatedAt: Timestamp.now(),
      });

      return { success: true, data: { ...comment, createdAt: normalizeDate(comment.createdAt) } };
    } catch (error) {
      throw new Error(error.message || 'Unable to add your comment.');
    }
  },

  async sharePost(postId, userProfile = null) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    try {
      const postRef = doc(db, SOCIAL_COLLECTION, postId);
      const snapshot = await getDoc(postRef);
      if (!snapshot.exists() || !(await canAccessPost(snapshot.data(), currentUser.uid, isSuperAdminProfile(userProfile)))) {
        throw new Error('You do not have access to share this post.');
      }
      await updateDoc(postRef, {
        shareCount: increment(1),
        sharesCount: increment(1),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      throw new Error(error.message || 'Unable to share this post.');
    }
    return { success: true };
  },

  async getSuggestions(userProfile) {
    const currentUser = auth.currentUser;
    const suggestions = [];

    try {
      const superAdmin = isSuperAdminProfile(userProfile);
      const [usersSnap, blockedIds, connections] = await Promise.all([
        getDocs(query(collection(db, 'users'), limit(30))),
        currentUser && !superAdmin ? getBlockedIds(currentUser.uid) : new Set(),
        currentUser && !superAdmin ? getConnectedIds(currentUser.uid) : new Set(),
      ]);
      usersSnap.forEach((entry) => {
        if (entry.id === currentUser?.uid || blockedIds.has(entry.id) || (!superAdmin && entry.data().privacySettings?.profileVisibility === 'private' && !connections.has(entry.id))) {
          return;
        }

        const data = entry.data();
        suggestions.push({
          id: entry.id,
          name: data.displayName || data.fullName || data.companyName || 'Community Member',
          role: data.userType || 'member',
          avatar: data.photoURL || data.profilePhoto || data.logo || '',
          headline:
            data.title ||
            data.currentPosition ||
            data.industry ||
            data.fieldOfStudy ||
            'Building something meaningful',
          mutualCount: Number(data.mutualCount || 0),
        });
      });
    } catch (error) {
      console.warn('Using default social suggestions', error);
    }

    if (suggestions.length > 0) {
      return { success: true, data: suggestions.slice(0, 5) };
    }

    return { success: true, data: [] };
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
