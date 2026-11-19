// frontend/src/pages/alumni/AlumniDashboard.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowDown, FaArrowUp, FaAward, FaBell, FaBookOpen, FaBriefcase, FaBullhorn,
  FaCalendarAlt, FaCheckCircle, FaComment, FaDonate, FaEllipsisH, FaExclamationTriangle,
  FaFilter, FaFlag, FaHandHoldingHeart, FaHeart, FaImage, FaLink, FaMapMarkerAlt,
  FaPlus, FaRegComment, FaRegHeart, FaSearch, FaShareAlt, FaSync, FaTimes, FaTrash,
  FaTrophy, FaUsers, FaUserPlus, FaVideo,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { alumniService } from '../../services/alumniService';
import { alumniSocialService } from '../../services/alumniSocialService';
import socialPlatformService from '../../services/socialPlatformService';
import { formatCurrency, formatDate, getRelativeTime, truncateText } from '../../utils/formatters';

// ============================================================
// Environment-safe helpers (never crash if env missing)
// ============================================================
const APP_NAME = import.meta.env.VITE_APP_NAME || 'Career Connect Lesotho';
const ENV = import.meta.env.VITE_APP_ENVIRONMENT || 'production';
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const safeLog = (...args) => {
  if (ENV !== 'production') console.debug('[AlumniDashboard]', ...args);
};

// OWASP: escape any user string before rendering as text content.
// React already escapes text nodes; this is a belt-and-braces guard used
// when we display raw values from URL params etc.
const safeText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).slice(0, 5000);
};

// ============================================================
// Small presentational components (pure Tailwind)
// ============================================================
const StatCard = ({ icon: Icon, label, value, accent = 'text-brand-600', bg = 'bg-brand-100', trend, trendUp }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
      <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${bg}`}>
        <Icon className={`h-4 w-4 ${accent}`} />
      </span>
    </div>
    {trend !== undefined && (
      <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
        {trendUp ? <FaArrowUp /> : <FaArrowDown />}
        <span>{trend}</span>
        <span className="font-normal text-slate-400">vs last month</span>
      </div>
    )}
  </div>
);

const Avatar = ({ src, name, size = 'md' }) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };
  const initials = safeText(name || 'A').charAt(0).toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={safeText(name || 'avatar')}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-800`}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }
  return (
    <span className={`${sizes[size]} inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-semibold text-white`}>
      {initials}
    </span>
  );
};

