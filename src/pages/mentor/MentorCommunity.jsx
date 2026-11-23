// src/pages/mentor/MentorCommunity.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc,
  query, where, orderBy, limit, startAfter, onSnapshot, serverTimestamp,
  increment, arrayUnion, arrayRemove, writeBatch
} from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { supabaseMediaService } from '../../services/supabaseMediaService';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/apiClient';
import { useNotification } from '../../context/NotificationContext';
import {
  Users, UserPlus, UserMinus, UserCheck, MessageCircle, MessageSquare,
  Heart, ThumbsUp, Share2, Bookmark, Flag, Send, Search, Filter, Plus,
  X, Check, CheckCircle, CheckCircle2, AlertCircle, Info, Clock, Clock3,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreVertical,
  Edit2, Trash2, Eye, EyeOff, RefreshCw, Loader2, Sparkles, Rocket,
  Trophy, Crown, Medal, Award, Star, Zap, Target, TrendingUp, Activity,
  BarChart3, PieChart, LineChart, Globe, MapPin, Building, Briefcase,
  GraduationCap, Calendar, Video, Mic, Camera, Image, Paperclip, Link,
  ExternalLink, Hash, AtSign, Bell, BellOff, Pin, PinOff, Lock, Unlock,
  Shield, Key, Fingerprint, Settings, Sliders, Layers, Grid, List,
  LayoutGrid, LayoutList, Filter as FilterIcon, SortAsc, SortDesc
} from 'lucide-react';

const POSTS_PER_PAGE = 10;
const MEMBERS_PER_PAGE = 12;

const POST_TYPES = {
  DISCUSSION: 'discussion',
  QUESTION: 'question',
  ANNOUNCEMENT: 'announcement',
  RESOURCE: 'resource',
  POLL: 'poll',
  ACHIEVEMENT: 'achievement'
};

