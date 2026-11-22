// frontend/src/services/alumniSocialService.js
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { apiRequest } from './apiClient';
import supabaseService from './supabaseService';

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Unable to read selected media'));
  reader.readAsDataURL(file);
});

// Helper function to upload multiple media files
async function uploadMultipleMedia(files, userId, folder) {
    const urls = [];
  for (const file of files) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      throw new Error('Media must be a JPG, PNG, or WEBP image under 5MB');
    }
    const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
    const objectPath = `alumni/${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    const uploaded = await supabaseService.uploadBase64({ path: objectPath, file: await fileToDataUrl(file), contentType: file.type });
    const url = uploaded?.publicUrl || uploaded?.data?.publicUrl || uploaded?.data?.url;
    if (!uploaded?.success || !url) throw new Error(uploaded?.error || 'Supabase media upload failed');
    urls.push({ url, path: objectPath });
  }
  return urls;
}

// Helper function to get post comments
async function getPostComments(postId, limitCount = 10) {
  const postRef = doc(db, 'social_posts', postId);
  const postSnap = await getDoc(postRef);
  const postData = postSnap.data();
  const comments = postData?.comments || [];
  return comments.slice(0, limitCount);
}

// Helper function to check if post is saved
async function isPostSaved(userId, postId) {
  const savedRef = doc(db, 'alumni_saved_posts', `${userId}_${postId}`);
  const savedSnap = await getDoc(savedRef);
  return savedSnap.exists();
}

// Helper function to create notification
async function createNotification(notificationData) {
  const notification = {
    ...notificationData,
    read: false,
    createdAt: Timestamp.now(),
  };

  await addDoc(collection(db, 'alumni_notifications'), notification);
}

// Main service object
export const alumniSocialService = {
  // Create a new post
  createPost: async (postData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const userRef = doc(db, 'alumni', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};

      let mediaUrls = [];
      if (postData.mediaFiles && postData.mediaFiles.length > 0) {
        mediaUrls = await uploadMultipleMedia(postData.mediaFiles, userId, 'posts');
      }

      const author = {
        id: userId,
        name: userData.displayName || userData.fullName || userData.name || auth.currentUser.displayName || 'Alumni',
        role: 'alumni',
        avatar: userData.photoURL || userData.profilePhoto || null,
        headline: userData.position || userData.title || 'Alumni',
      };
      const post = {
        authorId: userId,
        author,
        userId,
        authorName: author.name,
        authorPhoto: author.avatar,
        authorTitle: author.headline,
        authorCompany: userData.company || '',
        content: postData.content || '',
        media: mediaUrls.map((asset) => ({ ...asset, storageType: 'supabase', type: 'image' })),
        mediaType: postData.mediaType || 'image',
        type: postData.type || 'post',
        privacy: postData.privacy || 'public',
        visibility: postData.privacy || 'public',
        likes: [],
        likedBy: [],
        likesCount: 0,
        likeCount: 0,
        comments: [],
        commentsCount: 0,
        commentCount: 0,
        shares: 0,
        sharesCount: 0,
        shareCount: 0,
        tags: postData.tags || [],
        location: postData.location || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'social_posts'), post);

      return { success: true, data: { id: docRef.id, ...post } };
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, error: error.message };
    }
  },

  // Get feed posts
  getFeed: async (lastDoc = null, pageSize = 10, filter = 'all', sort = 'latest') => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      let postsQuery = query(
        collection(db, 'social_posts'),
        orderBy('createdAt', 'desc'),
        limit(pageSize * 2)
      );

      if (lastDoc) {
        postsQuery = query(postsQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(postsQuery);
      const posts = [];
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      for (const doc of snapshot.docs) {
        const postData = doc.data();
        const isLiked = postData.likes?.includes(userId) || postData.likedBy?.includes(userId) || false;

        posts.push({
          id: doc.id,
          ...postData,
          userId: postData.userId || postData.authorId,
          authorId: postData.authorId || postData.userId,
          isLiked: isLiked,
          likeCount: postData.likeCount ?? postData.likesCount ?? postData.likedBy?.length ?? postData.likes?.length ?? 0,
          commentsCount: postData.commentCount ?? postData.commentsCount ?? postData.comments?.length ?? 0,
        });
      }

      const [outgoingConnections, incomingConnections] = await Promise.all([
        getDocs(query(collection(db, 'alumni_connections'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'alumni_connections'), where('connectedUserId', '==', userId))),
      ]);
      const connectedIds = new Set();
      outgoingConnections.docs.forEach((item) => {
        const connection = item.data();
        if (connection.status === 'connected') connectedIds.add(connection.connectedUserId);
      });
      incomingConnections.docs.forEach((item) => {
        const connection = item.data();
        if (connection.status === 'connected') connectedIds.add(connection.userId);
      });
      const visiblePosts = posts.filter((post) => {
        const privacy = post.privacy || post.visibility || 'public';
        const visible = privacy === 'public' || post.userId === userId ||
          (privacy === 'connections' && connectedIds.has(post.userId));
        return visible && (filter !== 'connections' || connectedIds.has(post.userId) || post.userId === userId);
      });
      if (filter === 'trending' || sort === 'trending' || sort === 'popular') {
        visiblePosts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      }
      const data = visiblePosts.slice(0, pageSize);

      return {
        success: true,
        data,
        lastDoc: lastVisible,
        hasMore: snapshot.docs.length === pageSize * 2,
      };
    } catch (error) {
      console.error('Error getting feed:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Like a post
  likePost: async (postId) => {
    try {
      const data = await apiRequest(`/api/social/posts/${encodeURIComponent(postId)}/like`, { method: 'POST' });
      return { success: true, data };
    } catch (error) {
      console.error('Error liking post:', error);
      return { success: false, error: error.message };
    }
  },

  // Unlike a post
  unlikePost: async (postId) => {
    try {
      const data = await apiRequest(`/api/social/posts/${encodeURIComponent(postId)}/like`, { method: 'POST' });
      return { success: true, data };
    } catch (error) {
      console.error('Error unliking post:', error);
      return { success: false, error: error.message };
    }
  },

  // Add comment
  addComment: async (postId, commentText) => {
    try {
      const data = await apiRequest(`/api/social/posts/${encodeURIComponent(postId)}/comments`, { method: 'POST', body: { body: commentText } });
      return { success: true, data };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  },

  // Share a post
  sharePost: async (postId, shareMessage = '') => {
    try {
      const data = await apiRequest(`/api/social/posts/${encodeURIComponent(postId)}/share`, { method: 'POST', body: { message: String(shareMessage).slice(0, 500) } });
      return { success: true, data };
    } catch (error) {
      console.error('Error sharing post:', error);
      return { success: false, error: error.message };
    }
  },

  // Save post
  savePost: async (postId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      await setDoc(doc(db, 'alumni_saved_posts', `${userId}_${postId}`), {
        userId: userId,
        postId: postId,
        savedAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving post:', error);
      return { success: false, error: error.message };
    }
  },

  // Unsave post
  unsavePost: async (postId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      await deleteDoc(doc(db, 'alumni_saved_posts', `${userId}_${postId}`));
      return { success: true };
    } catch (error) {
      console.error('Error unsaving post:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete post
  deletePost: async (postId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const postRef = doc(db, 'social_posts', postId);
      const postSnapshot = await getDoc(postRef);
      if (!postSnapshot.exists()) return { success: false, error: 'Post not found' };
      const post = postSnapshot.data();
      if ((post.authorId || post.userId) !== userId) return { success: false, error: 'You can only delete your own posts' };

      for (const item of post.media || []) {
        if (item?.path) {
          await supabaseService.deleteObject(item.path);
        } else if (typeof item?.url === 'string' && item.url.includes('/storage/v1/object/public/')) {
          const objectPath = decodeURIComponent(item.url.split('/storage/v1/object/public/')[1].split('/').slice(1).join('/'));
          await supabaseService.deleteObject(objectPath);
        }
      }
      await deleteDoc(postRef);

      return { success: true };
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: error.message };
    }
  },

  // Report post
  reportPost: async (postId, reason) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const report = {
        postId: postId,
        userId: userId,
        reason: reason,
        status: 'pending',
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'alumni_reports'), report);
      return { success: true };
    } catch (error) {
      console.error('Error reporting post:', error);
      return { success: false, error: error.message };
    }
  },

  // Get notifications
  getNotifications: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const notificationsQuery = query(
        collection(db, 'alumni_notifications'),
        where('userId', '==', userId),
        limit(50)
      );

      const snapshot = await getDocs(notificationsQuery);
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })).sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bDate - aDate;
      });

      return { success: true, data: notifications };
    } catch (error) {
      console.error('Error getting notifications:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    try {
      await updateDoc(doc(db, 'alumni_notifications', notificationId), { read: true });
      return { success: true };
    } catch (error) {
      console.error('Error marking notification read:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const notificationsQuery = query(
        collection(db, 'alumni_notifications'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(notificationsQuery);
      const batch = writeBatch(db);

      snapshot.docs.filter((item) => item.data().read === false).forEach((item) => {
        batch.update(item.ref, { read: true });
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      return { success: false, error: error.message };
    }
  },

  // Get polls
  getPolls: async () => {
    try {
      const pollsQuery = query(
        collection(db, 'alumni_polls'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(pollsQuery);
      const polls = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: polls };
    } catch (error) {
      return { success: true, data: [] };
    }
  },

  // Vote on poll
  votePoll: async (pollId, optionId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const pollRef = doc(db, 'alumni_polls', pollId);
      const pollSnap = await getDoc(pollRef);
      const pollData = pollSnap.data();

      const updatedOptions = pollData.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
      );

      await updateDoc(pollRef, {
        options: updatedOptions,
        voters: arrayUnion(userId),
      });

      return { success: true };
    } catch (error) {
      console.error('Error voting poll:', error);
      return { success: false, error: error.message };
    }
  },

  // Get announcements
  getAnnouncements: async () => {
    try {
      const announcementsQuery = query(
        collection(db, 'alumni_announcements'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(announcementsQuery);
      const announcements = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: announcements };
    } catch (error) {
      return { success: true, data: [] };
    }
  },
};

export default alumniSocialService;