const Tag = ({ children, color = 'slate' }) => {
  const palette = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    violet: 'bg-violet-100 text-violet-700',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${palette[color]}`}>{children}</span>;
};

// ============================================================
// PostCard — the core feed item
// ============================================================
const PostCard = ({ post, currentUserId, onLike, onComment, onShare, onSave, onDelete, onReport }) => {
  const [comment, setComment] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const authorName = safeText(post.authorName || 'Alumni');
  const createdAt = post.createdAt?.toDate?.() || post.createdAt;
  const media = Array.isArray(post.media) ? post.media.filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u)) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = comment.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      await onComment(post.id, text);
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <header className="flex items-center gap-3 p-4 pb-2">
        <Avatar src={post.authorPhoto} name={authorName} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{authorName}</p>
          <p className="truncate text-xs text-slate-500">
            {[post.authorTitle, post.authorCompany, createdAt ? formatDate(createdAt, 'relative') : null].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onReport(post.id)} aria-label="Report post" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800">
            <FaFlag className="h-3.5 w-3.5" />
          </button>
          {post.userId === currentUserId && (
            <button
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete post"
              className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-slate-800"
            >
              <FaTrash className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      {confirmDelete && (
        <div className="mx-4 mb-2 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <span>Delete this post?</span>
          <div className="flex gap-2">
            <button onClick={() => { onDelete(post.id); setConfirmDelete(false); }} className="font-semibold">Yes</button>
            <button onClick={() => setConfirmDelete(false)} className="text-slate-500">Cancel</button>
          </div>
        </div>
      )}

      {post.content && (
        <div className="px-4 pb-2">
          <p className={`whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200 ${!expanded && post.content.length > 400 ? 'line-clamp-4' : ''}`}>
            {safeText(post.content)}
          </p>
          {post.content.length > 400 && (
            <button onClick={() => setExpanded(!expanded)} className="mt-1 text-xs font-semibold text-brand-600">
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {media.length > 0 && (
        <div className={`grid gap-1 px-4 pb-3 ${media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {media.slice(0, 4).map((url, i) => (
            <img
              key={`${url}-${i}`}
              src={url}
              alt={`Post attachment ${i + 1}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="max-h-96 w-full rounded-lg object-cover"
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
            />
          ))}
        </div>
      )}

      {post.location && (
        <p className="px-4 pb-2 text-xs text-slate-500">
          <FaMapMarkerAlt className="mr-1 inline" /> {safeText(post.location)}
        </p>
      )}

      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 pb-2">
          {post.tags.slice(0, 5).map((tag, i) => (
            <span key={i} className="text-xs text-brand-600">#{safeText(tag)}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 px-2 py-1 dark:border-slate-800">
        <button
          onClick={() => onLike(post.id, Boolean(post.isLiked))}
          aria-label={post.isLiked ? 'Unlike post' : 'Like post'}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${post.isLiked ? 'text-red-500' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          {post.isLiked ? <FaHeart /> : <FaRegHeart />}
          {post.likeCount ?? post.likesCount ?? 0}
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
          <FaRegComment />
          {post.commentCount ?? post.commentsCount ?? post.comments?.length ?? 0}
        </button>
        <button
          onClick={() => onShare(post.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <FaShareAlt /> Share
        </button>
        <button
          onClick={() => onSave(post.id, Boolean(post.isSaved))}
          aria-label={post.isSaved ? 'Unsave post' : 'Save post'}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${post.isSaved ? 'text-brand-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          {post.isSaved ? '★ Saved' : '☆ Save'}
        </button>
      </div>

      {Array.isArray(post.comments) && post.comments.length > 0 && (
        <div className="space-y-1 border-t border-slate-100 px-4 py-2 dark:border-slate-800">
          {post.comments.slice(-3).map((c, i) => (
            <p key={c.id || i} className="text-xs text-slate-600 dark:text-slate-300">
              <strong>{safeText(c.authorName || 'Alumni')}:</strong> {safeText(c.content || c.text || '')}
            </p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 1000))}
          placeholder="Write a comment…"
          maxLength={1000}
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
        />
        <button
          type="submit"
          disabled={!comment.trim() || submitting}
          className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? '…' : 'Post'}
        </button>
      </form>
    </article>
  );
};

// ============================================================
// MySchoolsCard — the "connect with previous schools" UI
// ============================================================
const MySchoolsCard = ({ schools = [], onRequestLink, onUnlink, loading }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FaBookOpen className="text-brand-600" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">My Schools</h3>
      </div>
      <button onClick={onRequestLink} className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
        <FaPlus className="h-3 w-3" /> Add school
      </button>
    </div>
    {loading ? (
      <div className="space-y-2">
        {[1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
      </div>
    ) : schools.length === 0 ? (
      <p className="text-xs text-slate-500">No schools linked yet. Connect a school to unlock mentors, jobs, and network suggestions from your alma mater.</p>
    ) : (
      <ul className="space-y-2">
        {schools.map((s) => (
          <li key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2 dark:border-slate-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <FaBookOpen className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{safeText(s.name)}</p>
              <p className="truncate text-[11px] text-slate-500">
                {s.status === 'verified' ? '✓ Verified' : s.status === 'pending' ? '⏳ Pending approval' : 'Unverified'} · {safeText(s.relationship || 'Alumni')}
              </p>
            </div>
            {s.status !== 'pending' && (
              <button onClick={() => onUnlink(s.id)} className="text-[11px] font-semibold text-slate-400 hover:text-red-500">
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    )}
  </section>
);

// ============================================================
// Main Dashboard
// ============================================================
const AlumniDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();

  // ---- Feed state
  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [feedFilter, setFeedFilter] = useState('all'); // all | connections | trending
  const [feedSort, setFeedSort] = useState('latest'); // latest | popular | discussed
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // ---- Dashboard metrics
  const [stats, setStats] = useState({
    total_connections: 0, posts_count: 0, total_donated: 0,
    events_attended: 0, achievements: 0, active_mentorships: 0,
    engagementScore: 0, trendingTopics: [], recentActivity: [],
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [networkSuggestions, setNetworkSuggestions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [polls, setPolls] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);

  // ---- Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // ---- Dialogs
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showSchoolLink, setShowSchoolLink] = useState(false);
  const [activeSharePostId, setActiveSharePostId] = useState(null);
  const [activeReportPostId, setActiveReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  // ---- Create-post form
  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [postPrivacy, setPostPrivacy] = useState('public');
  const [postTags, setPostTags] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  // ---- Donation form
  const [donationAmount, setDonationAmount] = useState('');
  const [donationCampaign, setDonationCampaign] = useState('general');
  const [donationMessage, setDonationMessage] = useState('');
  const [donationAnonymous, setDonationAnonymous] = useState(false);
  const [donationRecurring, setDonationRecurring] = useState(false);
  const [donationProcessing, setDonationProcessing] = useState(false);

  // ---- School-link form
  const [schoolName, setSchoolName] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [schoolRelationship, setSchoolRelationship] = useState('alumni');
  const [schoolLinking, setSchoolLinking] = useState(false);

  const fileInputRef = useRef(null);
  const feedEndRef = useRef(null);
  const observerRef = useRef(null);

  // ============================================================
  // Data loaders — designed to NEVER throw "requires index".
  // We order by createdAt only (single-field index is automatic),
  // and filter `privacy` client-side. Same for notifications.
  // ============================================================
  const loadFeed = useCallback(async (reset = false) => {
    if (reset) {
      setPosts([]);
      setLastDoc(null);
      setHasMore(true);
      setLoadingFeed(true);
    } else {
      if (!hasMore || loadingMore) return;
      setLoadingMore(true);
    }
    try {
      const result = await socialPlatformService.getFeed(userProfile, 30);
      if (result?.success) {
        let incoming = (Array.isArray(result.data) ? result.data : []).map((post) => ({
          ...post,
          userId: post.authorId || post.author?.id,
          authorName: post.author?.name || post.authorName || 'Community Member',
          authorPhoto: post.author?.avatar || post.authorPhoto || '',
          authorTitle: post.author?.headline || post.authorTitle || post.author?.role || '',
          authorCompany: post.authorCompany || '',
          media: (post.media || []).filter((item) => !item?.type || item.type === 'image').map((item) => typeof item === 'string' ? item : item?.url).filter(Boolean),
          isLiked: Boolean(post.hasLiked),
          isSaved: Boolean(post.isSaved),
          comments: (post.comments || []).map((comment) => ({
            ...comment,
            content: comment.content || comment.body || comment.text || '',
          })),
          commentsCount: post.commentCount ?? post.commentsCount ?? post.comments?.length ?? 0,
        }));
        if (feedFilter === 'connections') incoming = incoming.filter((post) => post.userId === currentUser?.uid || post.visibility === 'connections');
        if (feedFilter === 'trending' || feedSort === 'popular' || feedSort === 'discussed') {
          incoming.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
        }
        incoming = incoming.slice(0, 15);
        setPosts((prev) => (reset ? incoming : [...prev, ...incoming]));
        setLastDoc(null);
        setHasMore(false);
      } else {
        addErrorNotification('Feed', 'Unable to load feed. Please retry.');
      }
    } catch (err) {
      safeLog('feed error', err);
      addErrorNotification('Feed', 'Unable to load feed. Please retry.');
    } finally {
      setLoadingFeed(false);
      setLoadingMore(false);
    }
  }, [userProfile, currentUser?.uid, feedFilter, feedSort, addErrorNotification]);

  const loadDashboardData = useCallback(async () => {
    try {
      const [metricsRes, eventsRes, suggestionsRes, insightsRes, pollsRes, annRes, lbRes] = await Promise.allSettled([
        alumniService.getOverview(),
        alumniService.getUpcomingEvents(),
        alumniService.getNetworkSuggestions(),
        alumniService.getInsights(),
        alumniSocialService.getPolls?.(),
        alumniSocialService.getAnnouncements?.(),
        alumniService.getLeaderboard?.(),
      ]);
      if (metricsRes.status === 'fulfilled' && metricsRes.value?.success) {
        setStats((prev) => ({ ...prev, ...(metricsRes.value.data || {}) }));
      }
      if (eventsRes.status === 'fulfilled' && eventsRes.value?.success) setUpcomingEvents(eventsRes.value.data || []);
      if (suggestionsRes.status === 'fulfilled' && suggestionsRes.value?.success) setNetworkSuggestions(suggestionsRes.value.data || []);
      if (insightsRes.status === 'fulfilled' && insightsRes.value?.success) setInsights(insightsRes.value.data?.insights || []);
      if (pollsRes.status === 'fulfilled' && pollsRes.value?.success) setPolls(pollsRes.value.data || []);
      if (annRes.status === 'fulfilled' && annRes.value?.success) setAnnouncements(annRes.value.data || []);
      if (lbRes.status === 'fulfilled' && lbRes.value?.success) setLeaderboard(lbRes.value.data || []);
    } catch (err) {
      safeLog('dashboard data error', err);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const result = await alumniSocialService.getNotifications();
      if (result?.success) {
        const list = Array.isArray(result.data) ? result.data : [];
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.read).length);
      }
    } catch (err) {
      safeLog('notifications error', err);
    }
  }, []);

  const loadSchools = useCallback(async () => {
    setSchoolsLoading(true);
    try {
      const res = await alumniService.getLinkedSchools?.();
      if (res?.success) setSchools(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      safeLog('schools error', err);
    } finally {
      setSchoolsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(true);
    loadDashboardData();
    loadNotifications();
    loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedFilter, feedSort]);

  // Infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loadingFeed) {
          loadFeed(false);
        }
      },
      { threshold: 0.1 }
    );
    if (feedEndRef.current) observerRef.current.observe(feedEndRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loadingFeed, loadFeed]);

  // ============================================================
  // Handlers
  // ============================================================
  const handleLike = async (postId, isLiked) => {
    try {
      const result = await socialPlatformService.toggleLike(postId, isLiked);
      if (result?.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, isLiked: !isLiked, likeCount: Math.max(0, (p.likeCount || 0) + (isLiked ? -1 : 1)) }
              : p
          )
        );
      }
    } catch (err) {
      safeLog('like error', err);
    }
  };

  const handleComment = async (postId, text) => {
    const result = await socialPlatformService.addComment(postId, text, userProfile);
    if (result?.success) {
      await loadFeed(true);
      addSuccessNotification('Comment', 'Comment added');
    }
  };

  const handleShare = (postId) => {
    setActiveSharePostId(postId);
    setShareMessage('');
    setShowShare(true);
  };

  const handleShareSubmit = async () => {
    if (!activeSharePostId) return;
    try {
      const result = await socialPlatformService.sharePost(activeSharePostId);
      if (result?.success) {
        setShowShare(false);
        addSuccessNotification('Share', 'Post shared');
        await loadFeed(true);
      }
    } catch (err) {
      addErrorNotification('Share', 'Failed to share');
    }
  };

  const handleSave = async (postId, isSaved) => {
    const result = isSaved
      ? await alumniSocialService.unsavePost(postId)
      : await alumniSocialService.savePost(postId);
    if (result?.success) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isSaved: !isSaved } : p)));
    }
  };

  const handleDeletePost = async (postId) => {
    const result = await alumniSocialService.deletePost(postId);
    if (result?.success) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      addSuccessNotification('Post', 'Post deleted');
    }
  };

  const handleReportPost = (postId) => {
    setActiveReportPostId(postId);
    setReportReason('');
    setShowReport(true);
  };

  const handleReportSubmit = async () => {
    if (!reportReason) {
      addErrorNotification('Report', 'Please choose a reason');
      return;
    }
    try {
      const result = await alumniSocialService.reportPost(activeReportPostId, reportReason);
      if (result?.success) {
        setShowReport(false);
        addSuccessNotification('Report', 'Report submitted — thank you');
      }
    } catch (err) {
      addErrorNotification('Report', 'Failed to submit report');
    }
  };

  // Media select — OWASP: validate type + size
  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = [];
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        addErrorNotification('Upload', `${file.name}: unsupported type`);
        continue;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        addErrorNotification('Upload', `${file.name}: exceeds 10MB`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length > 0) {
      setSelectedMedia((prev) => [...prev, ...valid]);
      setMediaPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
    }
    e.target.value = '';
  };

  const removeMedia = (idx) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== idx));
    setMediaPreviews((prev) => {
      const url = prev[idx];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleCreatePost = async () => {
    if ((!postContent.trim() && selectedMedia.length === 0) || isPosting) return;
    setIsPosting(true);
    try {
      const tags = postTags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10);
      const result = await alumniSocialService.createPost({
        content: postContent.trim(),
        mediaFiles: selectedMedia,
        privacy: postPrivacy,
        tags,
        location: postLocation.trim(),
      });
      if (result?.success) {
        setPostContent('');
        mediaPreviews.forEach((u) => URL.revokeObjectURL(u));
        setSelectedMedia([]);
        setMediaPreviews([]);
        setPostTags('');
        setPostLocation('');
        setShowCreatePost(false);
        addSuccessNotification('Post', 'Post created');
        await loadFeed(true);
      } else {
        addErrorNotification('Post', result?.error || 'Failed to create post');
      }
    } finally {
      setIsPosting(false);
    }
  };

  const handleDonationSubmit = async () => {
    const amount = parseFloat(donationAmount);
    if (!amount || amount < 1) {
      addErrorNotification('Donation', 'Enter a valid amount (min $1)');
      return;
    }
    if (amount > 50000) {
      addErrorNotification('Donation', 'For amounts over $50,000 please contact us');
      return;
    }
    setDonationProcessing(true);
    try {
      const result = await alumniService.createDonation({
        amount,
        campaign: donationCampaign,
        message: donationMessage.slice(0, 500),
        isAnonymous: donationAnonymous,
        isRecurring: donationRecurring,
        paymentMethod: 'card',
      });
      if (result?.success) {
        setShowDonation(false);
        setDonationAmount('');
        setDonationMessage('');
        setDonationAnonymous(false);
        setDonationRecurring(false);
        addSuccessNotification('Thank you', 'Your donation was recorded');
        await loadDashboardData();
      } else {
        addErrorNotification('Donation', result?.error || 'Donation failed');
      }
    } finally {
      setDonationProcessing(false);
    }
  };

  const handleRequestSchoolLink = async () => {
    if (!schoolName.trim()) {
      addErrorNotification('School', 'Enter a school name');
      return;
    }
    setSchoolLinking(true);
    try {
      const res = await alumniService.requestSchoolLink?.({
        name: schoolName.trim(),
        graduationYear: schoolYear ? parseInt(schoolYear, 10) : null,
        relationship: schoolRelationship,
      });
      if (res?.success) {
        setShowSchoolLink(false);
        setSchoolName('');
        setSchoolYear('');
        addSuccessNotification('School', 'Verification request submitted');
        await loadSchools();
      } else {
        addErrorNotification('School', res?.error || 'Request failed');
      }
    } finally {
      setSchoolLinking(false);
    }
  };

  const handleUnlinkSchool = async (id) => {
    if (!window.confirm('Remove this school from your profile?')) return;
    const res = await alumniService.unlinkSchool?.(id);
    if (res?.success) {
      await loadSchools();
      addSuccessNotification('School', 'School removed');
    }
  };

  // ============================================================
  // Derived data
  // ============================================================
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        (p.content || '').toLowerCase().includes(q) ||
        (p.authorName || '').toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const statCards = useMemo(
    () => [
      { label: 'Network Size', value: stats.total_connections || 0, icon: FaUsers, accent: 'text-brand-600', bg: 'bg-brand-100', trend: '+12%', trendUp: true },
      { label: 'Posts Shared', value: stats.posts_count || 0, icon: FaBullhorn, accent: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+8%', trendUp: true },
      { label: 'Total Donated', value: formatCurrency(stats.total_donated || 0), icon: FaDonate, accent: 'text-amber-600', bg: 'bg-amber-100', trend: '+25%', trendUp: true },
      { label: 'Events Attended', value: stats.events_attended || 0, icon: FaCalendarAlt, accent: 'text-violet-600', bg: 'bg-violet-100', trend: '+5', trendUp: true },
      { label: 'Achievements', value: stats.achievements || 0, icon: FaTrophy, accent: 'text-red-600', bg: 'bg-red-100', trend: '+3', trendUp: true },
      { label: 'Mentorships', value: stats.active_mentorships || 0, icon: FaHandHoldingHeart, accent: 'text-sky-600', bg: 'bg-sky-100', trend: '+15%', trendUp: true },
    ],
    [stats]
  );

  const engagementColor = stats.engagementScore >= 80 ? 'emerald' : stats.engagementScore >= 60 ? 'amber' : 'red';

  // ============================================================
  // Render
  // ============================================================
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">

        {/* ===== Header ===== */}
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Alumni Dashboard · {APP_NAME}</p>
              <h1 className="mt-1 truncate text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
                Welcome back, {userProfile?.displayName || currentUser?.displayName || 'Alumni'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Stay connected with your alma mater and community.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowSearch((v) => !v)}
                aria-label="Toggle search"
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <FaSearch className="h-4 w-4" />
              </button>
              <button
                onClick={() => { loadFeed(true); loadDashboardData(); loadNotifications(); loadSchools(); }}
                aria-label="Refresh"
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <FaSync className="h-4 w-4" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications((v) => !v)}
                  aria-label="Notifications"
                  className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <FaBell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 z-20 mt-2 w-80 max-w-[90vw] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 p-3 dark:border-slate-800">
                      <p className="text-sm font-semibold">Notifications</p>
                      <button
                        onClick={async () => {
                          await alumniSocialService.markAllNotificationsRead?.();
                          setNotifications((n) => n.map((x) => ({ ...x, read: true })));
                          setUnreadCount(0);
                        }}
                        className="text-xs font-semibold text-brand-600"
                      >
                        Mark all read
                      </button>
                    </div>
                    <ul className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <li className="p-4 text-center text-xs text-slate-500">No notifications</li>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <li
                            key={n.id}
                            className={`cursor-pointer border-b border-slate-50 p-3 text-xs hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${!n.read ? 'bg-brand-50/40' : ''}`}
                            onClick={async () => {
                              await alumniSocialService.markNotificationRead?.(n.id);
                              setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                              setUnreadCount((c) => Math.max(0, c - 1));
                            }}
                          >
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{safeText(n.title || 'Notification')}</p>
                            <p className="mt-0.5 text-slate-500">{safeText(n.message || '')}</p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {getRelativeTime(n.createdAt?.toDate?.() || n.createdAt)}
                            </p>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowDonation(true)}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <FaDonate className="h-4 w-4" /> Donate
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="mt-4">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.slice(0, 200))}
                placeholder="Search posts, people, events…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          )}
        </header>

        {/* ===== Stat grid ===== */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>

        {/* ===== Engagement banner ===== */}
        <section className={`mb-6 rounded-xl border-l-4 border-${engagementColor}-500 bg-white p-4 shadow-sm dark:bg-slate-900`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Engagement score</h2>
              <p className="text-xs text-slate-500">Based on your activity, connections, donations, and events.</p>
              <div className="mt-2 flex items-center gap-2">
                <Tag color={stats.engagementScore >= 60 ? 'green' : 'amber'}>
                  {stats.engagementScore >= 80 ? 'Excellent' : stats.engagementScore >= 60 ? 'Good' : stats.engagementScore >= 40 ? 'Fair' : 'Needs improvement'}
                </Tag>
                <span className="text-xs text-slate-500">Top {Math.max(1, 100 - (stats.engagementScore || 0))}% of alumni</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative h-20 w-20">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="16" fill="none"
                    stroke={stats.engagementScore >= 60 ? '#10b981' : '#f59e0b'}
                    strokeWidth="3"
                    strokeDasharray={`${(stats.engagementScore / 100) * 100} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800 dark:text-slate-100">
                  {stats.engagementScore || 0}
                </span>
              </div>
              <div className="hidden text-xs text-slate-500 sm:block">
                Keep participating to<br />unlock higher tiers
              </div>
            </div>
          </div>
        </section>

        {/* ===== Tabs ===== */}
        <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {['Feed', 'Network', 'Impact', 'Events', 'Insights', 'Achievements', 'Leaderboard'].map((t, i) => (
            <button
              key={t}
              onClick={() => { setActiveTab(i); if (i === 0) loadFeed(true); }}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${activeTab === i ? 'bg-brand-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ===== Tab content ===== */}
        {activeTab === 0 && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1">
                  {['all', 'connections', 'trending'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFeedFilter(f)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${feedFilter === f ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {['latest', 'popular', 'discussed'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFeedSort(s)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${feedSort === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowCreatePost(true)}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700"
              >
                <FaPlus className="h-4 w-4" /> Share something with the community
              </button>

              {loadingFeed && posts.length === 0 ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                          <div className="h-2 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
                        </div>
                      </div>
                      <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="mt-2 h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                  <FaBullhorn className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No posts yet</p>
                  <p className="mt-1 text-xs text-slate-500">Be the first to share something with your community.</p>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Create your first post
                  </button>
                </div>
              ) : (
                filteredPosts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    currentUserId={currentUser?.uid}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    onSave={handleSave}
                    onDelete={handleDeletePost}
                    onReport={handleReportPost}
                  />
                ))
              )}

              {loadingMore && (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
                </div>
              )}
              <div ref={feedEndRef} />
              {!hasMore && filteredPosts.length > 0 && (
                <p className="py-6 text-center text-xs text-slate-400">You've reached the end 🎉</p>
              )}
            </section>

            {/* Right sidebar */}
            <aside className="space-y-4">
              <MySchoolsCard
                schools={schools}
                loading={schoolsLoading}
                onRequestLink={() => setShowSchoolLink(true)}
                onUnlink={handleUnlinkSchool}
              />

              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">🤝 Suggested connections</h3>
                {networkSuggestions.length === 0 ? (
                  <p className="text-xs text-slate-500">No suggestions yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {networkSuggestions.slice(0, 4).map((s) => (
                      <li key={s.id} className="flex items-center gap-2">
                        <Avatar src={s.photoURL} name={s.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{safeText(s.name)}</p>
                          <p className="truncate text-[11px] text-slate-500">{safeText(s.position)} · {safeText(s.company)}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/alumni/network?connect=${encodeURIComponent(s.id)}`)}
                          className="rounded-lg border border-brand-200 p-1.5 text-brand-600 hover:bg-brand-50"
                          aria-label="Send connection request"
                        >
                          <FaUserPlus className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">📢 Announcements</h3>
                {announcements.length === 0 ? (
                  <p className="text-xs text-slate-500">Nothing new right now.</p>
                ) : (
                  announcements.slice(0, 3).map((a) => (
                    <div key={a.id} className="mb-2 rounded-lg bg-amber-50 p-2 last:mb-0">
                      <p className="text-xs font-semibold text-amber-800">{safeText(a.title)}</p>
                      <p className="mt-0.5 text-[11px] text-amber-700">{truncateText(safeText(a.content || ''), 120)}</p>
                    </div>
                  ))
                )}
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">🔥 Trending topics</h3>
                {(stats.trendingTopics || []).length === 0 ? (
                  <p className="text-xs text-slate-500">No trends yet.</p>
                ) : (
                  stats.trendingTopics.slice(0, 5).map((t, i) => (
                    <div key={i} className="mb-1 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <p className="text-[11px] text-slate-500">Trending</p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">#{safeText(t.hashtag)}</p>
                      <p className="text-[10px] text-slate-400">{t.posts || 0} posts</p>
                    </div>
                  ))
                )}
              </section>
            </aside>
          </div>
        )}

        {activeTab === 1 && (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {networkSuggestions.length === 0 ? (
              <div className="col-span-full rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                <FaUsers className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm text-slate-600 dark:text-slate-300">No network suggestions yet.</p>
              </div>
            ) : (
              networkSuggestions.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar src={s.photoURL} name={s.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{safeText(s.name)}</p>
                      <p className="truncate text-xs text-slate-500">{safeText(s.position)} · {safeText(s.company)}</p>
                      <p className="mt-0.5 text-[11px] text-brand-600">✓ {Math.round((s.matchScore || 0) * 100)}% match</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(s.commonInterests || []).slice(0, 3).map((tag, i) => (
                      <Tag key={i} color="slate">{safeText(tag)}</Tag>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate(`/alumni/network?connect=${encodeURIComponent(s.id)}`)}
                    className="mt-3 w-full rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Connect
                  </button>
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === 2 && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">📊 Lifetime impact</h3>
              <p className="mt-4 text-center text-4xl font-bold text-brand-600">{formatCurrency(stats.total_donated || 0)}</p>
              <p className="text-center text-xs text-slate-500">Total lifetime giving</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-brand-600"
                  style={{ width: `${Math.min(100, ((stats.total_donated || 0) / 10000) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-center text-[11px] text-slate-500">Next milestone: $10,000</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: 'Students', val: Math.floor((stats.total_donated || 0) / 100), bg: 'bg-blue-50 text-blue-700' },
                  { label: 'Scholarships', val: Math.floor((stats.total_donated || 0) / 500), bg: 'bg-emerald-50 text-emerald-700' },
                  { label: 'Books', val: Math.floor((stats.total_donated || 0) / 25), bg: 'bg-amber-50 text-amber-700' },
                  { label: 'Meals', val: Math.floor((stats.total_donated || 0) / 10), bg: 'bg-violet-50 text-violet-700' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-lg p-3 text-center ${s.bg}`}>
                    <p className="text-lg font-bold">{s.val}</p>
                    <p className="text-[11px]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">🏆 Recognition journey</h3>
              <ul className="mt-3 space-y-2">
                {[
                  { label: 'Friend', amt: 100 },
                  { label: 'Supporter', amt: 500 },
                  { label: 'Bronze', amt: 1000 },
                  { label: 'Silver', amt: 5000 },
                  { label: 'Gold', amt: 10000 },
                  { label: 'Platinum', amt: 25000 },
                ].map((tier) => {
                  const achieved = (stats.total_donated || 0) >= tier.amt;
                  return (
                    <li key={tier.label} className="flex items-center gap-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${achieved ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                        {achieved ? <FaCheckCircle /> : <FaAward />}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{tier.label}</p>
                        <p className="text-[11px] text-slate-500">${tier.amt.toLocaleString()}</p>
                      </div>
                      {achieved && <Tag color="green">Achieved</Tag>}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.length === 0 ? (
              <div className="col-span-full rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                <FaCalendarAlt className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm text-slate-600 dark:text-slate-300">No upcoming events yet.</p>
              </div>
            ) : (
              upcomingEvents.map((ev) => (
                <div key={ev.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  {ev.image && (
                    <img src={ev.image} alt={safeText(ev.title)} loading="lazy" referrerPolicy="no-referrer" className="h-40 w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  )}
                  <div className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{safeText(ev.title)}</h4>
                      {ev.isVirtual && <Tag color="brand">Virtual</Tag>}
                    </div>
                    <p className="flex items-center gap-1 text-xs text-slate-500"><FaCalendarAlt /> {formatDate(ev.startDate?.toDate?.() || ev.startDate, 'long')}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><FaMapMarkerAlt /> {safeText(ev.location || 'Virtual')}</p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{truncateText(safeText(ev.description || ''), 100)}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500"><FaUsers className="inline" /> {ev.registrationsCount || 0} registered</span>
                      <button
                        disabled={ev.isRegistered}
                        onClick={async () => {
                          const r = await alumniService.registerForEvent(ev.id);
                          if (r?.success) { addSuccessNotification('Event', 'Registered'); await loadDashboardData(); }
                        }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${ev.isRegistered ? 'bg-slate-100 text-slate-400' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
                      >
                        {ev.isRegistered ? 'Registered' : 'Register'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === 4 && (
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-600 dark:text-slate-300">No AI insights yet.</p>
              </div>
            ) : (
              insights.map((ins, i) => (
                <div key={i} className={`rounded-xl border p-4 ${ins.priority === 'high' ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
                  <div className="flex items-center gap-2">
                    <FaBullhorn className="text-brand-600" />
                    <h4 className="text-sm font-semibold text-slate-900">{safeText(ins.title)}</h4>
                    <Tag color={ins.priority === 'high' ? 'red' : 'amber'}>{safeText(ins.priority || 'info')}</Tag>
                  </div>
                  <p className="mt-2 text-xs text-slate-700">{safeText(ins.description || '')}</p>
                  {ins.recommendation && (
                    <p className="mt-2 rounded-lg bg-white p-2 text-xs text-slate-600">{safeText(ins.recommendation)}</p>
                  )}
                </div>
              ))
            )}

            {polls.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">📊 Community polls</h3>
                {polls.map((p) => {
                  const totalVotes = (p.options || []).reduce((s, o) => s + (o.votes || 0), 0);
                  return (
                    <div key={p.id} className="mb-4 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                      <p className="mb-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{safeText(p.question)}</p>
                      {(p.options || []).map((opt, i) => {
                        const pct = totalVotes > 0 ? ((opt.votes || 0) / totalVotes) * 100 : 0;
                        return (
                          <button
                            key={i}
                            disabled={p.userVoted}
                            onClick={async () => {
                              const r = await alumniSocialService.votePoll?.(p.id, opt.id);
                              if (r?.success) {
                                setPolls((prev) => prev.map((x) => x.id === p.id
                                  ? { ...x, userVoted: true, options: x.options.map((o) => o.id === opt.id ? { ...o, votes: (o.votes || 0) + 1 } : o) }
                                  : x));
                              }
                            }}
                            className="mb-2 block w-full rounded-lg border border-slate-200 p-2 text-left text-xs hover:bg-slate-50 disabled:cursor-default dark:border-slate-700"
                          >
                            <div className="flex items-center justify-between">
                              <span>{safeText(opt.text)}</span>
                              <span className="text-slate-500">{pct.toFixed(1)}%</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </section>
            )}
          </div>
        )}

        {activeTab === 5 && (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'First Post', desc: 'Shared your first post', unlocked: (stats.posts_count || 0) >= 1 },
              { name: 'Networker', desc: 'Connected with 10 alumni', unlocked: (stats.total_connections || 0) >= 10 },
              { name: 'Generous', desc: 'Made a donation', unlocked: (stats.total_donated || 0) > 0 },
              { name: 'Event Goer', desc: 'Attended an event', unlocked: (stats.events_attended || 0) > 0 },
              { name: 'Mentor', desc: 'Mentored a student', unlocked: (stats.active_mentorships || 0) > 0 },
              { name: 'Community Pillar', desc: '20+ posts', unlocked: (stats.posts_count || 0) >= 20 },
            ].map((a) => (
              <div key={a.name} className={`rounded-xl border p-4 text-center ${a.unlocked ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>
                <div className={`mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full ${a.unlocked ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                  <FaTrophy className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.name}</p>
                <p className="mt-1 text-[11px] text-slate-500">{a.desc}</p>
                {a.unlocked && <Tag color="green">Unlocked</Tag>}
              </div>
            ))}
          </section>
        )}

        {activeTab === 6 && (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-3 py-2">Rank</th>
                  <th className="px-3 py-2">Alumni</th>
                  <th className="px-3 py-2 text-center">Impact</th>
                  <th className="px-3 py-2 text-center">Donated</th>
                  <th className="px-3 py-2 text-center">Connections</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">Leaderboard loading…</td></tr>
                ) : (
                  leaderboard.slice(0, 20).map((m, i) => (
                    <tr key={m.id || i} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2 font-bold text-slate-500">#{i + 1}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Avatar src={m.photoURL} name={m.name} size="sm" />
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{safeText(m.name)}</p>
                            <p className="text-[11px] text-slate-500">{safeText(m.title || '')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center"><Tag color="brand">{m.impactScore || 0}%</Tag></td>
                      <td className="px-3 py-2 text-center">{formatCurrency(m.totalDonated || 0)}</td>
                      <td className="px-3 py-2 text-center">{m.connectionsCount || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* ===== Create Post Modal ===== */}
        {showCreatePost && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Create a post</h3>
                <button onClick={() => setShowCreatePost(false)} aria-label="Close" className="rounded p-1 text-slate-400 hover:text-red-500"><FaTimes /></button>
              </div>
              <select value={postPrivacy} onChange={(e) => setPostPrivacy(e.target.value)} className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800">
                <option value="public">🌍 Public</option>
                <option value="connections">👥 Connections only</option>
                <option value="only-me">🔒 Only me</option>
              </select>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value.slice(0, 5000))}
                rows={5}
                maxLength={5000}
                placeholder="Share your thoughts, achievements, or opportunities…"
                className="w-full resize-none rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800"
              />
              <p className="mt-1 text-right text-[11px] text-slate-400">{postContent.length}/5000</p>

              {mediaPreviews.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {mediaPreviews.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt={`preview ${i}`} className="h-20 w-20 rounded-lg object-cover" />
                      <button onClick={() => removeMedia(i)} className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 text-red-500 shadow" aria-label="Remove"><FaTimes className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}

              <input ref={fileInputRef} type="file" multiple accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={handleMediaSelect} className="hidden" />

              <div className="mb-2 flex flex-wrap gap-2 text-xs">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700"><FaImage /> Photo</button>
                <input value={postLocation} onChange={(e) => setPostLocation(e.target.value.slice(0, 100))} placeholder="Location" className="rounded-lg border border-slate-200 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <input value={postTags} onChange={(e) => setPostTags(e.target.value.slice(0, 200))} placeholder="Tags (comma-separated)" className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800" />

              <div className="flex justify-end gap-2">
                <button onClick={() => setShowCreatePost(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700">Cancel</button>
                <button onClick={handleCreatePost} disabled={isPosting || (!postContent.trim() && selectedMedia.length === 0)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                  {isPosting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Donation Modal ===== */}
        {showDonation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100"><FaDonate className="text-brand-600" /> Make a donation</h3>
                <button onClick={() => setShowDonation(false)} className="text-slate-400 hover:text-red-500" aria-label="Close"><FaTimes /></button>
              </div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Amount (USD)</label>
              <input
                type="number" min="1" max="50000" step="1"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="mt-1 mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Campaign</label>
              <select value={donationCampaign} onChange={(e) => setDonationCampaign(e.target.value)} className="mt-1 mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                <option value="general">🎓 General scholarship fund</option>
                <option value="mentorship">🤝 Mentorship program</option>
                <option value="infrastructure">🏗️ Infrastructure</option>
                <option value="innovation">💡 Innovation lab</option>
              </select>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Message (optional)</label>
              <textarea value={donationMessage} onChange={(e) => setDonationMessage(e.target.value.slice(0, 500))} rows={3} className="mt-1 mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <label className="mb-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={donationAnonymous} onChange={(e) => setDonationAnonymous(e.target.checked)} /> Anonymous
              </label>
              <label className="mb-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={donationRecurring} onChange={(e) => setDonationRecurring(e.target.checked)} /> Recurring monthly
              </label>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowDonation(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700">Cancel</button>
                <button onClick={handleDonationSubmit} disabled={donationProcessing || !donationAmount} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                  {donationProcessing ? 'Processing…' : 'Donate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Share Modal ===== */}
        {showShare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <h3 className="mb-3 text-base font-semibold">Share post</h3>
              <textarea value={shareMessage} onChange={(e) => setShareMessage(e.target.value.slice(0, 500))} rows={3} placeholder="Add a message (optional)…" className="mb-3 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowShare(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                <button onClick={handleShareSubmit} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Share</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Report Modal ===== */}
        {showReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <h3 className="mb-2 flex items-center gap-2 text-base font-semibold"><FaExclamationTriangle className="text-red-500" /> Report post</h3>
              <p className="mb-3 text-xs text-slate-500">Select a reason. Reports are confidential.</p>
              {['spam', 'harassment', 'hate', 'inappropriate', 'other'].map((r) => (
                <label key={r} className="mb-1 flex items-center gap-2 text-xs capitalize">
                  <input type="radio" name="report" value={r} checked={reportReason === r} onChange={(e) => setReportReason(e.target.value)} /> {r}
                </label>
              ))}
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowReport(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                <button onClick={handleReportSubmit} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Submit</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== School Link Modal ===== */}
        {showSchoolLink && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <h3 className="mb-2 text-base font-semibold">Link a school</h3>
              <p className="mb-3 text-xs text-slate-500">We'll verify your enrollment with the institution. Only verified links are shown publicly.</p>
              <input value={schoolName} onChange={(e) => setSchoolName(e.target.value.slice(0, 200))} placeholder="School name (e.g. National University of Lesotho)" className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <input value={schoolYear} onChange={(e) => setSchoolYear(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Graduation year (optional)" className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <select value={schoolRelationship} onChange={(e) => setSchoolRelationship(e.target.value)} className="mb-3 w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                <option value="alumni">Alumni</option>
                <option value="staff">Staff</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowSchoolLink(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                <button onClick={handleRequestSchoolLink} disabled={schoolLinking} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {schoolLinking ? 'Submitting…' : 'Request verification'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AlumniDashboard;