const GROUP_CATEGORIES = [
  { id: 'all', label: 'All Groups', icon: Layers },
  { id: 'tech', label: 'Technology', icon: Zap },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'design', label: 'Design', icon: Sparkles },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'finance', label: 'Finance', icon: TrendingUp }
];

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatNumber = (n) => {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

// ─────────── Hooks ───────────
const useCommunityPosts = (userId, filters = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (loadMore = false) => {
    if (!userId) return;
    setLoading(true);
    try {
      let q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'));
      if (filters.type && filters.type !== 'all') {
        q = query(collection(db, 'communityPosts'), where('type', '==', filters.type), orderBy('createdAt', 'desc'));
      }
      if (loadMore && lastDoc) q = query(q, startAfter(lastDoc));
      q = query(q, limit(POSTS_PER_PAGE));

      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(prev => loadMore ? [...prev, ...data] : data);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === POSTS_PER_PAGE);
    } catch (err) {
      console.error('fetchPosts error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, filters.type, lastDoc]);

  useEffect(() => { if (userId) fetchPosts(false); }, [userId, filters.type]);

  return { posts, loading, hasMore, fetchPosts, setPosts };
};

const useCommunityMembers = (userId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    apiRequest('/api/mentorship/mentors')
      .then((result) => {
        if (!cancelled) setMembers((result?.data || result || []).filter((member) => member.id !== userId));
      })
      .catch((err) => { if (!cancelled) console.error('Unable to load mentor directory:', err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  return { members, loading };
};

const useFollowing = (userId) => {
  const [following, setFollowing] = useState(new Set());

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, 'mentorFollows'), where('followerId', '==', userId));
    const unsub = onSnapshot(q, (snap) => {
      setFollowing(new Set(snap.docs.map(d => d.data().followingId)));
    });
    return () => unsub();
  }, [userId]);

  const toggleFollow = async (targetId) => {
    if (!userId || !targetId) return;
    const isFollowing = following.has(targetId);
    const docId = `${userId}_${targetId}`;
    try {
      if (isFollowing) {
        await deleteDoc(doc(db, 'mentorFollows', docId));
      } else {
        await setDoc(doc(db, 'mentorFollows', docId), {
          followerId: userId,
          followingId: targetId,
          createdAt: serverTimestamp()
        });
      }
      await supabase.from('mentor_follows').upsert({
        follower_id: userId,
        following_id: targetId,
        is_active: !isFollowing,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('toggleFollow error:', err);
    }
  };

  return { following, toggleFollow };
};

// ─────────── Components ───────────
const Avatar = ({ src, name, size = 'md', ring = false }) => {
  const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-2xl' };
  const initials = (name || '?').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0 ${ring ? 'ring-2 ring-white' : ''}`}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
};

const Badge = ({ children, variant = 'default', icon: Icon }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    pink: 'bg-pink-50 text-pink-700'
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-gray-900/60" onClick={onClose} />
        <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const cfg = {
    success: { bg: 'bg-green-50 border-green-200 text-green-800', Icon: CheckCircle2 },
    error: { bg: 'bg-red-50 border-red-200 text-red-800', Icon: X },
    warning: { bg: 'bg-amber-50 border-amber-200 text-amber-800', Icon: AlertCircle },
    info: { bg: 'bg-blue-50 border-blue-200 text-blue-800', Icon: Info }
  }[type];
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg ${cfg.bg}`}>
      <cfg.Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-white/50 rounded"><X className="w-4 h-4" /></button>
    </div>
  );
};

const PostCard = ({ post, currentUserId, onLike, onSave, onComment, onDelete, onReport, isAuthor }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isLiked = (post.likes || []).includes(currentUserId);
  const isSaved = (post.savedBy || []).includes(currentUserId);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const q = query(
        collection(db, 'postComments'),
        where('postId', '==', post.id),
        orderBy('createdAt', 'asc'),
        limit(50)
      );
      const snap = await getDocs(q);
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => { if (showComments) loadComments(); }, [showComments]);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    await onComment(post.id, commentText.trim());
    setCommentText('');
    await loadComments();
  };

  const typeVariant = {
    discussion: 'blue', question: 'amber', announcement: 'purple',
    resource: 'green', poll: 'pink', achievement: 'amber'
  }[post.type] || 'default';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={post.authorAvatar} name={post.authorName} size="md" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 text-sm">{post.authorName || 'Anonymous'}</p>
                {post.authorVerified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                <Badge variant={typeVariant}>{post.type}</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {post.authorTitle || 'Mentor'} • {formatRelativeTime(post.createdAt)}
              </p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                <button onClick={() => { setMenuOpen(false); navigator.clipboard.writeText(`${window.location.origin}/community/post/${post.id}`); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Link className="w-4 h-4" /> Copy link
                </button>
                <button onClick={() => { setMenuOpen(false); onSave(post.id); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Bookmark className="w-4 h-4" /> {isSaved ? 'Unsave' : 'Save'}
                </button>
                {isAuthor && (
                  <button onClick={() => { setMenuOpen(false); onDelete(post.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
                {!isAuthor && (
                  <button onClick={() => { setMenuOpen(false); onReport(post.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Flag className="w-4 h-4" /> Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {post.title && <h3 className="font-semibold text-gray-900 mt-4 text-base">{post.title}</h3>}
        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed">{post.content}</p>

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map((tag, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {post.media?.length > 0 && (
          <div className={`mt-4 grid gap-2 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.media.slice(0, 4).map((m, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-gray-100">
                <img src={m.url} alt="" className="w-full h-48 object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isLiked ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            {formatNumber(post.likeCount || 0)}
          </button>
          <button
            onClick={() => setShowComments(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {formatNumber(post.commentCount || 0)}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
        <button
          onClick={() => onSave(post.id)}
          className={`p-1.5 rounded-lg transition-colors ${isSaved ? 'text-amber-600 bg-amber-50' : 'text-gray-400 hover:bg-gray-100'}`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {showComments && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
          {loadingComments ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-blue-500 animate-spin" /></div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">No comments yet — be the first to reply</p>
          ) : (
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="flex items-start gap-2">
                  <Avatar src={c.authorAvatar} name={c.authorName} size="xs" />
                  <div className="flex-1 bg-white rounded-lg p-2.5 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-gray-900">{c.authorName}</p>
                      <span className="text-xs text-gray-400">{formatRelativeTime(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button
              onClick={submitComment}
              disabled={!commentText.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MemberCard = ({ member, isFollowing, onFollow, onMessage }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all">
    <div className="flex flex-col items-center text-center">
      <Avatar src={member.photoURL || member.avatar} name={member.displayName || member.name} size="lg" />
      <div className="mt-3 flex items-center gap-1.5">
        <p className="font-semibold text-gray-900 text-sm truncate">{member.displayName || member.name}</p>
        {member.verified && <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />}
      </div>
      <p className="text-xs text-gray-500 mt-0.5 truncate w-full">{member.title || 'Mentor'}</p>
      {member.expertise?.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mt-2">
          {member.expertise.slice(0, 2).map((s, i) => (
            <Badge key={i} variant="blue">{s}</Badge>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span><strong className="text-gray-900">{formatNumber(member.followersCount || 0)}</strong> Followers</span>
        <span><strong className="text-gray-900">{formatNumber(member.menteesCount || 0)}</strong> Mentees</span>
      </div>
      <div className="flex gap-2 mt-4 w-full">
        <button
          onClick={() => onFollow(member.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isFollowing ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isFollowing ? <><UserCheck className="w-3.5 h-3.5" /> Following</> : <><UserPlus className="w-3.5 h-3.5" /> Follow</>}
        </button>
        <button
          onClick={() => onMessage(member.id)}
          className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
);

// ─────────── Main ───────────
const MentorCommunity = () => {
  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('feed');
  const [filters, setFilters] = useState({ type: 'all', search: '' });
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [composeForm, setComposeForm] = useState({ title: '', content: '', type: POST_TYPES.DISCUSSION, tags: '', media: [] });
  const [mediaUploading, setMediaUploading] = useState(false);
  const [composeTagInput, setComposeTagInput] = useState('');
  const fileInputRef = useRef(null);

  const { posts, loading, hasMore, fetchPosts, setPosts } = useCommunityPosts(currentUser?.uid, filters);
  const { members, loading: membersLoading } = useCommunityMembers(currentUser?.uid);
  const { following, toggleFollow } = useFollowing(currentUser?.uid);

  const filteredPosts = useMemo(() => {
    if (!filters.search) return posts;
    const s = filters.search.toLowerCase();
    return posts.filter(p =>
      p.title?.toLowerCase().includes(s) ||
      p.content?.toLowerCase().includes(s) ||
      p.authorName?.toLowerCase().includes(s)
    );
  }, [posts, filters.search]);

  const filteredMembers = useMemo(() => {
    if (!filters.search) return members;
    const s = filters.search.toLowerCase();
    return members.filter(m =>
      (m.displayName || m.name || '').toLowerCase().includes(s) ||
      (m.title || '').toLowerCase().includes(s)
    );
  }, [members, filters.search]);

  // ─── Post actions ───
  const handleLike = async (postId) => {
    if (!currentUser) return;
    const postRef = doc(db, 'communityPosts', postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const isLiked = (post.likes || []).includes(currentUser.uid);
    try {
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
        likeCount: increment(isLiked ? -1 : 1),
        updatedAt: serverTimestamp()
      });
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        likes: isLiked ? (p.likes || []).filter(id => id !== currentUser.uid) : [...(p.likes || []), currentUser.uid],
        likeCount: (p.likeCount || 0) + (isLiked ? -1 : 1)
      } : p));
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to update like', type: 'error' });
    }
  };

  const handleSave = async (postId) => {
    if (!currentUser) return;
    const postRef = doc(db, 'communityPosts', postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const isSaved = (post.savedBy || []).includes(currentUser.uid);
    try {
      await updateDoc(postRef, {
        savedBy: isSaved ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
      });
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        savedBy: isSaved ? (p.savedBy || []).filter(id => id !== currentUser.uid) : [...(p.savedBy || []), currentUser.uid]
      } : p));
      setToast({ message: isSaved ? 'Removed from saved' : 'Saved!', type: 'success' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleComment = async (postId, content) => {
    if (!currentUser || !content) return;
    try {
      await addDoc(collection(db, 'postComments'), {
        postId,
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || 'Mentor',
        authorAvatar: userProfile?.photoURL || '',
        content,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'communityPosts', postId), {
        commentCount: increment(1),
        updatedAt: serverTimestamp()
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p));
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to post comment', type: 'error' });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      // Delete associated comments in batches
      const commentsSnap = await getDocs(query(collection(db, 'postComments'), where('postId', '==', postId)));
      const batch = writeBatch(db);
      commentsSnap.docs.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, 'communityPosts', postId));
      await batch.commit();
      setPosts(prev => prev.filter(p => p.id !== postId));
      setToast({ message: 'Post deleted', type: 'success' });
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to delete post', type: 'error' });
    }
  };

  const handleReport = async (postId) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'postReports'), {
        postId,
        reporterId: currentUser.uid,
        reporterName: userProfile?.displayName || 'Mentor',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setToast({ message: 'Report submitted. Thank you.', type: 'success' });
    } catch (e) {
      setToast({ message: 'Failed to submit report', type: 'error' });
    }
  };

  // ─── Media upload ───
  const handleMediaUpload = async (files) => {
    if (!files || !files.length) return;
    setMediaUploading(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map(async (file) => {
        const result = await supabaseMediaService.uploadFile(file, { folder: 'community' });
        return { url: result.url, storagePath: result.path, name: file.name, type: file.type, size: file.size };
      }));
      setComposeForm(prev => ({ ...prev, media: [...prev.media, ...uploaded] }));
    } catch (e) {
      console.error(e);
      setToast({ message: 'Upload failed', type: 'error' });
    } finally {
      setMediaUploading(false);
    }
  };

  // ─── Publish post ───
  const handlePublish = async () => {
    if (!composeForm.content.trim()) {
      setToast({ message: 'Post content is required', type: 'warning' });
      return;
    }
    try {
      const tags = composeForm.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
      const postData = {
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || 'Mentor',
        authorAvatar: userProfile?.photoURL || '',
        authorTitle: userProfile?.title || 'Mentor',
        authorVerified: userProfile?.verified || false,
        title: composeForm.title.trim(),
        content: composeForm.content.trim(),
        type: composeForm.type,
        tags,
        media: composeForm.media,
        likes: [],
        savedBy: [],
        likeCount: 0,
        commentCount: 0,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const ref = await addDoc(collection(db, 'communityPosts'), postData);

      // Supabase sync
      await supabase.from('community_posts').insert({
        firebase_id: ref.id,
        author_id: currentUser.uid,
        author_name: postData.authorName,
        title: postData.title,
        content: postData.content,
        post_type: postData.type,
        tags,
        status: 'published',
        created_at: new Date().toISOString()
      });

      setPosts(prev => [{ id: ref.id, ...postData, createdAt: { toDate: () => new Date() } }, ...prev]);
      setShowComposeModal(false);
      setComposeForm({ title: '', content: '', type: POST_TYPES.DISCUSSION, tags: '', media: [] });
      setToast({ message: 'Post published!', type: 'success' });
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to publish post', type: 'error' });
    }
  };

  const handleMessage = (memberId) => {
    window.location.href = `/messages?to=${memberId}`;
  };

  // ─── Render Feed ───
  const renderFeed = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Compose Trigger */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar src={userProfile?.photoURL} name={userProfile?.displayName} size="md" />
            <button
              onClick={() => setShowComposeModal(true)}
              className="flex-1 text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-500 transition-colors"
            >
              Share something with the community...
            </button>
            <button
              onClick={() => { setComposeForm(f => ({ ...f, type: POST_TYPES.QUESTION })); setShowComposeModal(true); }}
              className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ask a question"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setComposeForm(f => ({ ...f, type: POST_TYPES.RESOURCE })); setShowComposeModal(true); }}
              className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Share a resource"
            >
              <Link className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Post type filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', ...Object.values(POST_TYPES)].map(type => (
            <button
              key={type}
              onClick={() => setFilters(prev => ({ ...prev, type }))}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filters.type === type ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {type === 'all' ? 'All Posts' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No posts yet</h3>
            <p className="text-sm text-gray-500 mb-5">Be the first to start a discussion</p>
            <button
              onClick={() => setShowComposeModal(true)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.uid}
                isAuthor={post.authorId === currentUser?.uid}
                onLike={handleLike}
                onSave={handleSave}
                onComment={handleComment}
                onDelete={handleDeletePost}
                onReport={handleReport}
              />
            ))}
            {hasMore && (
              <button
                onClick={() => fetchPosts(true)}
                className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Load more posts
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        {/* Community stats */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Community Pulse
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Mentors</span>
              <span className="font-semibold text-gray-900">{formatNumber(members.length)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Posts Today</span>
              <span className="font-semibold text-gray-900">
                {posts.filter(p => p.createdAt && new Date() - (p.createdAt.toDate?.() || new Date(p.createdAt)) < 86400000).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Your Network</span>
              <span className="font-semibold text-gray-900">{following.size}</span>
            </div>
          </div>
        </div>

        {/* Suggested mentors */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" /> Suggested
            </h4>
            <button onClick={() => setActiveTab('members')} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              See all
            </button>
          </div>
          <div className="space-y-3">
            {members.slice(0, 4).map(m => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar src={m.photoURL || m.avatar} name={m.displayName || m.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{m.displayName || m.name}</p>
                  <p className="text-xs text-gray-500 truncate">{m.title || 'Mentor'}</p>
                </div>
                <button
                  onClick={() => toggleFollow(m.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    following.has(m.id) ? 'bg-gray-100 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {following.has(m.id) ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4 text-amber-600" /> Topics
          </h4>
          <div className="flex flex-wrap gap-2">
            {GROUP_CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <button
                key={c.id}
                onClick={() => setFilters(prev => ({ ...prev, search: c.label }))}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-full text-xs font-medium transition-colors"
              >
                <c.icon className="w-3 h-3" /> {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Render Members ───
  const renderMembers = () => (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search mentors by name or expertise..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="blue">{formatNumber(filteredMembers.length)} mentors</Badge>
          <Badge variant="green">{following.size} following</Badge>
        </div>
      </div>

      {membersLoading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No mentors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map(m => (
            <MemberCard
              key={m.id}
              member={m}
              isFollowing={following.has(m.id)}
              onFollow={toggleFollow}
              onMessage={handleMessage}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mentor Community</h1>
                <p className="text-sm text-gray-500">Connect, share, and grow with fellow mentors</p>
              </div>
            </div>
            <button
              onClick={() => setShowComposeModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Post
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {[
              { id: 'feed', label: 'Feed', icon: MessageSquare },
              { id: 'members', label: 'Members', icon: Users }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'feed' && renderFeed()}
        {activeTab === 'members' && renderMembers()}
      </div>

      {/* Compose Modal */}
      <Modal isOpen={showComposeModal} onClose={() => setShowComposeModal(false)} title="Create Post" size="lg">
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {Object.values(POST_TYPES).map(t => (
              <button
                key={t}
                onClick={() => setComposeForm(prev => ({ ...prev, type: t }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  composeForm.type === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <input
            value={composeForm.title}
            onChange={e => setComposeForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Title (optional)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={composeForm.content}
            onChange={e => setComposeForm(prev => ({ ...prev, content: e.target.value }))}
            placeholder="What's on your mind?"
            rows={6}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <input
            value={composeForm.tags}
            onChange={e => setComposeForm(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="Tags (comma-separated)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {composeForm.media.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {composeForm.media.map((m, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden bg-gray-100">
                  <img src={m.url} alt="" className="w-full h-32 object-cover" />
                  <button
                    onClick={() => setComposeForm(prev => ({ ...prev, media: prev.media.filter((_, idx) => idx !== i) }))}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => handleMediaUpload(e.target.files)} className="hidden" />
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={mediaUploading}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mediaUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                Media
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Paperclip className="w-4 h-4" /> Attach
              </button>
            </div>
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" /> Publish
            </button>
          </div>
        </div>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MentorCommunity;
